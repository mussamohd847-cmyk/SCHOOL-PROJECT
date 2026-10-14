from database import db
from datetime import datetime


class RolePermission(db.Model):
    __tablename__ = "role_permissions"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(30), nullable=False, index=True)
    permission_id = db.Column(
        db.Integer,
        db.ForeignKey("permissions.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    permission = db.relationship("Permission", backref="role_permissions")

    __table_args__ = (
        db.UniqueConstraint("role", "permission_id", name="uq_role_permission"),
    )
