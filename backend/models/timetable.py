from database import db
from models.base import TimestampMixin, SerializerMixin


class Timetable(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "timetable"

    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(
        db.Enum(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
            name="timetable_day",
        ),
        nullable=False,
    )
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"))
    stream_id = db.Column(db.Integer, db.ForeignKey("streams.id"))
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"))
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"))
    academic_year_id = db.Column(db.Integer, db.ForeignKey("academic_years.id"))
    term_id = db.Column(db.Integer, db.ForeignKey("terms.id"))
    room = db.Column(db.String(50))
    lesson_type = db.Column(
        db.Enum("SCHOOL", "MADRASA", "BREAK", "ACTIVITY", name="lesson_type"),
        default="SCHOOL",
    )
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="timetable_status"), default="ACTIVE")
