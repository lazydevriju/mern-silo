## v1.2.0 – LAN Access + Frontend/Backend Stabilization (2025-12-07)

### Added
- PUBLIC_BASE_URL and FRONTEND_URL env variables for dynamic URL handling
- API layer on frontend (`/src/api`) for cleaner request management
- Socket.io CORS alignment with backend origins
- New UI assets (silo_black.svg, silo_grey.png/svg)
- version.json for frontend version tracking

### Updated
- shareController now builds download URLs using LAN/WAN-safe base URL
- server.js CORS overhauled to support LAN, local dev, and multi-origin setups
- server now binds to `0.0.0.0` for LAN accessibility
- App.jsx updated to use API layer instead of raw axios
- App.css improvements + layout refinements
- frontend/index.html branding and meta updates

### Fixed
- Mobile devices could not open generated links due to localhost-based URLs
- CORS errors when accessing from phones or other LAN devices

