# from pydantic import BaseModel, Field
# from typing import List, Literal


# NodeType = Literal["origin", "milestone", "current"]

# NodeAction = Literal["expand", "pivot"]

# class Node(BaseModel):
#     id: str = Field(description="Unique ID (e.g., '1', 'origin-node')")
#     label: str = Field(description="Text inside the bubble (e.g., '1956: AI Coined')")
#     type: NodeType = Field(description="Category: 'origin', 'milestone', or 'current'")
#     details: str = Field(description="A short 1-sentence description for the sidebar")
#     year: int = Field(ge=0, le=2100, description="Event year as an integer (e.g., 1903)")
#     who: str | None = Field(default=None, description="Person/org responsible (e.g., 'Wright brothers')")
#     who_role: str | None = Field(default=None, description="Role (e.g., 'invented by', 'coined by')")

# class Edge(BaseModel):
#     source: str = Field(description="ID of the start node")
#     target: str = Field(description="ID of the end node")
#     label: str = Field(description="Relationship (e.g., 'evolved into')")


# class RoadmapResponse(BaseModel):
#     nodes: List[Node]
#     edges: List[Edge]

from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# 1. Update Categories to match the 3 Dimensions + Center
# input = The main center node
# root  = History/Genealogy (Left)
# core  = Ontology/Definition (Center/Top/Bottom)
# path  = Curriculum/Learning (Right)
NodeType = Literal["input", "root", "core", "path"]

NodeAction = Literal["expand", "pivot"]

class Node(BaseModel):
    id: str = Field(description="Unique ID (e.g., '1', 'root-1')")
    label: str = Field(description="The main concept Name (e.g. 'Satoshi Nakamoto')")
    type: NodeType = Field(description="Which dimension this node belongs to")
    details: str = Field(description="2-3 sentence explanation for the sidebar")
    
    # 2. Generalized Metadata
    # We make 'year' optional because 'Core' or 'Path' nodes might not have one.
    # We change it to str to allow "Late 1990s" or "Ancient Greece".
    year: Optional[str] = Field(default=None, description="For Root nodes: The time period")
    
    # Replaces specific 'who' fields with a generic 'tag' for UI flexibility
    # Root Node Tag -> "Inventor"
    # Path Node Tag -> "Difficulty: Hard"
    # Core Node Tag -> "Mechanism"
    tag: Optional[str] = Field(default=None, description="Small pill badge text (e.g. 'Inventor', 'Hard', '1995')")
    
    # 3. Capabilities
    # We default this to BOTH because in a recursive app, every node is pivotable.
    capabilities: List[NodeAction] = Field(
        default=["expand", "pivot"], 
        description="Actions user can take. Defaults to everything."
    )

class Edge(BaseModel):
    source: str = Field(description="ID of the start node")
    target: str = Field(description="ID of the end node")
    label: str = Field(description="Active verb (e.g., 'coined', 'composed of', 'requires')")

class RoadmapResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]