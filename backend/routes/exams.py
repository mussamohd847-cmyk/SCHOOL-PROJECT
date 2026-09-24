from flask import Blueprint, request
from database import db
from models import Exam
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import update_model_from_dict, parse_date

exams_bp = Blueprint("exams", __name__, url_prefix="/api/exams")

WRITABLE_FIELDS = [
    "name", "exam_type", "academic_year_id", "term_id", "class_id",
    "subject_id", "total_marks", "status",
]


@exams_bp.route("", methods=["GET"])
@login_required
def list_exams():
    query = Exam.query
    for field in ("class_id", "subject_id", "term_id", "academic_year_id"):
        value = request.args.get(field, type=int)
        if value:
            query = query.filter(getattr(Exam, field) == value)
    items, pagination = paginate_query(query, request.args)
    return success_response("Exams list", [e.to_dict() for e in items], pagination=pagination)


@exams_bp.route("/<int:exam_id>", methods=["GET"])
@login_required
def get_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return error_response("Exam not found", 404)
    return success_response("Exam details", exam.to_dict())


@exams_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN", "TEACHER")
def create_exam():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "exam_type"])
    if missing:
        return error_response(f"{missing} is required", 400)

    exam = Exam(name=data["name"], exam_type=data["exam_type"], exam_date=parse_date(data.get("exam_date")))
    update_model_from_dict(exam, data, WRITABLE_FIELDS)
    db.session.add(exam)
    db.session.commit()
    return success_response("Exam created successfully", exam.to_dict(), 201)


@exams_bp.route("/<int:exam_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN", "TEACHER")
def update_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return error_response("Exam not found", 404)
    data = request.get_json(silent=True) or {}
    if "exam_date" in data:
        exam.exam_date = parse_date(data["exam_date"])
    update_model_from_dict(exam, data, WRITABLE_FIELDS)
    db.session.commit()
    return success_response("Exam updated successfully", exam.to_dict())


@exams_bp.route("/<int:exam_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return error_response("Exam not found", 404)
    db.session.delete(exam)
    db.session.commit()
    return success_response("Exam deleted successfully")
