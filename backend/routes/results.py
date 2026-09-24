from flask import Blueprint, request
from database import db
from models import Result, Exam, Student, compute_grade
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields

results_bp = Blueprint("results", __name__, url_prefix="/api/results")


@results_bp.route("", methods=["GET"])
@login_required
def list_results():
    query = Result.query
    for field in ("student_id", "exam_id", "subject_id"):
        value = request.args.get(field, type=int)
        if value:
            query = query.filter(getattr(Result, field) == value)
    items, pagination = paginate_query(query, request.args)
    return success_response("Results list", [r.to_dict() for r in items], pagination=pagination)


@results_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN", "TEACHER")
def create_result():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["student_id", "exam_id", "subject_id", "marks"])
    if missing:
        return error_response(f"{missing} is required", 400)

    if Result.query.filter_by(
        student_id=data["student_id"], exam_id=data["exam_id"], subject_id=data["subject_id"]
    ).first():
        return error_response("A result for this student/exam/subject already exists", 409)

    exam = Exam.query.get(data["exam_id"])
    total_marks = exam.total_marks if exam else 100
    marks = float(data["marks"])

    result = Result(
        student_id=data["student_id"], exam_id=data["exam_id"], subject_id=data["subject_id"],
        marks=marks, grade=compute_grade(marks, total_marks), remarks=data.get("remarks"),
    )
    db.session.add(result)
    db.session.commit()
    return success_response("Result recorded successfully", result.to_dict(), 201)


@results_bp.route("/<int:result_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN", "TEACHER")
def update_result(result_id):
    result = Result.query.get(result_id)
    if not result:
        return error_response("Result not found", 404)
    data = request.get_json(silent=True) or {}

    if "marks" in data:
        exam = Exam.query.get(result.exam_id)
        total_marks = exam.total_marks if exam else 100
        result.marks = float(data["marks"])
        result.grade = compute_grade(result.marks, total_marks)
    if "remarks" in data:
        result.remarks = data["remarks"]

    db.session.commit()
    return success_response("Result updated successfully", result.to_dict())


@results_bp.route("/<int:result_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN", "TEACHER")
def delete_result(result_id):
    result = Result.query.get(result_id)
    if not result:
        return error_response("Result not found", 404)
    db.session.delete(result)
    db.session.commit()
    return success_response("Result deleted successfully")


@results_bp.route("/student/<int:student_id>/report", methods=["GET"])
@login_required
def student_report(student_id):
    results = Result.query.filter_by(student_id=student_id).all()
    avg = round(sum(r.marks for r in results) / len(results), 2) if results else 0
    return success_response(
        "Student report",
        {"student_id": student_id, "average_marks": avg, "results": [r.to_dict() for r in results]},
    )


@results_bp.route("/class/<int:class_id>/ranking", methods=["GET"])
@login_required
def class_ranking(class_id):
    exam_id = request.args.get("exam_id", type=int)
    students = Student.query.filter_by(class_id=class_id).all()
    student_ids = [s.id for s in students]

    query = Result.query.filter(Result.student_id.in_(student_ids))
    if exam_id:
        query = query.filter_by(exam_id=exam_id)
    results = query.all()

    totals = {}
    for r in results:
        totals.setdefault(r.student_id, []).append(r.marks)

    ranking = sorted(
        (
            {"student_id": sid, "average_marks": round(sum(marks) / len(marks), 2)}
            for sid, marks in totals.items()
        ),
        key=lambda x: x["average_marks"],
        reverse=True,
    )
    for i, entry in enumerate(ranking, start=1):
        entry["rank"] = i

    return success_response("Class ranking", ranking)


@results_bp.route("/subject/<int:subject_id>/performance", methods=["GET"])
@login_required
def subject_performance(subject_id):
    results = Result.query.filter_by(subject_id=subject_id).all()
    if not results:
        return success_response("Subject performance", {"subject_id": subject_id, "average_marks": 0, "count": 0})

    avg = round(sum(r.marks for r in results) / len(results), 2)
    grade_distribution = {}
    for r in results:
        grade_distribution[r.grade] = grade_distribution.get(r.grade, 0) + 1

    return success_response(
        "Subject performance",
        {"subject_id": subject_id, "average_marks": avg, "count": len(results), "grade_distribution": grade_distribution},
    )
