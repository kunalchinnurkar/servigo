from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash

from app.db import get_db
from app.utils import err, oid, to_public_id

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

VALID_ROLES = ("customer", "provider")


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")
    phone = (data.get("phone") or "").strip()

    if not name or not email or not password or role not in VALID_ROLES:
        return err("name, email, password and a valid role (customer/provider) are required")
    if len(password) < 6:
        return err("Password must be at least 6 characters")

    db = get_db()
    user = {
        "name": name,
        "email": email,
        "phone": phone,
        "password_hash": generate_password_hash(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = db.users.insert_one(user)
    except DuplicateKeyError:
        return err("An account with this email already exists", 409)

    user["_id"] = result.inserted_id

    if role == "provider":
        db.provider_profiles.insert_one({
            "user_id": result.inserted_id,
            "services": [],
            "bio": "",
            "location": None,
            "address_text": "",
            "available": False,
            "rating_sum": 0,
            "rating_count": 0,
            "created_at": datetime.now(timezone.utc),
        })

    token = create_access_token(
        identity=str(result.inserted_id),
        additional_claims={"role": role, "name": name},
    )
    return jsonify(token=token, user=to_public_id(user)), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password_hash"], password):
        return err("Invalid email or password", 401)

    token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={"role": user["role"], "name": user["name"]},
    )
    return jsonify(token=token, user=to_public_id(user))


@bp.get("/me")
@jwt_required()
def me():
    db = get_db()
    user = db.users.find_one({"_id": oid(get_jwt_identity())})
    if not user:
        return err("User not found", 404)
    return jsonify(user=to_public_id(user))
