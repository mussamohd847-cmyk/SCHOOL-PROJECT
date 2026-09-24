from database import db
from models.base import TimestampMixin, SerializerMixin


class FeeStructure(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "fee_structure"

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey("classes.id"))
    academic_year_id = db.Column(db.Integer, db.ForeignKey("academic_years.id"))
    term_id = db.Column(db.Integer, db.ForeignKey("terms.id"))
    fee_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="fee_structure_status"), default="ACTIVE")
