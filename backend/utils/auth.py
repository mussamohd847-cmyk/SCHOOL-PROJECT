import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, current_app
from models import User
from utils.responses import error_response


def generate_token(user):
    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=current_app.config["JWT_EXPIRY_HOURS"]),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])


def get_token_from_request():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None


def login_required(f):
    """Validates the JWT and attaches request.current_user."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return error_response("Authentication token is missing", 401)
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return error_response("Token has expired", 401)
        except jwt.InvalidTokenError:
            return error_response("Invalid token", 401)

        user = User.query.get(payload.get("user_id"))
        if not user or user.status != "ACTIVE":
            return error_response("User not found or inactive", 401)

        request.current_user = user
        return f(*args, **kwargs)

    return decorated


def roles_required(*roles):
    """Restricts an endpoint to the given roles. Use after @login_required."""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(request, "current_user", None)
            if not user:
                return error_response("Authentication required", 401)
            if user.role not in roles:
                return error_response("You do not have permission to perform this action", 403)
            return f(*args, **kwargs)

        return decorated

    return decorator
