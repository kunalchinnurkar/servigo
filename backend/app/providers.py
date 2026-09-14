from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.db import get_db
from app.utils import err, haversine_km, oid, role_required, to_public_id

bp = Blueprint("providers", __name__, url_prefix="/api/providers")


def _profile_with_user(db, profile):
    user = db.users.find_one({"_id": profile["user_id"]})
    out = to_public_id(profile)
    out["name"] = user["name"] if user else "Unknown"
    out["phone"] = user.get("phone", "") if user else ""
    count = profile.get("rating_count", 0)
    out["rating_avg"] = round(profile["rating_sum"] / count, 1) if count else None
    out["rating_count"] = count
    out.pop("rating_sum", None)
    return out


@bp.get("/me")
@role_required("provider")
def get_my_profile():
    db = get_db()
    profile = db.provider_profiles.find_one({"user_id": oid(get_jwt_identity())})
    if not profile:
        return err("Provider profile not found", 404)
    return jsonify(profile=_profile_with_user(db, profile))


@bp.put("/me")
@role_required("provider")
def update_my_profile():
    data = request.get_json(silent=True) or {}
    updates = {}

    if "services" in data:
        if not isinstance(data["services"], list):
            return err("services must be a list of category names")
        updates["services"] = data["services"]
    if "bio" in data:
        updates["bio"] = str(data["bio"])[:500]
    if "address_text" in data:
        updates["address_text"] = str(data["address_text"])[:200]
    if "location" in data and data["location"]:
        loc = data["location"]
        try:
            lat, lng = float(loc["lat"]), float(loc["lng"])
        except (KeyError, TypeError, ValueError):
            return err("location must be {lat, lng} numbers")
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            return err("location out of range")
        updates["location"] = {"lat": lat, "lng": lng}

    if not updates:
        return err("Nothing to update")

    db = get_db()
    db.provider_profiles.update_one(
        {"user_id": oid(get_jwt_identity())}, {"$set": updates}
    )
    profile = db.provider_profiles.find_one({"user_id": oid(get_jwt_identity())})
    return jsonify(profile=_profile_with_user(db, profile))


@bp.put("/me/availability")
@role_required("provider")
def set_availability():
    data = request.get_json(silent=True) or {}
    if "available" not in data or not isinstance(data["available"], bool):
        return err("available (boolean) is required")

    db = get_db()
    db.provider_profiles.update_one(
        {"user_id": oid(get_jwt_identity())},
        {"$set": {"available": data["available"]}},
    )
    profile = db.provider_profiles.find_one({"user_id": oid(get_jwt_identity())})
    return jsonify(profile=_profile_with_user(db, profile))


@bp.get("/nearby")
@jwt_required()
def nearby():
    """The Location Module + Service Matching step from the architecture diagram:
    find available providers for a service, within a radius, ranked by distance."""
    service = request.args.get("service", "").strip()
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
    except (TypeError, ValueError):
        return err("lat and lng query params are required")
    radius_km = float(request.args.get("radius_km", 15))

    if not service:
        return err("service query param is required")

    db = get_db()
    query = {"available": True, "services": service, "location": {"$ne": None}}
    matches = []
    for profile in db.provider_profiles.find(query):
        loc = profile["location"]
        dist = haversine_km(lat, lng, loc["lat"], loc["lng"])
        if dist <= radius_km:
            item = _profile_with_user(db, profile)
            item["distance_km"] = round(dist, 1)
            matches.append(item)

    matches.sort(key=lambda p: p["distance_km"])
    return jsonify(providers=matches, count=len(matches))
