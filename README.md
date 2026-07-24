# 📖 Qalam CH Library API

A modern, feature-rich RESTful API built with **Laravel** for the **Qalam CH Digital Library** application. The backend powers mobile and web applications with seamless authentication, book catalog management, smart suggestions, zip file storage compression, personal user libraries, ratings, and a comprehensive Admin Dashboard.

---

## ✨ Features Overview

### 🔐 1. Authentication & Security
- **User Authentication**: Standard email/password registration, login, and token-based Sanctum authentication.
- **Google OAuth Integration**: Google login endpoint accepting OAuth access tokens.
- **Admin Authentication**: Separate admin authentication with role-based token abilities (`ability:admin`).

---

### 📚 2. Book Catalog & Discovery
- **Public Listings**: Browse categories, authors, and books.
- **Book Filters**:
  - `GET /api/books/latest`: Retrieve latest published books.
  - `GET /api/books/most-read`: Retrieve books sorted by total views (`views_count`).
  - `GET /api/books/book-of-the-day`: Retrieve featured Book of the Day (with fallback to random).
  - `GET /api/books/loved`: Retrieve top-rated and most favorited books.
- **💡 Smart Suggested Books (`GET /api/books/suggested`)**:
  - Returns books manually flagged by admins (`is_suggested = true`).
  - Automatically falls back to returning random non-archived books if no admin suggestions are configured.

---

### 📁 3. Zip Storage Compression
- **Storage Space Optimization**: Book files (PDF, EPUB, DOCX) uploaded by admins are automatically compressed into `.zip` archives on storage using PHP `ZipArchive`.
- **Space Savings**: Reduces server storage footprint by 30% to 70%.
- **Uncompromised Image Quality**: Cover images (`cover_image`) remain unzipped (JPEG/PNG/WEBP) for fast UI rendering.

---

### 📦 4. Archiving & Soft Deletes
- **End-User Filtering**: Soft-deleted (archived) books are automatically hidden from all public/end-user APIs using Laravel `SoftDeletes`.
- **Admin Management**:
  - `DELETE /api/admin/books/{id}`: Soft-delete/archive a book.
  - `GET /api/admin/books/archived`: List all archived books.
  - `POST /api/admin/books/{id}/restore`: Restore an archived book back to public view.

---

### 📖 5. User Personal Library
- **Favorites**: Toggle books as favorites (`POST /api/library/favorites`).
- **Personal Shelf**: Add/remove books to custom reading shelf (`POST /api/library/shelf`).
- **Reading History**: Automatically record user reading history (`POST /api/library/history`).
- **Library Dashboard**: Fetch user's complete library (`GET /api/library`).

---

### ⭐ 6. Ratings & Reviews
- Rate books from 1 to 5 stars (`POST /api/ratings`).
- Automatic rating aggregation and rating counts per book.

---

### 📊 7. Admin Dashboard & Management API
- **Admin Dashboard (`GET /api/admin/dashboard`)**:
  - System Overview Stats: Total counts for Books, Authors, Categories, Users, Advertisements, Contact Inquiries, and Total Book Views.
  - Activity Lists: Recent books, most read books, and latest registered users.
- **Resource CRUD Operations**: Full management endpoints for Books, Authors, Categories, and Advertisements.

---

## 🗄️ Database Architecture

| Table | Description |
| :--- | :--- |
| `users` | Customer accounts (supports email/password & Google login). |
| `admins` | System administrator accounts with `username` and `password`. |
| `books` | Book records containing title, slug, cover, file path, views count, `is_book_of_the_day`, `is_suggested`, and soft deletes. |
| `authors` | Author profiles with bio, country, and image. |
| `categories` | Book genres/categories. |
| `book_user` | Pivot table tracking user interactions (`favorite`, `shelf`, `history`). |
| `ratings` | Book ratings submitted by users. |
| `advertisements` | Promotional banner ads managed by admins. |
| `contacts` | User contact/support inquiries. |

---

## 🚀 API Endpoint Reference

### 🔓 Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Register new user account. |
| `POST` | `/api/login` | Login user and obtain token. |
| `POST` | `/api/auth/google` | Authenticate via Google OAuth token. |
| `GET` | `/api/categories` | List all book categories. |
| `GET` | `/api/authors` | List all authors. |
| `GET` | `/api/books` | List books. |
| `GET` | `/api/books/latest` | Get 10 latest books. |
| `GET` | `/api/books/most-read` | Get top 10 most read books. |
| `GET` | `/api/books/suggested` | Get suggested books (or random fallback). |
| `GET` | `/api/books/book-of-the-day` | Get Book of the Day. |
| `GET` | `/api/books/loved` | Get top rated/loved books. |
| `GET` | `/api/advertisements` | Get active banner advertisements. |
| `POST` | `/api/contact` | Submit contact inquiry. |

---

### 🔒 Protected User Endpoints (Header: `Authorization: Bearer {token}`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/logout` | Revoke current user session. |
| `GET` | `/api/user` | Get current authenticated user details. |
| `GET` | `/api/library` | Get user library (Favorites, Shelf, History). |
| `POST` | `/api/library/favorites` | Toggle book favorite status. |
| `POST` | `/api/library/shelf` | Toggle book shelf status. |
| `POST` | `/api/library/history` | Record book reading history. |
| `POST` | `/api/ratings` | Submit rating for a book. |

---

### 🛡️ Protected Admin Endpoints (Header: `Authorization: Bearer {adminToken}`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Admin login to receive admin token. |
| `GET` | `/api/admin/dashboard` | **Admin Dashboard statistics & overview.** |
| `POST` | `/api/admin/books` | Create book (supports `file` upload with zip compression & `is_suggested`). |
| `PUT` | `/api/admin/books/{id}` | Update book details/files/flags. |
| `DELETE` | `/api/admin/books/{id}` | Archive (soft delete) a book. |
| `GET` | `/api/admin/books/archived` | List all archived books. |
| `POST` | `/api/admin/books/{id}/restore` | Restore an archived book. |
| `POST` | `/api/admin/authors` | Create author. |
| `POST` | `/api/admin/categories` | Create category. |
| `POST` | `/api/admin/advertisements` | Create advertisement. |
| `POST` | `/api/admin/logout` | Admin logout. |

---

## 💻 Installation & Setup Guide

### 1. Requirements
- PHP `>= 8.2` (with `zip` and `pdo_mysql` extensions enabled)
- Composer
- MySQL Database

### 2. Environment Setup
Clone the repository and copy the environment file:
```bash
cp .env.example .env
```

Configure your database connection in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ch_library
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Install Dependencies & Generate Key
```bash
composer install
php artisan key:generate
```

### 4. Database Migration & Seeding
Run migrations to set up the database tables (including `is_suggested` and `admins`):
```bash
php artisan migrate
```

Seed initial admin credentials and demo advertisements:
```bash
php artisan db:seed --class=AdminAndAdSeeder
```

### 5. Storage Link
Link the storage directory to make uploaded images and files publicly accessible:
```bash
php artisan storage:link
```

### 6. Run Local Development Server
```bash
php artisan serve
```

---

## 🧪 Postman Collection

A complete Postman collection is included in the project root:
- **`Qalam_CH_Postman_Collection.json`**

Import this file into Postman to instantly test all Public, Protected User, and Admin Dashboard APIs.

---

## 📝 License
This project is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
