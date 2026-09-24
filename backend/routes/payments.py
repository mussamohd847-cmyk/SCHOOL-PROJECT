from flask import Blueprint, request
from sqlalchemy import func
from database import db
from models import Payment, FeeStructure
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response, paginate_query
from utils.validators import require_fields
from utils.helpers import parse_date

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payments_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def list_payments():
    query = Payment.query
    student_id = request.args.get("student_id", type=int)
    if student_id:
        query = query.filter_by(student_id=student_id)
    items, pagination = paginate_query(query.order_by(Payment.payment_date.desc()), request.args)
    return success_response("Payments list", [p.to_dict() for p in items], pagination=pagination)


@payments_bp.route("/<int:payment_id>", methods=["GET"])
@login_required
def get_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return error_response("Payment not found", 404)
    return success_response("Payment details", payment.to_dict())


@payments_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def create_payment():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["student_id", "fee_structure_id", "amount", "payment_date", "payment_method"])
    if missing:
        return error_response(f"{missing} is required", 400)

    ref = data.get("reference_number")
    if ref and Payment.query.filter_by(reference_number=ref).first():
        return error_response("reference_number already exists", 409)

    payment = Payment(
        student_id=data["student_id"], fee_structure_id=data["fee_structure_id"],
        amount=data["amount"], payment_date=parse_date(data["payment_date"]),
        payment_method=data["payment_method"], reference_number=ref,
        received_by=request.current_user.id, remarks=data.get("remarks"),
    )
    db.session.add(payment)
    db.session.commit()
    return success_response("Payment recorded successfully", payment.to_dict(), 201)


@payments_bp.route("/<int:payment_id>", methods=["PUT"])
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def update_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return error_response("Payment not found", 404)
    data = request.get_json(silent=True) or {}
    for field in ("amount", "payment_method", "reference_number", "remarks"):
        if field in data:
            setattr(payment, field, data[field])
    if "payment_date" in data:
        payment.payment_date = parse_date(data["payment_date"])
    db.session.commit()
    return success_response("Payment updated successfully", payment.to_dict())


@payments_bp.route("/<int:payment_id>", methods=["DELETE"])
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return error_response("Payment not found", 404)
    db.session.delete(payment)
    db.session.commit()
    return success_response("Payment deleted successfully")


@payments_bp.route("/student/<int:student_id>/balance", methods=["GET"])
@login_required
def student_balance(student_id):
    total_fees = db.session.query(func.coalesce(func.sum(FeeStructure.amount), 0)).scalar()
    total_paid = (
        db.session.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.student_id == student_id)
        .scalar()
    )
    total_fees = float(total_fees or 0)
    total_paid = float(total_paid or 0)
    return success_response(
        "Student balance",
        {
            "student_id": student_id,
            "total_fees": total_fees,
            "total_paid": total_paid,
            "balance": round(total_fees - total_paid, 2),
        },
    )
