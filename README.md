# ✈️ Airline Booking Service

A **Node.js microservice** for handling flight bookings, built as part of a larger Airline Management System. It communicates with a separate Flight Search Service via REST (axios) and publishes events to a RabbitMQ message broker for downstream notification services.

---

## 🏗️ Architecture

```
Client
  │
  ▼
Booking Service (this repo)  ──────►  Flight Search Service
  │                                        (external microservice)
  ▼
MySQL Database (Bookings table)
  │
  ▼
RabbitMQ Exchange  ──────►  Notification/Reminder Service
                                    (external microservice)
```

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Runtime      | Node.js                             |
| Framework    | Express.js                          |
| ORM          | Sequelize (with migrations)         |
| Database     | MySQL                               |
| Messaging    | RabbitMQ (via amqplib)              |
| HTTP Client  | Axios                               |
| Dev Server   | Nodemon                             |

---

## 📁 Project Structure

```
src/
├── config/
│   ├── config.json          # Sequelize DB config (dev/test/prod)
│   └── serverConfig.js      # Reads env variables via dotenv
├── controllers/
│   └── booking-controller.js
├── migrations/
│   ├── 20221225122104-create-booking.js
│   └── 20221225124206-modify_bookings_add_new_fields.js
├── models/
│   ├── index.js             # Sequelize model loader
│   └── booking.js           # Booking model definition
├── repository/
│   └── booking-repository.js  # DB operations (create, update)
├── routes/
│   ├── index.js             # Mounts /v1
│   └── v1/index.js          # POST /bookings, POST /publish
├── services/
│   └── booking-service.js   # Business logic
└── utils/
    ├── messageQueue.js      # RabbitMQ channel helpers
    └── errors/
        ├── app-error.js
        ├── service-error.js
        └── validation-error.js
```

---

## ⚙️ Prerequisites

- **Node.js** v16+
- **MySQL** running locally (or accessible)
- **RabbitMQ** running locally (or accessible)
- A running instance of the **Flight Search Service** (for seat/price lookups)

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the database
Edit `src/config/config.json` with your MySQL credentials:
```json
{
  "development": {
    "username": "root",
    "password": "your_password",
    "database": "airline_booking_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Create the database in MySQL:
```sql
CREATE DATABASE airline_booking_db;
```

### 3. Set up environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

`.env` contents:
```env
PORT=3002
FLIGHT_SERVICE_PATH=http://localhost:3001
MESSAGE_BROKER_URL=amqp://localhost
EXCHANGE_NAME=AIRLINE_NOTIFICATION
REMINDER_BINDING_KEY=REMINDER_BINDING_KEY
DB_SYNC=true
```

### 4. Run database migrations
```bash
npx sequelize-cli db:migrate
```

### 5. Start the server
```bash
npm start
```

Server starts at: `http://localhost:3002`

---

## 📡 API Endpoints

### `POST /api/v1/bookings`
Create a new flight booking.

**Request Body:**
```json
{
  "flightId": 1,
  "userId": 42,
  "noOfSeats": 2
}
```

**Success Response (200):**
```json
{
  "message": "Successfully completed booking",
  "success": true,
  "err": {},
  "data": {
    "id": 10,
    "flightId": 1,
    "userId": 42,
    "noOfSeats": 2,
    "totalCost": 9000,
    "status": "Booked"
  }
}
```

**Error Response (e.g. 500):**
```json
{
  "message": "Something Went Wrong",
  "success": false,
  "err": "Service layer error",
  "data": {}
}
```

---

### `POST /api/v1/publish`
Publish a test message to the RabbitMQ exchange (used for testing the notification pipeline).

**Success Response (200):**
```json
{
  "message": "Successfully published the event"
}
```

---

## 🔄 Booking Flow

1. Client sends `POST /api/v1/bookings` with `flightId`, `userId`, `noOfSeats`
2. Service calls Flight Service to get flight details (price, available seats)
3. Validates that enough seats are available
4. Creates a `Booking` record in DB with status `InProcess`
5. Calls Flight Service to decrement available seats
6. Updates booking status to `Booked`
7. Returns the final booking

---

## 🐛 Known Issues Fixed (from original)

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `booking-controller.js` | `publishMessage` not awaited → silent failures | Added `await` |
| 2 | `booking-controller.js` | `error.statusCode` could be `undefined` → Express crashes | Added fallback to `500` |
| 3 | `booking-service.js` | `ServiceError` not caught by its own name check → gets re-wrapped | Added `'ServiceError'` to the re-throw condition |
| 4 | `booking-service.js` | No input validation for required fields | Added check for `flightId`, `userId`, `noOfSeats` |
| 5 | `src/config/config.json` | Missing from repo (gitignored) → app crashes on start | Added with default dev config |
| 6 | `.env.example` | No example env file → confusing for new devs | Created `.env.example` |
