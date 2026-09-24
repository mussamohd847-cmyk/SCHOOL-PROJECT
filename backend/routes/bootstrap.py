from flask import Blueprint
from utils.auth import login_required
from utils.responses import success_response
from models import (
    Student,
    Teacher,
    ClassModel,
    Stream,
    Subject,
    TeacherClass,
    TeacherSubject,
    AcademicYear,
    Term,
    Timetable,
    Attendance,
    Exam,
    Result,
    FeeStructure,
    Payment,
    Setting,
)

bootstrap_bp = Blueprint(
    "bootstrap",
    __name__,
    url_prefix="/api/bootstrap",
)


@bootstrap_bp.route("", methods=["GET"])
@login_required
def bootstrap():
    data = {
        "students": [
            s.to_dict()
            for s in Student.query.order_by(Student.id.desc()).all()
        ],
        "teachers": [
            t.to_dict()
            for t in Teacher.query.order_by(Teacher.id.desc()).all()
        ],
        "classes": [
            c.to_dict()
            for c in ClassModel.query.order_by(ClassModel.id.asc()).all()
        ],
        "streams": [
            s.to_dict()
            for s in Stream.query.order_by(Stream.id.asc()).all()
        ],
        "subjects": [
            s.to_dict()
            for s in Subject.query.order_by(Subject.id.asc()).all()
        ],
        "teacherClasses": [
            x.to_dict()
            for x in TeacherClass.query.order_by(TeacherClass.id.desc()).all()
        ],
        "teacherSubjects": [
            x.to_dict()
            for x in TeacherSubject.query.order_by(TeacherSubject.id.desc()).all()
        ],
        "academicYears": [
            x.to_dict()
            for x in AcademicYear.query.order_by(AcademicYear.id.desc()).all()
        ],
        "terms": [
            x.to_dict()
            for x in Term.query.order_by(Term.id.desc()).all()
        ],
        "timetable": [
            x.to_dict()
            for x in Timetable.query.order_by(Timetable.id.desc()).all()
        ],
        "attendance": [
            x.to_dict()
            for x in Attendance.query.order_by(Attendance.id.desc()).all()
        ],
        "exams": [
            x.to_dict()
            for x in Exam.query.order_by(Exam.id.desc()).all()
        ],
        "results": [
            x.to_dict()
            for x in Result.query.order_by(Result.id.desc()).all()
        ],
        "fees": [
            x.to_dict()
            for x in FeeStructure.query.order_by(FeeStructure.id.desc()).all()
        ],
        "payments": [
            x.to_dict()
            for x in Payment.query.order_by(Payment.id.desc()).all()
        ],
        "settings": [
            x.to_dict()
            for x in Setting.query.order_by(Setting.id.asc()).all()
        ],
    }

    return success_response(
        "Bootstrap data loaded successfully",
        data,
    )
