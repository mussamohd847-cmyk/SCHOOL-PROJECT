from flask import Blueprint, request
from database import db
from models import User
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields, is_valid_email
from utils.helpers import update_model_from_dict

users_bp = Blueprint("users", __name__, url_prefix="/api/users")

WRITABLE_FIELDS = ["full_name", "email", "phone", "username", "role", "status"]


@users_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN")
def list_users():
    query = User.query
    role = request.args.get("role")
    if role:
        query = query.filter_by(role=role)
    items, pagination = paginate_query(query, request.args)
    return success_response("Users list", [u.to_dict() for u in items], pagination=pagination)


@users_bp.route("/<int:user_id>", methods=["GET"])
@login_required
@roles_required("ADMIN")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response("User details", user.to_dict())


@users_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_user():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["full_name", "email", "username", "password", "role"])
    if missing:
        return error_response(f"{missing} is required", 400)
    if not is_valid_email(data["email"]):
        return error_response("A valid email is required", 422)
    if User.query.filter_by(email=data["email"]).first():
        return error_response("Email already exists", 409)
    if User.query.filter_by(username=data["username"]).first():
        return error_response("Username already exists", 409)

    user = User(
        full_name=data["full_name"], email=data["email"], phone=data.get("phone"),
        username=data["username"], role=data["role"], status=data.get("status", "ACTIVE"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return success_response("User created successfully", user.to_dict(), 201)


@users_bp.route("/<int:user_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    data = request.get_json(silent=True) or {}

    if "email" in data and data["email"] != user.email:
        if not is_valid_email(data["email"]):
            return error_response("A valid email is required", 422)
        if User.query.filter_by(email=data["email"]).first():
            return error_response("Email already exists", 409)
    if "username" in data and data["username"] != user.username:
        if User.query.filter_by(username=data["username"]).first():
            return error_response("Username already exists", 409)

    update_model_from_dict(user, data, WRITABLE_FIELDS)
    if data.get("password"):
        user.set_password(data["password"])
    db.session.commit()
    return success_response("User updated successfully", user.to_dict())


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    db.session.delete(user)
    db.session.commit()
    return success_response("User deleted successfully")
