from database import db
from models.base import TimestampMixin, SerializerMixin


class Exam(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "exams"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    exam_type = db.Column(
        db.Enum(
            "TEST",
            "MIDTERM",
            "TERMINAL",
            "FINAL",
            name="exam_type"
        ),
        nullable=False
    )

    academic_year_id = db.Column(
        db.Integer,
        db.ForeignKey("academic_years.id"),
        nullable=True
    )

    year_id = db.Column(
        db.Integer,
        nullable=False
    )

    term_id = db.Column(
        db.Integer,
        db.ForeignKey("terms.id"),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey("classes.id"),
        nullable=False
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False
    )

    exam_date = db.Column(
        db.Date,
        nullable=False
    )

    total_marks = db.Column(
        db.Integer,
        default=100,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "ACTIVE",
            "INACTIVE",
            name="exam_status"
        ),
        default="ACTIVE",
        nullable=False
    )
