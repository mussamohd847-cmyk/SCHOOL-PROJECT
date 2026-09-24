from database import db
from models.base import TimestampMixin, SerializerMixin


class Attendance(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "attendance"
    __table_args__ = (
        db.UniqueConstraint("student_id", "date", name="uq_attendance_student_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"))
    date = db.Column(db.Date, nullable=False)
    status = db.Column(
        db.Enum("PRESENT", "ABSENT", "LATE", "EXCUSED", name="attendance_status"),
        nullable=False,
    )
    remarks = db.Column(db.String(255))
    marked_by = db.Column(db.Integer, db.ForeignKey("users.id"))
