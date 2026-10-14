from datetime import date
from flask import Blueprint, request
from database import db
from models import (
    User, Student, Teacher, TeacherClass, TeacherSubject,
    ClassModel, Subject, Timetable, Attendance, Exam, Result,
    FeeStructure, Payment, compute_grade
)
from utils.auth import login_required, roles_required, permissions_required
from utils.responses import success_response, error_response

portal_bp = Blueprint("portal", __name__, url_prefix="/api/portal")


def current_student():
    user = request.current_user
    if not user.student_id:
        return None
    return db.session.get(Student, user.student_id)


def current_teacher():
    user = request.current_user
    teacher = Teacher.query.filter_by(user_id=user.id).first()
    if teacher:
        return teacher
    if user.teacher_id:
        return db.session.get(Teacher, user.teacher_id)
    return None


def student_summary(s):
    return {
        "id": s.id,
        "admissionNo": s.admission_no,
        "name": " ".join(x for x in [s.first_name, s.middle_name, s.last_name] if x),
        "schoolClassId": s.school_class_id,
        "schoolStreamId": s.school_stream_id,
        "madrasaClassId": s.madrasa_class_id,
        "madrasaStreamId": s.madrasa_stream_id,
        "status": s.status,
    }


@portal_bp.get("/me")
@login_required
def portal_me():
    u = request.current_user
    return success_response("Current account", {
        "id": u.id, "username": u.username, "name": u.name,
        "role": str(u.role).lower(),
        "mustChangePassword": bool(u.must_change_password),
    })


@portal_bp.get("/student/dashboard")
@login_required
@permissions_required("attendance.view")
def student_dashboard():
    s = current_student()
    if not s:
        return error_response("This account is not linked to a student record", 403)

    class_ids = [x for x in [s.school_class_id, s.madrasa_class_id] if x]
    attendance = Attendance.query.filter_by(student_id=s.id).order_by(Attendance.date.desc()).limit(100).all()
    results = Result.query.filter_by(student_id=s.id).order_by(Result.id.desc()).limit(100).all()
    payments = Payment.query.filter_by(student_id=s.id).order_by(Payment.payment_date.desc()).limit(100).all()
    fees = FeeStructure.query.filter(FeeStructure.class_id.in_(class_ids)).all() if class_ids else []
    timetable = Timetable.query.filter(
        Timetable.class_id.in_(class_ids),
        Timetable.status == "ACTIVE"
    ).order_by(Timetable.day_of_week, Timetable.start_time).all() if class_ids else []

    return success_response("Student portal data", {
        "student": student_summary(s),
        "attendance": [x.to_dict() for x in attendance],
        "results": [
            {
                **x.to_dict(),
                "examName": db.session.get(Exam, x.exam_id).name
                    if db.session.get(Exam, x.exam_id) else "Unknown Exam",
                "subjectName": db.session.get(Subject, x.subject_id).name
                    if db.session.get(Subject, x.subject_id) else "Unknown Subject",
            }
            for x in results
        ],
        "payments": [x.to_dict() for x in payments],
        "fees": [x.to_dict() for x in fees],
        "timetable": [
            {
                **x.to_dict(),
                "subjectName": (
                    db.session.get(Subject, x.subject_id).name
                    if x.subject_id and db.session.get(Subject, x.subject_id)
                    else "Subject not assigned"
                ),
            }
            for x in timetable
        ],
    })


