from flask import Blueprint, request
from database import db
from models import Student
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import update_model_from_dict, parse_date

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

WRITABLE_FIELDS = [
    "first_name", "middle_name", "last_name", "gender", "phone", "email",
    "address", "class_id", "stream_id", "parent_name", "parent_phone", "status",
]


@students_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN", "TEACHER", "ACCOUNTANT")
def list_students():
    query = Student.query
    class_id = request.args.get("class_id", type=int)
    stream_id = request.args.get("stream_id", type=int)
    status = request.args.get("status")
    if class_id:
        query = query.filter_by(class_id=class_id)
    if stream_id:
        query = query.filter_by(stream_id=stream_id)
    if status:
        query = query.filter_by(status=status)

    items, pagination = paginate_query(query, request.args)
    return success_response("Students list", [s.to_dict() for s in items], pagination=pagination)


@students_bp.route("/<int:student_id>", methods=["GET"])
@login_required
def get_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)
    return success_response("Student details", student.to_dict())


@students_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_student():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["student_number", "first_name", "last_name"])
    if missing:
        return error_response(f"{missing} is required", 400)

    if Student.query.filter_by(student_number=data["student_number"]).first():
        return error_response("student_number already exists", 409)

    student = Student(
        student_number=data["student_number"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        date_of_birth=parse_date(data.get("date_of_birth")),
        admission_date=parse_date(data.get("admission_date")),
    )
    update_model_from_dict(student, data, WRITABLE_FIELDS)
    db.session.add(student)
    db.session.commit()
    return success_response("Student created successfully", student.to_dict(), 201)


@students_bp.route("/<int:student_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def update_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)
    data = request.get_json(silent=True) or {}

    if "student_number" in data and data["student_number"] != student.student_number:
        if Student.query.filter_by(student_number=data["student_number"]).first():
            return error_response("student_number already exists", 409)
        student.student_number = data["student_number"]

    if "date_of_birth" in data:
        student.date_of_birth = parse_date(data["date_of_birth"])
    if "admission_date" in data:
        student.admission_date = parse_date(data["admission_date"])

    update_model_from_dict(student, data, WRITABLE_FIELDS)
    db.session.commit()
    return success_response("Student updated successfully", student.to_dict())


@students_bp.route("/<int:student_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)
    db.session.delete(student)
    db.session.commit()
    return success_response("Student deleted successfully")
