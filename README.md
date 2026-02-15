# Period Tracker App - Frontend

React + Vite frontend for the period tracker. Connects to the backend API for all data.

## Run both client and server

1. **Backend** (must run first):  
   - Open a terminal  
   - `cd period-tracker-app` (or wherever the backend repo is)  
   - Set `.env` with `DATABASE_URL` and optionally `GEMINI_API_KEY`  
   - `node app.js` (listens on port 3000)

2. **Frontend**:  
   - In another terminal: `npm run dev`  
   - Vite proxies `/api` to `http://localhost:3000`

All data is fetched from the backend via axios and `useEffect`. No static or hardcoded data.
