from database import db
from models.base import TimestampMixin, SerializerMixin


class Student(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "students"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    admission_no = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        index=True
    )

    first_name = db.Column(
        db.String(80),
        nullable=False
    )

    middle_name = db.Column(
        db.String(80),
        nullable=True
    )

    last_name = db.Column(
        db.String(80),
        nullable=False
    )

    gender = db.Column(
        db.Enum(
            "Male",
            "Female",
            name="student_gender"
        ),
        nullable=False
    )

    date_of_birth = db.Column(
        db.Date,
        nullable=True
    )

    place_of_birth = db.Column(
        db.String(100),
        nullable=True
    )

    phone = db.Column(
        db.String(30),
        nullable=True
    )

    email = db.Column(
        db.String(120),
        nullable=True
    )

    address = db.Column(
        db.String(200),
        nullable=True
    )

    parent_name = db.Column(
        db.String(120),
        nullable=True
    )

    parent_phone = db.Column(
        db.String(30),
        nullable=True
    )

    parent_email = db.Column(
        db.String(120),
        nullable=True
    )

    emergency_contact = db.Column(
        db.String(30),
        nullable=True
    )

    photo = db.Column(
        db.String(255),
        nullable=True
    )

    admission_date = db.Column(
        db.Date,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "active",
            "graduated",
            "transferred",
            "suspended",
            "inactive",
            name="student_status"
        ),
        nullable=False,
        default="active"
    )

    in_school = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    school_class_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "classes.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    school_stream_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "streams.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    in_madrasa = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    madrasa_class_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "classes.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    madrasa_stream_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "streams.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "admissionNo": self.admission_no,
            "firstName": self.first_name,
            "middleName": self.middle_name,
            "lastName": self.last_name,
            "gender": self.gender,
            "dateOfBirth": (
                self.date_of_birth.isoformat()
                if self.date_of_birth
                else None
            ),
            "placeOfBirth": self.place_of_birth,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "parentName": self.parent_name,
            "parentPhone": self.parent_phone,
            "parentEmail": self.parent_email,
            "emergencyContact": self.emergency_contact,
            "photo": self.photo,
            "admissionDate": (
                self.admission_date.isoformat()
                if self.admission_date
                else None
            ),
            "status": self.status,
            "inSchool": bool(self.in_school),
            "schoolClassId": self.school_class_id,
            "schoolStreamId": self.school_stream_id,
            "inMadrasa": bool(self.in_madrasa),
            "madrasaClassId": self.madrasa_class_id,
            "madrasaStreamId": self.madrasa_stream_id,
            "createdAt": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updatedAt": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }