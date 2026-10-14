from flask import Blueprint, request
from sqlalchemy import func

from database import db
from models import Payment, FeeStructure, Student
from utils.auth import login_required, roles_required
from utils.responses import (
    success_response,
    error_response,
    paginate_query,
)
from utils.validators import require_fields
from utils.helpers import parse_date


payments_bp = Blueprint(
    "payments",
    __name__,
    url_prefix="/api/payments",
)


# =========================================================
# LIST PAYMENTS
# =========================================================

@payments_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def list_payments():
    query = Payment.query

    student_id = request.args.get(
        "student_id",
        type=int,
    )

    if student_id:
        query = query.filter(
            Payment.student_id == student_id
        )

    items, pagination = paginate_query(
        query.order_by(
            Payment.payment_date.desc(),
            Payment.id.desc(),
        ),
        request.args,
    )

    return success_response(
        "Payments list",
        [p.to_dict() for p in items],
        pagination=pagination,
    )


# =========================================================
# GET SINGLE PAYMENT
# =========================================================

@payments_bp.route(
    "/<int:payment_id>",
    methods=["GET"],
)
@login_required
def get_payment(payment_id):
    payment = Payment.query.get(
        payment_id
    )

    if not payment:
        return error_response(
            "Payment not found",
            404,
        )

    return success_response(
        "Payment details",
        payment.to_dict(),
    )


# =========================================================
# CREATE PAYMENT
# =========================================================

@payments_bp.route(
    "",
    methods=["POST"],
)
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def create_payment():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    missing = require_fields(
        data,
        [
            "student_id",
            "fee_structure_id",
            "amount",
            "payment_date",
            "payment_method",
        ],
    )

    if missing:
        return error_response(
            f"{missing} is required",
            400,
        )

    student = Student.query.get(
        data["student_id"]
    )

    if not student:
        return error_response(
            "Student not found",
            404,
        )

    fee = FeeStructure.query.get(
        data["fee_structure_id"]
    )

    if not fee:
        return error_response(
            "Fee structure not found",
            404,
        )

    try:
        amount = float(
            data["amount"]
        )
    except (
        TypeError,
        ValueError,
    ):
        return error_response(
            "Invalid payment amount",
            400,
        )

    if amount <= 0:
        return error_response(
            "Payment amount must be greater than zero",
            400,
        )

    payment_method = str(
        data["payment_method"]
    ).upper()

    allowed_methods = {
        "CASH",
        "BANK",
        "MOBILE_MONEY",
        "CARD",
        "OTHER",
    }

    if (
        payment_method
        not in allowed_methods
    ):
        return error_response(
            "Invalid payment method",
            400,
        )

    reference_number = (
        data.get(
            "reference_number"
        )
        or None
    )

    if reference_number:
        reference_number = (
            str(
                reference_number
            ).strip()
        )

        existing = (
            Payment.query.filter(
                Payment.reference_number
                == reference_number
            ).first()
        )

        if existing:
            return error_response(
                "reference_number already exists",
                409,
            )

    payment = Payment(
        student_id=student.id,
        fee_structure_id=fee.id,
        amount=amount,
        payment_date=parse_date(
            data["payment_date"]
        ),
        payment_method=payment_method,
        reference_number=reference_number,
        received_by=(
            request.current_user.id
            if request.current_user
            else None
        ),
        remarks=(
            str(
                data.get("remarks")
            ).strip()
            if data.get("remarks")
            else None
        ),
    )

    db.session.add(payment)
    db.session.commit()

    return success_response(
        "Payment recorded successfully",
        payment.to_dict(),
        201,
    )


# =========================================================
# UPDATE PAYMENT
# =========================================================

