import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import request, current_app

from models import User
from utils.responses import error_response


def generate_token(user):

    now = datetime.now(timezone.utc)

    payload = {
        "user_id": user.id,
        "role": str(user.role).strip().lower(),
        "iat": now,
        "exp": now + timedelta(
            hours=current_app.config["JWT_EXPIRY_HOURS"]
        ),
    }

    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )


def decode_token(token):

    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=["HS256"],
    )


def get_token_from_request():

    auth_header = request.headers.get(
        "Authorization",
        ""
    ).strip()

    if not auth_header:
        return None

    parts = auth_header.split(
        " ",
        1
    )

    if len(parts) != 2:
        return None

    scheme = parts[0].strip().lower()
    token = parts[1].strip()

    if scheme != "bearer" or not token:
        return None

    return token


def login_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        token = get_token_from_request()

        if not token:
            return error_response(
                "Authentication token is missing",
                401,
            )

        try:

            payload = decode_token(token)

        except jwt.ExpiredSignatureError:

            return error_response(
                "Token has expired",
                401,
            )

        except jwt.InvalidTokenError:

            return error_response(
                "Invalid token",
                401,
            )

        user_id = payload.get("user_id")

        if not user_id:

            return error_response(
                "Invalid authentication token",
                401,
            )

        user = User.query.get(user_id)

        if not user:

            return error_response(
                "User not found or inactive",
                401,
            )

        user_status = str(
            user.status or ""
        ).strip().lower()

        if user_status != "active":

            return error_response(
                "User not found or inactive",
                401,
            )

        request.current_user = user

        return f(
            *args,
            **kwargs,
        )

    return decorated


def roles_required(*roles):

    allowed_roles = {
        str(role).strip().lower()
        for role in roles
    }

    def decorator(f):

        @wraps(f)
        def decorated(*args, **kwargs):

            user = getattr(
                request,
                "current_user",
                None,
            )

            if not user:

                return error_response(
                    "Authentication required",
                    401,
                )

            user_role = str(
                user.role or ""
            ).strip().lower()

            if user_role not in allowed_roles:

                return error_response(
                    "You do not have permission to perform this action",
                    403,
                )

            return f(
                *args,
                **kwargs,
            )

        return decorated

    return decorator