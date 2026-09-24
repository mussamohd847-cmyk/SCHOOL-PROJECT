from database import db
from models.base import TimestampMixin, SerializerMixin


class Setting(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "settings"

    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    setting_value = db.Column(db.Text)
    description = db.Column(db.String(255))
