from database import db
from models.base import TimestampMixin, SerializerMixin


class TeacherSubject(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "teacher_subjects"
    __table_args__ = (
        db.UniqueConstraint(
            "teacher_id", "subject_id", "academic_year_id",
            name="uq_teacher_subject_assignment",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey("academic_years.id"), nullable=False)
