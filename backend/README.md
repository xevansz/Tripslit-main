# TripSplit Backend

## Quick Start

```bash
# Copy the example env file and configure
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the server (uses dummy data by default - no MongoDB needed!)
python main.py
```

## Architecture

The backend is organized into a modular structure:

```
backend/
├── main.py              # Entry point - run this
├── app/                 # Application package
│   ├── __init__.py
│   ├── core/            # Core utilities
│   │   ├── config.py    # Environment config
│   │   └── security.py  # Auth, JWT, password hashing
│   ├── db/              # Database layer
│   │   ├── dummy_store.py   # JSON file storage for demo
│   │   └── database.py      # Unified DB interface
│   ├── models/          # Pydantic schemas
│   │   └── schemas.py
│   └── routes/          # API route handlers
│       ├── __init__.py
│       ├── auth.py      # Auth endpoints
│       ├── trips.py     # Trip management
│       ├── expenses.py  # Expenses & balance
│       ├── borrow.py    # Borrow/lend ledger
│       ├── vendors.py   # Vendor marketplace
│       ├── wallet.py    # Trip wallet & group pay
│       ├── ai.py        # AI TripBuddy
│       ├── notifications.py
│       └── tools.py     # Trip tools & achievements
├── data/                # Dummy data storage (JSON files)
└── requirements.txt
```

## Demo Mode (No Database Required)

By default, the app runs in **demo mode** using `USE_DUMMY_DB=true`. This stores all data in JSON files in the `data/` directory - perfect for showcasing to investors without database setup.

To switch to MongoDB for production:
1. Set `USE_DUMMY_DB=false` in `.env`
2. Provide `MONGO_URL` (e.g., `mongodb://localhost:27017/tripsplit`)
3. Install `motor` package (already in requirements.txt)

## Fixed Issues

### Backend
- **Date validation**: `TripCreateReq` now validates that `end_date` > `start_date`
- **Balance calculation**: Uses actual expense splits instead of mocked percentages
- **Code structure**: Split monolithic `server.py` into proper modules
- **emergentintegrations**: Made optional - AI features gracefully degrade if not installed

### Frontend (API Layer)
- **Type safety**: Proper TypeScript interfaces for all API types
- **Timeout**: 30-second timeout with `AbortController`
- **Env validation**: Runtime check for `EXPO_PUBLIC_BACKEND_URL`
- **Error handling**: Proper error display in UI components

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USE_DUMMY_DB` | No | `true` | Use JSON file storage (demo mode) |
| `MONGO_URL` | If dummy=false | - | MongoDB connection string |
| `DB_NAME` | No | `tripsplit` | Database name |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `EMERGENT_LLM_KEY` | No | - | For AI TripBuddy (optional) |

## API Endpoints

See the route files in `app/routes/` for all available endpoints.

Key endpoints:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/trips` - List trips
- `POST /api/trips` - Create trip
- `GET /api/balance` - Get accurate balance
- `GET /api/borrow` - List borrow/lend records
