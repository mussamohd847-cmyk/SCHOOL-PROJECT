import os

from dotenv import load_dotenv

load_dotenv()


class Config:

    # =====================================================
    # APPLICATION
    # =====================================================

    SECRET_KEY = os.environ.get(
        "SECRET_KEY",
        "nia-school-secret-key"
    )

    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY",
        "nia-school-jwt-secret-key"
    )

    JWT_EXPIRY_HOURS = int(
        os.environ.get(
            "JWT_EXPIRY_HOURS",
            "12"
        )
    )

    # =====================================================
    # DATABASE
    # =====================================================

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

    from sqlalchemy.engine import URL
    SQLALCHEMY_DATABASE_URI = URL.create(
        "mysql+pymysql",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
        database=DB_NAME,
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_size": 5,
        "max_overflow": 15,
        "pool_timeout": 30,
        "pool_use_lifo": True,
        "connect_args": {
            "connect_timeout": 10,
            "ssl": {"ca": os.environ.get(
                "TIDB_CA_PATH",
                str(__import__("pathlib").Path(__file__).parent / "certs" / "tidb-ca.pem")
            )},
        },
    }

    # =====================================================
    # CORS
    # =====================================================

    default_origins = [
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
        default_origins.extend(
            origin.strip()
            for origin in env_origins.split(",")
            if origin.strip()
        )

    CORS_ORIGINS = list(
        dict.fromkeys(default_origins)
    )

    # =====================================================
    # SERVER
    # =====================================================

    HOST = os.environ.get(
        "HOST",
        "0.0.0.0"
    )

    PORT = int(
        os.environ.get(
            "PORT",
            "6001"
        )
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