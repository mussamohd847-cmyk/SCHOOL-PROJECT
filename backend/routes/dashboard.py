from models.term import Term
from models.academic_year import AcademicYear
from models.exam import Exam
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
    today = date.today()

    total_students = Student.query.count()
    active_students = Student.query.filter_by(status="active").count()
    total_teachers = Teacher.query.count()
    total_classes = ClassModel.query.count()
    total_subjects = Subject.query.count()

    attendance_today = Attendance.query.filter_by(date=today)
    attendance_present = attendance_today.filter_by(status="PRESENT").count()
    attendance_absent = attendance_today.filter_by(status="ABSENT").count()
    attendance_late = attendance_today.filter_by(status="LATE").count()
    attendance_excused = attendance_today.filter_by(status="EXCUSED").count()
    attendance_total = attendance_today.count()

    # Use only the active academic year and its active term.
    active_year = AcademicYear.query.filter_by(status="ACTIVE").order_by(
        AcademicYear.id.desc()
    ).first()

    active_term = None
    if active_year:
        active_term = Term.query.filter_by(
            academic_year_id=active_year.id,
            status="ACTIVE",
        ).order_by(Term.id.desc()).first()

    fee_structures = []
    total_fees = 0.0
    total_paid = 0.0

    if active_year and active_term:
        fee_structures = FeeStructure.query.filter_by(
            year_id=active_year.id,
            term_id=active_term.id,
        ).all()

        for fee in fee_structures:
            enrolled = Student.query.filter_by(
                school_class_id=fee.class_id,
                in_school=True,
                status="active",
            ).count()
            total_fees += float(fee.amount or 0) * enrolled

        fee_ids = [fee.id for fee in fee_structures]
        if fee_ids:
            total_paid = float(
                db.session.query(
                    func.coalesce(func.sum(Payment.amount), 0)
                ).filter(Payment.fee_structure_id.in_(fee_ids)).scalar() or 0
            )

    outstanding = max(total_fees - total_paid, 0)
    fee_percentage = round(total_paid / total_fees * 100, 1) if total_fees else 0

    madrasa_students = Student.query.filter_by(
        in_madrasa=True, status="active"
    ).count()

    madrasa_present = (
        db.session.query(func.count(Attendance.id))
        .join(Student, Attendance.student_id == Student.id)
        .filter(
            Student.in_madrasa.is_(True),
            Student.status == "active",
            Attendance.date == today,
            Attendance.status.in_(("PRESENT", "LATE")),
        ).scalar() or 0
    )

    # Normalize scores against each exam's actual maximum marks.
    average_score = (
        db.session.query(
            func.avg(Result.total * 100.0 / func.nullif(Exam.total_marks, 0))
        )
        .join(Exam, Result.exam_id == Exam.id)
        .scalar()
    )
    result_count = Result.query.count()
    exam_count = db.session.query(
        func.count(func.distinct(Result.exam_id))
    ).scalar() or 0

    recent_payments = []
    for payment in Payment.query.order_by(
        Payment.payment_date.desc(), Payment.id.desc()
    ).limit(5).all():
        row = payment.to_dict()
        student = Student.query.get(payment.student_id)
        row["student_name"] = (
            " ".join(filter(None, [
                student.first_name, student.middle_name, student.last_name
            ])) if student else None
        )
        row["admission_no"] = student.admission_no if student else None
        row["payment_date"] = (
            payment.payment_date.isoformat() if payment.payment_date else None
        )
        recent_payments.append(row)

    recent_students = []
    for student in Student.query.order_by(
        Student.created_at.desc(), Student.id.desc()
    ).limit(8).all():
        row = student.to_dict()
        full_name = " ".join(filter(None, [
            student.first_name, student.middle_name, student.last_name
        ]))
        row.update({
            "name": full_name,
            "full_name": full_name,
            "admission_no": student.admission_no,
            "class_name": None,
        })
        if student.school_class_id:
            school_class = ClassModel.query.get(student.school_class_id)
            if school_class:
                row["class_name"] = school_class.name
        recent_students.append(row)

    # These are real recent records, not fabricated audit events.
    activity = []
    for student in Student.query.order_by(
        Student.created_at.desc(), Student.id.desc()
    ).limit(10).all():
        if student.created_at:
            activity.append({
                "_sort": student.created_at,
                "createdAt": student.created_at.isoformat(),
                "userName": None,
                "action": "Student registered",
                "module": "Students",
                "description": " ".join(filter(None, [
                    student.first_name, student.middle_name, student.last_name
                ])),
            })

    for payment in Payment.query.order_by(
        Payment.created_at.desc(), Payment.id.desc()
    ).limit(10).all():
        student = Student.query.get(payment.student_id)
        if payment.created_at:
            activity.append({
                "_sort": payment.created_at,
                "createdAt": payment.created_at.isoformat(),
                "userName": None,
                "action": "Payment recorded",
                "module": "Finance",
                "description": (
                    f"TZS {float(payment.amount or 0):,.2f}"
                    + (f" — {student.first_name} {student.last_name}" if student else "")
                ),
            })

    activity.sort(key=lambda item: item["_sort"], reverse=True)
    for item in activity:
        item.pop("_sort", None)
    activity = activity[:10]

    attendance_percentage = (
        round(attendance_present / attendance_total * 100)
        if attendance_total else 0
    )

    data = {
        "total_students": total_students,
        "totalStudents": total_students,
        "activeStudents": active_students,
        "total_teachers": total_teachers,
        "teachers": total_teachers,
        "total_classes": total_classes,
        "classes": total_classes,
        "total_subjects": total_subjects,
        "subjects": total_subjects,
        "attendance_summary": {
            "PRESENT": attendance_present,
            "ABSENT": attendance_absent,
            "LATE": attendance_late,
            "EXCUSED": attendance_excused,
        },
        "attendance": {
            "present": attendance_present,
            "absent": attendance_absent,
            "late": attendance_late,
            "excused": attendance_excused,
            "total": attendance_total,
            "percentage": attendance_percentage,
        },
        "fees_collected": total_paid,
        "collected": total_paid,
        "outstanding_fees": round(outstanding, 2),
        "outstanding": round(outstanding, 2),
        "finance": {
            "totalFees": round(total_fees, 2),
            "percentage": fee_percentage,
            "configured": bool(active_year and active_term and fee_structures),
            "academicYear": active_year.name if active_year else None,
            "term": active_term.name if active_term else None,
        },
        "academic": {
            "average": round(float(average_score), 2) if average_score is not None else None,
            "exams": int(exam_count),
            "results": result_count,
            "subjects": total_subjects,
            "students": total_students,
        },
        "madrasa": {
            "students": madrasa_students,
            "present": madrasa_present,
        },
        "recent_payments": recent_payments,
        "recentPayments": recent_payments,
        "recent_students": recent_students,
        "studentOverview": recent_students,
        "activity": activity,
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
@roles_required("STUDENT", "ADMIN")
def student_dashboard():
    student_id = request.args.get("student_id", type=int)
    if not student_id:
        return error_response("student_id query parameter is required", 400)

    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)

    user = request.current_user
    if (
        str(user.role).strip().lower() == "student"
        and user.student_id != student_id
    ):
        return error_response(
            "You can only access your own student information",
            403,
        )

    active_year = AcademicYear.query.filter_by(
        status="ACTIVE"
    ).order_by(AcademicYear.id.desc()).first()

    active_term = None
    if active_year:
        active_term = Term.query.filter_by(
            academic_year_id=active_year.id,
            status="ACTIVE",
        ).order_by(Term.id.desc()).first()

    class_ids = list({
        cid for cid in (
            student.school_class_id,
            student.madrasa_class_id,
        ) if cid
    })

    fee_structures = []
    total_fees = 0.0
    total_paid = 0.0

    if active_year and active_term and class_ids:
        fee_structures = FeeStructure.query.filter(
            FeeStructure.year_id == active_year.id,
            FeeStructure.term_id == active_term.id,
            FeeStructure.class_id.in_(class_ids),
        ).all()

        total_fees = sum(float(f.amount or 0) for f in fee_structures)
        fee_ids = [f.id for f in fee_structures]

        if fee_ids:
            total_paid = float(
                db.session.query(
                    func.coalesce(func.sum(Payment.amount), 0)
                ).filter(
                    Payment.student_id == student_id,
                    Payment.fee_structure_id.in_(fee_ids),
                ).scalar() or 0
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
@roles_required("ADMIN")
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
