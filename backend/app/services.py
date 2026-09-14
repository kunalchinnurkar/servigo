from flask import Blueprint, jsonify

from app.db import get_db
from app.utils import to_public_id

bp = Blueprint("services", __name__, url_prefix="/api/services")


@bp.get("")
def list_services():
    db = get_db()
    items = [to_public_id(s) for s in db.services.find().sort("name", 1)]
    return jsonify(services=items)
