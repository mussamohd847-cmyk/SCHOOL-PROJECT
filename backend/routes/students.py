from datetime import date

from flask import Blueprint, request
from sqlalchemy import text

from database import db
from models import Student

from utils.auth import login_required, roles_required
from utils.responses import (
    success_response,
    error_response,
    paginate_query,
)


students_bp = Blueprint(
    "students",
    __name__,
    url_prefix="/api/students",
)


# ============================================================
# HELPERS
# ============================================================

def parse_date_value(value):
    if value in (None, "", "null"):
        return None

    if isinstance(value, date):
        return value

    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def get_value(data, camel, snake=None, default=None):
    if camel in data:
        return data.get(camel)

    if snake and snake in data:
        return data.get(snake)

    return default


def serialize_student(student):
    return student.to_dict()


def validate_student_data(data, editing=False):
    admission_no = get_value(
        data,
        "admissionNo",
        "admission_no"
    )

    first_name = get_value(
        data,
        "firstName",
        "first_name"
    )

    last_name = get_value(
        data,
        "lastName",
        "last_name"
    )

    gender = get_value(
        data,
        "gender"
    )

    admission_date = get_value(
        data,
        "admissionDate",
        "admission_date"
    )

    if not editing:
        if not admission_no:
            return "Admission number is required"

        if not first_name:
            return "First name is required"

        if not last_name:
            return "Last name is required"

        if not gender:
            return "Gender is required"

        if not admission_date:
            return "Admission date is required"

    if gender and gender not in ["Male", "Female"]:
        return "Gender must be Male or Female"

    status = get_value(data, "status")

    if status and status not in [
        "active",
        "graduated",
        "transferred",
        "suspended",
        "inactive",
    ]:
        return "Invalid student status"

    return None


def apply_student_data(student, data):
    # --------------------------------------------------------
    # BASIC INFORMATION
    # --------------------------------------------------------

    value = get_value(
        data,
        "admissionNo",
        "admission_no"
    )

    if value is not None:
        student.admission_no = str(value).strip()

    value = get_value(
        data,
        "firstName",
        "first_name"
    )

    if value is not None:
        student.first_name = str(value).strip()

    value = get_value(
        data,
        "middleName",
        "middle_name"
    )

    if value is not None:
        student.middle_name = (
            str(value).strip()
            if value
            else None
        )

    value = get_value(
        data,
        "lastName",
        "last_name"
    )

    if value is not None:
        student.last_name = str(value).strip()

    value = get_value(
        data,
        "gender"
    )

    if value is not None:
        student.gender = value

    # --------------------------------------------------------
    # PERSONAL INFORMATION
    # --------------------------------------------------------

    if (
        "dateOfBirth" in data
        or "date_of_birth" in data
    ):
        student.date_of_birth = parse_date_value(
            get_value(
                data,
                "dateOfBirth",
                "date_of_birth"
            )
        )

    if (
        "placeOfBirth" in data
        or "place_of_birth" in data
        or "pob" in data
    ):
        student.place_of_birth = get_value(
            data,
            "placeOfBirth",
            "place_of_birth",
            get_value(data, "pob")
        )

    if "phone" in data:
        student.phone = data.get("phone") or None

    if "email" in data:
        student.email = data.get("email") or None

    if "address" in data:
        student.address = data.get("address") or None

    # --------------------------------------------------------
    # PARENT / GUARDIAN
    # --------------------------------------------------------

    if (
        "parentName" in data
        or "parent_name" in data
        or "guardianName" in data
    ):
        student.parent_name = get_value(
            data,
            "parentName",
            "parent_name",
            get_value(data, "guardianName")
        )

    if (
        "parentPhone" in data
        or "parent_phone" in data
        or "guardianPhone" in data
    ):
        student.parent_phone = get_value(
            data,
            "parentPhone",
            "parent_phone",
            get_value(data, "guardianPhone")
        )

    if (
        "parentEmail" in data
        or "parent_email" in data
    ):
        student.parent_email = get_value(
            data,
            "parentEmail",
            "parent_email"
        )

    if "emergencyContact" in data:
        student.emergency_contact = (
            data.get("emergencyContact")
            or None
        )

    # --------------------------------------------------------
    # PHOTO
    # --------------------------------------------------------

    if "photo" in data:
        student.photo = data.get("photo") or None

    # --------------------------------------------------------
    # ADMISSION DATE
    # --------------------------------------------------------

    if (
        "admissionDate" in data
        or "admission_date" in data
    ):
        student.admission_date = parse_date_value(
            get_value(
                data,
                "admissionDate",
                "admission_date"
            )
        )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if "status" in data:
        student.status = data.get("status")

    # --------------------------------------------------------
    # SCHOOL
    # --------------------------------------------------------

    if (
        "inSchool" in data
        or "in_school" in data
    ):
        student.in_school = bool(
            get_value(
                data,
                "inSchool",
                "in_school"
            )
        )

    if (
        "schoolClassId" in data
        or "school_class_id" in data
    ):
        value = get_value(
            data,
            "schoolClassId",
            "school_class_id"
        )

        student.school_class_id = (
            int(value)
            if value not in ("", None)
            else None
        )

    if (
        "schoolStreamId" in data
        or "school_stream_id" in data
    ):
        value = get_value(
            data,
            "schoolStreamId",
            "school_stream_id"
        )

        student.school_stream_id = (
            int(value)
            if value not in ("", None)
            else None
        )

    # --------------------------------------------------------
    # MADRASA
    # --------------------------------------------------------

    if (
        "inMadrasa" in data
        or "in_madrasa" in data
    ):
        student.in_madrasa = bool(
            get_value(
                data,
                "inMadrasa",
                "in_madrasa"
            )
        )

    if (
        "madrasaClassId" in data
        or "madrasa_class_id" in data
    ):
        value = get_value(
            data,
            "madrasaClassId",
            "madrasa_class_id"
        )

        student.madrasa_class_id = (
            int(value)
            if value not in ("", None)
            else None
        )

    if (
        "madrasaStreamId" in data
        or "madrasa_stream_id" in data
    ):
        value = get_value(
            data,
            "madrasaStreamId",
            "madrasa_stream_id"
        )

        student.madrasa_stream_id = (
            int(value)
            if value not in ("", None)
            else None
        )


