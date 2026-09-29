from datetime import datetime

from flask import Blueprint, request, jsonify

from database import db
from models import FeeStructure


fees_bp = Blueprint(
    "fees",
    __name__,
    url_prefix="/api/fees"
)


def serialize_fee(fee):
    return {
        "id": fee.id,
        "year_id": fee.year_id,
        "term_id": fee.term_id,
        "class_id": fee.class_id,
        "academic_year_id": fee.academic_year_id,
        "fee_type": fee.fee_type,
        "amount": float(fee.amount) if fee.amount is not None else 0,
        "due_date": (
            fee.due_date.isoformat()
            if fee.due_date
            else None
        ),
    }


@fees_bp.route("", methods=["GET"])
def get_fees():
    try:
        fees = (
            FeeStructure.query
            .order_by(FeeStructure.id.desc())
            .all()
        )

        return jsonify({
            "success": True,
            "data": [serialize_fee(fee) for fee in fees]
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@fees_bp.route("", methods=["POST"])
def create_fee():
    try:
        data = request.get_json(silent=True) or {}

        year_id = data.get("year_id")
        term_id = data.get("term_id")
        class_id = data.get("class_id")
        academic_year_id = data.get("academic_year_id")

        fee_type = str(
            data.get("fee_type", "")
        ).strip()

        amount = data.get("amount")
        due_date = data.get("due_date")

        if not year_id:
            return jsonify({
                "success": False,
                "message": "Academic Year is required"
            }), 400

        if not term_id:
            return jsonify({
                "success": False,
                "message": "Term is required"
            }), 400

        if not class_id:
            return jsonify({
                "success": False,
                "message": "Class is required"
            }), 400

        if not fee_type:
            return jsonify({
                "success": False,
                "message": "Fee Type is required"
            }), 400

        if amount in (None, ""):
            return jsonify({
                "success": False,
                "message": "Amount is required"
            }), 400

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return jsonify({
                "success": False,
                "message": "Amount must be a valid number"
            }), 400

        if amount < 0:
            return jsonify({
                "success": False,
                "message": "Amount cannot be negative"
            }), 400

        if not academic_year_id:
            academic_year_id = year_id

        parsed_due_date = None

        if due_date:
            try:
                parsed_due_date = datetime.strptime(
                    due_date,
                    "%Y-%m-%d"
                ).date()
            except ValueError:
                return jsonify({
                    "success": False,
                    "message": "Due Date must use YYYY-MM-DD format"
                }), 400

        fee = FeeStructure(
            year_id=int(year_id),
            term_id=int(term_id),
            class_id=int(class_id),
            academic_year_id=int(academic_year_id),
            fee_type=fee_type,
            amount=amount,
            due_date=parsed_due_date,
        )

        db.session.add(fee)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Fee structure created successfully",
            "data": serialize_fee(fee)
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@fees_bp.route("/<int:fee_id>", methods=["PUT", "PATCH"])
def update_fee(fee_id):
    try:
        fee = FeeStructure.query.get(fee_id)

        if not fee:
            return jsonify({
                "success": False,
                "message": "Fee structure not found"
            }), 404

        data = request.get_json(silent=True) or {}

        if "year_id" in data and data["year_id"]:
            fee.year_id = int(data["year_id"])

        if "academic_year_id" in data:
            fee.academic_year_id = (
                int(data["academic_year_id"])
                if data["academic_year_id"]
                else None
            )

        if "term_id" in data and data["term_id"]:
            fee.term_id = int(data["term_id"])

        if "class_id" in data and data["class_id"]:
            fee.class_id = int(data["class_id"])

        if "fee_type" in data:
            fee_type = str(
                data["fee_type"]
            ).strip()

            if not fee_type:
                return jsonify({
                    "success": False,
                    "message": "Fee Type cannot be empty"
                }), 400

            fee.fee_type = fee_type

        if "amount" in data:
            try:
                amount = float(data["amount"])
            except (TypeError, ValueError):
                return jsonify({
                    "success": False,
                    "message": "Amount must be a valid number"
                }), 400

            if amount < 0:
                return jsonify({
                    "success": False,
                    "message": "Amount cannot be negative"
                }), 400

            fee.amount = amount

        if "due_date" in data:
            if data["due_date"]:
                try:
                    fee.due_date = datetime.strptime(
                        data["due_date"],
                        "%Y-%m-%d"
                    ).date()
                except ValueError:
                    return jsonify({
                        "success": False,
                        "message": "Due Date must use YYYY-MM-DD format"
                    }), 400
            else:
                fee.due_date = None

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Fee structure updated successfully",
            "data": serialize_fee(fee)
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@fees_bp.route("/<int:fee_id>", methods=["DELETE"])
def delete_fee(fee_id):
    try:
        fee = FeeStructure.query.get(fee_id)

        if not fee:
            return jsonify({
                "success": False,
                "message": "Fee structure not found"
            }), 404

        db.session.delete(fee)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Fee structure deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500