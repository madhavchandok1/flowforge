from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models  # Ensure all models are registered
from routers import forge

from db.base import Base
from db.session import engine

# Create all tables if they don't exist (for development/testing)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flow Forge API",
    description="Backend API for Flow Forge – a project management platform",
    version="0.1.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set specific frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forge.router)

@app.get("/")
def root():
    return {"message": "Welcome to Flow Forge!"}
