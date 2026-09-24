from flask import Blueprint, request
from database import db
from models import TeacherClass
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields

teacher_classes_bp = Blueprint("teacher_classes", __name__, url_prefix="/api/teacher-classes")


@teacher_classes_bp.route("", methods=["GET"])
@login_required
def list_teacher_classes():
    query = TeacherClass.query
    teacher_id = request.args.get("teacher_id", type=int)
    class_id = request.args.get("class_id", type=int)
    if teacher_id:
        query = query.filter_by(teacher_id=teacher_id)
    if class_id:
        query = query.filter_by(class_id=class_id)
    items, pagination = paginate_query(query, request.args)
    return success_response("Teacher-class assignments", [i.to_dict() for i in items], pagination=pagination)


@teacher_classes_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_teacher_class():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["teacher_id", "class_id", "academic_year_id"])
    if missing:
        return error_response(f"{missing} is required", 400)

    existing = TeacherClass.query.filter_by(
        teacher_id=data["teacher_id"], class_id=data["class_id"],
        stream_id=data.get("stream_id"), academic_year_id=data["academic_year_id"],
    ).first()
    if existing:
        return error_response("This teacher-class assignment already exists", 409)

    item = TeacherClass(
        teacher_id=data["teacher_id"], class_id=data["class_id"],
        stream_id=data.get("stream_id"), academic_year_id=data["academic_year_id"],
    )
    db.session.add(item)
    db.session.commit()
    return success_response("Assignment created successfully", item.to_dict(), 201)


@teacher_classes_bp.route("/<int:item_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_teacher_class(item_id):
    item = TeacherClass.query.get(item_id)
    if not item:
        return error_response("Assignment not found", 404)
    db.session.delete(item)
    db.session.commit()
    return success_response("Assignment deleted successfully")
