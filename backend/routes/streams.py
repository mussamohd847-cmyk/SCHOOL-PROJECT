from models import Stream
from utils.crud_factory import build_crud_blueprint

streams_bp = build_crud_blueprint(
    "streams", "/api/streams", Stream,
    required_fields=["class_id", "name"],
    writable_fields=["class_id", "name", "capacity", "status"],
)
