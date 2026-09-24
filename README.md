# NIA School & Madrasa Management System — React + Flask + MySQL

This package converts the supplied NIA HTML/CSS/JavaScript system into a React + JSX frontend and a Python Flask REST API connected to MySQL.

## Structure

```text
NIA_React_Python_MySQL/
├── frontend/                 React + Vite + JSX
│   ├── public/NIA SCHOOLS.jpg
│   └── src/
├── backend/                  Python Flask API
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── nia_full.sql          Original NIA MySQL schema + data
│   └── README.md
└── README.md
```

## Ubuntu setup

### 1. MySQL

Make sure MySQL is running:

```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

Create/import the database:

```bash
cd database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nia_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p nia_system < nia_full.sql
```

If root has no password, remove `-p`.

### 2. Python backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

Set your real MySQL password in `.env`.

Start:

```bash
python app.py
```

Test:

```bash
curl http://127.0.0.1:5000/api/health
```

You should receive JSON with:

```text
"status": "ok"
"database": "mysql"
```

### 3. React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite address shown in the terminal, normally:

```text
http://127.0.0.1:5173
```

The React frontend calls:

```text
http://127.0.0.1:5000/api
```

You can change it with:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

inside `frontend/.env`.

## Demo login

The imported database contains the original accounts. The main account is:

```text
Username: admin
Password: admin123
```

Other original demo accounts are listed in the supplied NIA documentation/database.

## Included React modules

- Login and JWT authentication
- Role-based sidebar
- Dashboard
- Students CRUD
- Teachers CRUD
- Academics: exams, results, attendance
- Finance: payments
- Madrasa
- Timetable
- Reports
- Settings
- Activity Log
- Responsive mobile layout
- NIA logo and original NIA data
- MySQL-backed REST API

## Important

The old Node/Express server is not used by this version. The backend is Python Flask.

The old HTML/JS files are not required to run the new application. The original SQL data is retained so existing NIA records can be imported into MySQL.
