from models import Subject
from utils.crud_factory import build_crud_blueprint

subjects_bp = build_crud_blueprint(
    "subjects", "/api/subjects", Subject,
    required_fields=["code", "name", "category"],
    unique_fields=["code"],
    writable_fields=["code", "name", "category", "description", "status"],
)
