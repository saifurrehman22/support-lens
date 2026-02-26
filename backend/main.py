import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import llm
import schemas
from database import Base, engine, get_db
from models import Category, Trace

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from seed import seed
    seed()
    yield


app = FastAPI(title="SupportLens API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat", response_model=schemas.ChatResponse)
def chat_endpoint(request: schemas.ChatRequest):
    """Generate a chatbot response for a user message."""
    try:
        response_text, response_time_ms = llm.chat(request.message)
        return {"response": response_text, "response_time_ms": response_time_ms}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")


@app.post("/traces", response_model=schemas.TraceResponse, status_code=201)
def create_trace(trace: schemas.TraceCreate, db: Session = Depends(get_db)):
    """Receive a trace, classify it via LLM, save and return it."""
    try:
        category_str = llm.classify(trace.user_message, trace.bot_response)
        category = Category(category_str)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Classification error: {str(e)}")

    db_trace = Trace(
        id=str(uuid.uuid4()),
        user_message=trace.user_message,
        bot_response=trace.bot_response,
        category=category,
        timestamp=datetime.utcnow(),
        response_time_ms=trace.response_time_ms,
    )
    db.add(db_trace)
    db.commit()
    db.refresh(db_trace)
    return db_trace


@app.get("/traces", response_model=list[schemas.TraceResponse])
def get_traces(
    category: Optional[str] = Query(None, description="Filter by category name"),
    db: Session = Depends(get_db),
):
    """Return all traces, most recent first. Optionally filter by category."""
    query = db.query(Trace).order_by(Trace.timestamp.desc())
    if category:
        try:
            cat_enum = Category(category)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        query = query.filter(Trace.category == cat_enum)
    return query.all()


@app.get("/analytics", response_model=schemas.Analytics)
def get_analytics(db: Session = Depends(get_db)):
    """Return aggregate statistics across all traces."""
    total = db.query(Trace).count()
    if total == 0:
        return schemas.Analytics(
            total_traces=0, by_category=[], avg_response_time_ms=0.0
        )

    category_counts = (
        db.query(Trace.category, func.count(Trace.id).label("count"))
        .group_by(Trace.category)
        .all()
    )

    avg_time = db.query(func.avg(Trace.response_time_ms)).scalar() or 0.0

    by_category = [
        schemas.CategoryStat(
            category=cat.value,
            count=count,
            percentage=round(count / total * 100, 1),
        )
        for cat, count in category_counts
    ]

    return schemas.Analytics(
        total_traces=total,
        by_category=by_category,
        avg_response_time_ms=round(avg_time, 1),
    )
