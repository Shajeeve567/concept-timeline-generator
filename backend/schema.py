from pydantic import BaseModel, Field
from typing import List, Literal


NodeType = Literal["origin", "milestone", "current"]

# class Node(BaseModel):
#     id: str = Field(description="Unique ID (e.g., '1', 'origin-node')")
#     label: str = Field(description="Text inside the bubble (e.g., '1956: AI Coined')")
#     type: NodeType = Field(description="Category: 'origin', 'milestone', or 'current'")
#     details: str = Field(description="A short 1-sentence description for the sidebar")
#     year: int = Field(ge=0, le=2100, description="Event year as an integer (e.g., 1903)")
#     who: str | None = Field(default=None, description="Person/org responsible (e.g., 'Wright brothers')")
#     who_role: str | None = Field(default=None, description="Role (e.g., 'invented by', 'coined by')")

class Edge(BaseModel):
    source: str = Field(description="ID of the start node")
    target: str = Field(description="ID of the end node")
    label: str = Field(description="Relationship (e.g., 'evolved into')")


class RoadmapResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

