# Product Requirements Document (PRD)
**Project:** MERN Stack (Express + MongoDB + React) with JWT auth, RBAC, and Product CRUD
**Backend:** `backend/` (Express + Mongoose)
**Frontend:** `frontend/` (React + React Router + Axios)
**Document Purpose:** Describe the product behavior, functional requirements, and full end-to-end request flow (routes -> middleware/controllers -> API behavior -> UI usage), plus endpoint-driven test cases.

---

## 1. Overview
This application provides:
- User registration and login using JWT authentication.
- Role-based access control:
  - `user` role: can view products (authenticated)
  - `admin` role: can add, update, and delete products
- CRUD operations for a `Product` entity via REST APIs.
- A React UI for registering/logging in and performing Product CRUD in a protected dashboard.

---

## 2. Goals
1. Allow users to register and obtain a JWT token.
2. Allow users to log in with email/password and obtain a JWT token.
3. Protect Product APIs so only authenticated requests can access them.
4. Restrict Product write operations (create/update/delete) to `admin` users only.
5. Provide a simple frontend UI for:
   - Registering users
   - Logging in users
   - Viewing products in a protected dashboard
   - Admin-only CRUD actions for products

---

## 3. Non-Goals (Current Scope)
- No refresh-token mechanism.
- No password reset or email verification.
- No pagination, filtering, or search for products.
- No centralized error response wrapper beyond per-route implementations.
- No centralized logging/observability layer.

---

## 4. Actors
- **Public user:** Can access `/register` and `/login` UI and call auth APIs.
- **Authenticated user (`user` role):** Can access dashboard and view product list.
- **Authenticated admin (`admin` role):** Can access dashboard and manage products (add/edit/delete).

---

## 5. High-Level Architecture

### 5.1 Backend
- Express server entry: `backend/server.js`
- MongoDB connection: `backend/config/db.js`
- Routes:
  - `backend/routes/auth.js` mounted at `/api/v1/auth`
  - `backend/routes/products.js` mounted at `/api/v1/products`
- Middleware:
  - JWT auth + RBAC: `backend/middleware/auth.js`
- Data models:
  - `backend/models/User.js`
  - `backend/models/Product.js`

### 5.2 Frontend
- React router config: `frontend/src/App.jsx`
- Protected route component: `frontend/src/components/PrivateRoute.jsx`
- Auth UI:
  - `frontend/src/components/Register.jsx`
  - `frontend/src/components/Login.jsx`
- Product UI:
  - `frontend/src/components/Dashboard.jsx`
  - `frontend/src/components/ProductForm.jsx`

---

## 6. Configuration and Runtime Dependencies

### 6.1 Backend Environment Variables
The backend expects:
- `PORT` (optional): server port, default `5000`
- `MONGO_URI`: MongoDB connection string (required)
- `JWT_SECRET`: secret used for signing/verifying JWT (required)

### 6.2 CORS and JSON
- CORS enabled globally.
- `express.json()` enabled for JSON request bodies.

---

## 7. End-to-End User Flows

### 7.1 Registration Flow
1. UI page: `/register`
2. User fills: `name`, `email`, `password`, `role`
3. UI calls:
   - `POST http://localhost:5000/api/v1/auth/register`
4. Backend:
   - Validates using `express-validator`
   - Hashes password with `bcryptjs`
   - Creates `User` in MongoDB
   - Signs JWT containing `user.id` and `user.role`
5. Returns:
   - `{ "token": "<jwt>" }`
6. UI stores token in `localStorage` as `token`
7. UI navigates to `/dashboard`

### 7.2 Login Flow
1. UI page: `/login`
2. User fills: `email`, `password`
3. UI calls:
   - `POST http://localhost:5000/api/v1/auth/login`
4. Backend:
   - Validates request body
   - Finds user by email
   - Compares password with bcrypt
   - Signs JWT containing `user.id` and `user.role`
5. Returns:
   - `{ "token": "<jwt>" }`
6. UI stores token and navigates to `/dashboard`

