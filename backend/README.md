# NIA — Nimble Integrated Academy — Backend

School & Madrasa Management System backend for NIA (Kisauni – Mkunazi
Samaki, Zanzibar). Flask + Flask-SQLAlchemy + MySQL (PyMySQL), JWT auth,
role-based access control, full REST CRUD.

## 1. Requirements
- Python 3.10+
- A running MySQL server reachable at the host/port in `.env`

## 2. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set DB_PASSWORD (and DB_HOST/DB_NAME/DB_USER if different),
# and change SECRET_KEY / JWT_SECRET_KEY for production.
```

Create the MySQL user referenced in `.env` if it doesn't exist yet, e.g.:

```sql
CREATE USER 'sfpms_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON nia_system.* TO 'sfpms_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Initialize the database

Creates the `nia_system` database if missing, creates all tables
(never drops existing ones), verifies them, and seeds default data
(admin user, academic year 2026, terms, classes, subjects):

```bash
python -m seed.init_db
```

Default admin login created by the seed: `admin` / `Admin@123` — **change this immediately.**

To re-seed reference data only, without the connection/table checks:

```bash
python -m seed.seed_database
```

## 4. Run the backend

```bash
python run.py
```

Runs on `0.0.0.0:5000` by default (edit `HOST`/`PORT` in `.env`), so it's
reachable both at `http://localhost:5000/api` and
`http://<your-LAN-IP>:5000/api` from the React/Vite frontend
(`http://localhost:5173` is allowed by default in `CORS_ORIGINS`).

## 5. Verify

```bash
# MySQL connectivity + app health
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Authenticated request (replace <TOKEN>)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer <TOKEN>"
```

## 6. Tests

```bash
pip install pytest
pytest tests/ -v
```

`test_login_admin` needs the database seeded first; the health/auth/404
tests run against any reachable database.

## 7. Project structure

See `API_DOCUMENTATION.md` for the full endpoint reference, roles, and
request/response shapes for every resource (users, students, teachers,
classes, streams, subjects, teacher-class/subject assignments, academic
years, terms, timetable, attendance, exams, results, fees, payments,
settings, dashboards).

## 8. Notes

- Passwords are hashed with Werkzeug (`generate_password_hash` /
  `check_password_hash`) — never stored in plain text.
- `seed/init_db.py` never drops tables or deletes existing student,
  teacher, payment, or result data; it only creates missing tables.
- Timetable creation/updates reject overlapping teacher or class/stream
  bookings with `409 Conflict`.
