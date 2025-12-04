# Silo

Silo is a secure, self-hosted file sharing service.

It lets you expose **only specific files** from a configured server directory by generating **time-limited, download-limited, signed links**. The rest of the system stays private.

## Tech Stack

- Backend: Node.js, Express, MongoDB, JWT
- (Planned) Frontend: React
- (Planned) Docker and automated testing

## Current Features (Backend)

- List files from a configured directory (`BASE_DIR`)
- Create secure share links with:
  - Expiry time (in minutes)
  - Maximum download count
- Validate signed URLs and stream file downloads
- Track downloads in MongoDB
