from flask import request
from database import db
from models import Setting
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response
from flask import Blueprint

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


@settings_bp.route("", methods=["GET"])
@login_required
def list_settings():
    items = Setting.query.all()
    return success_response("Settings", [item.to_dict() for item in items])


@settings_bp.route("/<string:key>", methods=["GET"])
@login_required
def get_setting(key):
    item = Setting.query.filter_by(setting_key=key).first()
    if not item:
        return error_response("Setting not found", 404)
    return success_response("Setting", item.to_dict())


@settings_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_setting():
    data = request.get_json(silent=True) or {}
    if not data.get("setting_key"):
        return error_response("setting_key is required", 400)
    if Setting.query.filter_by(setting_key=data["setting_key"]).first():
        return error_response("setting_key already exists", 409)

    item = Setting(
        setting_key=data["setting_key"],
        setting_value=data.get("setting_value"),
        description=data.get("description"),
    )
    db.session.add(item)
    db.session.commit()
    return success_response("Setting created successfully", item.to_dict(), 201)


@settings_bp.route("/<string:key>", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def update_setting(key):
    item = Setting.query.filter_by(setting_key=key).first()
    if not item:
        return error_response("Setting not found", 404)
    data = request.get_json(silent=True) or {}
    if "setting_value" in data:
        item.setting_value = data["setting_value"]
    if "description" in data:
        item.description = data["description"]
    db.session.commit()
    return success_response("Setting updated successfully", item.to_dict())


@settings_bp.route("/<string:key>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_setting(key):
    item = Setting.query.filter_by(setting_key=key).first()
    if not item:
        return error_response("Setting not found", 404)
    db.session.delete(item)
    db.session.commit()
    return success_response("Setting deleted successfully")
