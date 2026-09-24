from flask import Blueprint, request
from database import db
from models import Timetable
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import update_model_from_dict, parse_time

timetable_bp = Blueprint("timetable", __name__, url_prefix="/api/timetable")

WRITABLE_FIELDS = [
    "day_of_week", "class_id", "stream_id", "subject_id", "teacher_id",
    "academic_year_id", "term_id", "room", "lesson_type", "status",
]


def _overlaps(existing, day, start, end, exclude_id=None):
    q = Timetable.query.filter(
        Timetable.day_of_week == day,
        Timetable.start_time < end,
        Timetable.end_time > start,
    )
    if exclude_id:
        q = q.filter(Timetable.id != exclude_id)
    return q


def _check_conflicts(data, exclude_id=None):
    day = data.get("day_of_week")
    start = parse_time(data.get("start_time"))
    end = parse_time(data.get("end_time"))
    if not (day and start and end):
        return None

    base = _overlaps(Timetable, day, start, end, exclude_id)

    teacher_id = data.get("teacher_id")
    if teacher_id:
        conflict = base.filter(Timetable.teacher_id == teacher_id).first()
        if conflict:
            return "This teacher is already scheduled for an overlapping time slot"

    class_id = data.get("class_id")
    stream_id = data.get("stream_id")
    if class_id:
        q = base.filter(Timetable.class_id == class_id)
        if stream_id:
            q = q.filter(Timetable.stream_id == stream_id)
        if q.first():
            return "This class/stream already has a subject scheduled for an overlapping time slot"

    return None


@timetable_bp.route("", methods=["GET"])
@login_required
def list_timetable():
    query = Timetable.query
    filters = {
        "teacher_id": request.args.get("teacher_id", type=int),
        "class_id": request.args.get("class_id", type=int),
        "stream_id": request.args.get("stream_id", type=int),
        "subject_id": request.args.get("subject_id", type=int),
        "day_of_week": request.args.get("day_of_week"),
        "academic_year_id": request.args.get("academic_year_id", type=int),
        "term_id": request.args.get("term_id", type=int),
    }
    for field, value in filters.items():
        if value:
            query = query.filter(getattr(Timetable, field) == value)

    items, pagination = paginate_query(query, request.args)
    return success_response("Timetable", [i.to_dict() for i in items], pagination=pagination)


@timetable_bp.route("/<int:item_id>", methods=["GET"])
@login_required
def get_timetable_entry(item_id):
    item = Timetable.query.get(item_id)
    if not item:
        return error_response("Timetable entry not found", 404)
    return success_response("Timetable entry", item.to_dict())


@timetable_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_timetable_entry():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["day_of_week", "start_time", "end_time"])
    if missing:
        return error_response(f"{missing} is required", 400)

    conflict = _check_conflicts(data)
    if conflict:
        return error_response(conflict, 409)

    item = Timetable(
        day_of_week=data["day_of_week"],
        start_time=parse_time(data["start_time"]),
        end_time=parse_time(data["end_time"]),
    )
    update_model_from_dict(item, data, WRITABLE_FIELDS)
    db.session.add(item)
    db.session.commit()
    return success_response("Timetable entry created successfully", item.to_dict(), 201)


@timetable_bp.route("/<int:item_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def update_timetable_entry(item_id):
    item = Timetable.query.get(item_id)
    if not item:
        return error_response("Timetable entry not found", 404)

    data = request.get_json(silent=True) or {}
    merged = {
        "day_of_week": data.get("day_of_week", item.day_of_week),
        "start_time": data.get("start_time", item.start_time.strftime("%H:%M")),
        "end_time": data.get("end_time", item.end_time.strftime("%H:%M")),
        "teacher_id": data.get("teacher_id", item.teacher_id),
        "class_id": data.get("class_id", item.class_id),
        "stream_id": data.get("stream_id", item.stream_id),
    }
    conflict = _check_conflicts(merged, exclude_id=item_id)
    if conflict:
        return error_response(conflict, 409)

    if "start_time" in data:
        item.start_time = parse_time(data["start_time"])
    if "end_time" in data:
        item.end_time = parse_time(data["end_time"])

    update_model_from_dict(item, data, WRITABLE_FIELDS)
    db.session.commit()
    return success_response("Timetable entry updated successfully", item.to_dict())


@timetable_bp.route("/<int:item_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN")
def delete_timetable_entry(item_id):
    item = Timetable.query.get(item_id)
    if not item:
        return error_response("Timetable entry not found", 404)
    db.session.delete(item)
    db.session.commit()
    return success_response("Timetable entry deleted successfully")
