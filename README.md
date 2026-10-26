# FrontDash

A full-stack food ordering and operations platform built with React, Spring Boot, and MySQL. Customers discover restaurants and place orders; restaurant, delivery, staff, and admin teams manage the workflow through role-based dashboards.

## Product

- Restaurant discovery with search, food categories, menus, and cart
- Customer registration, addresses, checkout, order history, and rewards
- Restaurant menus, incoming orders, operating hours, and withdrawals
- Staff delivery coordination and driver assignment
- Admin tools for registrations, users, restaurants, and operations
- Spring Boot REST API with MySQL persistence

This is a portfolio/demo application. Checkout is not connected to a payment processor; use dummy data only and never enter real card or CVV information.

## Stack

| Layer | Technologies |
| --- | --- |
| Web | React 19, React Router, Bootstrap, Lucide React |
| API | Java 21, Spring Boot 3, Spring Data JPA, validation |
| Data | MySQL 8 |
| Hosting | Vercel for the web app; Java and managed MySQL hosts for the API and data |

## Run locally

Prerequisites: Node.js 18+, Java 21, Maven, and MySQL 8.

1. Create an empty `food_delivery_db` database and apply `database/schema.sql`. The schema creates tables only; it does not delete existing tables or include sample accounts or customer records.
2. Configure the backend environment:

   ```sh
   export DB_URL='jdbc:mysql://localhost:3306/food_delivery_db'
   export DB_USER='root'
   export DB_PASSWORD='your-local-password'
   export CORS_ALLOWED_ORIGINS='http://localhost:3000'
   ```

3. Start the API:

   ```sh
   cd backend
   mvn spring-boot:run
   ```

4. In another terminal, configure and start the React app:

   ```sh
   cd frontend
   cp .env.example .env.local
   npm install
   npm start
   ```

The web app runs at `http://localhost:3000`. The API runs at `http://localhost:8080`; its health endpoint is `/api/health`. Create a dedicated demo account for reviewers; no default credentials are included.

## Deploy the web app to Vercel

1. Import the repository into Vercel and set the project **Root Directory** to `frontend`.
2. Set `REACT_APP_API_URL` to the public base URL of the deployed API, including `/api`.
3. Deploy. `frontend/vercel.json` configures the React build and client-side route fallback.

Vercel hosts the React frontend. The Spring Boot API and MySQL database must be hosted separately. Configure `DB_URL`, `DB_USER`, `DB_PASSWORD`, and `CORS_ALLOWED_ORIGINS` in the API host; use the Vercel site origin in `CORS_ALLOWED_ORIGINS`.

## Repository layout

```text
frontend/   React customer and operations interfaces
backend/    Spring Boot API and database configuration
database/   MySQL schema
```

Do not commit environment files, credentials, database snapshots, or customer data. Use the example environment files as templates and keep deployment secrets in the hosting provider's environment settings.