### 7.3 Dashboard Access and Product Viewing
1. UI route: `/dashboard` guarded by `PrivateRoute`
2. `PrivateRoute`:
   - If `localStorage.token` exists: allows
   - Else: redirects to `/login`
3. Dashboard calls:
   - `GET http://localhost:5000/api/v1/products`
   - Header: `x-auth-token: <token>`
4. Backend validates JWT and returns product list.

### 7.4 Admin Product Management (Create/Update/Delete)
1. Dashboard shows admin-only controls when decoded JWT role is `admin`.
2. Admin actions call:
   - `POST /api/v1/products`
   - `PUT /api/v1/products/:id`
   - `DELETE /api/v1/products/:id`
3. Backend enforces RBAC using `authorize('admin')`.

---

## 8. Functional Requirements

### 8.1 Authentication APIs
- **`POST /api/v1/auth/register`**
  - Validate request body
  - Hash password
  - Store user
  - Return JWT
- **`POST /api/v1/auth/login`**
  - Validate request body
  - Authenticate user
  - Return JWT

### 8.2 Authorization (RBAC)
- `auth` middleware:
  - reads `x-auth-token`, verifies JWT, sets `req.user`
- `authorize(...roles)` middleware:
  - checks `req.user.role` is allowed else returns `403`

### 8.3 Product APIs
- `GET /api/v1/products` for authenticated users
- `POST /api/v1/products` admin only
- `PUT /api/v1/products/:id` admin only
- `DELETE /api/v1/products/:id` admin only

---

## 9. API Endpoint Specification (Backend)

### 9.1 Base URL
- `http://localhost:5000/api/v1`

### 9.2 Common Security Header
For authenticated endpoints:
- Header: `x-auth-token: <jwt>`

### 9.3 Error Response Conventions (as implemented)
- Missing token: `401` `{ "msg": "No token, authorization denied" }`
- Invalid token: `401` `{ "msg": "Token is not valid" }`
- Unauthorized role: `403` `{ "msg": "User role <role> is not authorized to access this route" }`
- Validation errors: `400` `{ "errors": [ ... ] }`
- Product not found: `404` `{ "msg": "Product not found" }`
- Server errors: `500` with `"Server Error"` or `"Server error"` depending on route

---

### 9.4 Auth Endpoints

#### POST `/auth/register`
**Path:** `/api/v1/auth/register`
**Auth:** Public

- **Request body**
  - `name` (string, required, non-empty)
  - `email` (string, required, valid email)
  - `password` (string, required, min length 6)
  - `role` (string, optional; model enum `user|admin`, default `user`)

- **Success Response**
  - `200 OK`
  - `{ "token": "<jwt>" }`

- **Validation Failure**
  - `400 Bad Request`
  - `{ "errors": [ ... ] }`

- **Duplicate Email**
  - `400 Bad Request`
  - `{ "msg": "User already exists" }`

- **JWT Payload**
  - Signed payload includes: `user.id`, `user.role`

#### POST `/auth/login`
**Path:** `/api/v1/auth/login`
**Auth:** Public

- **Request body**
  - `email` (string, required, valid email)
  - `password` (string, required, exists)

- **Success Response**
  - `200 OK`
  - `{ "token": "<jwt>" }`

- **Invalid Credentials**
  - `400 Bad Request`
  - `{ "msg": "Invalid Credentials" }`

- **Validation Failure**
  - `400 Bad Request`
  - `{ "errors": [ ... ] }`

---

### 9.5 Product Endpoints

#### GET `/products`
**Path:** `/api/v1/products`
**Auth:** Required

- **Request headers**
  - `x-auth-token: <jwt>`

- **Success Response**
  - `200 OK`
  - Body: array of Product documents

#### POST `/products`
**Path:** `/api/v1/products`
**Auth:** Required
**RBAC:** Admin only

- **Request body**
  - `name` (required)
  - `description` (required)
  - `price` (required, numeric)

- **Success Response**
  - `200 OK`
  - Body: created Product document

- **Validation Failure**
  - `400 Bad Request`
  - `{ "errors": [ ... ] }`

- **Unauthorized Role**
  - `403 Forbidden`
  - `{ "msg": "User role <role> is not authorized to access this route" }`

