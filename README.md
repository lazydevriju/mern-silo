# Silo 📦  
### Secure, Self-Hosted Personal Cloud with Real-Time File Watching

[![Docker](https://img.shields.io/badge/Docker-v24-blue.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)]()
[![React](https://img.shields.io/badge/React-v19-blue.svg)]()
![Silo Version](https://img.shields.io/badge/release-v1.2.0-informational)
[![License](https://img.shields.io/badge/license-ISC-lightgrey.svg)]()

**Silo** is a secure, self-hosted mini-cloud platform that exposes a folder on your machine as a private storage service. It provides:

- Expiring secure share links  
- Real-time file watching  
- LAN-based access from any device  
- Safe, containerized deployment with Docker  

This project follows a modular, scalable architecture suitable for real deployment and future multi-user expansion.

---

# 🚀 Key Features

- **🔒 Secure Link Generation**  
  Create expiring, JWT-signed URLs for file downloads. No folder outside the configured base directory is ever exposed.

- **👀 Real-Time Disk Watching**  
  Using `Chokidar` and `Socket.io`, Silo updates the frontend instantly when files are added/removed.

- **🛡️ Path Traversal Protection**  
  Blocks attempts like `../../system32` using resolved path comparison.

- **⚡ Efficient File Streaming**  
  Large files are streamed using Node.js pipes without blocking memory.

- **🌐 LAN Access Ready (v1.2.0)**  
  Access Silo from phones and laptops on the same Wi-Fi network.

- **🐳 Fully Dockerized**  
  No Node.js, MongoDB, or local tool installations required. Everything runs through Docker Compose.

---

# 🛠️ Tech Stack

### **Frontend**
- React 19 (Vite)
- Axios
- Socket.io Client

### **Backend**
- Node.js v22
- Express.js
- Socket.io
- Chokidar
- JWT

### **Infrastructure**
- MongoDB (Metadata store)
- Docker & Docker Compose

---

# 🏗️ Project Architecture

The project follows a modular structure suitable for scaling:

```
silo/
├── docker-compose.yml                 # Container orchestration configuration
├── .gitignore                         # Git ignore rules
├── .gitattributes                     # Git attributes
├── README.md                          # Project documentation
├── CHANGELOG.md                       # Project changelog
├── .env
├── .env.example                       # Environment variables template
├── version.json
│
├── backend/                           # Node.js Express API
│   ├── Dockerfile                     # Backend container image
│   ├── package.json                   # Backend dependencies
│   ├── server.js                      # Express server & Socket.io setup
│   ├── .env                           
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
│       ├── App.css                    # App-specific styles
|       ├── .env
│       │
│       └── api/
│           ├── client.js              # Frontend UI for browsing files and creating share links
│           ├── files.jsx              # Generates secure expiring download links
│           └── share.js               # Global styles
|
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

**1. Clone the Repository**
```
git clone https://github.com/lazydevriju/node-silo.git
cd node-silo
```

**2. Create the Environment File**
```
Copy the example environment template:

cp .env.example .env
```

Now open .env and configure the folder on YOUR computer that Silo should expose.

**Windows Example**
SILO_HOST_FOLDER=C:\Users\MyName\Documents\SiloFiles

**macOS / Linux Example**
SILO_HOST_FOLDER=/Users/myname/SiloFiles

**Other required variables (already in .env.example)**
JWT_SECRET=my_very_secure_key
MONGODB_URI=mongodb://mongo:27017/silo
PORT=4000

### ⚠️ Critical Note

SILO_HOST_FOLDER must point to a real folder on your local machine.
Its contents become accessible through Silo’s secure link system.

**3. Run the Entire System**

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

**4. API Endpoints**
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

**5. Security: Path Traversal Protection**

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

**6. Future Improvements**

 * User Authentication (Host + Client accounts)

 * Drag-and-Drop File Uploads

 * Remote Upload Support

 * HTTPS for Production Deployment

 * Multi-device link syncing

Author

Mayukh Neogi
Built with unnecessary caffeine and questionable motivation.
😉