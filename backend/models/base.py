from datetime import datetime, date, time
from database import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class SerializerMixin:
    def to_dict(self):
        result = {}
        for column in self.__table__.primary_key.columns:
            value = getattr(self, column.name, None)
            if isinstance(value, (datetime, date, time)):
                value = value.isoformat()
            result[column.name] = value
        for column in self.__table__.columns:
            if column.name in result:
                continue
            value = getattr(self, column.name, None)
            if isinstance(value, (datetime, date, time)):
                value = value.isoformat()
            result[column.name] = value
        return result
