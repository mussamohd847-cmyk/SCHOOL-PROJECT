from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

db = SQLAlchemy()


def init_db(app):
    """Attach SQLAlchemy to the Flask app."""
    db.init_app(app)


def check_db_connection():
    """Returns True if the database is reachable, False otherwise."""
    try:
        db.session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
