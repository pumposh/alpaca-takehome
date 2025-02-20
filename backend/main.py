from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.optimize import router as optimize_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(optimize_router)

@app.get("/")
async def health_check():
    return {"status": "ok"} 