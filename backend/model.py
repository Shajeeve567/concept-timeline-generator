from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base

class RoadmapGallery(Base):
    __tablename__ = "gallery_roads"

    id = Column(Integer, primary_key=True, index=True)

    # URL-friendly ID
    concept_slug = Column(String, unique=True, index=True, nullable=False)

    title = Column(String, nullable=False)

    graph_data = Column(JSONB, nullable=False)

    views = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())