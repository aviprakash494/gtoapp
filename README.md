# GlobeTrek Overseas — Student Application & Payment Management API

A backend REST API for GlobeTrek Overseas that lets students register, apply to universities, and pay application fees via Stripe.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Architecture Decisions](#architecture-decisions)
- [Postman Collection](#postman-collection)

---

## Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Runtime         | Node.js 24                    |
| Language        | TypeScript 5.9                |
| Framework       | Express 5                     |
| Database        | MongoDB + Mongoose ODM        |
| Auth            | JWT (jsonwebtoken) + bcryptjs |
| Payments        | Stripe                        |
| Validation      | express-validator             |
| Logging         | Pino                          |
| Build           | esbuild (ESM bundle)          |
| Package Manager | pnpm workspaces               |

---

## Project Structure

```
.
├── artifacts/
│   └── api-server/
│       └── src/
│           ├── models/          # Mongoose schemas (User, University, Application, Payment)
│           ├── routes/          # Route handlers (auth, universities, applications, payments)
│           ├── middlewares/     # JWT auth middleware, validation error handler
│           └── lib/
│               └── db.ts        # MongoDB connection
├── lib/
│   └── api-spec/
│       └── openapi.yaml         # OpenAPI spec
├── GlobeTrek_API.postman_collection.json
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- A MongoDB Atlas account (or local MongoDB instance)
- A Stripe account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd globetrek-overseas

# Install dependencies
pnpm install

# Copy the sample environment file and fill in your values
cp .env.example .env
```

### Running the API

```bash
# Development (API runs on port 8080, proxied at /api)
pnpm --filter @workspace/api-server run dev

# Type checking across all packages
pnpm run typecheck
```

---

## Environment Variables

Create a `.env` file at the root based on `.env.example`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/globetrek
JWT_SECRET=your_long_random_secret_here
STRIPE_SECRET_KEY=sk_test_...
```

| Variable            | Description                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `MONGODB_URI`       | MongoDB Atlas connection string (`mongodb+srv://` format required; URL-encode credentials) |
| `JWT_SECRET`        | Long random string used to sign JWTs                                                       |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` for test, `sk_live_…` for production)                       |

---

## API Reference

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

### Authentication

#### `POST /api/auth/register`

Register a new student account.

**Request body:**

```json
{
  "name": "Avi Prakash",
  "email": "avi@example.com",
  "password": "securepassword"
}
```

**Response `201`:**

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Avi Prakash", "email": "avi@example.com" }
}
```

---

#### `POST /api/auth/login`

Login and receive a JWT.

**Request body:**

```json
{
  "email": "avi@example.com",
  "password": "securepassword"
}
```

**Response `200`:**

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Avi Prakash", "email": "avi@example.com" }
}
```

---

#### `GET /api/auth/profile` 🔒

Get the authenticated student's profile.

**Response `200`:**

```json
{
  "id": "...",
  "name": "Avi Prakash",
  "email": "avi@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Universities

#### `GET /api/universities`

List all universities. Public — no auth required.

**Response `200`:**

```json
[
  {
    "id": "...",
    "name": "University of Toronto",
    "country": "Canada",
    "course": "Computer Science",
    "applicationFee": 150
  }
]
```

---

#### `POST /api/universities` 🔒

Add a new university.

**Request body:**

```json
{
  "name": "University of Toronto",
  "country": "Canada",
  "course": "Computer Science",
  "applicationFee": 150
}
```

**Response `201`:** The created university object.

---

#### `PUT /api/universities/:id` 🔒

Update an existing university by ID.

**Request body:** Any subset of the university fields.

**Response `200`:** The updated university object.

---

#### `DELETE /api/universities/:id` 🔒

Delete a university by ID.

**Response `200`:**

```json
{ "message": "University deleted successfully" }
```

---

### Applications

#### `POST /api/applications` 🔒

Submit an application to a university. Duplicate applications (same student + university) are rejected with `HTTP 409`.

**Request body:**

```json
{
  "universityId": "<university_id>"
}
```

**Response `201`:**

```json
{
  "id": "...",
  "student": "<student_id>",
  "university": "<university_id>",
  "status": "pending",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### `GET /api/applications` 🔒

List all applications submitted by the authenticated student.

**Response `200`:** Array of application objects with populated university details.

---

#### `GET /api/applications/:id` 🔒

Retrieve a single application by ID.

**Response `200`:** Application object with populated university details.

---

### Payments

#### `POST /api/payments/create-order` 🔒

Create a Stripe PaymentIntent for an application. The amount is derived from the university's `applicationFee` (USD → cents).

**Request body:**

```json
{
  "applicationId": "<application_id>"
}
```

**Response `201`:**

```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_...",
  "amount": 15000,
  "currency": "usd"
}
```

Use `clientSecret` on the frontend to confirm the payment with Stripe.js.

---

#### `POST /api/payments/verify` 🔒

Verify a completed Stripe payment and mark the application as paid.

**Request body:**

```json
{
  "paymentIntentId": "pi_..."
}
```

**Response `200`:**

```json
{
  "message": "Payment verified successfully",
  "application": { "id": "...", "status": "paid" }
}
```

---

#### `GET /api/payments/history` 🔒

Get all payment records for the authenticated student.

**Response `200`:** Array of payment records with populated application and university details.

---

### Endpoint Summary

| Method | Path                         | Auth | Description                  |
| ------ | ---------------------------- | ---- | ---------------------------- |
| POST   | `/api/auth/register`         | No   | Register student             |
| POST   | `/api/auth/login`            | No   | Login, receive JWT           |
| GET    | `/api/auth/profile`          | Yes  | Get own profile              |
| GET    | `/api/universities`          | No   | List universities            |
| POST   | `/api/universities`          | Yes  | Create university            |
| PUT    | `/api/universities/:id`      | Yes  | Update university            |
| DELETE | `/api/universities/:id`      | Yes  | Delete university            |
| POST   | `/api/applications`          | Yes  | Submit application           |
| GET    | `/api/applications`          | Yes  | List own applications        |
| GET    | `/api/applications/:id`      | Yes  | Get one application          |
| POST   | `/api/payments/create-order` | Yes  | Create Stripe PaymentIntent  |
| POST   | `/api/payments/verify`       | Yes  | Verify payment, mark as paid |
| GET    | `/api/payments/history`      | Yes  | Payment history              |

---

## Authentication

JWT tokens are issued on registration and login, and expire after **7 days**. Store the token client-side and include it in the `Authorization` header as a Bearer token for all protected routes.

Passwords are hashed with **bcrypt (10 salt rounds)** via a Mongoose pre-save hook and are never returned in any API response.

---

## Architecture Decisions

**MongoDB over PostgreSQL** — chosen per project requirements; Mongoose provides schema enforcement and easy document population for nested university/application/payment data.

**JWT stateless auth** — tokens expire in 7 days; no refresh token flow in v1 (stateless by design for simplicity).

**Stripe PaymentIntent flow** — the server creates a PaymentIntent and returns a `clientSecret` → the client confirms payment using Stripe.js → the client calls `/payments/verify` with the `paymentIntentId` → the server fetches the final status from Stripe and marks the application as paid. This keeps card data off the server entirely.

**express-validator** — all inputs are validated at the route layer before any database interaction, keeping controllers clean.

---

## Postman Collection

Import `GlobeTrek_API.postman_collection.json` into Postman. Set the following collection variables before running:

| Variable   | Value                                        |
| ---------- | -------------------------------------------- |
| `base_url` | `http://localhost:8080/api`                  |
| `token`    | Populated automatically after login/register |

Run the requests in order: Register → Login → Universities → Applications → Payments.

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| `400`  | Validation error / bad request                    |
| `401`  | Missing or invalid JWT                            |
| `404`  | Resource not found                                |
| `409`  | Duplicate application (same student + university) |
| `500`  | Internal server error                             |
