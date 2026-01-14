import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from schema import RoadmapResponse
from pathlib import Path

# Setting up the path
script_location = Path(__file__).parent.resolve()
file_path = script_location / "data" 


# Loading the API key
load_dotenv()


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_retries=2,
)

structured_llm = llm.with_structured_output(RoadmapResponse)

system_prompt = """
You are a historical visualization engine. 
Analyze the user's concept and generate a horizontal genealogy timeline.
Structure the nodes in 3 distinct phases:
1. Origin (Left): Who coined it? When? (Year & Author)
2. Evolution (Middle): 2-3 key turning points or technological shifts.
3. Current State (Right): 2-3 modern applications or derivatives.

Make sure the IDs connect logically from left to right.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "Generate a roadmap for the concept: {concept}"),
])

chain = prompt | structured_llm

async def generate_roadmap(concept: str):
    return await chain.ainvoke({"concept": concept})


