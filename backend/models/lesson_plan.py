from database import db
from datetime import datetime

class LessonPlan(db.Model):
    __tablename__ = "lesson_plans"

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"), nullable=False, index=True)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    lesson_date = db.Column(db.Date, nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    objectives = db.Column(db.Text, nullable=False)
    activities = db.Column(db.Text, nullable=True)
    resources = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "class_id": self.class_id,
            "subject_id": self.subject_id,
            "lesson_date": self.lesson_date.isoformat() if self.lesson_date else None,
            "topic": self.topic,
            "objectives": self.objectives,
            "activities": self.activities or "",
            "resources": self.resources or "",
            "notes": self.notes or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
