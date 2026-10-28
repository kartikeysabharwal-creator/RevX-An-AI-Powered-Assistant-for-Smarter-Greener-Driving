# RevX — AI Smart Driving Assistant

RevX is an AI-powered smart-driving and automotive efficiency platform. It captures vehicle telemetry (via smartphone sensors: GPS, accelerometer, gyroscope, or optional OBD-II adapters), detects driving events, estimates fuel consumption and CO₂ emissions, computes Eco and Safety Scores, generates personalized AI coaching feedback, and tracks maintenance, savings, and gamification streaks.

---

## 🚀 Quick Start (Running on macOS)

### Prerequisites
- **Node.js**: v18.0.0+ (v20+ recommended)
- **npm**: v9.0.0+
- macOS Terminal (zsh/bash)

### 1. Extract and Install
```bash
# If unzipping the archive
unzip revx-source.zip -d revx
cd revx

# Install monorepo dependencies
npm install
```

### 2. Configure Environment Files
Pre-configured templates are included:
```bash
# Configure backend API environment
cp .env.example apps/api/.env

# Configure Web Dashboard environment
cp apps/web/.env.example apps/web/.env.local
```

> **Note:** The backend comes with an in-memory database and rule-based AI fallback enabled by default. No external Supabase or OpenAI credentials are required for local testing or evaluation!

### 3. Start Backend API
In your first terminal tab:
```bash
npm run dev:api
```
- API server starts at: `http://localhost:4000`
- Health check endpoint: `http://localhost:4000/api/v1/health`

### 4. Start Web Application
In a second terminal tab:
```bash
npm run dev:web
```
- Public Landing Page: `http://localhost:3000`
- Main Dashboard: `http://localhost:3000/dashboard`
- Drive Simulator: `http://localhost:3000/dashboard/simulator`

### 5. Generate Simulation Data
Populate the app with simulated vehicle telemetry and scores:
```bash
# Run the CLI drive simulator
npm run test:sim
```
Or interactively test drive scenarios in the browser via the **Simulator** page in the dashboard.

---

## 📁 Project Structure

```
revx/
├── apps/
│   ├── api/             # Express.js + TypeScript REST API
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers (Trips, Telemetry, Health, Analytics, Gamification)
│   │   │   ├── services/     # AI Coach, Trip Processor, Vehicle Health, ML Model
│   │   │   ├── simulators/   # Phone sensor & OBD-II physics telemetry simulators
│   │   │   └── middleware/   # Auth, validation, rate limiting
│   └── web/             # Next.js 14 App Router + Tailwind CSS Dashboard
│       └── src/
│           ├── app/          # Dashboard views (Analytics, Health, Savings, Achievements, Simulator)
│           ├── components/   # Circular Score Gauges, Trend Charts, Map Viewer
│           └── lib/          # Typed API Client
├── packages/
│   ├── shared/          # Types, Schemas, Scoring Engines (Eco, Safety, Fuel, Emissions)
│   └── analytics/       # Aggregation & Trend Engine
└── scripts/             # Packaging and dev automation scripts
```

---

## 🧪 Testing

Run automated tests across workspaces:
```bash
# Test shared computation engines (Eco/Safety scoring, fuel estimation)
npm run --workspace=packages/shared test

# Test analytics aggregation
npm run --workspace=packages/analytics test

# Test API endpoints
npm run --workspace=apps/api test
```

---

## 🔒 Security & Green Computing
- Secrets and tokens are stripped from this distribution archive.
- Utilizes deterministic edge-scoring and smart AI caching to minimize cloud emissions and API compute.
