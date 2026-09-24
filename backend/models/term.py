from database import db
from models.base import TimestampMixin, SerializerMixin


class Term(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "terms"

    id = db.Column(db.Integer, primary_key=True)
    academic_year_id = db.Column(db.Integer, db.ForeignKey("academic_years.id"), nullable=False)
    name = db.Column(db.Enum("TERM 1", "TERM 2", "TERM 3", name="term_name"), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="term_status"), default="INACTIVE")
