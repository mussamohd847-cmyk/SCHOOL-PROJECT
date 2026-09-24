from database import db
from models.base import TimestampMixin, SerializerMixin


class Payment(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    fee_structure_id = db.Column(db.Integer, db.ForeignKey("fee_structure.id"), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(
        db.Enum("CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER", name="payment_method"),
        nullable=False,
    )
    reference_number = db.Column(db.String(100), unique=True)
    received_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    remarks = db.Column(db.String(255))
