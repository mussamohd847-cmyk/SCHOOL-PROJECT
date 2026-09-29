from database import db
from models.base import TimestampMixin, SerializerMixin


def compute_grade(marks, total_marks=100):
    """Grade on a 0-100 scale."""
    pct = (float(marks) / float(total_marks)) * 100 if total_marks else float(marks)

    if pct >= 80:
        return "A"
    if pct >= 65:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 35:
        return "D"

    return "F"


class Result(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "results"

    __table_args__ = (
        db.UniqueConstraint(
            "student_id",
            "exam_id",
            "subject_id",
            name="uq_result_student_exam_subject",
        ),
    )

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False,
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False,
    )

    exam_id = db.Column(
        db.Integer,
        db.ForeignKey("exams.id"),
        nullable=False,
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey("classes.id"),
        nullable=True,
    )

    stream_id = db.Column(
        db.Integer,
        db.ForeignKey("streams.id"),
        nullable=True,
    )

    hw = db.Column(
        db.Numeric(5, 2),
        nullable=True,
    )

    ct = db.Column(
        db.Numeric(5, 2),
        nullable=True,
    )

    cw = db.Column(
        db.Numeric(5, 2),
        nullable=True,
    )

    fe = db.Column(
        db.Numeric(5, 2),
        nullable=False,
    )

    total = db.Column(
        db.Numeric(5, 2),
        nullable=False,
    )

    grade = db.Column(
        db.String(1),
        nullable=False,
    )