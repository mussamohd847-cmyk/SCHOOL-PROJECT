"""Import every model so SQLAlchemy metadata is fully registered
before db.create_all() runs, and so `from models import X` works."""

from models.user import User
from models.class_model import ClassModel
from models.stream import Stream
from models.subject import Subject
from models.student import Student
from models.teacher import Teacher
from models.teacher_class import TeacherClass
from models.teacher_subject import TeacherSubject
from models.academic_year import AcademicYear
from models.term import Term
from models.timetable import Timetable
from models.attendance import Attendance
from models.exam import Exam
from models.result import Result, compute_grade
from models.fee_structure import FeeStructure
from models.payment import Payment
from models.setting import Setting

__all__ = [
    "User", "ClassModel", "Stream", "Subject", "Student", "Teacher",
    "TeacherClass", "TeacherSubject", "AcademicYear", "Term", "Timetable",
    "Attendance", "Exam", "Result", "compute_grade", "FeeStructure",
    "Payment", "Setting",
]
