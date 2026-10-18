# Prerona Online Exam Preparation & Question Bank Platform
## Complete Full-Stack Architecture & Deployment Documentation

### 1. Technology Architecture

- **Backend (Production API)**: PHP 8.3+ with Laravel 11, Laravel Sanctum, Eloquent ORM, MySQL 8.0 / Percona.
- **Frontend SPA**: React 19, TypeScript, Tailwind CSS, React Router v7, Lucide Icons.
- **Node.js Fullstack Server**: Express.js proxy with Vite integration serving `/api/v1` routes and hosting the SPA on Port 3000.
- **Typography & Localization**: Bilingual Bengali (Hind Siliguri) & English (Plus Jakarta Sans) with tabular numerals for exam countdowns and analytics.

---

### 2. Database ERD & Schema Design

```
+---------------+        +-------------------+        +--------------------+
|  categories   |<-------|  question_papers  |------->|   organizations    |
+---------------+        +-------------------+        +--------------------+
| id (PK)       |        | id (PK)           |        | id (PK)            |
| name          |        | category_id (FK)  |        | name               |
| name_bn       |        | organization_id   |        | name_bn            |
| slug          |        | position_id (FK)  |        | slug               |
| order         |        | exam_year         |        | is_active          |
| is_active     |        | total_marks       |        +--------------------+
+---------------+        | duration_minutes  |
                         | is_paid           |        +--------------------+
                         | pdf_url           |        |     positions      |
                         +-------------------+        +--------------------+
                                   |                  | id (PK)            |
                                   | 1:N              | organization_id(FK)|
                                   v                  | name, name_bn      |
                         +-------------------+        +--------------------+
                         |     questions     |
                         +-------------------+
                         | id (PK)           |
                         | question_paper_id |
                         | question_text     |
                         | options (JSON)    |
                         | correct_ids (JSON)|
                         | marks, neg_marks  |
                         | explanation       |
                         +-------------------+

+---------------+        +-------------------+        +--------------------+
|     exams     |------->|   exam_attempts   |<-------|       users        |
+---------------+        +-------------------+        +--------------------+
| id (PK)       |        | id (PK)           |        | id (PK)            |
| title         |        | exam_id (FK)      |        | name, email        |
| question_ids  |        | user_id (FK)      |        | password_hash      |
| duration_mins |        | deadline          |        | role (RBAC)        |
| pass_marks    |        | score (server-calc|        | status             |
| negative_marks|        | correct_count     |        +--------------------+
| is_paid       |        | rank              |                   |
+---------------+        +-------------------+                   |
                                                                 v
+---------------+        +-------------------+        +--------------------+
|  packages     |<-------|      orders       |------->| user_entitlements  |
+---------------+        +-------------------+        +--------------------+
| id (PK)       |        | id (PK)           |        | id (PK)            |
| name, name_bn |        | user_id (FK)      |        | user_id (FK)       |
| duration_days |        | package_id (FK)   |        | order_id (FK)      |
| price_bdt     |        | transaction_id    |        | starts_at          |
| is_active     |        | status (pending)  |        | expires_at         |
+---------------+        | approved_by       |        | is_active          |
                         +-------------------+        +--------------------+
```

---

### 3. API Endpoints Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/home` | Featured categories, solved papers, live exams, notices | Public |
| `GET` | `/api/v1/questions` | Filter question papers by year, category, organization, paid/free | Public |
| `GET` | `/api/v1/questions/{slug}`| Details, PDF attachment, questions (answers masked if unpaid) | Public |
| `GET` | `/api/v1/exams` | Active & upcoming online mock tests | Public |
| `GET` | `/api/v1/exams/{slug}` | Exam instructions, questions with masked keys | Public |
| `POST` | `/api/v1/exam-attempts/start` | Initiates attempt, locks server deadline | Sanctum Token |
| `POST` | `/api/v1/exam-attempts/{id}/save` | Autosaves answer selections | Sanctum Token |
| `POST` | `/api/v1/exam-attempts/{id}/submit` | Calculates score, rank & logs completion | Sanctum Token |
| `GET` | `/api/v1/results/{id}` | Scorecard with marks, negative penalty, rank & solutions | Sanctum Token |
| `POST` | `/api/v1/orders` | Submits purchase request with bKash/Nagad Txn ID | Sanctum Token |
| `GET` | `/api/v1/entitlements` | Active subscriptions & expiration time | Sanctum Token |
| `GET` | `/api/v1/admin/dashboard` | Real-time counts, revenue, pending approvals | Admin / Staff |
| `POST` | `/api/v1/admin/payments/{id}/approve` | Approves payment & activates entitlement | Admin / Staff |
| `POST` | `/api/v1/admin/bulk-import-mcqs` | Batch imports MCQs into question paper | Admin / Staff |

---

### 4. Running the Project Locally & In Production

#### Running in Node.js (AI Studio Live Container)
```bash
# Start fullstack dev server (Express + Vite on Port 3000)
npm run dev

# Lint & build
npm run lint
npm run build
```

#### Running Laravel 11 Backend Standalone
```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
