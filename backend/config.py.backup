import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration built from environment variables."""

    # ---------------------------------------------------------
    # APPLICATION
    # ---------------------------------------------------------
    SECRET_KEY = os.environ.get(
        "SECRET_KEY",
        "change-this-secret"
    )

    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY",
        "change-this-jwt-secret"
    )

    JWT_EXPIRY_HOURS = int(
        os.environ.get("JWT_EXPIRY_HOURS", "12")
    )

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    DB_HOST = os.environ.get(
        "DB_HOST",
        "127.0.0.1"
    )

    DB_PORT = os.environ.get(
        "DB_PORT",
        "3306"
    )

    DB_NAME = os.environ.get(
        "DB_NAME",
        "nia_system"
    )

    DB_USER = os.environ.get(
        "DB_USER",
        "sfpms_user"
    )

    DB_PASSWORD = os.environ.get(
        "DB_PASSWORD",
        ""
    )

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://"
        f"{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    # Origins provided through .env
    env_origins = os.environ.get(
        "CORS_ORIGINS",
        ""
    )

    env_origins = [
        origin.strip()
        for origin in env_origins.split(",")
        if origin.strip()
    ]

    # Default origins for local development
    default_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    # Add environment origins without duplicates
    CORS_ORIGINS = list(
        dict.fromkeys(
            default_origins + env_origins
        )
    )

    # ---------------------------------------------------------
    # SERVER
    # ---------------------------------------------------------
    HOST = os.environ.get(
        "HOST",
        "0.0.0.0"
    )

    PORT = int(
        os.environ.get("PORT", "5000")
    )

    FLASK_ENV = os.environ.get(
        "FLASK_ENV",
        "development"
    )

    DEBUG = FLASK_ENV == "development"


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}