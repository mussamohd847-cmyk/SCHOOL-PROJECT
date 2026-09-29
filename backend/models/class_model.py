from database import db
from models.base import TimestampMixin, SerializerMixin


class ClassModel(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "classes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(50),
        nullable=False
    )

    level = db.Column(
        db.String(50),
        nullable=True
    )

    description = db.Column(
        db.String(255),
        nullable=True
    )

    status = db.Column(
        db.Enum(
            "active",
            "inactive",
            name="class_status"
        ),
        nullable=False,
        default="active"
    )

    streams = db.relationship(
        "Stream",
        backref="class_",
        lazy=True,
        cascade="all, delete-orphan"
    )

    school_students = db.relationship(
        "Student",
        foreign_keys="Student.school_class_id",
        backref="school_class",
        lazy=True
    )

    madrasa_students = db.relationship(
        "Student",
        foreign_keys="Student.madrasa_class_id",
        backref="madrasa_class",
        lazy=True
    )