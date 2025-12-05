# Silo

Silo is a secure, self-hosted file sharing service.

It lets you expose **only specific files** from a configured server directory by generating **time-limited, download-limited, signed links**. The rest of the system stays private.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, JWT, Socket.io, Chokidar
- **Frontend:** React, Vite
- **Planned:** Docker and automated testing

## Features

### Core Functionality
- **File System Integration:** securely lists files from a configured directory (`BASE_DIR`) on your server.
- **Secure Sharing:** Generate signed share links with:
  - **Expiry time** (in minutes)
  - **Usage limits** (Maximum download count)
- **Access Control:** Validates signed URLs before streaming file downloads.
- **Usage Tracking:** Tracks download counts and access logs in MongoDB.

### Real-Time & UI
- **Live Updates:** The frontend automatically updates the file list when files are added or removed from the server (powered by Chokidar & Socket.io).
- **Interactive UI:** Select files and generate links directly from a clean React interface.