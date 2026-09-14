# ServiGo — Local Service Discovery & Availability Platform

Working full-stack prototype for the Webverse 2026 hackathon submission
("The Local Service Discovery & Availability Gap", team Code Titans).
Matches customers with **nearby, currently-available** local service
providers — plumbers, electricians, carpenters, and more — instead of
just listing everyone in a city.

```
customer / provider  →  React frontend  →  Auth (JWT)  →  Flask REST API
                                                              │
                                        ┌─────────────┬───────┴────────┐
                                   Location module  Matching       Requests
                                        └─────────────┴───────┬────────┘
                                                          MongoDB
                                              (users, providers, requests)
```

## What's real vs. stubbed

| Piece | Status |
|---|---|
| React frontend, Flask REST API, all business logic | **Real**, runs locally |
| Auth | **Real** JWT auth (register/login), not Firebase — no external account needed |
| Database | **Stubbed** with `mongomock` (in-memory) by default. Set `MONGO_URI` in `backend/.env` to a real MongoDB Atlas connection string to go live — no code changes needed |
| Maps | OpenStreetMap + Leaflet (free, no API key) instead of Google Maps, so it runs with zero setup. Swappable later if you want Google Maps specifically |
| Location matching | **Real** — haversine distance calculation, filters by service + availability + radius |

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env      # defaults already work out of the box
python3 run.py
```

Runs on `http://localhost:5000`. On first run it seeds:
- 8 service categories (Plumber, Electrician, Carpenter, Painter, AC Repair, Appliance Repair, Home Cleaning, Pest Control)
- 6 demo providers spread around Pune (some available, some not)
- 1 demo customer

**Demo logins** (password for all: `password123`):
- Customer: `customer@servigo.demo`
- Providers: `ramesh.plumber@servigo.demo`, `sunita.electric@servigo.demo`, `vikas.carpenter@servigo.demo`, `ashok.ac@servigo.demo` (starts unavailable), `meena.clean@servigo.demo`, `ganesh.plumber2@servigo.demo`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # points at http://localhost:5000/api by default
npm run dev
```

Runs on `http://localhost:5173`. Open it, log in as the demo customer,
allow location access (or it falls back to a Pune location), and search
for a "Plumber" — you'll see nearby providers with distance and rating.

## Try the full loop

1. Log in as `customer@servigo.demo`, search for a service, send a request to a provider.
2. Open a second browser (or incognito window), log in as that provider (e.g. `ramesh.plumber@servigo.demo`), go to **Requests**, accept it, then mark it **completed**.
3. Back as the customer, go to **Requests**, rate the completed job. The provider's average rating updates.
4. As a provider, toggle **"Go unavailable"** on the dashboard — you'll immediately disappear from customer searches for that service.

## Project layout

```
servigo/
├── backend/            Flask REST API
│   ├── app/
│   │   ├── auth.py           register / login (JWT)
│   │   ├── providers.py      profile, availability, nearby search (location + matching)
│   │   ├── requests_bp.py    request lifecycle + ratings
│   │   ├── services.py       service catalog
│   │   ├── db.py             mongomock <-> real MongoDB switch
│   │   ├── utils.py          haversine distance, auth helpers
│   │   └── seed.py           demo data
│   └── run.py
└── frontend/           React (Vite) app
    └── src/
        ├── pages/            Landing, Login, Register, Customer*, Provider*
        ├── components/       Navbar, MapView (Leaflet), ProviderRow, RequestRow, ...
        └── context/          auth session (JWT stored in localStorage)
```

## Going from prototype to the pitch deck's real version

- Swap `MONGO_URI` for a real Atlas cluster (`backend/.env`) — no code changes.
- Swap Leaflet/OSM for Google Maps if you specifically want that provider (update `MapView.jsx`).
- Add Firebase Authentication if you want it to match the original slide exactly — the JWT layer here is a lighter-weight stand-in that does the same job (stateless tokens, role-based access) without a Firebase project.
- Deploy backend to Render/Railway and frontend to Vercel, exactly as planned in the submission — set `CORS_ORIGINS` (backend) and `VITE_API_URL` (frontend) to the deployed URLs.
