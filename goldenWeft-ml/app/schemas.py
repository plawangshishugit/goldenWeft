from typing import List, Dict
from pydantic import BaseModel


class Product(BaseModel):
    id: str
    fabric: str
    weight: str
    style: str
    tier: str
    tones: List[str]
    occasions: List[str]


class AdvisorRequest(BaseModel):
    answers: Dict[str, str]
    products: List[Product]


class Recommendation(BaseModel):
    productId: str
    confidence: int
    reasons: List[str]


class AdvisorResponse(BaseModel):
    recommendations: List[Recommendation]