@portal_bp.get("/teacher/dashboard")
@login_required
@roles_required("teacher")
def teacher_dashboard():
    t = current_teacher()
    if not t:
        return error_response("This account is not linked to a teacher record", 403)

    assignments = TeacherClass.query.filter_by(teacher_id=t.id).all()
    subject_assignments = TeacherSubject.query.filter_by(teacher_id=t.id).all()
    class_ids = list({x.class_id for x in assignments})
    subject_ids = list({x.subject_id for x in subject_assignments})

    students = []
    if class_ids:
        students = Student.query.filter(
            db.or_(
                Student.school_class_id.in_(class_ids),
                Student.madrasa_class_id.in_(class_ids)
            )
        ).order_by(Student.first_name, Student.last_name).all()

    timetable = Timetable.query.filter_by(
        teacher_id=t.id, status="ACTIVE"
    ).order_by(Timetable.day_of_week, Timetable.start_time).all()

    exams = []
    if class_ids and subject_ids:
        exams = Exam.query.filter(
            Exam.class_id.in_(class_ids),
            Exam.subject_id.in_(subject_ids),
            Exam.status == "ACTIVE",
            Exam.exam_date >= date.today()
        ).order_by(Exam.exam_date.asc()).all()

    # Attendance overview: records actually saved for the current date.
    attendance_today = (
        Attendance.query.filter(
            Attendance.class_id.in_(class_ids),
            Attendance.date == date.today()
        ).all() if class_ids else []
    )
    attendance_counts = {
        "present": sum(1 for x in attendance_today if str(x.status).upper().endswith("PRESENT")),
        "absent": sum(1 for x in attendance_today if str(x.status).upper().endswith("ABSENT")),
        "late": sum(1 for x in attendance_today if str(x.status).upper().endswith("LATE")),
        "excused": sum(1 for x in attendance_today if str(x.status).upper().endswith("EXCUSED")),
        "recorded": len({x.student_id for x in attendance_today}),
    }
    attendance_counts["notRecorded"] = max(
        0, len({x.id for x in students}) - attendance_counts["recorded"]
    )

    # Academic progress is calculated only from existing result records.
    recorded_results = (
        Result.query.filter(
            Result.class_id.in_(class_ids),
            Result.subject_id.in_(subject_ids)
        ).all() if class_ids and subject_ids else []
    )
    percentages = []
    for result_row in recorded_results:
        exam_row = db.session.get(Exam, result_row.exam_id) if result_row.exam_id else None
        total_marks = getattr(exam_row, "total_marks", None) if exam_row else None
        score = getattr(result_row, "total", None)
        try:
            if total_marks and score is not None and float(total_marks) > 0:
                percentages.append(float(score) / float(total_marks) * 100)
        except (TypeError, ValueError):
            pass

    academic_progress = {
        "recordCount": len(recorded_results),
        "averagePercentage": round(sum(percentages) / len(percentages), 1) if percentages else None,
    }

    # Tasks are based on missing attendance and past exams without results.
    recorded_student_ids = {x.student_id for x in attendance_today}
    pending_attendance = sum(
        1 for student in students if student.id not in recorded_student_ids
    )
    past_exams = (
        Exam.query.filter(
            Exam.class_id.in_(class_ids),
            Exam.subject_id.in_(subject_ids),
            Exam.status == "ACTIVE",
            Exam.exam_date < date.today()
        ).all() if class_ids and subject_ids else []
    )
    result_exam_ids = {x.exam_id for x in recorded_results}
    pending_exam_results = sum(
        1 for exam_row in past_exams if exam_row.id not in result_exam_ids
    )

    classes = []
    for cid in class_ids:
        c = db.session.get(ClassModel, cid)
        if c:
            classes.append(c.to_dict())

    subjects = []
    for sid in subject_ids:
        sub = db.session.get(Subject, sid)
        if sub:
            subjects.append(sub.to_dict())

    return success_response("Teacher portal data", {
        "teacher": {"id": t.id, "name": t.name, "employeeNumber": t.employee_number},
        "classes": classes,
        "subjects": subjects,
        "students": [student_summary(x) for x in students],
        "timetable": [
            {
                **x.to_dict(),
                "subjectName": (
                    db.session.get(Subject, x.subject_id).name
                    if x.subject_id and db.session.get(Subject, x.subject_id)
                    else "Subject not assigned"
                ),
                "className": (
                    db.session.get(ClassModel, x.class_id).name
                    if x.class_id and db.session.get(ClassModel, x.class_id)
                    else "Class not assigned"
                ),
            }
            for x in timetable
        ],
        "exams": [x.to_dict() for x in exams],
        "attendanceOverview": attendance_counts,
        "academicProgress": academic_progress,
        "pendingTasks": {
            "attendanceNotRecorded": pending_attendance,
            "pastExamsWithoutResults": pending_exam_results,
        },
    })


