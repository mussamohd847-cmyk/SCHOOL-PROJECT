from models import ClassModel
from utils.crud_factory import build_crud_blueprint

classes_bp = build_crud_blueprint(
    "classes", "/api/classes", ClassModel,
    required_fields=["name"],
    writable_fields=["name", "level", "description", "status"],
    singular_name="class",
)
