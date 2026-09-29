from database import db


class FeeStructure(db.Model):
    __tablename__ = "fee_structure"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    year_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "academic_years.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    term_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "terms.id",
            ondelete="CASCADE"
        ),
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

    academic_year_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "academic_years.id"
        ),
        nullable=True
    )

    fee_type = db.Column(
        db.String(60),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    due_date = db.Column(
        db.Date,
        nullable=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "year_id": self.year_id,
            "term_id": self.term_id,
            "class_id": self.class_id,
            "academic_year_id": self.academic_year_id,
            "fee_type": self.fee_type,
            "amount": float(self.amount) if self.amount is not None else 0,
            "due_date": (
                self.due_date.isoformat()
                if self.due_date
                else None
            ),
        }