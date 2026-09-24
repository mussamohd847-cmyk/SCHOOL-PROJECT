from database import db
from models.base import TimestampMixin, SerializerMixin


class Student(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    student_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.Enum("MALE", "FEMALE", name="student_gender"))
    date_of_birth = db.Column(db.Date)
    phone = db.Column(db.String(30))
    email = db.Column(db.String(150))
    address = db.Column(db.String(255))
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"))
    stream_id = db.Column(db.Integer, db.ForeignKey("streams.id"))
    parent_name = db.Column(db.String(150))
    parent_phone = db.Column(db.String(30))
    admission_date = db.Column(db.Date)
    status = db.Column(
        db.Enum("ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED", "SUSPENDED", name="student_status"),
        default="ACTIVE",
    )
