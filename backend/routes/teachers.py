from flask import Blueprint, request
from database import db
from models import Teacher
from utils.auth import login_required, roles_required
from utils.responses import (
    success_response,
    error_response,
    paginate_query,
)
from utils.validators import require_fields
from utils.helpers import update_model_from_dict, parse_date


teachers_bp = Blueprint(
    "teachers",
    __name__,
    url_prefix="/api/teachers"
)


# =========================================================
# FIELDS ADMIN IS ALLOWED TO EDIT
# =========================================================

WRITABLE_FIELDS = [
    "first_name",
    "middle_name",
    "last_name",
    "gender",
    "phone",
    "email",
    "address",
    "specialization",
    "employment_date",
    "assignment",
    "status",
]


# =========================================================
# AUTOMATIC EMPLOYEE NUMBER
# =========================================================

def generate_employee_number():
    last_teacher = (
        Teacher.query
        .filter(
            Teacher.employee_number.isnot(None)
        )
        .order_by(Teacher.id.desc())
        .first()
    )

    if not last_teacher:
        number = 1
    else:
        number = last_teacher.id + 1

    while True:
        employee_number = f"EMP{number:03d}"

        exists = Teacher.query.filter_by(
            employee_number=employee_number
        ).first()

        if not exists:
            return employee_number

        number += 1


# =========================================================
# AUTOMATIC TEACHER NUMBER
# =========================================================

def generate_teacher_number():
    last_teacher = (
        Teacher.query
        .filter(
            Teacher.teacher_no.isnot(None)
        )
        .order_by(Teacher.id.desc())
        .first()
    )

    if not last_teacher:
        number = 1
    else:
        number = last_teacher.id + 1

    while True:
        teacher_number = f"TCH{number:03d}"

        exists = Teacher.query.filter_by(
            teacher_no=teacher_number
        ).first()

        if not exists:
            return teacher_number

        number += 1


# =========================================================
# AUTOMATIC FULL NAME
# =========================================================

def build_full_name(data):
    parts = [
        data.get("first_name"),
        data.get("middle_name"),
        data.get("last_name"),
    ]

    return " ".join(
        str(part).strip()
        for part in parts
        if part and str(part).strip()
    )


# =========================================================
# GET ALL TEACHERS
# =========================================================

@teachers_bp.route("", methods=["GET"])
@login_required
@roles_required("ADMIN", "TEACHER")
def list_teachers():

    query = Teacher.query

    status = request.args.get("status")

    if status:
        query = query.filter_by(
            status=status
        )

    items, pagination = paginate_query(
        query,
        request.args
    )

    return success_response(
        "Teachers list",
        [
            teacher.to_dict()
            for teacher in items
        ],
        pagination=pagination,
    )


# =========================================================
# GET SINGLE TEACHER
# =========================================================

@teachers_bp.route(
    "/<int:teacher_id>",
    methods=["GET"]
)
@login_required
def get_teacher(teacher_id):

    teacher = Teacher.query.get(
        teacher_id
    )

    if not teacher:
        return error_response(
            "Teacher not found",
            404
        )

    return success_response(
        "Teacher details",
        teacher.to_dict()
    )


# =========================================================
# CREATE TEACHER
# =========================================================

