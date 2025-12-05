# Silo 📦
### Secure, Self-Hosted Personal Cloud with Real-Time File Watching

[![Docker](https://img.shields.io/badge/Docker-v24-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey.svg)]()

**Silo** is a full-stack, microservices-ready application that turns any folder on your computer into a secure, shareable cloud storage system. It features **real-time file synchronization** (using WebSockets & Kernel-level watching), **secure expiring links**, and a fully containerized **Docker** architecture.

---

## 🚀 Key Features

* **🔒 Secure Link Generation:** Create time-limited, signed URLs (JWT) to share specific files without exposing your entire drive.
* **👀 Real-Time I/O:** The UI updates instantly when files are added or deleted on the host disk (powered by `Chokidar` + `Socket.io`).
* **🛡️ Security First:** Implements robust protection against **Path Traversal Attacks** to ensure system files remain isolated.
* **⚡ Efficient Streaming:** Uses Node.js Streams to handle large file downloads (movies, archives) efficiently without overloading server RAM.
* **🐳 Fully Dockerized:** Runs in an isolated environment separating 'State' (Files/DB) from 'Stateless Code' (App) for maximum portability.

---

## 🛠️ Tech Stack

### **Frontend**
* **React 19** (Vite Build Tool)
* **Axios** (API Requests)
* **Socket.io-client** (Real-time events)

### **Backend**
* **Node.js v22** (ES Modules)
* **Express.js** (REST API)
* **Socket.io** (WebSocket Server)
* **Chokidar** (File System Watcher)
* **JWT** (Stateless Authentication)

### **Infrastructure**
* **MongoDB** (Metadata & Link Tracking)
* **Docker & Docker Compose** (Container Orchestration)

---

## 🏗️ Architecture

The project follows a modular structure suitable for scaling:

```
silo/
├── docker-compose.yml                 # Container orchestration configuration
├── .gitignore                         # Git ignore rules
├── .gitattributes                     # Git attributes
├── README.md                          # Project documentation
│
├── backend/                           # Node.js Express API
│   ├── Dockerfile                     # Backend container image
│   ├── package.json                   # Backend dependencies
│   ├── server.js                      # Express server & Socket.io setup
│   ├── .env.example                   # Environment variables template
│   │
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   │
│   ├── models/
│   │   └── SiloLink.js                # MongoDB schema for share links
│   │
│   ├── controllers/
│   │   ├── fileController.js          # File listing logic
│   │   └── shareController.js         # Link generation & download logic
│   │
│   └── routes/
│       ├── fileRoutes.js              # /api/files endpoints
│       └── shareRoutes.js             # /api/share & /silo/download endpoints
│
├── frontend/                          # React + Vite SPA
│   ├── Dockerfile                     # Frontend container image
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite bundler configuration
│   ├── eslint.config.js               # ESLint rules
│   ├── index.html                     # HTML entry point
│   ├── .gitignore                     # Frontend git ignore
│   ├── .gitattributes                 # Frontend git attributes
│   ├── README.md                      # Frontend-specific docs
│   │
│   └── src/
│       ├── main.jsx                   # React DOM render
│       ├── App.jsx                    # Main application component
│       ├── index.css                  # Global styles
│       └── App.css                    # App-specific styles
│
└── .dockerignore                      # Docker build ignore rules
```

### 📋 Key Files Explained

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates MongoDB, Backend, and Frontend containers |
| `backend/server.js` | Express app with Socket.io & Chokidar file watcher |
| `backend/models/SiloLink.js` | Stores share link metadata (expiration, download limits) |
| `backend/controllers/shareController.js` | JWT token generation & secure file downloads |
| `frontend/src/App.jsx` | React UI for file selection & link generation |
| `backend/.env.example` | Template for required environment variables |



⚡ Quick Start (Run with Docker)

You do not need Node.js or MongoDB installed locally.
All services run inside Docker containers.

1. Clone the Repository
```
git clone https://github.com/lazydevriju/node-silo.git
cd node-silo
```

2. Create the Environment File
Copy the example environment template:
```
cp .env.example .env
```

Now open .env and configure the folder on YOUR computer that Silo should expose.

Windows Example
SILO_HOST_FOLDER=C:\Users\MyName\Documents\SiloFiles

macOS / Linux Example
SILO_HOST_FOLDER=/Users/myname/SiloFiles

Other required variables (already in .env.example)
JWT_SECRET=my_very_secure_key
MONGODB_URI=mongodb://mongo:27017/silo
PORT=4000

### ⚠️ Critical Note

SILO_HOST_FOLDER must point to a real folder on your local machine.
Its contents become accessible through Silo’s secure link system.

3. Run the Entire System

From the project root:
```
docker-compose up --build
```

This launches:

Service	Port	Description
Frontend	http://localhost:5173
	React App
Backend API	http://localhost:4000
	Express + WebSockets
MongoDB	localhost:27017	Database for link metadata

Once all containers are running, open:

http://localhost:5173


You should now see Silo’s web dashboard.

4. API Endpoints
List Files
```
GET /api/files
```

Generate a Secure Share Link
```
POST /api/share
```

Example Request Body:
```
{
  "filename": "vacation_video.mp4",
  "expiresInMinutes": 60,
  "maxDownloads": 5
}
```
Download a File
```
GET /silo/download/:token
```

Automatically enforces:

Link expiration

Download count limits

Path traversal prevention

5. Security: Path Traversal Protection

Silo defends against attempts like:

../../Windows/System32


by validating resolved file paths:
```
const isSafePath = (base, target) => {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(base, target);
  return resolvedTarget.startsWith(resolvedBase);
};
```

If a file lies outside the allowed folder, Silo will refuse access.

6. Future Improvements

 * User Authentication (Login/Register)

 * Drag-and-Drop File Uploads

 * Rate Limiting for Download Links

 * HTTPS for Production Deployment

Author

Mayukh Neogi
