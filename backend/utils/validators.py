import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def require_fields(data, fields):
    """Returns the name of the first missing/blank required field, or None."""
    if not isinstance(data, dict):
        return fields[0] if fields else "body"
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return field
    return None


def is_valid_email(email):
    return bool(email and EMAIL_RE.match(email))


def is_valid_enum(value, allowed_values):
    return value in allowed_values
