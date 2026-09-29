
import os

from flask import Flask, request
from flask_cors import CORS

from config import config_by_name
from database import (
    db,
    init_db,
    check_db_connection,
)
from utils.responses import (
    success_response,
    error_response,
)


def create_app(config_name=None):

    # =====================================================
    # CONFIGURATION
    # =====================================================

    config_name = config_name or os.environ.get(
        "FLASK_ENV",
        "development"
    )

    app = Flask(__name__)

    app.config.from_object(
        config_by_name.get(
            config_name,
            config_by_name["development"]
        )
    )

    # =====================================================
    # DATABASE
    # =====================================================

    init_db(app)

    # =====================================================
    # CORS
    # =====================================================

    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    env_origins = os.environ.get(
        "CORS_ORIGINS",
        ""
    )

    if env_origins:

        for origin in env_origins.split(","):

            origin = origin.strip()

            if origin and origin not in allowed_origins:
                allowed_origins.append(origin)

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        expose_headers=[
            "Content-Type",
            "Authorization",
        ],
        max_age=600,
    )

    # =====================================================
    # PREFLIGHT REQUEST
    # =====================================================

    @app.before_request
    def handle_preflight():

        if request.method == "OPTIONS":
            return "", 204

    # =====================================================
    # BLUEPRINTS
    # =====================================================

    from routes import ALL_BLUEPRINTS

    for blueprint in ALL_BLUEPRINTS:

        app.register_blueprint(
            blueprint
        )

    # =====================================================
    # HEALTH CHECK
    # =====================================================

    @app.route(
        "/api/health",
        methods=["GET"]
    )
    def health():

        if check_db_connection():

            return success_response(
                "NIA backend is running",
                {
                    "database": "connected"
                }
            )

        return error_response(
            "Database connection failed",
            500,
            {
                "database": "disconnected"
            }
        )

    # =====================================================
    # 404
    # =====================================================

    @app.errorhandler(404)
    def not_found(error):

        return error_response(
            "Resource not found",
            404
        )

    # =====================================================
    # 405
    # =====================================================

    @app.errorhandler(405)
    def method_not_allowed(error):

        return error_response(
            "Method not allowed",
            405
        )

    # =====================================================
    # 500
    # =====================================================

    @app.errorhandler(500)
    def internal_error(error):

        try:
            db.session.rollback()
        except Exception:
            pass

        message = "Internal server error"

        if app.config.get("DEBUG"):

            message = str(error)

        return error_response(
            message,
            500
        )

    # =====================================================
    # RETURN APPLICATION
    # =====================================================

    return app


# =========================================================
# CREATE APPLICATION
# =========================================================

app = create_app()


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=6001,
        debug=True,
    )