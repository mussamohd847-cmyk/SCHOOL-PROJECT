from database import db
from models.base import TimestampMixin, SerializerMixin


class Teacher(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "teachers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    employee_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    teacher_no = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        index=True
    )

    first_name = db.Column(
        db.String(100),
        nullable=False
    )

    middle_name = db.Column(
        db.String(100),
        nullable=True
    )

    last_name = db.Column(
        db.String(100),
        nullable=False
    )

    name = db.Column(
        db.String(120),
        nullable=False
    )

    gender = db.Column(
        db.Enum(
            "Male",
            "Female",
            name="teacher_gender"
        ),
        nullable=False
    )

    phone = db.Column(
        db.String(30),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=True
    )

    address = db.Column(
        db.String(200),
        nullable=True
    )

    specialization = db.Column(
        db.String(150),
        nullable=True
    )

    employment_date = db.Column(
        db.Date,
        nullable=True
    )

    assignment = db.Column(
        db.Enum(
            "school",
            "madrasa",
            "both"
        ),
        nullable=False,
        default="school"
    )

    status = db.Column(
        db.Enum(
            "active",
            "inactive"
        ),
        nullable=False,
        default="active"
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    user = db.relationship(
        "User",
        backref="teacher_profile",
        uselist=False
    )