#### PUT `/products/:id`
**Path:** `/api/v1/products/:id`
**Auth:** Required
**RBAC:** Admin only

- **Params**
  - `id` (Mongo ObjectId)

- **Request body**
  - partial updates: `name`, `description`, `price` (truthy checks)

- **Success Response**
  - `200 OK`
  - Body: updated Product document

- **Not Found**
  - `404 Not Found`
  - `{ "msg": "Product not found" }`

#### DELETE `/products/:id`
**Path:** `/api/v1/products/:id`
**Auth:** Required
**RBAC:** Admin only

- **Params**
  - `id` (Mongo ObjectId)

- **Success Response**
  - `200 OK`
  - `{ "msg": "Product removed" }`

- **Not Found**
  - `404 Not Found`
  - `{ "msg": "Product not found" }`

---

## 10. Middleware Specification

### 10.1 `auth` Middleware
- Reads token from header `x-auth-token`
- Missing => `401` `{ "msg": "No token, authorization denied" }`
- Invalid => `401` `{ "msg": "Token is not valid" }`
- On success:
  - `req.user = decoded.user`
  - `next()`

### 10.2 `authorize(...roles)` Middleware
- If `req.user.role` not in roles => `403`
- Else => `next()`

---

## 11. Data Model Specification

### 11.1 User
Fields:
- `name` (required string)
- `email` (required unique string)
- `password` (required string; bcrypt hash stored)
- `role` (enum: `user|admin`, default `user`)
- `createdAt` (date, default now)

### 11.2 Product
Fields:
- `name` (required string)
- `description` (required string)
- `price` (required number)
- `createdAt` (date, default now)

---

## 12. Frontend Specification

### 12.1 Client Routes
- `/register` => Register
- `/login` => Login
- `/dashboard` => PrivateRoute(Dashboard)
- `/` => Login

### 12.2 PrivateRoute
- If token exists: allow; else redirect to `/login`
- Does not validate expiry/signature client-side.

### 12.3 Frontend API Usage
- Register/Login store token in `localStorage`
- Dashboard:
  - decodes role from token
  - fetches products using `x-auth-token`
  - shows admin controls only for role `admin`

---

## 13. Test Cases (API Endpoint-Driven)

**Notes**
- **Base URL**: `http://localhost:5000/api/v1`
- **Auth header** (protected endpoints): `x-auth-token: <jwt>`
- **Roles**:
  - `user`: can only **GET** products
  - `admin`: can **GET/POST/PUT/DELETE** products
- **Validation errors**: `{ "errors": [ ... ] }`
- **Auth/RBAC errors**: `{ "msg": "..." }`

---

### 13.1 Authentication Endpoints

#### AUTH-REG-001 - Register (success, user)
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Request body**: valid `name`, `email`, `password (>=6)`, `role="user"`
- **Expected**:
  - Status `200`
  - Body: `{ "token": "<jwt>" }`

#### AUTH-REG-002 - Register (success, admin)
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Request body**: valid fields with `role="admin"`
- **Expected**:
  - Status `200`
  - Returned token decodes to `user.role = "admin"`

#### AUTH-REG-003 - Register fails: missing name
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "errors": [ ... ] }`

#### AUTH-REG-004 - Register fails: invalid email
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "errors": [ ... ] }`

#### AUTH-REG-005 - Register fails: short password
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "errors": [ ... ] }`

#### AUTH-REG-006 - Register fails: duplicate email
- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Precondition**: user already exists with same email
- **Expected**:
  - Status `400`
  - `{ "msg": "User already exists" }`

#### AUTH-LOG-001 - Login (success)
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Expected**:
  - Status `200`
  - `{ "token": "<jwt>" }`

#### AUTH-LOG-002 - Login fails: unknown email
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "msg": "Invalid Credentials" }`

