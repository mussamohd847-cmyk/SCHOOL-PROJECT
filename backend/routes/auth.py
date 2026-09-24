from flask import Blueprint, request

from database import db
from models import User
from utils.auth import generate_token
from utils.responses import success_response, error_response


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if not username or not password:
        return error_response(
            "Username and password are required",
            400,
        )

    # Default NIA administrator
    if username == "admin" and password == "admin":
        user = User.query.filter_by(username="admin").first()

        if not user:
            user = User(
                username="admin",
                role="ADMIN",
                status="ACTIVE",
                name="NIA Administrator",
            )

            if hasattr(user, "set_password"):
                user.set_password("admin")
            else:
                from werkzeug.security import generate_password_hash
                user.password_hash = generate_password_hash("admin")

            db.session.add(user)
            db.session.commit()

        else:
            # Make sure the default administrator remains active
            user.role = "ADMIN"
            user.status = "ACTIVE"

            if hasattr(user, "set_password"):
                user.set_password("admin")
            elif hasattr(user, "password_hash"):
                from werkzeug.security import generate_password_hash
                user.password_hash = generate_password_hash("admin")

            db.session.commit()

        token = generate_token(user)

        return success_response(
            "Login successful",
            {
                "token": token,
                "user": user.to_dict() if hasattr(user, "to_dict") else {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "status": user.status,
                    "name": getattr(user, "name", "NIA Administrator"),
                },
            },
        )

    # Normal database users
    user = User.query.filter_by(username=username).first()

    if not user:
        return error_response(
            "Invalid username or password",
            401,
        )

    if getattr(user, "status", "ACTIVE") != "ACTIVE":
        return error_response(
            "User account is inactive",
            403,
        )

    password_valid = False

    if hasattr(user, "check_password"):
        password_valid = user.check_password(password)

    elif hasattr(user, "password_hash"):
        from werkzeug.security import check_password_hash

        password_valid = check_password_hash(
            user.password_hash,
            password,
        )

    elif hasattr(user, "password"):
        password_valid = user.password == password

    if not password_valid:
        return error_response(
            "Invalid username or password",
            401,
        )

    token = generate_token(user)

    return success_response(
        "Login successful",
        {
            "token": token,
            "user": user.to_dict() if hasattr(user, "to_dict") else {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "status": user.status,
                "name": getattr(user, "name", username),
            },
        },
    )


@auth_bp.route("/me", methods=["GET"])
def me():
    from utils.auth import login_required

    @login_required
    def current_user():
        user = request.current_user

        return success_response(
            "Current user",
            user.to_dict() if hasattr(user, "to_dict") else {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "status": user.status,
                "name": getattr(user, "name", user.username),
            },
        )

    return current_user()