from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models import Category


class TraceCreate(BaseModel):
    user_message: str
    bot_response: str
    response_time_ms: int


class TraceResponse(BaseModel):
    id: str
    user_message: str
    bot_response: str
    category: Category
    timestamp: datetime
    response_time_ms: int

    model_config = {"from_attributes": True}


class CategoryStat(BaseModel):
    category: str
    count: int
    percentage: float


class Analytics(BaseModel):
    total_traces: int
    by_category: list[CategoryStat]
    avg_response_time_ms: float


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    response_time_ms: int
