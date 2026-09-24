from flask import Blueprint, request
from database import db
from models import Teacher
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import update_model_from_dict, parse_date

teachers_bp = Blueprint("teachers", __name__, url_prefix="/api/teachers")

WRITABLE_FIELDS = [
    "first_name", "middle_name", "last_name", "gender", "phone", "email",
    "address", "specialization", "status", "user_id",
]


@teachers_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN", "TEACHER")
def list_teachers():
    query = Teacher.query
    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)
    items, pagination = paginate_query(query, request.args)
    return success_response("Teachers list", [t.to_dict() for t in items], pagination=pagination)


@teachers_bp.route("/<int:teacher_id>", methods=["GET"])
@login_required
def get_teacher(teacher_id):
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return error_response("Teacher not found", 404)
    return success_response("Teacher details", teacher.to_dict())


@teachers_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_teacher():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["employee_number", "first_name", "last_name"])
    if missing:
        return error_response(f"{missing} is required", 400)

    if Teacher.query.filter_by(employee_number=data["employee_number"]).first():
        return error_response("employee_number already exists", 409)

    teacher = Teacher(
        employee_number=data["employee_number"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        employment_date=parse_date(data.get("employment_date")),
    )
    update_model_from_dict(teacher, data, WRITABLE_FIELDS)
    db.session.add(teacher)
    db.session.commit()
    return success_response("Teacher created successfully", teacher.to_dict(), 201)


@teachers_bp.route("/<int:teacher_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def update_teacher(teacher_id):
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return error_response("Teacher not found", 404)
    data = request.get_json(silent=True) or {}

    if "employee_number" in data and data["employee_number"] != teacher.employee_number:
        if Teacher.query.filter_by(employee_number=data["employee_number"]).first():
            return error_response("employee_number already exists", 409)
        teacher.employee_number = data["employee_number"]

    if "employment_date" in data:
        teacher.employment_date = parse_date(data["employment_date"])

    update_model_from_dict(teacher, data, WRITABLE_FIELDS)
    db.session.commit()
    return success_response("Teacher updated successfully", teacher.to_dict())


@teachers_bp.route("/<int:teacher_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_teacher(teacher_id):
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return error_response("Teacher not found", 404)
    db.session.delete(teacher)
    db.session.commit()
    return success_response("Teacher deleted successfully")
