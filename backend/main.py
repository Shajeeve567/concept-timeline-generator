import re
from pydantic import BaseModel, Field
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from service import generate_roadmap, save_into_json
import logging

app = FastAPI(title="Geneology")

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def slug(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "concept"


class RoadMapRequest(BaseModel):
    concept: str = Field(min_length=2)


@app.post("/roadmap/{concept}")
def search_term(concept: str):
    try:
        result = generate_roadmap(concept)
        save_into_json(concept, result.model_dump_json(indent=2))
        logging.info(f"🔮 Generating roadmap for '{concept}'")
        return result
    except Exception as e:
        print(f"\n❌ ERROR: {e}")


@app.post("/roadmap")
def search_term(request: RoadMapRequest):
    try:
        logging.info(f"🔮 Generating roadmap for '{request.concept}'")
        return generate_roadmap(request.concept)
    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)