from fastapi import FastAPI
from .schemas import AdvisorRequest, AdvisorResponse
from .recommend import recommend_products

app = FastAPI(
    title="GoldenWeft ML Service",
    version="1.0"
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/recommend", response_model=AdvisorResponse)
def recommend(payload: AdvisorRequest):
    recommendations = recommend_products(
        payload.answers,
        payload.products
    )

    return {
        "recommendations": recommendations
    }
