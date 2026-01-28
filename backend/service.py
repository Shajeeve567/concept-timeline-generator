import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from schema import RoadmapResponse
from pathlib import Path

# Setting up the path
script_location = Path(__file__).parent.resolve()
file_path = script_location / "data" 


# Loading the API key
load_dotenv()

gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_retries=2,
)

llama_llm = ChatOpenAI(
    model="meta-llama/llama-3.1-8b-instruct",
    temperature=0,
    max_retries=2,
    base_url="https://openrouter.ai/api/v1",
)

ACTIVE_LLM = gemini_llm

structured_llm = ACTIVE_LLM.with_structured_output(RoadmapResponse)

system_roadmap_prompt = """
You are a historical visualization engine. 
Analyze the user's concept and generate a horizontal genealogy timeline.
Structure the nodes in 3 distinct phases:
1. Origin (Left): Who coined it? When? (Year & Author)
2. Evolution (Middle): 2-3 key turning points or technological shifts.
3. Current State (Right): 2-3 modern applications or derivatives.z

Make sure the IDs connect logically from left to right.
"""

roadmap_prompt = ChatPromptTemplate.from_messages([
    ("system", system_roadmap_prompt),
    ("human", "Generate a roadmap for the concept: {concept}"),
])

chain = roadmap_prompt | structured_llm

async def generate_roadmap(concept: str):
    return await chain.ainvoke({"concept": concept})


system_prompt_expand = """
You are a Recursive Depth Engine. 
The user is "zooming in" on a specific node to see its sub-components.

Global Concept: '{concept}'
Target Node: '{parent_node}' (ID: {parent_id})
Context Dimension: "{context_type}" (root, core, or path)

Task: Generate 4-5 NEW sub-nodes that explain '{parent_node}' in granular detail.

ADAPTIVE LOGIC (Strictly follow the Dimension):
- If context is 'root' (History): Generate ancestors, key dates, or specific events.
- If context is 'core' (Theory): Generate sub-components, mechanisms, or definitions.
- If context is 'path' (Learning): Generate specific tools, books, or prerequisites.

CRITICAL RULES:
1. The 'source' of every new edge MUST be exactly "{parent_id}".
2. The 'type' of new nodes must match the parent's "{context_type}".
3. Do NOT repeat the parent node.
"""

expand_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt_expand),
    ("human", "Expand deeply on '{parent_node}'")
])

expand_chain = expand_prompt | structured_llm

async def expand_node(concept: str, parent_node: str, parent_id: str, context_type: str):
    return await expand_chain.ainvoke({
        "concept": concept,
        "parent_node": parent_node,
        "parent_id": parent_id,
        "context_type": context_type
    })