# ============================================================
# GET STUDENTS
# ============================================================

@students_bp.route("", methods=["GET"])
@login_required
@roles_required(
    "admin",
    "teacher",
    "accountant"
)
def list_students():

    query = Student.query

    class_id = request.args.get(
        "class_id",
        type=int
    )

    stream_id = request.args.get(
        "stream_id",
        type=int
    )

    status = request.args.get("status")

    section = request.args.get("section")

    search = request.args.get(
        "search",
        ""
    ).strip()

    # --------------------------------------------------------
    # CLASS
    # --------------------------------------------------------

    if class_id:

        query = query.filter(
            (
                Student.school_class_id == class_id
            )
            |
            (
                Student.madrasa_class_id == class_id
            )
        )

    # --------------------------------------------------------
    # STREAM
    # --------------------------------------------------------

    if stream_id:

        query = query.filter(
            (
                Student.school_stream_id == stream_id
            )
            |
            (
                Student.madrasa_stream_id == stream_id
            )
        )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if status:
        query = query.filter(
            Student.status == status
        )

    # --------------------------------------------------------
    # SECTION
    # --------------------------------------------------------

    if section == "school":

        query = query.filter(
            Student.in_school.is_(True)
        )

    elif section == "madrasa":

        query = query.filter(
            Student.in_madrasa.is_(True)
        )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:

        search_value = f"%{search}%"

        query = query.filter(
            db.or_(
                Student.admission_no.ilike(
                    search_value
                ),
                Student.first_name.ilike(
                    search_value
                ),
                Student.middle_name.ilike(
                    search_value
                ),
                Student.last_name.ilike(
                    search_value
                ),
                Student.phone.ilike(
                    search_value
                ),
            )
        )

    query = query.order_by(
        Student.id.desc()
    )

    items, pagination = paginate_query(
        query,
        request.args
    )

    return success_response(
        "Students list",
        [
            serialize_student(student)
            for student in items
        ],
        pagination=pagination
    )


