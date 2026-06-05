# Backend Serasi Autoraya - Order Product System

## Table of Contents
- [Project Overview](#project-overview)
- [Logic Problem Solving](#logic-problem-solving)
- [Technology & Architecture](#technology--architecture)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Async Processing with Order Queue](#async-processing-with-order-queue)
- [Testing](#testing)

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

1. **Penimbangan 1:** Bagi 6 kelereng menjadi dua kelompok 3-3, sisa 2 kelereng di luar
   - Jika seimbang → kelereng terberat ada di 2 kelereng yang di luar
   - Jika berat sebelah → kelereng terberat ada di kelompok lengan yang turun

2. **Penimbangan 2:** Dari kelompok terbukti berisi kelereng terberat
   - Jika dari 2 kelereng: timbang 1 vs 1 → kelereng yang turun adalah solusi
   - Jika dari 3 kelereng: ambil 2, timbang 1 vs 1, satu sisanya di luar
     - Jika seimbang → kelereng di luar adalah solusi
     - Jika berat sebelah → kelereng yang turun adalah solusi

**Reasoning (Analisis Logika):**
- Menggunakan **ternary decision tree** (3 status: Kiri turun -1, Seimbang 0, Kanan turun 1)
- Kapasitas informasi: $3^k$ di mana $k$ = jumlah penimbangan
- Dengan 2 penimbangan maksimal: $3^2 = 9$ kelereng dapat dideteksi
- Karena $8 \le 9$, maka **pasti bisa diselesaikan dalam 2 penimbangan**

**Complexity:**
- **Time Complexity:** $\mathcal{O}(\log_3 n)$ = $\lceil\log_3 8\rceil = 2$ operasi
- **Space Complexity:** $\mathcal{O}(1)$ (konstan, tidak ada alokasi dinamis)

Lihat detail lengkap: [logic-problem-solving/marble-problem/marble-problem.md](logic-problem-solving/marble-problem/marble-problem.md)

### Section 2: System Design Thinking

**Arsitektur Backend:**
- **Decoupled Architecture / Modular Monolith** berbasis Node.js Express
- Pemisahan komponen berdasarkan **Event-Driven** principles
- Menggunakan **Message Broker (Redis + BullMQ)** untuk async processing

**Komponen Utama:**
1. **API Gateway (Nginx):** Reverse proxy, SSL termination, rate limiting
2. **Core API Service (Node.js Express):** Sinkron traffic (auth, katalog, orders)
3. **Database (PostgreSQL):** Master-Slave replication (Write→Master, Read→Slave)
4. **Message Queue (Redis + BullMQ):** Email, logging, notifikasi async

**Scaling Strategy:**
- **Horizontal Scaling:** Beberapa instance Node.js dalam Docker + Nginx load balancing
- **Database Tuning:** Connection pooling, query optimization
- **Caching:** Redis untuk read-heavy operations (produk, pencarian)
- **Idempotency:** Unique transaction ID + Redis SETNX untuk prevent duplicates

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

- **Service Layer Pattern:** Bisnis logic terpisah dari controller
- **Middleware Pattern:** Auth, error handling, RBAC
- **Transactional Pattern:** Atomic operations pada order creation
- **Idempotency Pattern:** Unique key handling untuk prevent duplicates
- **Soft-Delete Pattern:** Logical deletion via `is_deleted` flag
- **Queue Worker Pattern:** Async job processing dengan retry & DLQ

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
│   │   ├── 20260604125400_create_table_users/
│   │   ├── 20260604125526_create_table_products/
│   │   ├── 20260604125600_create_table_orders/
│   │   ├── 20260604125647_create_table_order_items/
│   │   └── ... (more migrations)
│   └── seed.js                     # Database seeding script
│
├── src/                            # Application source code
│   ├── main.js                     # Application entry point
│   ├── application/                # Core application setup
│   │   ├── database.js             # Prisma client + event logging
│   │   ├── logging.js              # Winston logger configuration
│   │   └── web.js                  # Express app setup
│   ├── controller/                 # HTTP request handlers
│   │   ├── user-controller.js      # User endpoints
│   │   ├── product-controller.js   # Product endpoints
│   │   └── order-controller.js     # Order endpoints
│   ├── service/                    # Business logic layer
│   │   ├── user-service.js         # User business logic
│   │   ├── product-service.js      # Product business logic
│   │   └── order-service.js        # Order business logic
│   ├── middleware/                 # Express middleware
│   │   ├── auth-middleware.js      # JWT authentication
│   │   ├── rbac-middleware.js      # Role-based access control
│   │   └── error-middleware.js     # Error handling
│   ├── validation/                 # Request validation schemas
│   │   ├── validation.js           # Base validation utilities
│   │   ├── user-validation.js      # User input validation
│   │   ├── product-validation.js   # Product input validation
│   │   └── order-validation.js     # Order input validation
│   ├── route/                      # API routing
│   │   ├── api.js                  # Protected API routes
│   │   └── public-api.js           # Public API routes
│   ├── queue/                      # Async job processing
│   │   └── order-queue.js          # Order processing queue
│   └── error/                      # Custom error classes
│       └── response-error.js       # API error response
│
├── test/                           # Test suite
│   ├── test-util.js                # Test utilities & helpers
│   ├── user.test.js                # User API tests
│   ├── product.test.js             # Product API tests
│   └── order.test.js               # Order API tests
│
├── generated/                      # Generated files (do not edit)
│   └── prisma/                     # Prisma client generation
│       ├── client.js
│       ├── schema.prisma
│       └── ... (Prisma artifacts)
│
├── package.json                    # NPM dependencies & scripts
├── .env.example                    # Environment variables template
├── babel.config.json               # Babel configuration
└── README.md                       # This file
```

---

## Installation Guide

### Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **npm** atau **yarn** (biasanya terinstall bersama Node.js)
- **PostgreSQL** v12+ ([postgresql.org](https://www.postgresql.org))
- **Redis** v6+ ([redis.io](https://redis.io)) - untuk async queue processing
- **Git** ([git-scm.com](https://git-scm.com))

### Step 1: Clone Repository

```bash
git clone https://github.com/serasi-autoraya/order-product.git
cd order-product
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi lokal Anda:

```env
# Application
APP_PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/order_product_db"

# JWT Secret
JWT_SECRET_KEY="your-super-secret-key-min-32-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Redis (untuk async queue)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**Konfigurasi Database:**

1. **Create PostgreSQL Database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE order_product_db;"
   ```
   atau via pgAdmin/DBeaver

2. **Create Database User (optional, untuk security):**
   ```bash
   psql -U postgres -c "CREATE USER order_user WITH PASSWORD 'securepassword';"
   psql -U postgres -c "ALTER ROLE order_user WITH CREATEDB;"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE order_product_db TO order_user;"
   ```

**Konfigurasi Redis:**

1. **macOS (via Homebrew):**
   ```bash
   brew install redis
   brew services start redis
   redis-cli ping  # Should return PONG
   ```

2. **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   redis-cli ping
   ```

3. **Docker (if prefer containerized):**
   ```bash
   docker run -d -p 6379:6379 redis:latest
   redis-cli ping
   ```

### Step 3: Install Dependencies

```bash
npm install
```

Ini akan install semua dependencies dari `package.json` termasuk:
- Express.js, Prisma, JWT, bcrypt
- Testing tools (Jest, Supertest)
- Logging (Winston)
- Queue (BullMQ, IORedis)

### Step 4: Setup Database Schema & Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run all migrations to setup database schema
npx prisma migrate deploy

# (Alternative) Run migrations in dev mode with logs
npx prisma migrate dev
```

Ini akan membuat semua tables: `users`, `products`, `orders`, `order_items`, `activity_logs`

### Step 5: Seed Initial Data (Optional)

```bash
npx prisma db seed
```

Ini akan populate database dengan dummy data dari `prisma/seed.js` untuk testing.

---

## Running the Application

### Start Development Server

```bash
node src/main.js
```

Output:
```
App start on port 3000
```

Server berjalan di: **http://localhost:3000**

### Available Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/users/register` | ❌ | - | Register user baru |
| POST | `/api/users/login` | ❌ | - | Login & get JWT token |
| GET | `/api/users/current` | ✅ | - | Get current user profile |
| PATCH | `/api/users/current` | ✅ | - | Update user profile |
| GET | `/api/products` | ❌ | - | Search products (paginated) |
| GET | `/api/products/:id` | ❌ | - | Get product detail |
| POST | `/api/products` | ✅ | MERCHANT | Create product |
| PUT | `/api/products/:id` | ✅ | MERCHANT | Update product |
| DELETE | `/api/products/:id` | ✅ | MERCHANT | Soft-delete product |
| POST | `/api/orders` | ✅ | CUSTOMER | Create order (transactional) |
| GET | `/api/orders` | ✅ | CUSTOMER | Get order history |
| GET | `/api/orders/:id` | ✅ | CUSTOMER | Get order detail |

### Example API Call

**Register User:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "irvan",
    "email": "irvan@example.com",
    "password": "securepass123",
    "name": "Irvan Rifai"
  }'
```

**Login & Get Token:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "irvan",
    "password": "securepass123"
  }'
```

Response akan berisi JWT token yang digunakan untuk authenticated requests.

**Protected Request (dengan JWT):**
```bash
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## Database Management

### Prisma Commands

#### 1. Generate Prisma Client

```bash
npx prisma generate
```

**Fungsi:** Regenerate Prisma Client di folder `generated/prisma/` setelah perubahan schema atau dependencies.

---

#### 2. Create New Migration

```bash
npx prisma migrate dev --create-only -n "descriptive_migration_name"
```

**Fungsi:** Membuat migration file baru di `prisma/migrations/` tanpa langsung menjalankannya. Gunakan untuk:
- Review changes sebelum apply
- Collaborative development (commit migration ke git)
- Manual adjustment jika diperlukan

**Contoh:**
```bash
npx prisma migrate dev --create-only -n "add_phone_to_users"
```

Akan membuat: `prisma/migrations/20260605123456_add_phone_to_users/migration.sql`

---

#### 3. Run/Apply Migrations

```bash
# Apply semua pending migrations (untuk production/deployment)
npx prisma migrate deploy

# Apply migrations + generate Prisma client (untuk development)
npx prisma migrate dev
```

**Fungsi:** 
- `migrate deploy`: Safe untuk production (tidak ada interactive prompts)
- `migrate dev`: Untuk development dengan extra logging & troubleshooting

---

#### 4. Check Migration Status

```bash
npx prisma migrate status
```

**Output Contoh:**
```
Status
3 migrations found in prisma/migrations
Your local migration history and the migrations table from your database are different:

The following migrations have not yet been applied:
  20260605143256_add_phone_to_users

Database: 1 migration
Local: 3 migrations
```

---

#### 5. Reset Database (⚠️ Development Only!)

```bash
npx prisma migrate reset
```

**Fungsi:** Drop database, create ulang, jalankan semua migrations, seed data. ⚠️ **HANYA untuk development/testing!**

**Dialog:**
```
⚠️  Prisma will create your missing database and then perform a reset.

Do you want to continue? [y/N] › y
```

---

#### 6. Prisma Studio (Visual Database Explorer)

```bash
npx prisma studio
```

**Fungsi:** Membuka UI visual di browser (`http://localhost:5555`) untuk browse & edit database records tanpa SQL.

---

#### 7. Database Seeding

```bash
npx prisma db seed
```

**Fungsi:** Jalankan script `prisma/seed.js` untuk populate dummy data. Berguna untuk:
- Setup test data
- Demo environment
- Development environment

**Edit seed script:** `prisma/seed.js`

---

### Common Workflow

**Saat membuat fitur baru:**
```bash
# 1. Update schema.prisma dengan model baru
vim prisma/schema.prisma

# 2. Create migration (review sebelum apply)
npx prisma migrate dev --create-only -n "add_new_feature"

# 3. Review migration.sql file
cat prisma/migrations/20260605123456_add_new_feature/migration.sql

# 4. Apply migration
npx prisma migrate dev

# 5. Start development
node src/main.js
```

---

## API Documentation

Dokumentasi lengkap untuk semua API endpoints tersedia dalam format Markdown:

### User API
📄 **File:** [docs/user.md](docs/user.md)

Endpoints:
- `POST /api/users/register` - Register user baru
- `POST /api/users/login` - Login & dapatkan JWT token
- `GET /api/users/current` - Ambil profil user saat ini
- `PATCH /api/users/current` - Update profil user

### Product API
📄 **File:** [docs/product.md](docs/product.md)

Endpoints:
- `GET /api/products` - Search/list produk (dengan pagination & filter nama)
- `GET /api/products/:id` - Dapatkan detail produk
- `POST /api/products` - Buat produk baru (merchant only)
- `PUT /api/products/:id` - Update produk (merchant only)
- `DELETE /api/products/:id` - Soft-delete produk (merchant only)

### Order API
📄 **File:** [docs/order.md](docs/order.md)

Endpoints:
- `POST /api/orders` - Buat order baru dengan idempotency handling
- `GET /api/orders` - Ambil order history (paginated)
- `GET /api/orders/:id` - Dapatkan detail order

### Postman Collection
📁 **File:** [docs/postman/](docs/postman/)

Import collection ke Postman untuk interactive API testing dengan pre-defined requests & environment variables.

---

## Entity Relationship Diagram

### Database Schema Overview

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
│ Relations: 1→Many [products, orders, activityLogs]          │
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
   │ description?     │      │ admin_fee        │
   │ price            │      │ shipping_fee     │
   │ stock            │      │ payment_method   │
   │ merchant_id (FK) │      │ status (ENUM)    │
   │ created_at       │      │ idempotency_key  │
   │ updated_at       │      │ created_at       │
   │ is_deleted       │      │ updated_at       │
   ├──────────────────┤      ├──────────────────┤
   │ Indexes:         │      │ Indexes:         │
   │ [name], [sku]    │      │ [user_id]        │
   │ [merchant_id]    │      │ Unique:          │
   │                  │      │ [idempotency_key]│
   └──────────────────┘      └──────────────────┘
           ▲                          │
           │ (product_id FK)          │ (order_id FK)
           │                          ▼
           └──────────┬──────────────────┐
                      │   order_items    │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ order_id (FK)    │
                      │ product_id (FK)  │
                      │ quantity         │
                      │ price            │
                      ├──────────────────┤
                      │ Indexes:         │
                      │ [order_id]       │
                      │ [product_id]     │
                      └──────────────────┘

┌──────────────────────────────┐
│    activity_logs             │
├──────────────────────────────┤
│ id (PK)                      │
│ user_id (FK) → users.id      │
│ action                       │
│ details                      │
│ created_at                   │
├──────────────────────────────┤
│ Indexes: [user_id]           │
└──────────────────────────────┘
```

### Key Relationships

| Relation | From | To | Cardinality | Description |
|----------|------|----|----|-------------|
| MerchantProducts | `users` | `products` | 1:N | Satu merchant bisa punya banyak produk |
| CustomerOrders | `users` | `orders` | 1:N | Satu customer bisa punya banyak orders |
| OrderItems | `orders` | `order_items` | 1:N | Satu order punya banyak items |
| ProductItems | `products` | `order_items` | 1:N | Satu produk bisa ada di banyak order items |
| ActivityLogs | `users` | `activity_logs` | 1:N | Satu user punya banyak activity logs |

### Key Features

- **Soft-Delete Pattern:** Produk & user tidak benar-benar dihapus, hanya flag `is_deleted = true`
- **Idempotency:** Order punya unique `idempotency_key` untuk prevent duplicate transactions
- **Order Status:** PENDING → SUCCESS atau FAILED
- **Activity Logging:** Setiap action penting dicatat di `activity_logs` untuk audit trail

---

## Async Processing with Order Queue

Sistem ini menggunakan **BullMQ** + **Redis** untuk memproses task asinkronus yang tidak perlu langsung diresponse ke client.

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Request (Client)                        │
│              POST /api/orders (Create Order)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Order Controller (Sinkron)                         │
│  - Validate input (Joi)                                         │
│  - Check JWT auth                                               │
│  - Validate stock                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          Order Service (Transactional)                          │
│  1. Start Prisma transaction                                    │
│  2. Check idempotency_key                                       │
│  3. Validate & decrement stock                                  │
│  4. Create order + order_items                                  │
│  5. Commit transaction                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│       Return Order Response to Client (201)                     │
│       ✓ Order created successfully                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (Non-blocking, async)
┌─────────────────────────────────────────────────────────────────┐
│        Push Job to OrderProcessingQueue (Redis)                │
│  {                                                              │
│    orderId: 123,                                               │
│    customerEmail: "irvan@example.com",                         │
│    totalPrice: 45000,                                          │
│    userId: 10                                                  │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────┴─────────────────────┬──────────────────┐
                    │                          │                  │
                    ▼                          ▼                  ▼
        ┌─────────────────────┐    ┌────────────────────┐  ┌──────────────┐
        │  Worker Process 1   │    │  Worker Process 2  │  │ ... Worker N │
        │  (BullMQ Worker)    │    │  (BullMQ Worker)   │  │              │
        └─────────────────────┘    └────────────────────┘  └──────────────┘
                    │
        ┌───────────┼──────────────┐
        │           │              │
        ▼           ▼              ▼
    ┌────────┐  ┌───────────┐  ┌────────────────┐
    │Send    │  │Save       │  │Send Internal   │
    │Email   │  │Activity   │  │Notification   │
    │Invoice │  │Log        │  │(Push notif)   │
    └────────┘  └───────────┘  └────────────────┘
        │           │              │
        └───────────┴──────────────┘
                    │
                    ▼
        ┌─────────────────────────────┐
        │    Job Completed (Success)  │
        │   ✓ Email dikirim           │
        │   ✓ Log tersimpan           │
        │   ✓ Notifikasi terkirim     │
        └─────────────────────────────┘

                OR (jika gagal)

        ┌──────────────────────────────┐
        │   Job Failed (Error)         │
        │   ❌ Retry attempt: 1/3      │
        └──────────┬───────────────────┘
                   │
        ┌──────────┴──────────────────┐
        │ Berhasil pada retry?        │
        │    YES  │         NO        │
        ├─────────┴──────────┬────────┤
        ▼                    ▼        │
    [SUCCESS]          [Retry 2/3]   │
    ✓ Job done          │             │
                        │             │
                        ▼             │
                    [FAILED again]    │
                     Retry 3/3        │
                        │             │
                        ├─ Berhasil?  │
                        │   YES: ✓    │
                        │   NO: ❌    │
                        ▼             │
                   ┌────────────────┐ │
                   │  DLQ Trigger   │ │
                   │ (Dead Letter)  │ │
                   │ Admin review   │ │
                   └────────────────┘ │
                                      │
                   Max retries exceeded
```

### Implementation Details

**File:** [src/queue/order-queue.js](src/queue/order-queue.js)

#### 1. Queue Setup

```javascript
// Main processing queue
export const orderQueue = new Queue("OrderProcessingQueue", {
  connection: redisConnection
});

// Dead Letter Queue (untuk job yang gagal total)
export const deadLetterQueue = new Queue("OrderDeadLetterQueue", {
  connection: redisConnection
});
```

#### 2. Worker Process

```javascript
const orderWorker = new Worker(
  "OrderProcessingQueue",
  async (job) => {
    const { orderId, customerEmail, totalPrice, userId } = job.data;

    // Task A: Kirim email invoice
    console.log(`[Async] Mengirim invoice ke ${customerEmail}`);
    // await sendEmail(...);

    // Task B: Simpan activity log ke DB
    console.log(`[Async] Menyimpan activity log untuk user ${userId}`);
    await prismaClient.activityLog.create({
      data: {
        user_id: userId,
        action: "CREATE_ORDER",
        details: `Order #${orderId} sebesar Rp${totalPrice}`,
        created_at: new Date()
      }
    });

    // Task C: Notifikasi internal
    console.log(`[Async] Push notification untuk order #${orderId}`);
    // await sendPushNotification(...);
  },
  { connection: redisConnection }
);
```

#### 3. Retry & Dead Letter Handling

```javascript
orderWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Max retry exceeded → Move to DLQ
    console.error(`[DLQ] Job ${job.id} gagal total.`);
    
    await deadLetterQueue.add("failedOrderReport", {
      originalJobId: job.id,
      errorReason: err.message,
      failedData: job.data,
      failedAt: new Date()
    });
  } else {
    // Retry otomatis
    console.warn(`[Retry] Job ${job.id} percobaan ke-${job.attemptsMade}`);
  }
});
```

#### 4. Adding Job to Queue (dari Order Controller/Service)

```javascript
// Dalam order-controller.js atau order-service.js
import { orderQueue } from "../queue/order-queue.js";

// Setelah order berhasil dibuat:
await orderQueue.add("processOrder", {
  orderId: createdOrder.id,
  customerEmail: user.email,
  totalPrice: createdOrder.total_price,
  userId: user.id
}, {
  attempts: 3,           // Max 3 retry attempts
  backoff: {
    type: "exponential",
    delay: 2000          // Start with 2s delay
  },
  removeOnComplete: true  // Auto-clean completed jobs
});
```

### Benefits

✅ **Non-blocking:** Client menerima response langsung, proses berjalan di background
✅ **Resilient:** Auto-retry dengan exponential backoff
✅ **Dead Letter Queue:** Visibility ke failed jobs untuk admin monitoring
✅ **Scalable:** Multiple workers dapat memproses jobs secara parallel
✅ **Durability:** Redis persist queue, jobs survive application restart

### Redis Commands untuk Monitoring

```bash
# Connect ke Redis CLI
redis-cli

# Monitor queue status
KEYS "bull:OrderProcessingQueue:*"

# Check queue size
LLEN bull:OrderProcessingQueue:wait

# Check failed jobs
LLEN bull:OrderProcessingQueue:failed

# Flush all queues (⚠️ be careful!)
FLUSHDB
```

---

## Testing

### Testing Strategy

Strategi testing project ini menggunakan **Jest** + **Supertest** dengan focus pada:

| Aspek | Fokus | Tool |
|-------|-------|------|
| Unit Testing | Business logic (validation, calculation) | Jest |
| Integration Testing | API endpoints + Database | Jest + Supertest |
| Test Isolation | Setiap test case independent, cleanup DB | Test utilities |
| Transaction Testing | Order creation dengan stock validation | Jest + Prisma transaction |

### Test Files Structure

```
test/
├── test-util.js        # Shared utilities & helpers
│   ├── createTestUser()
│   ├── loginUser()
│   ├── createTestProduct()
│   └── cleanup functions
│
├── user.test.js        # User registration, login, profile
├── product.test.js     # Product CRUD operations
└── order.test.js       # Order creation, history, transactions
```

### Running Tests

#### Run All Tests
```bash
npm run test
```

**Equivalent to:**
```bash
jest -i --runInBand --forceExit
```

**Flags:**
- `-i` / `--runInBand`: Run tests sequentially (lebih stabil untuk DB)
- `--runInBand`: Alias untuk `-i`
- `--forceExit`: Force Jest exit setelah tests selesai (handle open handles)

---

#### Run Specific Test File
```bash
npx jest test/user.test.js --runInBand
```

---

#### Run Tests with Verbose Output
```bash
npx jest --runInBand --verbose --colors
```

Output akan menampilkan:
- Setiap test case execution
- Pass/fail status
- Execution time per test

---

#### Run Tests & Detect Open Handles
```bash
npx jest --runInBand --detectOpenHandles --forceExit
```

**Berguna untuk:** Debugging resource leaks atau database connection yang tidak ditutup.

---

### Test Examples

#### User Registration Test
```javascript
// test/user.test.js
test("should register a new user", async () => {
  const response = await request(web)
    .post("/api/users/register")
    .send({
      username: "testuser",
      email: "test@example.com",
      password: "testpass123",
      name: "Test User"
    });

  expect(response.status).toBe(201);
  expect(response.body.data.username).toBe("testuser");
  expect(response.body.data.email).toBe("test@example.com");
});
```

#### Protected Endpoint Test
```javascript
test("should get current user with JWT token", async () => {
  const user = await createTestUser();
  const token = await loginUser(user.username, "password123");

  const response = await request(web)
    .get("/api/users/current")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.data.username).toBe(user.username);
});
```

#### Order Transaction Test
```javascript
test("should create order with stock validation", async () => {
  const user = await createTestUser({ role: "CUSTOMER" });
  const token = await loginUser(user.username, "password123");
  
  const product = await createTestProduct({
    stock: 5,
    price: 10000
  });

  const response = await request(web)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .set("x-idempotency-key", "unique-key-123")
    .send({
      payment_method: "QRIS",
      items: [
        { product_id: product.id, quantity: 3 }
      ]
    });

  expect(response.status).toBe(201);
  expect(response.body.data.total_price).toBe(30000);
  expect(response.body.data.items[0].quantity).toBe(3);
});
```

### Test Utilities

File: [test/test-util.js](test/test-util.js)

```javascript
// Create test user
const user = await createTestUser(overrides);
// → returns: { id, username, email, password, role, ... }

// Login & get JWT token
const token = await loginUser(username, password);
// → returns: JWT token string

// Create test product
const product = await createTestProduct(overrides);
// → returns: { id, sku, name, price, stock, ... }

// Cleanup functions
await cleanupUsers();
await cleanupProducts();
await cleanupOrders();
await disconnectDatabase();
```

### Debugging Failed Tests

#### 1. Run Single Test Case
```bash
npx jest test/user.test.js --testNamePattern="should register" --runInBand --verbose
```

---

#### 2. Enable Debug Output
```bash
DEBUG=* npm run test
```

---

#### 3. Check Database State
Buka Prisma Studio saat test sedang berjalan:
```bash
npx prisma studio
```

---

#### 4. Inspect Error Details
```bash
npm run test 2>&1 | tee test-output.log
```

Menyimpan output ke `test-output.log` untuk analisis lebih detail.

---

### CI/CD Integration

Untuk integration dengan CI/CD pipeline (GitHub Actions, GitLab CI, etc):

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: order_product_db
          POSTGRES_PASSWORD: password
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma migrate deploy
      - run: npm run test
```

---

## Additional Resources

### Documentation
- 📖 [Prisma Docs](https://www.prisma.io/docs/)
- 📖 [Express.js Docs](https://expressjs.com/)
- 📖 [JWT.io](https://jwt.io/)
- 📖 [Jest Docs](https://jestjs.io/)
- 📖 [BullMQ Docs](https://docs.bullmq.io/)

### Problem Solving
- 🧩 [Marble Problem](logic-problem-solving/marble-problem/marble-problem.md)
- 🏗️ [System Design Thinking](logic-problem-solving/system-design-thinking/system-design.md)

### API Specifications
- 👤 [User API](docs/user.md)
- 📦 [Product API](docs/product.md)
- 🛒 [Order API](docs/order.md)
- 📮 [Postman Collection](docs/postman/)

---

## Troubleshooting

### Database Connection Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL status
psql -U postgres -c "SELECT version();"

# If PostgreSQL not running:
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

---

### Redis Connection Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Check Redis status
redis-cli ping

# If Redis not running:
brew services start redis    # macOS
sudo systemctl start redis-server # Linux
docker run -d -p 6379:6379 redis:latest # Docker
```

---

### Migration Conflicts

**Error:** `Prisma migration conflict detected`

**Solution:**
```bash
# Reset development database (⚠️ local only!)
npx prisma migrate reset

# Or manually resolve conflict:
npx prisma migrate resolve --rolled-back <migration_name>
```

---

### Test Hanging Issues

**Symptom:** Tests tidak selesai, process terus running

**Solution:**
```bash
# Ensure database disconnect in test teardown
afterAll(async () => {
  await prismaClient.$disconnect();
});

# Run with forceExit
npm run test -- --forceExit
```

---

## License

ISC

---

## Author

- **Irvan Rifai** - Backend Development

---

## Kontribusi

Contributions welcome! Silakan buat pull request atau report issues.

---

**Last Updated:** 2026-06-05
**Project Status:** Active Development
