# PinDrop — Hackathon Project

A collaborative photo-sharing application with geolocation features.

## Project Structure

```
Hackathon/
├── pindrop-web/        ← Frontend (React 19 + TypeScript + Vite)
├── pindrop/            ← Backend (Dev 2)
├── _bmad-output/       ← Planning artifacts
└── README.md           ← Project root README
```

## Frontend Setup (pindrop-web)

```bash
cd pindrop-web
npm install
npm run dev
```

Visit http://localhost:5174 to start the app.

**Stack**: React 19, TypeScript, Vite, React Router v6, React-Leaflet v5, Supabase JS

**Features**:
- Interactive map with real-time pin polling (30s)
- Drag-and-drop photo upload with EXIF/GPS extraction
- Photo gallery with detail view
- Manual coordinate assignment for unlocated photos
- Error handling with retry, file validation, upload progress tracking

## Backend

See `pindrop/` folder for backend setup and documentation.

## Team

- Dev 1: Frontend
- Dev 2: Backend

## License

TBD
