from database import db
from models.base import TimestampMixin, SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model, TimestampMixin, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(30))
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum("ADMIN", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT", name="user_role"),
        nullable=False,
    )
    status = db.Column(
        db.Enum("ACTIVE", "INACTIVE", "SUSPENDED", name="user_status"),
        default="ACTIVE",
        nullable=False,
    )

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        data = super().to_dict()
        data.pop("password_hash", None)
        return data
