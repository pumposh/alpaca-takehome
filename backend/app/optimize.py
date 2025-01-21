from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from openai import AsyncOpenAI
from typing import Optional

router = APIRouter()

class NotesRequest(BaseModel):
    notes: str

async def optimize_notes_with_openai(notes: str, api_key: str) -> str:
    client = AsyncOpenAI(api_key=api_key)
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert ABA therapy note optimizer. Analyze the session notes and provide a response in the following exact format:

Behaviors Observed:
- {specific behavior}
- {specific behavior}

Interventions Used:
- {specific intervention}
- {specific intervention}

Progress Made:
- {specific progress point}
- {specific progress point}

Challenges:
- {specific challenge}
- {specific challenge}

Recommendations:
- {specific recommendation}
- {specific recommendation}

Important:
1. Use professional clinical language
2. Be concise and clear
3. Maintain factual accuracy
4. Do not extrapolate beyond what's in the notes
5. Always use bullet points with a dash (-)
6. Keep exactly these section titles
7. Include all sections even if empty (use "- None noted" in this case)"""
                },
                {
                    "role": "user",
                    "content": f"Please optimize these ABA therapy session notes:\n\n{notes}"
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(e)
        raise e

@router.post("/optimize")
async def optimize_notes(
    request: NotesRequest,
    authorization: Optional[str] = Header(None)
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
    
    api_key = authorization.replace("Bearer ", "")
    
    try:
        optimized = await optimize_notes_with_openai(request.notes, api_key)
        return {"optimized": optimized}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e)) 