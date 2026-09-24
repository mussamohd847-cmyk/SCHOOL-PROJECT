from database import db
from models.base import TimestampMixin, SerializerMixin


class AcademicYear(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "academic_years"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="academic_year_status"), default="INACTIVE")

    terms = db.relationship("Term", backref="academic_year", lazy=True)
