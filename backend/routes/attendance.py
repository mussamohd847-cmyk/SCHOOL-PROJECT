from flask import Blueprint, request
from database import db
from models import Attendance
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import parse_date

attendance_bp = Blueprint("attendance", __name__, url_prefix="/api/attendance")


@attendance_bp.route("", methods=["GET"])
@login_required
def list_attendance():
    query = Attendance.query
    student_id = request.args.get("student_id", type=int)
    class_id = request.args.get("class_id", type=int)
    date_str = request.args.get("date")
    if student_id:
        query = query.filter_by(student_id=student_id)
    if class_id:
        query = query.filter_by(class_id=class_id)
    if date_str:
        query = query.filter_by(date=parse_date(date_str))

    items, pagination = paginate_query(query.order_by(Attendance.date.desc()), request.args)
    return success_response("Attendance records", [i.to_dict() for i in items], pagination=pagination)


@attendance_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN", "TEACHER")
def mark_attendance():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["student_id", "date", "status"])
    if missing:
        return error_response(f"{missing} is required", 400)

    record_date = parse_date(data["date"])
    existing = Attendance.query.filter_by(student_id=data["student_id"], date=record_date).first()
    if existing:
        return error_response("Attendance for this student on this date already exists", 409)

    item = Attendance(
        student_id=data["student_id"], class_id=data.get("class_id"),
        date=record_date, status=data["status"], remarks=data.get("remarks"),
        marked_by=request.current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return success_response("Attendance marked successfully", item.to_dict(), 201)


@attendance_bp.route("/bulk", methods=["POST"])
@login_required
@roles_required("ADMIN", "TEACHER")
def bulk_attendance():
    data = request.get_json(silent=True) or {}
    records = data.get("records", [])
    class_id = data.get("class_id")
    date_str = data.get("date")
    if not records or not date_str:
        return error_response("date and records[] are required", 400)

    record_date = parse_date(date_str)
    created, skipped = [], []
    for record in records:
        student_id = record.get("student_id")
        status = record.get("status")
        if not student_id or not status:
            continue
        if Attendance.query.filter_by(student_id=student_id, date=record_date).first():
            skipped.append(student_id)
            continue
        item = Attendance(
            student_id=student_id, class_id=class_id, date=record_date,
            status=status, remarks=record.get("remarks"), marked_by=request.current_user.id,
        )
        db.session.add(item)
        created.append(student_id)

    db.session.commit()
    return success_response(
        "Bulk attendance processed",
        {"created": created, "skipped_existing": skipped},
        201,
    )


@attendance_bp.route("/<int:item_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN", "TEACHER")
def update_attendance(item_id):
    item = Attendance.query.get(item_id)
    if not item:
        return error_response("Attendance record not found", 404)
    data = request.get_json(silent=True) or {}
    if "status" in data:
        item.status = data["status"]
    if "remarks" in data:
        item.remarks = data["remarks"]
    db.session.commit()
    return success_response("Attendance updated successfully", item.to_dict())


@attendance_bp.route("/student/<int:student_id>/percentage", methods=["GET"])
@login_required
def attendance_percentage(student_id):
    records = Attendance.query.filter_by(student_id=student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status in ("PRESENT", "LATE"))
    percentage = round((present / total) * 100, 2) if total else 0.0
    return success_response(
        "Attendance percentage",
        {"student_id": student_id, "total_days": total, "present_days": present, "percentage": percentage},
    )


@attendance_bp.route("/class/<int:class_id>/monthly", methods=["GET"])
@login_required
def monthly_class_attendance(class_id):
    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)
    if not year or not month:
        return error_response("year and month query params are required", 400)

    from sqlalchemy import extract
    records = Attendance.query.filter(
        Attendance.class_id == class_id,
        extract("year", Attendance.date) == year,
        extract("month", Attendance.date) == month,
    ).all()

    summary = {}
    for r in records:
        summary.setdefault(r.student_id, {"PRESENT": 0, "ABSENT": 0, "LATE": 0, "EXCUSED": 0})
        summary[r.student_id][r.status] += 1

    return success_response("Monthly attendance report", summary)