@portal_bp.post("/teacher/attendance")
@login_required
@permissions_required("attendance.mark")
def teacher_mark_attendance():
    t = current_teacher()
    if not t:
        return error_response("Teacher account is not linked", 403)

    data = request.get_json(silent=True) or {}
    try:
        student_id = int(data.get("student_id"))
        class_id = int(data.get("class_id"))
        attendance_date = date.fromisoformat(str(data.get("date", "")))
    except (TypeError, ValueError):
        return error_response("student_id, class_id and date (YYYY-MM-DD) are required", 400)

    status = str(data.get("status", "")).upper()
    if status not in ("PRESENT", "ABSENT", "LATE", "EXCUSED"):
        return error_response("Invalid attendance status", 400)

    assigned = TeacherClass.query.filter_by(
        teacher_id=t.id, class_id=class_id
    ).first()
    student = db.session.get(Student, student_id)
    if not assigned or not student:
        return error_response("Student or class not found in your assignments", 403)

    if class_id not in (student.school_class_id, student.madrasa_class_id):
        return error_response("Student does not belong to this class", 403)

    row = Attendance.query.filter_by(
        student_id=student.id, date=attendance_date
    ).first()
    if row:
        row.status = status
        row.class_id = class_id
        row.remarks = str(data.get("remarks", ""))[:255] or None
        row.marked_by = request.current_user.id
    else:
        row = Attendance(
            student_id=student.id, class_id=class_id,
            date=attendance_date, status=status,
            remarks=str(data.get("remarks", ""))[:255] or None,
            marked_by=request.current_user.id,
        )
        db.session.add(row)

    db.session.commit()
    return success_response("Attendance saved", row.to_dict())


@portal_bp.post("/teacher/results")
@login_required
@permissions_required("results.enter")
def teacher_save_result():
    t = current_teacher()
    if not t:
        return error_response("Teacher account is not linked", 403)

    data = request.get_json(silent=True) or {}
    try:
        student_id = int(data.get("student_id"))
        exam_id = int(data.get("exam_id"))
        total = float(data.get("total"))
    except (TypeError, ValueError):
        return error_response("student_id, exam_id and total marks are required", 400)

    exam = db.session.get(Exam, exam_id)
    student = db.session.get(Student, student_id)
    if not exam or not student or exam.status != "ACTIVE":
        return error_response("Active exam or student not found", 404)

    class_assigned = TeacherClass.query.filter_by(
        teacher_id=t.id, class_id=exam.class_id
    ).first()
    subject_assigned = TeacherSubject.query.filter_by(
        teacher_id=t.id, subject_id=exam.subject_id
    ).first()
    if not class_assigned or not subject_assigned:
        return error_response("You are not assigned to this class and subject", 403)

    if exam.class_id not in (student.school_class_id, student.madrasa_class_id):
        return error_response("Student does not belong to this exam class", 403)

    if total < 0 or total > exam.total_marks:
        return error_response("Marks are outside the allowed range", 400)

    def optional_mark(key):
        value = data.get(key)
        if value in (None, ""):
            return None
        value = float(value)
        if value < 0 or value > exam.total_marks:
            raise ValueError(key)
        return value

    try:
        hw, ct, cw = optional_mark("hw"), optional_mark("ct"), optional_mark("cw")
        fe = float(data.get("fe", total))
        if fe < 0 or fe > exam.total_marks:
            raise ValueError("fe")
    except (TypeError, ValueError):
        return error_response("Check the entered marks", 400)

    row = Result.query.filter_by(
        student_id=student.id, exam_id=exam.id, subject_id=exam.subject_id
    ).first()
    if not row:
        row = Result(
            student_id=student.id, exam_id=exam.id,
            subject_id=exam.subject_id, class_id=exam.class_id,
            stream_id=getattr(student, "school_stream_id", None),
            hw=hw, ct=ct, cw=cw, fe=fe, total=total,
            grade=compute_grade(total, exam.total_marks),
        )
        db.session.add(row)
    else:
        row.hw, row.ct, row.cw = hw, ct, cw
        row.fe, row.total = fe, total
        row.grade = compute_grade(total, exam.total_marks)

    db.session.commit()
    return success_response("Result saved", row.to_dict())


# Teacher lesson planning, announcements, profile and password APIs

@portal_bp.get("/teacher/lessons")
@login_required
@roles_required("teacher")
def teacher_lessons():
    from models.lesson_plan import LessonPlan
    teacher = current_teacher()
    if not teacher:
        return error_response("Teacher profile was not found.", 404)
    rows = LessonPlan.query.filter_by(teacher_id=teacher.id).order_by(
        LessonPlan.lesson_date.desc(), LessonPlan.id.desc()
    ).all()
    return success_response(data=[row.to_dict() for row in rows])


