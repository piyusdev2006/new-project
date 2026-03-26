# MERN Stack Project

This project is a full-stack MERN (MongoDB, Express, React, Node.js) application with a simple frontend UI for testing the APIs. It includes user registration and login with JWT authentication, role-based access control (user vs admin), and CRUD APIs for a `Product` entity.

## Features

-   **Backend (Node.js/Express):**
    -   User registration & login APIs with password hashing (bcryptjs) and JWT authentication.
    -   Role-based access control (user vs admin).
    -   CRUD APIs for a `Product` entity.
    -   API versioning (`/api/v1`).
    -   Error handling and validation (express-validator).
    -   MongoDB/Mongoose for the database.

-   **Frontend (React):**
    -   Simple UI to:
        -   Register & log in users.
        -   Access a protected dashboard (JWT required).
        -   Perform CRUD actions on the `Product` entity.
        -   Show error/success messages from API responses.
    -   React Hooks for state management.
    -   Axios for API requests.
    -   React Router for navigation.

## Getting Started

### Prerequisites

-   Node.js
-   npm
-   MongoDB (You can use a local instance or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory with the following variables:
    ```
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm run dev
    ```
    The server will be running on `http://localhost:5000`.

2.  **Start the frontend development server:**
    ```bash
    cd ../frontend
    npm run dev
    ```
    The frontend will be running on `http://localhost:5173`.

## API Documentation

The API routes are defined in the `backend/routes` directory.

-   **Authentication:** `backend/routes/auth.js`
-   **Products:** `backend/routes/products.js`

### Postman Collection

Import these into Postman:

- `postman/mern-assignment.postman_collection.json`
- `postman/mern-assignment.postman_environment.json`

Environment variables used:
- `baseUrl` (default `http://localhost:5000`)
- `token` (set automatically after running the Login request)
- `productId` (set manually for update/delete requests)

## Scalability

This project is a simple monolith. To scale it, you could consider the following:

-   **Microservices:** Break down the application into smaller, independent services (e.g., a user service, a product service).
-   **Caching:** Use a caching layer like Redis to cache frequently accessed data.
-   **Load Balancing:** Use a load balancer to distribute traffic across multiple instances of the application.
-   **Database Scaling:** Use database sharding or replication to scale the database.
