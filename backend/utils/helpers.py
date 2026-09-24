from datetime import datetime, date, time


def parse_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


def parse_time(value):
    if not value:
        return None
    if isinstance(value, time):
        return value
    return datetime.strptime(value, "%H:%M").time()


def update_model_from_dict(model, data, allowed_fields):
    """Apply only whitelisted fields from `data` onto `model`."""
    for field in allowed_fields:
        if field in data:
            setattr(model, field, data[field])
    return model
