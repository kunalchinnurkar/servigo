from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app.db import get_db
from app.utils import err, oid, role_required, to_public_id

bp = Blueprint("requests", __name__, url_prefix="/api/requests")


def _enrich(db, req):
    out = to_public_id(req)
    customer = db.users.find_one({"_id": req["customer_id"]})
    provider_user = db.users.find_one({"_id": req["provider_id"]})
    out["customer_name"] = customer["name"] if customer else "Unknown"
    out["provider_name"] = provider_user["name"] if provider_user else "Unknown"
    out["provider_phone"] = provider_user.get("phone", "") if provider_user else ""
    return out


@bp.post("")
@role_required("customer")
def create_request():
    data = request.get_json(silent=True) or {}
    service = (data.get("service") or "").strip()
    provider_profile_id = data.get("provider_id")
    loc = data.get("location") or {}

    if not service or not provider_profile_id:
        return err("service and provider_id are required")
    try:
        lat, lng = float(loc["lat"]), float(loc["lng"])
    except (KeyError, TypeError, ValueError):
        return err("location {lat, lng} is required")

    db = get_db()
    profile = db.provider_profiles.find_one({"_id": oid(provider_profile_id)})
    if not profile:
        return err("Provider not found", 404)
    if not profile.get("available"):
        return err("This provider is currently unavailable", 409)

    doc = {
        "customer_id": oid(get_jwt_identity()),
        "provider_id": profile["user_id"],
        "provider_profile_id": profile["_id"],
        "service": service,
        "location": {"lat": lat, "lng": lng},
        "status": "pending",
        "rating": None,
        "review": "",
        "created_at": datetime.now(timezone.utc),
        "accepted_at": None,
        "completed_at": None,
    }
    result = db.service_requests.insert_one(doc)
    doc["_id"] = result.inserted_id
    return jsonify(request=_enrich(db, doc)), 201


@bp.get("/mine")
@jwt_required()
def my_requests():
    claims = get_jwt()
    user_id = oid(get_jwt_identity())
    db = get_db()
    field = "customer_id" if claims.get("role") == "customer" else "provider_id"
    items = [
        _enrich(db, r)
        for r in db.service_requests.find({field: user_id}).sort("created_at", -1)
    ]
    return jsonify(requests=items)


def _load_owned_request(db, request_id, provider_user_id):
    req = db.service_requests.find_one({"_id": oid(request_id)})
    if not req or req["provider_id"] != provider_user_id:
        return None
    return req


@bp.put("/<request_id>/accept")
@role_required("provider")
def accept_request(request_id):
    db = get_db()
    req = _load_owned_request(db, request_id, oid(get_jwt_identity()))
    if not req:
        return err("Request not found", 404)
    if req["status"] != "pending":
        return err(f"Request is already {req['status']}", 409)
    db.service_requests.update_one(
        {"_id": req["_id"]},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc)}},
    )
    return jsonify(request=_enrich(db, db.service_requests.find_one({"_id": req["_id"]})))


@bp.put("/<request_id>/reject")
@role_required("provider")
def reject_request(request_id):
    db = get_db()
    req = _load_owned_request(db, request_id, oid(get_jwt_identity()))
    if not req:
        return err("Request not found", 404)
    if req["status"] != "pending":
        return err(f"Request is already {req['status']}", 409)
    db.service_requests.update_one({"_id": req["_id"]}, {"$set": {"status": "rejected"}})
    return jsonify(request=_enrich(db, db.service_requests.find_one({"_id": req["_id"]})))


@bp.put("/<request_id>/complete")
@role_required("provider")
def complete_request(request_id):
    db = get_db()
    req = _load_owned_request(db, request_id, oid(get_jwt_identity()))
    if not req:
        return err("Request not found", 404)
    if req["status"] != "accepted":
        return err("Only an accepted request can be marked complete", 409)
    db.service_requests.update_one(
        {"_id": req["_id"]},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}},
    )
    return jsonify(request=_enrich(db, db.service_requests.find_one({"_id": req["_id"]})))


@bp.post("/<request_id>/rate")
@role_required("customer")
def rate_request(request_id):
    data = request.get_json(silent=True) or {}
    try:
        rating = int(data.get("rating"))
    except (TypeError, ValueError):
        return err("rating must be an integer 1-5")
    if not 1 <= rating <= 5:
        return err("rating must be between 1 and 5")
    review = str(data.get("review", ""))[:500]

    db = get_db()
    req = db.service_requests.find_one({"_id": oid(request_id)})
    if not req or req["customer_id"] != oid(get_jwt_identity()):
        return err("Request not found", 404)
    if req["status"] != "completed":
        return err("Only a completed request can be rated", 409)
    if req.get("rating") is not None:
        return err("This request has already been rated", 409)

    db.service_requests.update_one(
        {"_id": req["_id"]}, {"$set": {"rating": rating, "review": review}}
    )
    db.provider_profiles.update_one(
        {"user_id": req["provider_id"]},
        {"$inc": {"rating_sum": rating, "rating_count": 1}},
    )
    return jsonify(request=_enrich(db, db.service_requests.find_one({"_id": req["_id"]})))
