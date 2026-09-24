from database import db
from models.base import TimestampMixin, SerializerMixin


class ClassModel(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "classes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.String(50))
    description = db.Column(db.String(255))
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="class_status"), default="ACTIVE")

    streams = db.relationship("Stream", backref="class_", lazy=True)
    students = db.relationship("Student", backref="class_", lazy=True)