@portal_bp.post("/teacher/lessons")
@login_required
@roles_required("teacher")
def teacher_create_lesson():
    from datetime import datetime
    from models.lesson_plan import LessonPlan

    teacher = current_teacher()
    if not teacher:
        return error_response("Teacher profile was not found.", 404)

    body = request.get_json(silent=True) or {}
    required = ("class_id", "subject_id", "lesson_date", "topic", "objectives")
    if any(not str(body.get(key, "")).strip() for key in required):
        return error_response("Fill in class, subject, date, topic and objectives.")

    try:
        class_id = int(body["class_id"])
        subject_id = int(body["subject_id"])
        lesson_date = datetime.strptime(body["lesson_date"], "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return error_response("Invalid class, subject or lesson date.")

    assigned_classes = {
        row.class_id for row in TeacherClass.query.filter_by(teacher_id=teacher.id).all()
    }
    assigned_subjects = {
        row.subject_id for row in TeacherSubject.query.filter_by(teacher_id=teacher.id).all()
    }
    if class_id not in assigned_classes or subject_id not in assigned_subjects:
        return error_response("You can only plan lessons for your assigned classes and subjects.", 403)

    lesson = LessonPlan(
        teacher_id=teacher.id,
        class_id=class_id,
        subject_id=subject_id,
        lesson_date=lesson_date,
        topic=str(body["topic"]).strip(),
        objectives=str(body["objectives"]).strip(),
        activities=str(body.get("activities", "")).strip() or None,
        resources=str(body.get("resources", "")).strip() or None,
        notes=str(body.get("notes", "")).strip() or None,
    )
    db.session.add(lesson)
    db.session.commit()
    return success_response("Lesson plan saved.", lesson.to_dict(), 201)


@portal_bp.delete("/teacher/lessons/<int:lesson_id>")
@login_required
@roles_required("teacher")
def teacher_delete_lesson(lesson_id):
    from models.lesson_plan import LessonPlan
    teacher = current_teacher()
    lesson = LessonPlan.query.filter_by(id=lesson_id, teacher_id=teacher.id if teacher else -1).first()
    if not lesson:
        return error_response("Lesson plan not found.", 404)
    db.session.delete(lesson)
    db.session.commit()
    return success_response("Lesson plan deleted.")


@portal_bp.get("/teacher/announcements")
@login_required
@roles_required("teacher")
def teacher_announcements():
    from models.announcement import Announcement
    rows = Announcement.query.filter_by(is_published=True).order_by(
        Announcement.created_at.desc()
    ).all()
    return success_response(data=[row.to_dict() for row in rows])


@portal_bp.patch("/teacher/profile")
@login_required
@roles_required("teacher")
def teacher_update_profile():
    from sqlalchemy.exc import IntegrityError
    teacher = current_teacher()
    if not teacher:
        return error_response("Teacher profile was not found.", 404)

    body = request.get_json(silent=True) or {}
    for field in ("phone", "email", "address"):
        if field in body:
            value = str(body[field] or "").strip() or None
            setattr(teacher, field, value)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("That email address is already in use.", 409)

    return success_response("Profile updated.", {
        "id": teacher.id,
        "name": teacher.name,
        "employeeNumber": teacher.employee_number,
        "teacherNumber": teacher.teacher_no,
        "phone": teacher.phone,
        "email": teacher.email,
        "address": teacher.address,
        "specialization": teacher.specialization,
        "gender": teacher.gender,
        "assignment": teacher.assignment,
    })


@portal_bp.post("/teacher/change-password")
@login_required
@roles_required("teacher")
def teacher_change_password():
    user = request.current_user
    body = request.get_json(silent=True) or {}
    current_password = str(body.get("current_password", ""))
    new_password = str(body.get("new_password", ""))
    confirm_password = str(body.get("confirm_password", ""))

    if not current_password or not new_password or not confirm_password:
        return error_response("Fill in all password fields.")
    if not user.check_password(current_password):
        return error_response("Current password is incorrect.", 401)
    if len(new_password) < 8:
        return error_response("New password must contain at least 8 characters.")
    if new_password != confirm_password:
        return error_response("New passwords do not match.")

    user.set_password(new_password)
    user.must_change_password = False
    db.session.commit()
    return success_response("Password changed successfully.")
