"""
Database initialization script.

Usage:
    python -m seed.init_db

Steps performed:
1. Connect to MySQL using the credentials in .env
2. Verify the target database exists (and create it if missing)
3. Create any missing tables (never drops or alters existing ones)
4. Verify all expected tables are present
5. Seed default data (admin user, academic year, terms, classes, subjects)
6. Report errors clearly and exit non-zero on failure
"""
import sys
import pymysql
from sqlalchemy import inspect

sys.path.insert(0, ".")

from config import Config
from app import create_app
from database import db
import models  # noqa: F401 registers all models' metadata


EXPECTED_TABLES = [
    "users", "students", "teachers", "classes", "streams", "subjects",
    "teacher_classes", "teacher_subjects", "academic_years", "terms",
    "timetable", "attendance", "exams", "results", "fee_structure",
    "payments", "settings",
]


def ensure_database_exists():
    print(f"[1/6] Connecting to MySQL server at {Config.DB_HOST}:{Config.DB_PORT} ...")
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST, port=int(Config.DB_PORT),
            user=Config.DB_USER, password=Config.DB_PASSWORD,
        )
    except Exception as exc:
        print(f"ERROR: Could not connect to MySQL server: {exc}")
        sys.exit(1)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
        print(f"[2/6] Database `{Config.DB_NAME}` verified/created.")
    finally:
        connection.close()


def create_tables(app):
    print("[3/6] Creating missing tables (existing tables and data are left untouched) ...")
    with app.app_context():
        db.create_all()
    print("      Done.")


def verify_tables(app):
    print("[4/6] Verifying tables ...")
    with app.app_context():
        inspector = inspect(db.engine)
        existing = set(inspector.get_table_names())
        missing = [t for t in EXPECTED_TABLES if t not in existing]
        if missing:
            print(f"ERROR: The following expected tables are missing: {missing}")
            sys.exit(1)
        print(f"      All {len(EXPECTED_TABLES)} expected tables are present.")


def seed_data(app):
    print("[5/6] Seeding default data ...")
    with app.app_context():
        from seed.seed_database import run_seed
        run_seed()
    print("      Done.")


def main():
    print("=== NIA Backend: Database Initialization ===")
    ensure_database_exists()

    app = create_app()
    create_tables(app)
    verify_tables(app)
    seed_data(app)

    print("[6/6] Database initialization complete.")


if __name__ == "__main__":
    main()
