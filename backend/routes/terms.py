from models import Term
from utils.crud_factory import build_crud_blueprint

terms_bp = build_crud_blueprint(
    "terms", "/api/terms", Term,
    required_fields=["academic_year_id", "name", "start_date", "end_date"],
    writable_fields=["academic_year_id", "name", "start_date", "end_date", "status"],
)
