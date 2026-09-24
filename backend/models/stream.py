from database import db
from models.base import TimestampMixin, SerializerMixin


class Stream(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "streams"

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer)
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="stream_status"), default="ACTIVE")

    students = db.relationship("Student", backref="stream", lazy=True)
