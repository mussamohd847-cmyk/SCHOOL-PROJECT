# NIA Database (MySQL)

This folder keeps the original NIA MySQL schema/data. It is used by the new Flask backend.

## 1. Create the database

From Ubuntu:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nia_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p nia_system < nia_full.sql
```

If your MySQL root account has no password, remove `-p`.

## 2. Backend connection

Copy `backend/.env.example` to `backend/.env` and set:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nia_system
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
JWT_SECRET=change-this-to-a-long-secret
PORT=5000
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

The backend uses PyMySQL, not SQLite.
