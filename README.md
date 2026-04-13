# Trading AI App

A full-stack paper trading platform for Indian equities with a dedicated AI service for market data ingestion and baseline signal generation.

This repository combines three applications:

- `frontend`: a Next.js dashboard for watchlists, stock detail views, and portfolio screens
- `backend`: an Express + TypeScript API for authentication, trading actions, and portfolio data
- `ai-service`: a FastAPI service that syncs market data from Yahoo Finance and generates ML-based trading signals

## Overview

The project is structured around a simple product idea: simulate equity trading with virtual capital while layering in AI-assisted market signals.

At the moment:

- the frontend is polished and API-ready, but still uses local service mocks for dashboard and portfolio data
- the backend contains the core authentication and paper trading API structure backed by PostgreSQL
- the AI service fetches historical stock data, stores it in PostgreSQL, schedules recurring sync jobs, and trains a baseline classifier on demand

## Core Features

- User registration and login with JWT-based authentication
- Virtual balance initialization for new users
- Buy and sell trade endpoints for paper trading workflows
- Portfolio holdings retrieval for authenticated users
- Historical Indian equity data sync using `yfinance`
- Scheduled background ingestion for tracked NSE symbols
- Baseline prediction endpoint with `BUY`, `SELL`, and `HOLD` outputs
- Modern frontend for dashboard, portfolio, and stock detail experiences

## Architecture

```text
Frontend (Next.js 15)
    |
    +-- UI pages and typed service contracts
    |
Backend API (Express + TypeScript)
    |
    +-- Auth, stocks, trades, portfolio
    +-- PostgreSQL for users, trades, holdings, stock prices
    |
AI Service (FastAPI + scikit-learn)
    |
    +-- Scheduled Yahoo Finance sync
    +-- Feature engineering
    +-- Baseline ML signal generation
```

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- Zod

### AI Service

- FastAPI
- Python
- PostgreSQL
- `yfinance`
- `pandas`
- `scikit-learn`
- APScheduler

## Repository Structure

```text
Trading AI/
|- frontend/
|  |- app/
|  |- components/
|  |- services/
|  `- types/
|- backend/
|  |- src/
|  |  |- modules/
|  |  |- repositories/
|  |  |- middleware/
|  |  `- config/
`- ai-service/
   `- app/
      |- api/
      |- services/
      |- repositories/
      |- schemas/
      `- core/
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 14+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/khush1092/Trading-AI-App.git
cd Trading-AI-App
```

### 2. Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
indian_paper_trading
```

Both the backend and AI service expect this database by default.

### 3. Configure Environment Variables

#### Backend

Copy `backend/.env.example` to `backend/.env` and update values as needed.

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/indian_paper_trading
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
DEFAULT_VIRTUAL_BALANCE=100000
```

#### AI Service

Copy `ai-service/.env.example` to `ai-service/.env`.

```env
APP_ENV=development
APP_NAME=Indian Stock Market AI Service
APP_HOST=0.0.0.0
APP_PORT=8001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/indian_paper_trading
TRACKED_SYMBOLS=RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS,ICICIBANK.NS,SBIN.NS
SUPPORTED_INTERVALS=1d,1h
SCHEDULER_MINUTES=5
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY_SECONDS=2
MAX_CONCURRENT_FETCHES=4
MODEL_MIN_ROWS=60
MODEL_TEST_SIZE=0.2
SIGNAL_THRESHOLD=0.004
MODEL_RANDOM_STATE=42
```

### 4. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
cd ..
```

#### Backend

```bash
cd backend
npm install
cd ..
```

#### AI Service

Windows PowerShell:

```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

macOS / Linux:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

## Running the Project

Run each service in a separate terminal.

### Frontend

```bash
cd frontend
npm run dev
```

Available at `http://localhost:3000`

### Backend

```bash
cd backend
npm run dev
```

Available at `http://localhost:4000`

### AI Service

```bash
cd ai-service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Available at `http://localhost:8001`

## API Overview

### Backend API

Base path: `http://localhost:4000/api/v1`

Key endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /stocks`
- `POST /buy`
- `POST /sell`
- `GET /portfolio`

Health check:

- `GET http://localhost:4000/health`

### AI Service API

Key endpoints:

- `GET /internal/v1/health`
- `POST /internal/v1/data/sync`
- `GET /prediction/{symbol}?interval=1d`

Examples:

```bash
curl http://localhost:8001/internal/v1/health
```

```bash
curl -X POST http://localhost:8001/internal/v1/data/sync \
  -H "Content-Type: application/json" \
  -d "{\"symbols\":[\"RELIANCE.NS\",\"TCS.NS\"],\"intervals\":[\"1d\"]}"
```

```bash
curl "http://localhost:8001/prediction/RELIANCE.NS?interval=1d"
```

## Machine Learning Pipeline

The AI service currently uses a baseline `RandomForestClassifier` pipeline with median imputation.

The prediction flow is:

1. Fetch and store historical OHLCV data
2. Build technical features such as moving averages, RSI, returns, range percentage, and volume trends
3. Label the next move as `BUY`, `SELL`, or `HOLD` using a configurable threshold
4. Train the baseline model on available labeled rows
5. Return the latest signal, class probabilities, and evaluation metrics

This is a practical baseline designed for iteration rather than a production trading model.

## Current Development Status

This repository is in active development.

What is already in place:

- backend API structure for auth, trades, stocks, and portfolio
- AI ingestion and prediction service
- frontend dashboard and portfolio UI
- shared PostgreSQL usage across backend and AI components

What still needs work:

- database migrations or schema bootstrap scripts
- direct frontend integration with backend and AI APIs
- richer order history, analytics, and charting
- stronger evaluation, backtesting, and model lifecycle management

## Notes

- The frontend currently relies on local mock data in `frontend/services` for dashboard and portfolio rendering.
- The backend and AI service both expect PostgreSQL tables to exist, but migration files are not yet included in this repository.
- The AI scheduler automatically runs a recurring sync based on `SCHEDULER_MINUTES`.

## Contributing

Contributions, fixes, and improvements are welcome. If you plan to extend the trading engine, schema, or AI pipeline, open an issue or fork the project and propose a clean, focused pull request.

## License

No license has been added yet. If you plan to open-source the project publicly, adding an explicit license is recommended.
