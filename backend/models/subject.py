from database import db
from models.base import TimestampMixin, SerializerMixin


class Subject(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.Enum("SCHOOL", "MADRASA", name="subject_category"), nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.Enum("ACTIVE", "INACTIVE", name="subject_status"), default="ACTIVE")
