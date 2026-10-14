from database import db

class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_published = db.Column(db.Boolean, nullable=False, default=True, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
