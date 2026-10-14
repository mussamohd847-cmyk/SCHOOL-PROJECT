from flask import Blueprint, request
from database import db
from models import User, Student, Teacher
from utils.auth import login_required, roles_required, permissions_required
from utils.responses import success_response, error_response

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def account_dict(user):
    return user.to_dict()


@users_bp.route("", methods=["GET"])
@login_required
@permissions_required("users.view")
def list_users():
    query = User.query
    role = request.args.get("role")
    if role in ("admin", "teacher", "student"):
        query = query.filter_by(role=role)

    return success_response(
        "Accounts list",
        [account_dict(user) for user in query.order_by(User.id.desc()).all()]
    )


@users_bp.route("/<int:user_id>", methods=["GET"])
@login_required
@roles_required("admin")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Account not found", 404)
    return success_response("Account details", account_dict(user))


@users_bp.route("", methods=["POST"])
@login_required
@roles_required("admin")
def create_user():
    data = request.get_json(silent=True) or {}

    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", ""))
    name = str(data.get("name", "")).strip()
    role = str(data.get("role", "")).strip().lower()

    if not username or not password or not name or not role:
        return error_response("username, password, name and role are required", 400)

    if len(password) < 8:
        return error_response("Password must contain at least 8 characters", 400)

    if role not in ("teacher", "student"):
        return error_response("Invalid account role", 400)

    if User.query.filter_by(username=username).first():
        return error_response("Username already exists", 409)

    student_id = data.get("student_id")
    teacher_id = data.get("teacher_id")

    if role == "student":
        if not student_id:
            return error_response("Select a student for this account", 400)
        student = db.session.get(Student, student_id)
        if not student:
            return error_response("Student not found", 404)
        if User.query.filter_by(student_id=student.id).first():
            return error_response("This student already has an account", 409)
        name = student.first_name + " " + student.last_name
        teacher_id = None

    elif role == "teacher":
        if not teacher_id:
            return error_response("Select a teacher for this account", 400)
        teacher = db.session.get(Teacher, teacher_id)
        if not teacher:
            return error_response("Teacher not found", 404)
        if teacher.user_id or User.query.filter_by(teacher_id=teacher.id).first():
            return error_response("This teacher already has an account", 409)
        name = teacher.name
        student_id = None

    else:
        student_id = None
        teacher_id = None

    user = User(
        username=username,
        name=name,
        role=role,
        status="active",
        student_id=student_id,
        teacher_id=teacher_id,
        must_change_password=True,
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.flush()

        if role == "teacher":
            teacher.user_id = user.id

        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return error_response("Could not create account: " + str(exc), 400)

    return success_response("Account created successfully", account_dict(user), 201)


@users_bp.route("/<int:user_id>", methods=["PUT"])
@login_required
@roles_required("admin")
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Account not found", 404)

    data = request.get_json(silent=True) or {}

    if "username" in data:
        username = str(data["username"]).strip().lower()
        existing = User.query.filter_by(username=username).first()
        if existing and existing.id != user.id:
            return error_response("Username already exists", 409)
        if not username:
            return error_response("Username is required", 400)
        user.username = username

    if "status" in data:
        status = str(data["status"]).lower()
        if status not in ("active", "inactive"):
            return error_response("Status must be active or inactive", 400)
        user.status = status

    if data.get("password"):
        password = str(data["password"])
        if len(password) < 8:
            return error_response("Password must contain at least 8 characters", 400)
        user.set_password(password)
        user.must_change_password = True

    db.session.commit()
    return success_response("Account updated successfully", account_dict(user))


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@login_required
@roles_required("admin")
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Account not found", 404)

    if user.role == "admin":
        return error_response("Admin accounts cannot be deleted here", 403)

    teacher = Teacher.query.filter_by(user_id=user.id).first()
    if teacher:
        teacher.user_id = None

    db.session.delete(user)
    db.session.commit()
    return success_response("Account deleted successfully")
