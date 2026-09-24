"""
Seed script — populates default reference data.
Safe to re-run: every insert checks for an existing record first.

Usage:
    python -m seed.seed_database
"""
import sys
from datetime import date

sys.path.insert(0, ".")


def run_seed():
    from database import db
    from models import User, AcademicYear, Term, ClassModel, Subject

    # --- Admin user -------------------------------------------------
    if not User.query.filter_by(username="admin").first():
        admin = User(
            full_name="System Administrator",
            email="admin@nia.school",
            username="admin",
            role="ADMIN",
            status="ACTIVE",
        )
        admin.set_password("Admin@123")
        db.session.add(admin)
        print("      Created default admin (username: admin / password: Admin@123)")
    else:
        print("      Admin user already exists, skipping.")

    # --- Academic year 2026 -----------------------------------------
    year = AcademicYear.query.filter_by(name="2026").first()
    if not year:
        year = AcademicYear(
            name="2026", start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
            status="ACTIVE",
        )
        db.session.add(year)
        db.session.flush()
        print("      Created academic year 2026.")
    else:
        print("      Academic year 2026 already exists, skipping.")

    # --- Terms ---------------------------------------------------------
    term_dates = {
        "TERM 1": (date(2026, 1, 6), date(2026, 4, 3)),
        "TERM 2": (date(2026, 4, 20), date(2026, 8, 7)),
        "TERM 3": (date(2026, 8, 24), date(2026, 12, 4)),
    }
    for term_name, (start, end) in term_dates.items():
        if not Term.query.filter_by(academic_year_id=year.id, name=term_name).first():
            db.session.add(Term(
                academic_year_id=year.id, name=term_name, start_date=start, end_date=end,
                status="ACTIVE" if term_name == "TERM 1" else "INACTIVE",
            ))
    print("      Terms seeded.")

    # --- Classes ------------------------------------------------------
    class_names = [
        "JUVENILE", "KG1", "KG2", "GRADE 1", "GRADE 2", "GRADE 3",
        "GRADE 4", "GRADE 5", "GRADE 6", "GRADE 7",
    ]
    for name in class_names:
        if not ClassModel.query.filter_by(name=name).first():
            db.session.add(ClassModel(name=name, status="ACTIVE"))
    print("      Classes seeded.")

    # --- Subjects -------------------------------------------------------
    school_subjects = [
        ("ENG", "English"), ("KIS", "Kiswahili"), ("MATH", "Mathematics"),
        ("SCI", "Science"), ("SOC", "Social Studies"), ("ICT", "Computer Studies"),
        ("ART", "Creative Arts"), ("PE", "Physical Education"),
    ]
    madrasa_subjects = [
        ("QUR", "Qur'an"), ("TAJ", "Tajweed"), ("FIQ", "Fiqh"),
        ("HAD", "Hadith"), ("ARB", "Arabic"), ("AKH", "Akhlaq"),
    ]
    for code, name in school_subjects:
        if not Subject.query.filter_by(code=code).first():
            db.session.add(Subject(code=code, name=name, category="SCHOOL", status="ACTIVE"))
    for code, name in madrasa_subjects:
        if not Subject.query.filter_by(code=code).first():
            db.session.add(Subject(code=code, name=name, category="MADRASA", status="ACTIVE"))
    print("      Subjects seeded.")

    db.session.commit()


if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        run_seed()
