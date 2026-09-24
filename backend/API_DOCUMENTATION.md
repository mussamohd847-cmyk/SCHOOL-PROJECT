# NIA — Nimble Integrated Academy — Backend API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (LAN): `http://<COMPUTER-LAN-IP>:5000/api`

## Authentication

Every endpoint except `/api/auth/register`, `/api/auth/login` and `/api/health`
requires a JWT bearer token:

```
Authorization: Bearer <token>
```

Obtain a token from `POST /api/auth/login`.

### Response envelope

Success:
```json
{ "success": true, "message": "...", "data": { } }
```
Error:
```json
{ "success": false, "message": "...", "error": { } }
```
Lists:
```json
{ "success": true, "data": [], "pagination": { "page": 1, "per_page": 20, "total": 100 } }
```

---

## Auth — `/api/auth`

| Method | URL | Auth | Role | Body | Notes |
|---|---|---|---|---|---|
| POST | /register | No | — | full_name, email, username, password, role | role ∈ ADMIN/TEACHER/ACCOUNTANT/PARENT/STUDENT |
| POST | /login | No | — | (email or username), password | Returns JWT + user |
| POST | /logout | Yes | any | — | Stateless — client discards token |
| GET | /me | Yes | any | — | Current user profile |
| PUT | /change-password | Yes | any | current_password, new_password | |

## Users — `/api/users` (ADMIN only)
Full CRUD: `GET /`, `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>`

## Students — `/api/students`
- `GET /` — ADMIN, TEACHER, ACCOUNTANT — filters: class_id, stream_id, status
- `GET /<id>` — any authenticated role
- `POST /`, `PUT /<id>`, `DELETE /<id>` — ADMIN only

## Teachers — `/api/teachers`
Same pattern as students. Read: ADMIN, TEACHER. Write: ADMIN.

## Classes — `/api/classes` | Streams — `/api/streams` | Subjects — `/api/subjects`
Full CRUD. Read: any authenticated user. Write: ADMIN.

## Teacher-Class / Teacher-Subject assignments
- `/api/teacher-classes` — GET (list/filter), POST (ADMIN), DELETE (ADMIN). Duplicate assignments rejected (409).
- `/api/teacher-subjects` — same pattern.

## Academic Years — `/api/academic-years`
Full CRUD (ADMIN write) plus `PUT /<id>/activate` which sets this year ACTIVE and all others INACTIVE.

## Terms — `/api/terms`
Full CRUD (ADMIN write).

## Timetable — `/api/timetable`
- `GET /` — filters: teacher_id, class_id, stream_id, subject_id, day_of_week, academic_year_id, term_id
- `GET /<id>`
- `POST /`, `PUT /<id>`, `DELETE /<id>` — ADMIN only
- Conflict prevention: a teacher cannot be double-booked in an overlapping time slot on the same day; a class/stream cannot have two overlapping lessons. Violations return `409`.

## Attendance — `/api/attendance`
- `GET /` — filters: student_id, class_id, date
- `POST /` — ADMIN, TEACHER — one record per student/date (409 on duplicate)
- `POST /bulk` — ADMIN, TEACHER — `{ "class_id", "date", "records": [{student_id, status, remarks}] }`
- `PUT /<id>` — ADMIN, TEACHER
- `GET /student/<id>/percentage`
- `GET /class/<id>/monthly?year=YYYY&month=MM`

## Exams — `/api/exams`
Full CRUD. Read: any. Create/Update: ADMIN, TEACHER. Delete: ADMIN.

## Results — `/api/results`
- `GET /` — filters: student_id, exam_id, subject_id
- `POST /`, `PUT /<id>` — ADMIN, TEACHER. `DELETE /<id>` — ADMIN, TEACHER.
- Grading: A 80–100, B 65–79, C 50–64, D 35–49, F 0–34 (scaled to the exam's total_marks).
- One result per student+exam+subject (409 on duplicate).
- `GET /student/<id>/report`
- `GET /class/<id>/ranking?exam_id=`
- `GET /subject/<id>/performance`

## Fees — `/api/fees` (fee_structure)
Full CRUD. Read: any authenticated. Write: ADMIN, ACCOUNTANT.

## Payments — `/api/payments`
- `GET /`, `GET /<id>` — ADMIN, ACCOUNTANT
- `POST /`, `PUT /<id>`, `DELETE /<id>` — ADMIN, ACCOUNTANT
- `GET /student/<id>/balance` — total fees, total paid, balance

## Settings — `/api/settings`
- `GET /`, `GET /<key>` — any authenticated
- `POST /`, `PUT /<key>`, `DELETE /<key>` — ADMIN

## Dashboards — `/api/dashboard`
- `GET /admin` — ADMIN
- `GET /teacher` — TEACHER (resolved from the logged-in user's linked teacher profile), ADMIN
- `GET /student?student_id=` — STUDENT, PARENT, ADMIN
- `GET /accountant` — ACCOUNTANT, ADMIN

## Health — `GET /api/health`
No auth required. Returns `{"database": "connected"}` or a 500 with `"database": "disconnected"`.

---

## HTTP status codes used
`200` OK · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden ·
`404` Not Found · `409` Conflict · `422` Unprocessable Entity · `500` Internal Server Error
