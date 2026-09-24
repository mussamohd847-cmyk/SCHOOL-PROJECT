from database import db
from models.base import TimestampMixin, SerializerMixin


class TeacherClass(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "teacher_classes"
    __table_args__ = (
        db.UniqueConstraint(
            "teacher_id", "class_id", "stream_id", "academic_year_id",
            name="uq_teacher_class_assignment",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    stream_id = db.Column(db.Integer, db.ForeignKey("streams.id"))
    academic_year_id = db.Column(db.Integer, db.ForeignKey("academic_years.id"), nullable=False)
