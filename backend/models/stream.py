from database import db
from models.base import TimestampMixin, SerializerMixin


class Stream(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "streams"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(50),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "classes.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    school_students = db.relationship(
        "Student",
        foreign_keys="Student.school_stream_id",
        backref="school_stream",
        lazy=True
    )

    madrasa_students = db.relationship(
        "Student",
        foreign_keys="Student.madrasa_stream_id",
        backref="madrasa_stream",
        lazy=True
    )