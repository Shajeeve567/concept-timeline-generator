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

def generate_roadmap(concept: str):
    return chain.invoke({"concept": concept})


def save_into_json(concept: str, response: str):
    try:
        with open(file_path / f"{concept}.json", "w") as f:
            f.write(response)
        print("\nSuccess!")
    except IOError as e:
        print(f"\nAn error occurred while writing to the file: {e}")


if __name__ == "__main__":
    test_concept = "Superman"

    print(f"Testing generation for : {test_concept}")

    print(f"""
        {RoadmapResponse.model_json_schema()}
""")

    try:
        result = generate_roadmap(test_concept)

        print("\n✅ SUCCESS! Here is the data:")
        print("------------------------------------------------")
        # print(result.model_dump_json(indent=2)) # Pretty print the JSON
        save_into_json(test_concept, result.model_dump_json(indent=2))
        print("------------------------------------------------")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")