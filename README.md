# 📡 Uptime Monitoring Application

A RESTful API built with **Pure Node.js** (no frameworks) that monitors the uptime and downtime of user-defined URLs and sends SMS alerts via Twilio when a status change is detected.

---

## 🚀 Features

- User registration and authentication system
- Token-based authentication (custom implementation)
- Monitor multiple URLs for uptime/downtime
- Background worker that pings URLs at regular intervals
- SMS alerts via Twilio when a site goes down or comes back up
- File-based data storage (no database required)
- Staging and production environment support

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (Pure — no Express or any framework)
- **Storage:** File System (JSON files)
- **SMS:** Twilio API
- **Security:** HMAC-SHA256 password hashing
- **Environment:** dotenv

---

## 📁 Project Structure

```
project/
├── index.js                          ← Entry point
├── routes.js                         ← Application routes
├── package.json
├── .env                              ← Environment variables (not committed)
├── .env.example                      ← Environment variable template
├── .data/                            ← File-based database (auto-created)
│   ├── users/
│   ├── tokens/
│   └── checks/
├── helpers/
│   ├── handleReqRes.js               ← Request/Response handler
│   ├── environments.js               ← Environment config
│   ├── utilities.js                  ← Utility functions
│   └── notifications.js              ← Twilio SMS
├── lib/
│   ├── data.js                       ← File system CRUD
│   ├── server.js                     ← HTTP server
│   └── worker.js                     ← Background worker
└── handlers/
    └── routeHandlers/
        ├── userHandler.js
        ├── tokenHandler.js
        ├── checkHandler.js
        ├── sampleHandler.js
        └── notFoundHandler.js
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Twilio](https://www.twilio.com/) account (free tier works)
- Git

---

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/abdullahrafi1234/Raw-Node.js-API-Project.git
cd Raw-Node.js-API-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Then fill in your credentials:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_PHONE=your_twilio_phone_number
SECRET_KEY_STAGING=your_staging_secret_key
SECRET_KEY_PRODUCTION=your_production_secret_key
```

### 4. Create data directories

```bash
mkdir -p .data/users .data/tokens .data/checks
```

### 5. Run the application

```bash
# Staging mode (port 3000)
npm start

# Production mode (port 5000)
npm run production
```

---

## 🔑 Getting Twilio Credentials

