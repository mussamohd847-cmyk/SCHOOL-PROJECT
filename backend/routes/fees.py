from flask import Blueprint, request
from database import db
from models import FeeStructure
from utils.crud_factory import build_crud_blueprint

fees_bp = build_crud_blueprint(
    "fees", "/api/fees", FeeStructure,
    required_fields=["fee_name", "amount"],
    writable_fields=["class_id", "academic_year_id", "term_id", "fee_name", "amount", "description", "status"],
    write_roles=("ADMIN", "ACCOUNTANT"),
    singular_name="fee structure",
)
