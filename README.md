# Backend Serasi Autoraya - Order Product System

## Table of Contents
- [Project Overview](#project-overview)
- [Logic Problem Solving](#logic-problem-solving)
- [Technology & Architecture](#technology--architecture)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Docker & Monitoring Stack](#docker--monitoring-stack)
- [API Documentation](#api-documentation)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Async Processing with Order Queue](#async-processing-with-order-queue)
- [Testing Suite](#testing-suite)
- [Prisma CLI Reference](#prisma-cli-reference)

---

## Project Overview

Project **order-product** adalah backend application untuk sistem **Serasi Autoraya**, yang berfungsi sebagai assessment dan pembelajaran mengenai:

- **RESTful API Design** dengan Express.js
- **Database Transaction & Concurrency** handling menggunakan Prisma ORM
- **Authentication & Authorization** (JWT + RBAC)
- **Order Processing Workflow** dengan validasi stok, idempotency handling, dan soft-delete pattern
- **Async Job Queue** menggunakan BullMQ + Redis untuk proses non-blocking
- **Testing Strategy** dengan Jest + Supertest

Sistem ini dirancang untuk mengelola:
- **User Management** (Register, Login, Profile)
- **Product Catalog** (Create, Update, Search, Soft-Delete)
- **Order Creation & History** (dengan transactional integrity dan stock validation)
- **Async Notifications** (Email invoices, Activity logging, Push notifications)

---

## Logic Problem Solving

Project ini juga mencakup solusi untuk problem-solving challenges dalam directory `logic-problem-solving/`:

### Section 1: Marble Problem (Soal 1 & 2)

**Problem:** Menemukan 1 kelereng berbobot 125 gram dari total 8 kelereng (7 kelereng lainnya berbobot 100 gram) dengan maksimal 2 kali penimbangan menggunakan neraca dua lengan.

**Solusi - Algoritma (Divide and Conquer):**

1. **Penimbangan 1:** Bagi 6 kelereng menjadi dua kelompok 3-3, sisa 2 kelereng di luar.
   - Jika seimbang → kelereng terberat ada di 2 kelereng yang di luar.
   - Jika berat sebelah → kelereng terberat ada di kelompok lengan yang turun.

2. **Penimbangan 2:** Dari kelompok terbukti berisi kelereng terberat:
   - Jika dari 2 kelereng: timbang 1 vs 1 → kelereng yang turun adalah solusi.
   - Jika dari 3 kelereng: ambil 2, timbang 1 vs 1, satu sisanya di luar.
     - Jika seimbang → kelereng di luar adalah solusi.
     - Jika berat sebelah → kelereng yang turun adalah solusi.

**Reasoning (Analisis Logika):**
- Menggunakan **ternary decision tree** (3 status: Kiri turun -1, Seimbang 0, Kanan turun 1).
- Kapasitas informasi: $3^k$ di mana $k$ = jumlah penimbangan.
- Dengan 2 penimbangan maksimal: $3^2 = 9$ kelereng dapat dideteksi.
- Karena $8 \le 9$, maka **pasti bisa diselesaikan dalam 2 penimbangan**.

**Complexity:**
- **Time Complexity:** $\mathcal{O}(\log_3 n)$ = $\lceil\log_3 8\rceil = 2$ operasi.
- **Space Complexity:** $\mathcal{O}(1)$ (konstan, tidak ada alokasi dinamis).

Lihat detail lengkap: [logic-problem-solving/marble-problem/marble-problem.md](logic-problem-solving/marble-problem/marble-problem.md)

### Section 2: System Design Thinking

**Arsitektur Backend:**
- **Decoupled Architecture / Modular Monolith** berbasis Node.js Express.
- Pemisahan komponen berdasarkan **Event-Driven** principles.
- Menggunakan **Message Broker (Redis + BullMQ)** untuk async processing.

**Komponen Utama:**
1. **API Gateway (Nginx):** Reverse proxy, SSL termination, rate limiting.
2. **Core API Service (Node.js Express):** Sinkron traffic (auth, katalog, orders).
3. **Database (PostgreSQL):** Master-Slave replication (Write→Master, Read→Slave).
4. **Message Queue (Redis + BullMQ):** Email, logging, notifikasi async.

**Scaling Strategy:**
- **Horizontal Scaling:** Beberapa instance Node.js dalam Docker + Nginx load balancing.
- **Database Tuning:** Connection pooling, query optimization.
- **Caching:** Redis untuk read-heavy operations (produk, pencarian).
- **Idempotency:** Unique transaction ID + Redis SETNX untuk prevent duplicates.

Lihat detail lengkap: [logic-problem-solving/system-design-thinking/system-design.md](logic-problem-solving/system-design-thinking/system-design.md)

---

## Technology & Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (ES Modules) | v18+ |
| Web Framework | Express.js | v5.1.0 |
| Database | PostgreSQL + Prisma ORM | v6.8.2 |
| Authentication | JWT (jsonwebtoken) | v9.0.3 |
| Password Hashing | Bcrypt | v6.0.0 |
| Validation | Joi | v17.13.3 |
| Message Queue | BullMQ + IORedis | v5.78.0 / v5.11.1 |
| Logging | Winston | v3.17.0 |
| Testing | Jest + Supertest | v29.7.0 / v7.1.1 |

### Architecture Patterns

- **Service Layer Pattern:** Bisnis logic terpisah dari controller.
- **Middleware Pattern:** Auth, error handling, RBAC.
- **Transactional Pattern:** Atomic operations pada order creation.
- **Idempotency Pattern:** Unique key handling untuk prevent duplicates.
- **Soft-Delete Pattern:** Logical deletion via `is_deleted` flag.
- **Queue Worker Pattern:** Async job processing dengan retry & DLQ.

---

## Project Structure


```

serasi-autoraya/order-product/
├── docs/                           # API Documentation & Specs
│   ├── user.md                     # User API specification
│   ├── product.md                  # Product API specification
│   ├── order.md                    # Order API specification
│   └── postman/                    # Postman collection
│
├── logic-problem-solving/          # Problem-solving challenges
│   ├── marble-problem/             # Divide and Conquer algorithm
│   │   └── marble-problem.md
│   └── system-design-thinking/     # Architectural design patterns
│       └── system-design.md
│
├── prisma/                         # Database schema & migrations
│   ├── schema.prisma               # Prisma data model
│   ├── migrations/                 # Migration history
│   └── seed.js                     # Database seeding script
│
├── src/                            # Application source code
│   ├── main.js                     # Application entry point
│   ├── application/                # Core application setup
│   │   ├── database.js             # Prisma client + event logging
│   │   ├── logging.js              # Winston logger configuration
│   │   └── web.js                  # Express app setup
│   ├── controller/                 # HTTP request handlers
│   ├── service/                    # Business logic layer
│   ├── middleware/                 # Express middleware
│   ├── validation/                 # Request validation schemas
│   ├── route/                      # API routing
│   ├── queue/                      # Async job processing
│   └── error/                      # Custom error classes
│
├── test/                           # Test suite
│   ├── test-util.js                # Test utilities & helpers
│   ├── user.test.js                # User API tests
│   ├── product.test.js             # Product API tests
│   └── order.test.js               # Order API tests
│
├── generated/                      # Generated files (Prisma Client artifacts)
├── Dockerfile                      # Container image build definition
├── docker-compose.yml              # Docker services and monitoring stack
├── package.json                    # NPM dependencies & scripts
├── .env.example                    # Environment variables template
├── babel.config.json               # Babel configuration
└── README.md                       # This file

```

---

## Installation Guide

### Prerequisites
Pastikan perangkat Anda sudah terpasang:
- **Node.js** v18+ & **npm**
- **PostgreSQL** v12+
- **Redis** v6+ (untuk async queue)
- **Docker & Docker Compose** (Sangat direkomendasikan untuk pengujian instan)

### Step 1: Clone Repository
```bash
git clone git@github.com:irvanrifai/serasi-order-product.git order-product
cd order-product

```

### Step 2: Setup Environment Variables

Buat file konfigurasi dengan menyalin template bawaan:

```bash
cp .env.example .env

```

Sesuaikan nilai di dalam file `.env` menggunakan kredensial database dan port yang diinginkan. Berikut contoh konfigurasi siap pakai:

```env
# APP CONFIG
APP_PORT=3000
NODE_ENV=production
JWT_SECRET=supersecretproductionkey2026

# DATABASE CONFIG
POSTGRES_USER=sera_admin
POSTGRES_PASSWORD=SeraSecurePassword2026!
POSTGRES_DB=order_product
OUTER_POSTGRES_PORT=5433 

# URL Koneksi Internal untuk Docker Mode (Gunakan Alias Network)
POSTGRES_HOST=postgres_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres_db:5432/${POSTGRES_DB}?schema=public"

# REDIS CONFIG (Untuk Async Queue)
OUTER_REDIS_PORT=6378 
REDIS_HOST=redis_broker
REDIS_PORT=6379
REDIS_ADDR=redis://redis_broker:6379

# MONITORING STACK EXTERNAL PORTS
OUTER_PROMETHEUS_PORT=9090
OUTER_GRAFANA_PORT=3001
OUTER_ALERTMANAGER_PORT=9093
OUTER_NODE_EXPORTER_PORT=9100
OUTER_CADVISOR_PORT=8081

# MONITORING ENVIRONMENT
GF_SECURITY_ADMIN_PASSWORD=adminmonitoring2026
K24KLIK_ENV=production

```

> 💡 **Tips Pengujian Lokal Tanpa Docker:** Jika Anda ingin menjalankan server langsung via terminal lokal laptop (`node src/main.js`), silakan buat file terpisah bernama `.env.local` lalu ubah `POSTGRES_HOST=localhost` dan `POSTGRES_PORT=5433` (menyesuaikan outer port database yang di-expose oleh Docker). Aplikasi otomatis memprioritaskan `.env.local` saat berjalan di mode lokal.

### Step 3: Pilihan Cara Menjalankan Aplikasi

#### Opsi A: Menggunakan Docker Compose (Sangat Direkomendasikan 🚀)

Seluruh sirkuit arsitektur aplikasi, database, message broker, hingga dashboard monitoring akan dibangun dan dijalankan secara otomatis hanya dengan satu komando:

```bash
docker compose --env-file .env up --build

```

*Catatan: Jalur ini otomatis mengeksekusi struktur skema tabel (migration) dan mengisi data produk awal (seeding) secara terisolasi di dalam kontainer, sehingga Anda bisa langsung menguji API tanpa konfigurasi manual tambahan.*

#### Opsi B: Menggunakan Runtime Lokal (Manual)

Jika Anda memilih untuk mengeksekusi servis secara terpisah di OS lokal Anda:

```bash
# 1. Install dependensi
npm install

# 2. Generate Prisma Client local
npx prisma generate

# 3. Jalankan migrasi skema tabel ke database lokal
npx prisma migrate deploy

# 4. Masukkan data produk dummy (Seeding)
npx prisma db seed

# 5. Nyalakan server aplikasi
node src/main.js

```

---

## Docker & Monitoring Stack

Aplikasi ini mengintegrasikan ekosistem monitoring berbasis kontainer yang tangguh untuk memantau metrik performa serta sirkuit kesehatan *message broker*.

### Manajemen Kontainer

* **Menyalakan Stack:** `docker compose --env-file .env up --build`
* **Mematikan Stack & Menghapus Volume:** `docker compose down -v`

### Alamat Akses Dashboard Eksternal (Laptop)

Semua gerbang masuk di bawah ini bersifat dinamis mengikuti file `.env` Anda:

* **REST API Server:** `http://localhost:3000`
* **Grafana Dashboard:** `http://localhost:3001` *(Default Password Admin: adminmonitoring2026)*
* **Prometheus Server:** `http://localhost:9090`
* **cAdvisor Metrics:** `http://localhost:8081`

---

## API Documentation

Dokumentasi spesifikasi teknis RESTful API tersedia lengkap dalam format Markdown mandiri:

* 👤 **User API Specification:** [docs/user.md](https://www.google.com/search?q=docs/user.md) (Register, Login, Update Profile)
* 📦 **Product API Specification:** [docs/product.md](https://www.google.com/search?q=docs/product.md) (Pencarian, Detail, CRUD Merchant)
* 🛒 **Order API Specification:** [docs/order.md](https://www.google.com/search?q=docs/order.md) (Transaksi Pemesanan, Riwayat Pembelian)

📁 **Postman Collection:** Berkas siap impor untuk pengujian interaktif langsung tersedia di dalam direktori [docs/postman/](https://www.google.com/search?q=docs/postman/).

### Daftar Utama Endpoint Tersedia

| Method | Endpoint | Auth | Role Terkait | Deskripsi |
| --- | --- | --- | --- | --- |
| POST | `/api/users/register` | ❌ | - | Registrasi akun pengguna baru |
| POST | `/api/users/login` | ❌ | - | Otentikasi & penyerahan JWT token |
| GET | `/api/users/current` | ✅ | - | Mengambil profil user saat ini |
| PATCH | `/api/users/current` | ✅ | - | Memperbarui informasi profil |
| GET | `/api/products` | ❌ | - | Pencarian katalog produk (Paginated) |
| GET | `/api/products/:id` | ❌ | - | Mengambil detail spesifik produk |
| POST | `/api/products` | ✅ | MERCHANT | Menambah produk baru ke katalog |
| PUT | `/api/products/:id` | ✅ | MERCHANT | Memperbarui data produk |
| DELETE | `/api/products/:id` | ✅ | MERCHANT | Penghapusan logis (Soft-delete) produk |
| POST | `/api/orders` | ✅ | CUSTOMER | Transaksi pembuatan order (Idempotent) |
| GET | `/api/orders` | ✅ | CUSTOMER | Mengambil riwayat transaksi (Paginated) |
| GET | `/api/orders/:id` | ✅ | CUSTOMER | Mengambil rincian detail order |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         users                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ INT AUTOINCREMENT                         │
│ name             │ VARCHAR                                   │
│ username (UQ)    │ VARCHAR                                   │
│ email (UQ)       │ VARCHAR                                   │
│ password         │ VARCHAR (hashed bcrypt)                   │
│ phone            │ VARCHAR? (nullable)                       │
│ role             │ ENUM [CUSTOMER, MERCHANT, ADMIN]         │
│ created_at       │ TIMESTAMP DEFAULT now()                   │
│ updated_at       │ TIMESTAMP                                 │
│ is_deleted       │ BOOLEAN DEFAULT false (soft-delete)       │
├─────────────────────────────────────────────────────────────┤
│ Indexes: [email], [username]                               │
└─────────────────────────────────────────────────────────────┘
          │                          │
          │ (merchant_id)            │ (user_id)
          ▼                          ▼
   ┌──────────────────┐      ┌──────────────────┐
   │    products      │      │      orders      │
   ├──────────────────┤      ├──────────────────┤
   │ id (PK)          │      │ id (PK)          │
   │ sku (UQ)         │      │ user_id (FK)     │
   │ name             │      │ total_price      │
   │ price            │      │ idempotency_key  │
   │ stock            │      │ status (ENUM)    │
   │ merchant_id (FK) │      │ created_at       │
   │ is_deleted       │      │ updated_at       │
   ├──────────────────┤      ├──────────────────┤
   │ Indexes:         │      │ Indexes:         │
   │ [name], [sku]    │      │ [user_id]        │
   └──────────────────┘      └──────────────────┘
           ▲                          │
           │ (product_id FK)          │ (order_id FK)
           └──────────┬──────────────────┘
                      ▼
             ┌──────────────────┐
             │   order_items    │
             ├──────────────────┤
             │ id (PK)          │
             │ order_id (FK)    │
             │ product_id (FK)  │
             │ quantity         │
             │ price            │
             └──────────────────┘

```

---

## Async Processing with Order Queue

Proses komputasi berat di luar transaksi inti (seperti pengiriman email invoice, penulisan audit trail, dan push notification) dilempar secara asinkron ke antrean **BullMQ** berbasis **Redis Connection** agar respons HTTP ke pengguna tetap instan dan *non-blocking*.

```
Client (POST /orders) ──► Express API Controller (Stock Check & DB Transaction)
                                  │
                                  ├──► Return 201 Created Response (Instan)
                                  │
                                  ▼ (Async Background Job)
                        BullMQ Queue (Redis Broker)
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
    Task Worker A            Task Worker B            Task Worker C
 (Send Email Invoice)     (Write Activity Log)     (Internal Push Notif)

```

### Fitur Ketahanan Antrean

* **Auto-Retry:** Mekanisme pengulangan otomatis menggunakan skema *exponential backoff* jika terjadi gangguan jaringan luar (misal API Mail Server down).
* **Dead Letter Queue (DLQ):** Pekerjaan yang gagal total setelah batas percobaan maksimal akan dipindahkan ke `OrderDeadLetterQueue` untuk keperluan audit dan investigasi manual oleh Administrator.

---

## Testing Suite

Strategi validasi kode menggunakan kombinasi pengujian unit dan integrasi end-to-end via **Jest** dan **Supertest**. Setiap skenario dijalankan secara terisolasi dengan melakukan pembersihan sisa state database (*database teardown*) di setiap akhir sesi pengujian.

### Eksekusi Perintah Pengujian

* **Menjalankan Seluruh Skenario Uji:**
```bash
npm run test

```


* **Menjalankan Pengujian di Berkas Spesifik:**
```bash
npx jest test/order.test.js --runInBand

```


* **Menjalankan dengan Analisis Kebocoran Resource (*Open Handles*):**
```bash
npx jest --runInBand --detectOpenHandles --forceExit

```



---

## Prisma CLI Reference

Gunakan rangkuman komando taktis di bawah ini untuk keperluan manajemen pengembangan skema database lokal Anda:

| Komando | Tujuan Penggunaan |
| --- | --- |
| `npx prisma generate` | Membangun ulang relasi skema artefak ke dalam folder kustom `generated/prisma` |
| `npx prisma migrate dev --create-only -n "nama"` | Merancang draf berkas migrasi SQL baru tanpa langsung mengeksekusinya ke DB |
| `npx prisma migrate dev` | Sinkronisasi perubahan skema terupdate ke database lokal mode development |
| `npx prisma migrate deploy` | Mengeksekusi seluruh antrean berkas migrasi yang tersedia (Aman untuk Production) |
| `npx prisma studio` | Membuka konsol visual database explorer berbasis web di port `5555` |
| `npx prisma db seed` | Menjalankan otomatisasi pengisian data produk dummy awal ke dalam database |

---

## Author

* **Irvan Rifai** - Lead Backend Developer
* **Project Status:** Active Assessment & Production Ready (2026)