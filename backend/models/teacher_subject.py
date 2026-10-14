from database import db
from models.base import SerializerMixin


class TeacherSubject(db.Model, SerializerMixin):
    __tablename__ = "teacher_subjects"

    teacher_id = db.Column(
        db.Integer, db.ForeignKey("teachers.id"), primary_key=True
    )
    subject_id = db.Column(
        db.Integer, db.ForeignKey("subjects.id"), primary_key=True
    )
