from contextlib import asynccontextmanager
import re
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from service import generate_roadmap, expand_node
from database import AsyncSession, get_db, engine
import models
import logging
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("🚀 Starting up: Creating database tables...")
    async with engine.begin() as conn:
        # This line actually builds "gallery_roadmaps" in Postgres
        await conn.run_sync(models.Base.metadata.create_all) 
    yield
    logging.info("🛑 Shutting down...")


app = FastAPI(title="Geneology", lifespan=lifespan)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def create_slug(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "concept"

# To send inputs as json, we use pydantic models as the function parameters
class RoadMapRequest(BaseModel):
    concept: str = Field(min_length=2)

class ExpandRequest(BaseModel):
    concept: str
    parent_node: str
    parent_id: str
    context_type: str


"""
Depends(get_db): This tells FastAPI: "Before you run this function, go run get_db() from database.py. Wait for it to yield a session. Then, put that session into the variable db."

db: AsyncSession: Now, inside your function, db is your open phone line to Postgres. You didn't have to write open() or connect(). It was handed to you on a silver platter.
"""

@app.get("/roadmap/trending")
async def recent_search(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    try:
        stmt = (
            select(models.RoadmapGallery)
            .order_by(desc(models.RoadmapGallery.views))
            .limit(limit=limit)
        )
        
        result = await db.execute(stmt)
        roadmaps = result.scalars().all()

        return [
            {
                "concept": item.title,
                "slug": item.concept_slug,
                "views": item.views,
                "created_at": item.created_at
            }
            for item in roadmaps
        ]

    except Exception as e:
        logging.error("Error fetching trending: {e}")
        raise HTTPException(status_code=500, detail=str(e))





@app.post("/roadmap")
async def search_term(request: RoadMapRequest, db: AsyncSession = Depends(get_db)):
    
    concept = request.concept
    slug = create_slug(concept)

    try:
        # Check the database
        stmt = select(models.RoadmapGallery).where(models.RoadmapGallery.concept_slug == slug)
        result = await db.execute(stmt)
        cached_item = result.scalar_one_or_none()

        if cached_item:
            logging.info(f"⚡ Serving '{concept}' from DB Cache")
            # Update view count
            cached_item.views += 1
            await db.commit()
            return cached_item.graph_data
        
        # ask ai to generate the roadmap
        logging.info(f"🔮 Generating '{concept}' via AI")

        try:
            ai_result = await generate_roadmap(request.concept)
        except Exception as e:
            print("🔥 BACKEND ERROR 🔥")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

        new_entry = models.RoadmapGallery(
            concept_slug=slug,
            title=concept,
            # Pydantic object -> Python Dict for JSONB storage
            graph_data=ai_result.model_dump(), 
            views=1
        )

        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)

        return ai_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/expand")
async def expand(request: ExpandRequest):
    try:
        logging.info("Expanding node '{request.parent_node}' ({request.context_type})")

        new_subgraph = await expand_node(
            concept=request.concept,
            parent_node=request.parent_node,
            parent_id=request.parent_id,
            context_type=request.context_type
        )
        
        return new_subgraph

    except Exception as e:
        logging.error(f"Error expanding node: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)