#### AUTH-LOG-003 - Login fails: wrong password
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "msg": "Invalid Credentials" }`

#### AUTH-LOG-004 - Login fails: invalid email format
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Expected**:
  - Status `400`
  - `{ "errors": [ ... ] }`

---

### 13.2 Product Endpoints (Auth + RBAC)

#### PROD-AUTH-001 - Protected endpoints reject missing token
- **Endpoints**:
  - `GET /products`
  - `POST /products`
  - `PUT /products/:id`
  - `DELETE /products/:id`
- **Expected**:
  - Status `401`
  - `{ "msg": "No token, authorization denied" }`

#### PROD-AUTH-002 - Protected endpoints reject invalid token
- **Endpoints**: same as above
- **Expected**:
  - Status `401`
  - `{ "msg": "Token is not valid" }`

#### PROD-GET-001 - Get products (success, user)
- **Endpoint**: `GET /products`
- **Role**: user
- **Expected**:
  - Status `200`
  - Body is an array

#### PROD-GET-002 - Get products (success, admin)
- **Endpoint**: `GET /products`
- **Role**: admin
- **Expected**:
  - Status `200`
  - Body is an array

#### PROD-CREATE-001 - Create product (success, admin)
- **Endpoint**: `POST /products`
- **Role**: admin
- **Expected**:
  - Status `200`
  - Body includes created product with `_id`

#### PROD-CREATE-002 - Create product fails: non-admin
- **Endpoint**: `POST /products`
- **Role**: user
- **Expected**:
  - Status `403`
  - `{ "msg": "User role user is not authorized to access this route" }`

#### PROD-CREATE-003 - Create product fails: validation
- **Endpoint**: `POST /products`
- **Role**: admin
- **Expected**:
  - Status `400`
  - `{ "errors": [ ... ] }`

#### PROD-UPD-001 - Update product (success, admin)
- **Endpoint**: `PUT /products/:id`
- **Role**: admin
- **Precondition**: product exists
- **Expected**:
  - Status `200`
  - Body is updated product

#### PROD-UPD-002 - Update product fails: not found
- **Endpoint**: `PUT /products/:id`
- **Role**: admin
- **Expected**:
  - Status `404`
  - `{ "msg": "Product not found" }`

#### PROD-UPD-003 - Update product fails: non-admin
- **Endpoint**: `PUT /products/:id`
- **Role**: user
- **Expected**:
  - Status `403`

#### PROD-UPD-004 - Update product edge: `price=0` is ignored (current behavior)
- **Endpoint**: `PUT /products/:id`
- **Role**: admin
- **Request body**: sets `price` to 0
- **Expected (current implementation)**:
  - Status `200`
  - price remains unchanged due to truthy check

#### PROD-DEL-001 - Delete product (success, admin)
- **Endpoint**: `DELETE /products/:id`
- **Role**: admin
- **Precondition**: product exists
- **Expected**:
  - Status `200`
  - `{ "msg": "Product removed" }`

#### PROD-DEL-002 - Delete product fails: not found
- **Endpoint**: `DELETE /products/:id`
- **Role**: admin
- **Expected**:
  - Status `404`
  - `{ "msg": "Product not found" }`

#### PROD-DEL-003 - Delete product fails: non-admin
- **Endpoint**: `DELETE /products/:id`
- **Role**: user
- **Expected**:
  - Status `403`

---

### 13.3 Frontend (UI) Test Cases (Route-Level)

#### UI-PRIV-001 - Protected dashboard requires token
- **Route**: `/dashboard` (client-side)
- **Precondition**: `localStorage.token` missing
- **Expected**: redirected to `/login`

#### UI-REG-001 - Register success navigates to dashboard
- **Route**: `/register`
- **Expected**:
  - Token stored in `localStorage`
  - Navigation to `/dashboard`

#### UI-LOG-001 - Login success navigates to dashboard
- **Route**: `/login`
- **Expected**:
  - Token stored in `localStorage`
  - Navigation to `/dashboard`

#### UI-ROLE-001 - Admin controls visible only for admin
- **Route**: `/dashboard`
- **Expected**:
  - admin token => Add/Edit/Delete visible
  - user token => Add/Edit/Delete hidden

#### UI-ERR-001 - API errors logged (current behavior)
- **Routes**: `/login`, `/register`, `/dashboard`
- **Expected**:
  - API failures are logged to console
  - No guaranteed UI error message rendering
