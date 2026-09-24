from datetime import date
from flask import Blueprint, request
from sqlalchemy import func
from database import db
from models import (
    Student, Teacher, ClassModel, Subject, Attendance, Payment,
    FeeStructure, Result, Timetable, TeacherClass, TeacherSubject, Teacher as TeacherModel,
)
from utils.auth import login_required, roles_required
from utils.responses import success_response, error_response

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/admin", methods=["GET"])
@login_required
@roles_required("ADMIN")
def admin_dashboard():
    total_fees = float(db.session.query(func.coalesce(func.sum(FeeStructure.amount), 0)).scalar() or 0)
    total_paid = float(db.session.query(func.coalesce(func.sum(Payment.amount), 0)).scalar() or 0)

    data = {
        "total_students": Student.query.count(),
        "total_teachers": Teacher.query.count(),
        "total_classes": ClassModel.query.count(),
        "total_subjects": Subject.query.count(),
        "attendance_summary": {
            status: Attendance.query.filter_by(status=status).count()
            for status in ("PRESENT", "ABSENT", "LATE", "EXCUSED")
        },
        "fees_collected": total_paid,
        "outstanding_fees": round(total_fees - total_paid, 2),
        "recent_payments": [
            p.to_dict() for p in Payment.query.order_by(Payment.created_at.desc()).limit(5)
        ],
        "recent_students": [
            s.to_dict() for s in Student.query.order_by(Student.created_at.desc()).limit(5)
        ],
    }
    return success_response("Admin dashboard", data)


@dashboard_bp.route("/teacher", methods=["GET"])
@login_required
@roles_required("TEACHER", "ADMIN")
def teacher_dashboard():
    teacher = Teacher.query.filter_by(user_id=request.current_user.id).first()
    if not teacher:
        return error_response("No teacher profile linked to this user", 404)

    today = date.today().strftime("%A").upper()
    data = {
        "my_classes": [tc.to_dict() for tc in TeacherClass.query.filter_by(teacher_id=teacher.id)],
        "my_subjects": [ts.to_dict() for ts in TeacherSubject.query.filter_by(teacher_id=teacher.id)],
        "todays_timetable": [
            t.to_dict() for t in Timetable.query.filter_by(teacher_id=teacher.id, day_of_week=today)
        ],
        "weekly_timetable": [t.to_dict() for t in Timetable.query.filter_by(teacher_id=teacher.id)],
        "recent_results": [
            r.to_dict() for r in Result.query.order_by(Result.created_at.desc()).limit(10)
        ],
    }
    return success_response("Teacher dashboard", data)


@dashboard_bp.route("/student", methods=["GET"])
@login_required
@roles_required("STUDENT", "ADMIN", "PARENT")
def student_dashboard():
    student_id = request.args.get("student_id", type=int)
    if not student_id:
        return error_response("student_id query parameter is required", 400)

    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)

    total_fees = float(db.session.query(func.coalesce(func.sum(FeeStructure.amount), 0)).scalar() or 0)
    total_paid = float(
        db.session.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.student_id == student_id).scalar() or 0
    )

    data = {
        "student_information": student.to_dict(),
        "attendance": [a.to_dict() for a in Attendance.query.filter_by(student_id=student_id).limit(30)],
        "results": [r.to_dict() for r in Result.query.filter_by(student_id=student_id)],
        "fees": total_fees,
        "payments": [p.to_dict() for p in Payment.query.filter_by(student_id=student_id)],
        "balance": round(total_fees - total_paid, 2),
        "timetable": [
            t.to_dict() for t in Timetable.query.filter_by(class_id=student.class_id, stream_id=student.stream_id)
        ],
    }
    return success_response("Student dashboard", data)


@dashboard_bp.route("/accountant", methods=["GET"])
@login_required
@roles_required("ACCOUNTANT", "ADMIN")
def accountant_dashboard():
    total_fees = float(db.session.query(func.coalesce(func.sum(FeeStructure.amount), 0)).scalar() or 0)
    total_paid = float(db.session.query(func.coalesce(func.sum(Payment.amount), 0)).scalar() or 0)

    method_stats = {
        method: float(
            db.session.query(func.coalesce(func.sum(Payment.amount), 0))
            .filter(Payment.payment_method == method).scalar() or 0
        )
        for method in ("CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER")
    }

    data = {
        "total_fees": total_fees,
        "total_paid": total_paid,
        "outstanding_balance": round(total_fees - total_paid, 2),
        "recent_payments": [p.to_dict() for p in Payment.query.order_by(Payment.created_at.desc()).limit(10)],
        "payment_statistics": method_stats,
    }
    return success_response("Accountant dashboard", data)
