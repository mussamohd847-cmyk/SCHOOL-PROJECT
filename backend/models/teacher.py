from database import db
from models.base import TimestampMixin, SerializerMixin


class Teacher(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "teachers"

    id = db.Column(db.Integer, primary_key=True)
    employee_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.Enum("MALE", "FEMALE", name="teacher_gender"))
    phone = db.Column(db.String(30))
    email = db.Column(db.String(150))
    address = db.Column(db.String(255))
    specialization = db.Column(db.String(150))
    employment_date = db.Column(db.Date)
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="teacher_status"), default="ACTIVE")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    user = db.relationship("User", backref="teacher_profile", uselist=False)
