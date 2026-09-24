import os

from flask import Flask
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
    # ---------------------------------------------------------
    # CONFIGURATION
    # ---------------------------------------------------------
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

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    init_db(app)

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"]
            }
        },
        supports_credentials=True,
    )

    # ---------------------------------------------------------
    # BLUEPRINTS / ROUTES
    # ---------------------------------------------------------
    from routes import ALL_BLUEPRINTS

    for bp in ALL_BLUEPRINTS:
        app.register_blueprint(bp)

    # ---------------------------------------------------------
    # HEALTH CHECK
    # ---------------------------------------------------------
    @app.route("/api/health", methods=["GET"])
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

    # ---------------------------------------------------------
    # 404
    # ---------------------------------------------------------
    @app.errorhandler(404)
    def not_found(e):
        return error_response(
            "Resource not found",
            404
        )

    # ---------------------------------------------------------
    # 405
    # ---------------------------------------------------------
    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response(
            "Method not allowed",
            405
        )

    # ---------------------------------------------------------
    # 500
    # ---------------------------------------------------------
    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()

        message = "Internal server error"

        if app.config["DEBUG"]:
            message = str(e)

        return error_response(
            message,
            500
        )

    return app


# -------------------------------------------------------------
# APPLICATION INSTANCE
# -------------------------------------------------------------
app = create_app()


# -------------------------------------------------------------
# RUN SERVER
# -------------------------------------------------------------
if __name__ == "__main__":
    app.run(
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"],
    )