1. Sign up at [twilio.com](https://www.twilio.com/)
2. Go to the **Console Dashboard**
3. Copy your **Account SID** and **Auth Token**
4. Get a free phone number from **Phone Numbers → Manage → Buy a number**
5. Add these to your `.env` file

---

## 📮 API Reference

### Base URL

```
http://localhost:3000
```

---

### 👤 Users

#### Create a User

```http
POST /user
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstName": "Abdullah",
  "lastName": "Rafi",
  "phone": "01234567890",
  "password": "yourpassword",
  "tosAgreement": "true"
}
```

**Response:**

```json
{
  "message": "User was created successfully"
}
```

---

#### Get a User

```http
GET /user?phone=01234567890
token: your_token_here
```

**Response:**

```json
{
  "firstName": "Abdullah",
  "lastName": "Rafi",
  "phone": "01234567890",
  "tosAgreement": "true",
  "checks": []
}
```

---

#### Update a User

```http
PUT /user
Content-Type: application/json
token: your_token_here
```

**Request Body** (at least one field required):

```json
{
  "phone": "01234567890",
  "firstName": "New Name",
  "lastName": "New Last Name",
  "password": "newpassword"
}
```

---

#### Delete a User

```http
DELETE /user?phone=01234567890
token: your_token_here
```

---

### 🔐 Tokens (Authentication)

#### Login — Create Token

```http
POST /token
Content-Type: application/json
```

**Request Body:**

```json
{
  "phone": "01234567890",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "phone": "01234567890",
  "id": "99okd1tvrx9zdaci39tk",
  "expires": 1775990406485
}
```

> Save the `id` — this is your token for protected routes.

---

#### Get a Token

```http
GET /token?id=99okd1tvrx9zdaci39tk
```

---

#### Extend Token (add 1 hour)

```http
PUT /token
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "99okd1tvrx9zdaci39tk",
  "extend": true
}
```

---

#### Logout — Delete Token

```http
DELETE /token?id=99okd1tvrx9zdaci39tk
```

---

### 🔍 Checks (URL Monitoring)

#### Create a Check

```http
POST /check
Content-Type: application/json
token: your_token_here
```

**Request Body:**

```json
{
  "protocol": "https",
  "url": "google.com",
  "method": "get",
  "successCodes": [200, 201],
  "timeoutSeconds": 3
}
```

**Field Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `protocol` | string | `"http"` or `"https"` only |
| `url` | string | non-empty |
| `method` | string | `"get"`, `"post"`, `"put"`, `"delete"` only |
| `successCodes` | array | e.g. `[200, 201]` |
| `timeoutSeconds` | number | integer between 1 and 5 |

---

#### Get a Check

```http
GET /check?id=check_id_here
token: your_token_here
```

---

#### Update a Check

```http
PUT /check?id=check_id_here
Content-Type: application/json
token: your_token_here
```

**Request Body** (at least one field required):

```json
{
  "protocol": "http",
  "url": "example.com",
  "method": "get",
  "successCodes": [200],
  "timeoutSeconds": 5
}
```

---

#### Delete a Check

```http
DELETE /check?id=check_id_here
token: your_token_here
```

---

## 📊 HTTP Status Codes

| Code  | Meaning                                    |
| ----- | ------------------------------------------ |
| `200` | Success                                    |
| `400` | Bad Request — missing or invalid fields    |
| `401` | Unauthorized — max check limit reached (5) |
| `403` | Forbidden — authentication failed          |
| `404` | Not Found                                  |
| `405` | Method Not Allowed                         |
| `500` | Internal Server Error                      |

---

## 🔄 How It Works

```
1. Register a user         →  POST /user
2. Login to get a token    →  POST /token
3. Create URL checks       →  POST /check  (with token in header)
4. Background worker runs every minute
5. Worker pings each registered URL
6. If status changes (up→down or down→up)
7. Twilio sends an SMS alert to the user's phone
```

---

## 🧪 Testing with Postman

### Step-by-step

```
1.  POST /user          →  Create your account
2.  POST /token         →  Login, copy the token id
3.  GET  /user          →  View your profile (add token in Headers)
4.  PUT  /user          →  Update your profile
5.  POST /check         →  Add a URL to monitor
6.  GET  /check         →  View the check
7.  PUT  /check         →  Update the check
8.  PUT  /token         →  Extend token if needed
9.  DELETE /check       →  Remove a check
10. DELETE /user        →  Delete your account
11. DELETE /token       →  Logout
```

### Adding Token in Postman

```
Go to Headers tab
Key:   token
Value: your_token_id_here
```

---

## 🌍 Environment Variables

| Variable                | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Twilio Account String Identifier               |
| `TWILIO_AUTH_TOKEN`     | Twilio Authentication Token                    |
| `TWILIO_FROM_PHONE`     | Your Twilio phone number (e.g. `+1XXXXXXXXXX`) |
| `SECRET_KEY_STAGING`    | Secret key for hashing in staging              |
| `SECRET_KEY_PRODUCTION` | Secret key for hashing in production           |

---

## 📝 NPM Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm start`          | Run in staging mode (port 3000)    |
| `npm run production` | Run in production mode (port 5000) |

---

## ⚠️ Limitations

- Maximum **5 checks** per user
- Token expires after **1 hour** (can be extended)
- SMS phone numbers must include country code (`+88` for Bangladesh)
- `timeoutSeconds` must be between 1 and 5

---

## 👨‍💻 Author

**Abdullah Al Rafi Bhuiyan**

- GitHub: [@abdullahrafi1234](https://github.com/abdullahrafi1234)

---

## 📄 License

This project is **UNLICENSED** — built for learning purposes.

---

> Built with Pure Node.js — no frameworks, just fundamentals. 🚀
