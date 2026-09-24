from flask import request
from database import db
from models import AcademicYear
from utils.crud_factory import build_crud_blueprint
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response

academic_years_bp = build_crud_blueprint(
    "academic_years", "/api/academic-years", AcademicYear,
    required_fields=["name", "start_date", "end_date"],
    unique_fields=["name"],
    writable_fields=["name", "start_date", "end_date", "status"],
)


@academic_years_bp.route("/<int:year_id>/activate", methods=["PUT"])
@login_required
@roles_required("ADMIN")
def activate_academic_year(year_id):
    year = AcademicYear.query.get(year_id)
    if not year:
        return error_response("Academic year not found", 404)

    AcademicYear.query.update({AcademicYear.status: "INACTIVE"})
    year.status = "ACTIVE"
    db.session.commit()
    return success_response("Academic year activated", year.to_dict())
