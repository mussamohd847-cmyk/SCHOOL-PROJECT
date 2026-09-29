from database import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(60),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False,
    )

    role = db.Column(
        db.Enum(
            "admin",
            "accountant",
            "teacher",
            "parent",
            "pupil",
        ),
        nullable=False,
    )

    name = db.Column(
        db.String(120),
        nullable=False,
    )

    teacher_id = db.Column(
        db.Integer,
        nullable=True,
    )

    student_id = db.Column(
        db.Integer,
        unique=True,
        nullable=True,
    )

    status = db.Column(
        db.Enum(
            "active",
            "inactive",
        ),
        nullable=False,
        default="active",
    )

    must_change_password = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    last_login_at = db.Column(
        db.DateTime,
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
    )

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(
            self.password_hash,
            raw_password,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "name": self.name,
            "teacher_id": self.teacher_id,
            "student_id": self.student_id,
            "status": self.status,
            "must_change_password": self.must_change_password,
            "last_login_at": (
                self.last_login_at.isoformat()
                if self.last_login_at
                else None
            ),
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }