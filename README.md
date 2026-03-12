# Employee Management System (EMS)

A comprehensive full-stack Employee Management System MVP built with Node.js, React, and MongoDB.

## Modules

1. **Employee Management** – profiles, documents, skill tracking
2. **Financial Accounting** – chart of accounts, journal entries, invoices, reports
3. **Legal Document Management** – templates, e-signing, audit trails
4. **Security & ID Management** – RFID cards, biometric data, access control
5. **Vehicle Management** – fleet tracking, maintenance, assignments
6. **Medical Records** – health profiles, certificates, incidents
7. **Environmental Safety** – inspections, incidents, compliance
8. **Performance Management** – KPIs, reviews, OKRs, dashboards
9. **Backup & Recovery** – AES-256 encryption, compression, scheduling
10. **Real-time Communication** – Socket.io notifications

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, MongoDB (Mongoose), JWT, Socket.io |
| Frontend | React 18, MUI 5, Redux Toolkit, Axios, Recharts |
| Infrastructure | Docker, Docker Compose |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Copy and configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# Start all services
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2: Local Development

**Prerequisites:** Node.js 18+, MongoDB 6+

```bash
# Backend
cd backend
cp .env.example .env   # edit with your settings
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh tokens |
| `BACKUP_ENCRYPTION_KEY` | 32-byte key for AES-256 backup encryption |
| `CORS_ORIGIN` | Allowed frontend origin (default: http://localhost:3000) |

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Employee Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (pagination, search, filter) |
| GET | `/api/employees/:id` | Get employee details |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Soft delete employee |

### Financial Accounting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/financial/accounts` | Chart of accounts |
| GET/POST | `/api/financial/journal-entries` | Journal entries |
| POST | `/api/financial/journal-entries/:id/post` | Post journal entry |
| GET/POST | `/api/financial/invoices` | Invoices |
| POST | `/api/financial/reports/balance-sheet` | Balance sheet report |
| POST | `/api/financial/reports/income-statement` | Income statement |
| PUT | `/api/financial/lock/:type/:id` | Lock record (SuperAdmin) |
| PUT | `/api/financial/unlock/:type/:id` | Unlock record (SuperAdmin) |

### Legal Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/legal/templates` | Document templates |
| POST | `/api/legal/documents/create-from-template` | Create from template |
| GET/PUT | `/api/legal/documents` | Manage documents |
| POST | `/api/legal/documents/:id/sign` | Sign document |
| GET | `/api/legal/documents/:id/history` | Audit trail |

See additional endpoints for Security, Vehicles, Medical, Environmental, Performance, and Backup in the source code.

## User Roles

| Role | Permissions |
|------|------------|
| `Employee` | Read own data, update own profile |
| `Admin` | Full CRUD on all modules |
| `SuperAdmin` | All Admin permissions + lock/unlock financial and legal records |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers (10 modules)
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose schemas (13 models)
│   ├── routes/          # Express routes (10 modules)
│   ├── uploads/         # File storage
│   ├── backups/         # Backup storage
│   └── server.js        # Express + Socket.io server
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance with interceptors
│   │   ├── components/  # Shared UI components
│   │   ├── layouts/     # Dashboard and Auth layouts
│   │   ├── pages/       # Feature pages (10 modules)
│   │   └── store/       # Redux store and slices
│   ├── Dockerfile       # Multi-stage build (Node → Nginx)
│   └── nginx.conf       # SPA routing + API proxy
├── docker-compose.yml   # Full stack orchestration
└── README.md
```

## Security Features

- JWT authentication with access + refresh tokens
- Role-based access control (RBAC)
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min global, 20 req/15min on auth)
- CORS protection with Helmet.js HTTP headers
- AES-256 backup encryption
- Input validation and sanitization
- Audit trails for all critical operations
- Superuser locking for financial and legal records