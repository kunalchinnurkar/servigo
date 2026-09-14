from functools import wraps
from math import asin, cos, radians, sin, sqrt

from bson import ObjectId
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def haversine_km(lat1, lng1, lat2, lng2):
    """Great-circle distance between two lat/lng points, in kilometres."""
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    return 2 * 6371 * asin(sqrt(a))


def oid(value):
    """Coerce a string/ObjectId into an ObjectId, raising ValueError on bad input."""
    return value if isinstance(value, ObjectId) else ObjectId(value)


def to_public_id(doc):
    """Return a shallow copy of doc with _id -> id (string), for JSON responses."""
    if doc is None:
        return None
    out = dict(doc)
    if "_id" in out:
        out["id"] = str(out.pop("_id"))
    for key, value in list(out.items()):
        if isinstance(value, ObjectId):
            out[key] = str(value)
    out.pop("password_hash", None)
    return out


def role_required(*roles):
    """Decorator: require a valid JWT AND that the caller's role is in `roles`."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify(error="This action needs a {} account".format(
                    " or ".join(roles)
                )), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def err(message, status=400):
    return jsonify(error=message), status
