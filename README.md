# SupportLens

A lightweight observability platform for a customer support chatbot. Every conversation is automatically classified by an LLM and displayed on a real-time dashboard.

## Architecture

```
frontend/   React + TypeScript + Tailwind + Recharts (port 5173)
backend/    FastAPI + SQLite + Anthropic Claude (port 8000)
```

**Flow:** User sends message → chatbot calls Claude (claude-haiku-4-5-20251001) → query+response saved as trace → second Claude call classifies into one of 5 categories → appears on dashboard.

## Quick Start (Docker)

**Prerequisites:** Docker + Docker Compose, an Anthropic API key.

```bash
git clone <repo-url>
cd supportlens

# 1. Create .env and add your key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# 2. Run
docker-compose up --build
```

- **Chatbot:** http://localhost:5173
- **Dashboard:** http://localhost:5173 → click "Dashboard"
- **API:** http://localhost:8000/docs

The backend auto-seeds 25 pre-classified traces on first startup.

---

## Manual Setup (without Docker)

### Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Set your API key
export ANTHROPIC_API_KEY=your_key_here   # Windows: set ANTHROPIC_API_KEY=...

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Generate a chatbot response |
| `POST` | `/traces` | Classify & save a trace |
| `GET`  | `/traces?category=Billing` | List traces (optional filter) |
| `GET`  | `/analytics` | Aggregate stats |

Interactive docs at http://localhost:8000/docs

## Classification Categories

| Category | Description |
|----------|-------------|
| Billing | Invoices, charges, payment methods, pricing |
| Refund | Returns, money back, dispute a charge |
| Account Access | Login issues, password reset, MFA |
| Cancellation | Cancel subscription, downgrade, close account |
| General Inquiry | Feature questions, product info, how-to |

Classification is done by `claude-haiku-4-5-20251001` using a carefully crafted prompt that handles edge cases (e.g., messages touching multiple categories — classified by primary intent).

## LLM Prompts

Both prompts are in [`backend/llm.py`](backend/llm.py):

- **`CHATBOT_SYSTEM_PROMPT`** — instructs Claude to act as a BillPro SaaS billing support agent
- **`CLASSIFICATION_PROMPT`** — structured prompt with category definitions, disambiguation rules (Refund vs Billing, Cancellation vs Billing, etc.), and a strict single-word output format
