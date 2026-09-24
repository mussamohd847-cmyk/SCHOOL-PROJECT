"""Generic CRUD blueprint factory for simple reference/config resources.

Used for resources whose access rules are simply "ADMIN manages, anyone
authenticated may read" (classes, streams, subjects, academic years,
terms, settings). Resources with custom business rules or per-role data
scoping (students, teachers, timetable, attendance, exams, results,
fees, payments, users) have their own dedicated route modules.
"""

from flask import Blueprint, request
from database import db
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.helpers import update_model_from_dict


def build_crud_blueprint(name, url_prefix, model, required_fields,
                          unique_fields=None, writable_fields=None,
                          write_roles=("ADMIN",), singular_name=None):
    bp = Blueprint(name, __name__, url_prefix=url_prefix)
    unique_fields = unique_fields or []
    writable_fields = writable_fields or required_fields
    label = (singular_name or name[:-1]).capitalize()

    @bp.route("", methods=["GET"])
    @login_required
    def list_items():
        query = model.query
        items, pagination = paginate_query(query, request.args)
        return success_response(
            f"{name} list", [item.to_dict() for item in items], pagination=pagination
        )

    @bp.route("/<int:item_id>", methods=["GET"])
    @login_required
    def get_item(item_id):
        item = model.query.get(item_id)
        if not item:
            return error_response(f"{label} not found", 404)
        return success_response(f"{label} details", item.to_dict())

    @bp.route("", methods=["POST"])
    @login_required
    @roles_required(*write_roles)
    def create_item():
        data = request.get_json(silent=True) or {}
        for field in required_fields:
            if data.get(field) in (None, ""):
                return error_response(f"{field} is required", 400)

        for field in unique_fields:
            if model.query.filter_by(**{field: data[field]}).first():
                return error_response(f"{field} already exists", 409)

        item = model()
        update_model_from_dict(item, data, writable_fields)
        db.session.add(item)
        db.session.commit()
        return success_response(f"{label} created successfully", item.to_dict(), 201)

    @bp.route("/<int:item_id>", methods=["PUT"])
    @login_required
    @roles_required(*write_roles)
    def update_item(item_id):
        item = model.query.get(item_id)
        if not item:
            return error_response(f"{label} not found", 404)

        data = request.get_json(silent=True) or {}
        for field in unique_fields:
            if field in data:
                existing = model.query.filter_by(**{field: data[field]}).first()
                if existing and existing.id != item_id:
                    return error_response(f"{field} already exists", 409)

        update_model_from_dict(item, data, writable_fields)
        db.session.commit()
        return success_response(f"{label} updated successfully", item.to_dict())

    @bp.route("/<int:item_id>", methods=["DELETE"])
    @login_required
    @roles_required(*write_roles)
    def delete_item(item_id):
        item = model.query.get(item_id)
        if not item:
            return error_response(f"{label} not found", 404)
        db.session.delete(item)
        db.session.commit()
        return success_response(f"{label} deleted successfully")

    return bp
