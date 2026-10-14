from database import db


class Perm:
    STUDENTS_VIEW   = "students.view"
    STUDENTS_CREATE = "students.create"
    STUDENTS_EDIT   = "students.edit"
    STUDENTS_DELETE = "students.delete"

    TEACHERS_VIEW   = "teachers.view"
    TEACHERS_MANAGE = "teachers.manage"

    USERS_VIEW   = "users.view"
    USERS_CREATE = "users.create"
    USERS_EDIT   = "users.edit"
    USERS_DELETE = "users.delete"

    ATTENDANCE_VIEW   = "attendance.view"
    ATTENDANCE_MARK   = "attendance.mark"
    ATTENDANCE_REPORT = "attendance.report"

    RESULTS_VIEW    = "results.view"
    RESULTS_ENTER   = "results.enter"
    RESULTS_PUBLISH = "results.publish"

    FEES_VIEW    = "fees.view"
    FEES_COLLECT = "fees.collect"
    FEES_REPORT  = "fees.report"

    TIMETABLE_VIEW   = "timetable.view"
    TIMETABLE_MANAGE = "timetable.manage"

    MADRASA_VIEW   = "madrasa.view"
    MADRASA_MANAGE = "madrasa.manage"

    REPORTS_SCHOOL  = "reports.school"
    REPORTS_FINANCE = "reports.finance"

    SETTINGS_VIEW   = "settings.view"
    SETTINGS_MANAGE = "settings.manage"

    BOOTSTRAP_ADMIN = "bootstrap.admin"


class Permission(db.Model):
    __tablename__ = "permissions"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False, index=True)
    label = db.Column(db.String(120), nullable=False)
    module = db.Column(db.String(50), nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "label": self.label,
            "module": self.module,
        }
