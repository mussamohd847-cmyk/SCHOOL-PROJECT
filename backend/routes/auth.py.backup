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

    # ==========================================================
    # DEFAULT ADMIN ACCOUNT
    # Username: admin
    # Password: admin
    # ==========================================================

    if username == "admin" and password == "admin":

        user = User.query.filter_by(
            username="admin"
        ).first()

        # ------------------------------------------------------
        # CREATE ADMIN IF DOES NOT EXIST
        # ------------------------------------------------------

        if not user:

            user = User(
                username="admin",
                role="admin",
                status="active",
                name="NIA Administrator",
            )

            user.set_password("admin")

            db.session.add(user)
            db.session.commit()

        # ------------------------------------------------------
        # MAKE SURE ADMIN ACCOUNT IS CORRECT
        # ------------------------------------------------------

        else:

            user.username = "admin"
            user.role = "admin"
            user.status = "active"
            user.name = "NIA Administrator"

            user.set_password("admin")

            db.session.commit()

    # ==========================================================
    # NORMAL DATABASE USER
    # ==========================================================

    else:

        user = User.query.filter_by(
            username=username
        ).first()

        if not user:

            return error_response(
                "Invalid username or password",
                401,
            )

        # ------------------------------------------------------
        # CHECK ACCOUNT STATUS
        # ------------------------------------------------------

        if str(user.status).lower() != "active":

            return error_response(
                "User account is inactive",
                403,
            )

        # ------------------------------------------------------
        # CHECK PASSWORD
        # ------------------------------------------------------

        if not user.check_password(password):

            return error_response(
                "Invalid username or password",
                401,
            )

    # ==========================================================
    # FORCE CORRECT ADMIN STATUS
    # ==========================================================

    if username == "admin":

        user.role = "admin"
        user.status = "active"

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

    return success_response(
        "Login successful",
        {
            "token": token,
            "user": user.to_dict(),
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