@payments_bp.route(
    "/<int:payment_id>",
    methods=["PUT"],
)
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def update_payment(payment_id):

    payment = Payment.query.get(
        payment_id
    )

    if not payment:
        return error_response(
            "Payment not found",
            404,
        )

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    if "amount" in data:
        try:
            amount = float(
                data["amount"]
            )
        except (
            TypeError,
            ValueError,
        ):
            return error_response(
                "Invalid payment amount",
                400,
            )

        if amount <= 0:
            return error_response(
                "Payment amount must be greater than zero",
                400,
            )

        payment.amount = amount

    if "payment_method" in data:

        method = str(
            data["payment_method"]
        ).upper()

        allowed_methods = {
            "CASH",
            "BANK",
            "MOBILE_MONEY",
            "CARD",
            "OTHER",
        }

        if method not in allowed_methods:
            return error_response(
                "Invalid payment method",
                400,
            )

        payment.payment_method = method

    if "reference_number" in data:

        reference = (
            data.get(
                "reference_number"
            )
            or None
        )

        if reference:
            reference = str(
                reference
            ).strip()

            existing = (
                Payment.query.filter(
                    Payment.reference_number
                    == reference,
                    Payment.id
                    != payment.id,
                ).first()
            )

            if existing:
                return error_response(
                    "reference_number already exists",
                    409,
                )

        payment.reference_number = (
            reference
        )

    if "remarks" in data:
        payment.remarks = (
            str(
                data["remarks"]
            ).strip()
            if data["remarks"]
            else None
        )

    if "payment_date" in data:
        payment.payment_date = (
            parse_date(
                data["payment_date"]
            )
        )

    if "fee_structure_id" in data:

        fee = FeeStructure.query.get(
            data["fee_structure_id"]
        )

        if not fee:
            return error_response(
                "Fee structure not found",
                404,
            )

        payment.fee_structure_id = (
            fee.id
        )

    db.session.commit()

    return success_response(
        "Payment updated successfully",
        payment.to_dict(),
    )


# =========================================================
# DELETE PAYMENT
# =========================================================

@payments_bp.route(
    "/<int:payment_id>",
    methods=["DELETE"],
)
@login_required
@roles_required("ADMIN", "ACCOUNTANT")
def delete_payment(payment_id):

    payment = Payment.query.get(
        payment_id
    )

    if not payment:
        return error_response(
            "Payment not found",
            404,
        )

    db.session.delete(payment)
    db.session.commit()

    return success_response(
        "Payment deleted successfully"
    )


# =========================================================
# STUDENT BALANCE
# =========================================================

@payments_bp.route(
    "/student/<int:student_id>/balance",
    methods=["GET"],
)
@login_required
def student_balance(student_id):

    student = Student.query.get(
        student_id
    )

    if not student:
        return error_response(
            "Student not found",
            404,
        )

    # -----------------------------------------------------
    # Student's school class
    # -----------------------------------------------------

    class_id = (
        student.school_class_id
    )

    # -----------------------------------------------------
    # Total fees for student's class
    # -----------------------------------------------------

    fee_query = FeeStructure.query

    if class_id:
        fee_query = fee_query.filter(
            FeeStructure.class_id
            == class_id
        )

    total_fees = (
        fee_query.with_entities(
            func.coalesce(
                func.sum(
                    FeeStructure.amount
                ),
                0,
            )
        ).scalar()
    )

    # -----------------------------------------------------
    # Total paid by this student
    # -----------------------------------------------------

    total_paid = (
        db.session.query(
            func.coalesce(
                func.sum(
                    Payment.amount
                ),
                0,
            )
        )
        .filter(
            Payment.student_id
            == student_id
        )
        .scalar()
    )

    total_fees = float(
        total_fees or 0
    )

    total_paid = float(
        total_paid or 0
    )

    balance = (
        total_fees -
        total_paid
    )

    return success_response(
        "Student balance",
        {
            "student_id": student_id,
            "total_fees": round(
                total_fees,
                2,
            ),
            "total_paid": round(
                total_paid,
                2,
            ),
            "balance": round(
                balance,
                2,
            ),
        },
    )