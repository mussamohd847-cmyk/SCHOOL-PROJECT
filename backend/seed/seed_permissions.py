"""
Seed permissions na role -> permission mapping.
Run once:
    cd backend
    python -m seed.seed_permissions
"""
from database import db
from models.permission import Permission, Perm
from models.role_permission import RolePermission


ALL_PERMISSIONS = [
    (Perm.STUDENTS_VIEW,   "View students",      "students"),
    (Perm.STUDENTS_CREATE, "Add students",       "students"),
    (Perm.STUDENTS_EDIT,   "Edit students",      "students"),
    (Perm.STUDENTS_DELETE, "Delete students",    "students"),
    (Perm.TEACHERS_VIEW,   "View teachers",      "teachers"),
    (Perm.TEACHERS_MANAGE, "Manage teachers",    "teachers"),
    (Perm.USERS_VIEW,   "View accounts",     "users"),
    (Perm.USERS_CREATE, "Create accounts",   "users"),
    (Perm.USERS_EDIT,   "Edit accounts",     "users"),
    (Perm.USERS_DELETE, "Delete accounts",   "users"),
    (Perm.ATTENDANCE_VIEW,   "View attendance",      "attendance"),
    (Perm.ATTENDANCE_MARK,   "Mark attendance",      "attendance"),
    (Perm.ATTENDANCE_REPORT, "Attendance reports",   "attendance"),
    (Perm.RESULTS_VIEW,    "View results",     "results"),
    (Perm.RESULTS_ENTER,   "Enter results",    "results"),
    (Perm.RESULTS_PUBLISH, "Publish results",  "results"),
    (Perm.FEES_VIEW,    "View fees",         "fees"),
    (Perm.FEES_COLLECT, "Collect payments",  "fees"),
    (Perm.FEES_REPORT,  "Fees reports",      "fees"),
    (Perm.TIMETABLE_VIEW,   "View timetable",   "timetable"),
    (Perm.TIMETABLE_MANAGE, "Manage timetable", "timetable"),
    (Perm.MADRASA_VIEW,   "View madrasa",   "madrasa"),
    (Perm.MADRASA_MANAGE, "Manage madrasa", "madrasa"),
    (Perm.REPORTS_SCHOOL,  "School reports",  "reports"),
    (Perm.REPORTS_FINANCE, "Finance reports", "reports"),
    (Perm.SETTINGS_VIEW,   "View settings",   "settings"),
    (Perm.SETTINGS_MANAGE, "Manage settings", "settings"),
    (Perm.BOOTSTRAP_ADMIN, "Access bootstrap", "bootstrap"),
]


DEFAULT_ROLE_PERMISSIONS = {
    "admin": [p[0] for p in ALL_PERMISSIONS],
    "teacher": [
        Perm.STUDENTS_VIEW,
        Perm.ATTENDANCE_VIEW, Perm.ATTENDANCE_MARK,
        Perm.RESULTS_VIEW, Perm.RESULTS_ENTER,
        Perm.TIMETABLE_VIEW, Perm.MADRASA_VIEW,
    ],
    "student": [
        Perm.ATTENDANCE_VIEW, Perm.RESULTS_VIEW, Perm.TIMETABLE_VIEW,
    ],
}


def run():
    from app import app

    with app.app_context():
        for code, label, module in ALL_PERMISSIONS:
            if not Permission.query.filter_by(code=code).first():
                db.session.add(Permission(code=code, label=label, module=module))
        db.session.commit()
        print(f"✅ Permissions: {Permission.query.count()}")

        code_to_id = {p.code: p.id for p in Permission.query.all()}
        for role, codes in DEFAULT_ROLE_PERMISSIONS.items():
            for code in codes:
                pid = code_to_id.get(code)
                if not pid:
                    continue
                exists = RolePermission.query.filter_by(
                    role=role, permission_id=pid
                ).first()
                if not exists:
                    db.session.add(RolePermission(role=role, permission_id=pid))
        db.session.commit()
        print(f"✅ Role permissions: {RolePermission.query.count()}")
        print("🎉 Permissions seeded!")


if __name__ == "__main__":
    run()