@teachers_bp.route("", methods=["POST"])
@login_required
@roles_required("ADMIN")
def create_teacher():

    data = request.get_json(
        silent=True
    ) or {}

    # -----------------------------------------------------
    # REQUIRED FIELDS
    # -----------------------------------------------------

    missing = require_fields(
        data,
        [
            "first_name",
            "last_name",
            "gender",
            "phone",
        ]
    )

    if missing:
        return error_response(
            f"{missing} is required",
            400
        )

    # -----------------------------------------------------
    # GENERATE NUMBERS AUTOMATICALLY
    # -----------------------------------------------------

    employee_number = (
        generate_employee_number()
    )

    teacher_number = (
        generate_teacher_number()
    )

    # -----------------------------------------------------
    # GENERATE FULL NAME AUTOMATICALLY
    # -----------------------------------------------------

    full_name = build_full_name(data)

    if not full_name:
        return error_response(
            "Teacher name is required",
            400
        )

    # -----------------------------------------------------
    # CREATE TEACHER
    # -----------------------------------------------------

    teacher = Teacher(
        employee_number=employee_number,
        teacher_no=teacher_number,

        first_name=data[
            "first_name"
        ].strip(),

        middle_name=(
            data.get("middle_name")
            or None
        ),

        last_name=data[
            "last_name"
        ].strip(),

        name=full_name,

        gender=data[
            "gender"
        ],

        phone=data[
            "phone"
        ].strip(),

        email=(
            data.get("email")
            or None
        ),

        address=(
            data.get("address")
            or None
        ),

        specialization=(
            data.get("specialization")
            or None
        ),

        employment_date=parse_date(
            data.get("employment_date")
        ),

        assignment=data.get(
            "assignment",
            "school"
        ),

        status=data.get(
            "status",
            "active"
        ),
    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    try:
        db.session.add(teacher)
        db.session.commit()

    except Exception as e:
        db.session.rollback()

        return error_response(
            f"Failed to create teacher: {str(e)}",
            500
        )

    return success_response(
        "Teacher created successfully",
        teacher.to_dict(),
        201
    )


# =========================================================
# UPDATE TEACHER
# =========================================================

@teachers_bp.route(
    "/<int:teacher_id>",
    methods=["PUT"]
)
@login_required
@roles_required("ADMIN")
def update_teacher(teacher_id):

    teacher = Teacher.query.get(
        teacher_id
    )

    if not teacher:
        return error_response(
            "Teacher not found",
            404
        )

    data = request.get_json(
        silent=True
    ) or {}

    # -----------------------------------------------------
    # NEVER ALLOW ADMIN TO CHANGE
    # EMPLOYEE NUMBER OR TEACHER NUMBER
    # -----------------------------------------------------

    data.pop(
        "employee_number",
        None
    )

    data.pop(
        "teacher_no",
        None
    )

    # -----------------------------------------------------
    # UPDATE BASIC FIELDS
    # -----------------------------------------------------

    if "first_name" in data:
        teacher.first_name = (
            data["first_name"].strip()
        )

    if "middle_name" in data:
        teacher.middle_name = (
            data.get("middle_name")
            or None
        )

    if "last_name" in data:
        teacher.last_name = (
            data["last_name"].strip()
        )

    # -----------------------------------------------------
    # REBUILD FULL NAME
    # -----------------------------------------------------

    teacher.name = build_full_name({
        "first_name": teacher.first_name,
        "middle_name": teacher.middle_name,
        "last_name": teacher.last_name,
    })

    # -----------------------------------------------------
    # EMPLOYMENT DATE
    # -----------------------------------------------------

    if "employment_date" in data:
        teacher.employment_date = parse_date(
            data["employment_date"]
        )

    # -----------------------------------------------------
    # OTHER ALLOWED FIELDS
    # -----------------------------------------------------

    update_model_from_dict(
        teacher,
        data,
        [
            "gender",
            "phone",
            "email",
            "address",
            "specialization",
            "assignment",
            "status",
        ]
    )

    # -----------------------------------------------------
    # UPDATED TIME
    # -----------------------------------------------------

    from datetime import datetime

    teacher.updated_at = datetime.utcnow()

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    try:
        db.session.commit()

    except Exception as e:
        db.session.rollback()

        return error_response(
            f"Failed to update teacher: {str(e)}",
            500
        )

    return success_response(
        "Teacher updated successfully",
        teacher.to_dict()
    )


# =========================================================
# DELETE TEACHER
# =========================================================

@teachers_bp.route(
    "/<int:teacher_id>",
    methods=["DELETE"]
)
@login_required
@roles_required("ADMIN")
def delete_teacher(teacher_id):

    teacher = Teacher.query.get(
        teacher_id
    )

    if not teacher:
        return error_response(
            "Teacher not found",
            404
        )

    try:
        db.session.delete(teacher)
        db.session.commit()

    except Exception as e:
        db.session.rollback()

        return error_response(
            f"Failed to delete teacher: {str(e)}",
            500
        )

    return success_response(
        "Teacher deleted successfully"
    )