# ============================================================
# STUDENT METADATA
# ============================================================

@students_bp.route(
    "/meta",
    methods=["GET"]
)
@login_required
def students_meta():

    classes_result = db.session.execute(
        text(
            """
            SELECT
                id,
                name,
                section,
                sort_order
            FROM classes
            ORDER BY section, sort_order, name
            """
        )
    ).mappings().all()

    streams_result = db.session.execute(
        text(
            """
            SELECT
                id,
                class_id,
                name
            FROM streams
            ORDER BY class_id, name
            """
        )
    ).mappings().all()

    return success_response(
        "Student metadata",
        {
            "classes": [
                dict(row)
                for row in classes_result
            ],
            "streams": [
                dict(row)
                for row in streams_result
            ],
        }
    )


# ============================================================
# GET ONE STUDENT
# ============================================================

@students_bp.route(
    "/<int:student_id>",
    methods=["GET"]
)
@login_required
def get_student(student_id):

    student = Student.query.get(
        student_id
    )

    if not student:
        return error_response(
            "Student not found",
            404
        )

    return success_response(
        "Student details",
        serialize_student(student)
    )


# ============================================================
# CREATE STUDENT
# ============================================================

@students_bp.route(
    "",
    methods=["POST"]
)
@login_required
@roles_required("admin")
def create_student():

    data = request.get_json(
        silent=True
    ) or {}

    validation_error = validate_student_data(
        data
    )

    if validation_error:
        return error_response(
            validation_error,
            400
        )

    admission_no = get_value(
        data,
        "admissionNo",
        "admission_no"
    )

    existing = Student.query.filter_by(
        admission_no=admission_no
    ).first()

    if existing:
        return error_response(
            "Admission number already exists",
            409
        )

    student = Student()

    apply_student_data(
        student,
        data
    )

    if not student.admission_date:
        return error_response(
            "Admission date is required",
            400
        )

    try:

        db.session.add(student)

        db.session.commit()

    except Exception as exc:

        db.session.rollback()

        return error_response(
            f"Could not create student: {str(exc)}",
            400
        )

    return success_response(
        "Student created successfully",
        serialize_student(student),
        201
    )


# ============================================================
# UPDATE STUDENT
# ============================================================

@students_bp.route(
    "/<int:student_id>",
    methods=["PUT"]
)
@login_required
@roles_required("admin")
def update_student(student_id):

    student = Student.query.get(
        student_id
    )

    if not student:
        return error_response(
            "Student not found",
            404
        )

    data = request.get_json(
        silent=True
    ) or {}

    validation_error = validate_student_data(
        data,
        editing=True
    )

    if validation_error:
        return error_response(
            validation_error,
            400
        )

    admission_no = get_value(
        data,
        "admissionNo",
        "admission_no"
    )

    if (
        admission_no
        and admission_no != student.admission_no
    ):

        existing = Student.query.filter(
            Student.admission_no == admission_no,
            Student.id != student.id
        ).first()

        if existing:
            return error_response(
                "Admission number already exists",
                409
            )

    try:

        apply_student_data(
            student,
            data
        )

        db.session.commit()

    except Exception as exc:

        db.session.rollback()

        return error_response(
            f"Could not update student: {str(exc)}",
            400
        )

    return success_response(
        "Student updated successfully",
        serialize_student(student)
    )


# ============================================================
# DELETE STUDENT
# ============================================================

@students_bp.route(
    "/<int:student_id>",
    methods=["DELETE"]
)
@login_required
@roles_required("admin")
def delete_student(student_id):

    student = Student.query.get(
        student_id
    )

    if not student:
        return error_response(
            "Student not found",
            404
        )

    try:

        db.session.delete(student)

        db.session.commit()

    except Exception as exc:

        db.session.rollback()

        return error_response(
            f"Could not delete student: {str(exc)}",
            400
        )

    return success_response(
        "Student deleted successfully"
    )