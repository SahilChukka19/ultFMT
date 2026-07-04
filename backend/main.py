from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import metadata, tools

app = FastAPI(
    title="AI Dev Toolkit API",
    description="Backend API for AI Developer Tools",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(metadata.router)
app.include_router(tools.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Dev Toolkit API"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}
