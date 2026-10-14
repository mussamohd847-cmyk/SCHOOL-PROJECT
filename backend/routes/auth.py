from datetime import datetime

from flask import Blueprint, request

from database import db
from models import User
from utils.auth import generate_token, login_required
from utils.responses import success_response, error_response


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


# ==============================================================
# LOGIN
# ==============================================================

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

    # Normalize username
    username = username.lower()

    # Authenticate all accounts without resetting passwords.
    user = User.query.filter_by(username=username).first()

    # Create the default admin only when the account does not exist.
    if not user:
        if username == "admin" and password == "admin":
            user = User(
                username="admin",
                role="admin",
                status="active",
                name="NIA Administrator",
            )
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
        else:
            return error_response(
                "Invalid username or password",
                401,
            )
    else:
        if str(user.status or "").strip().lower() != "active":
            return error_response(
                "User account is inactive",
                403,
            )

        if not user.check_password(password):
            return error_response(
                "Invalid username or password",
                401,
            )

    if username == "admin" and str(user.role or "").strip().lower() != "admin":
        return error_response(
            "Admin account role is misconfigured",
            403,
        )

    # ==========================================================
    # UPDATE LAST LOGIN
    # ==========================================================

    user.last_login_at = datetime.utcnow()

    db.session.commit()

    # ==========================================================
    # GENERATE JWT TOKEN
    # ==========================================================

    token = generate_token(user)

    # ==========================================================
    # RESPONSE
    # ==========================================================

    from utils.permissions import get_user_permissions

    return success_response(
        "Login successful",
        {
            "token": token,
            "user": {
                **user.to_dict(),
                "permissions": sorted(get_user_permissions(user)),
            },
        },
    )


# ==============================================================
# CURRENT LOGGED-IN USER
# ==============================================================

@auth_bp.route("/me", methods=["GET"])
@login_required
def me():

    user = request.current_user

    return success_response(
        "Current user",
        user.to_dict(),
    )

# ==============================================================
# MY PERMISSIONS
# ==============================================================

@auth_bp.route("/permissions", methods=["GET"])
@login_required
def my_permissions():
    """Rudisha role na permissions zote za mtumiaji aliyeingia."""
    from utils.permissions import get_user_permissions

    user = request.current_user

    return success_response(
        "Your permissions",
        {
            "role": str(user.role).lower(),
            "permissions": sorted(get_user_permissions(user)),
        },
    )
