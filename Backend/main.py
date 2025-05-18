from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import core

app = FastAPI(title="SuperMango API")

app.include_router(core.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gopher-loved-largely.ngrok-free.app",  
        
    ],
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.get("/")
def root():
    return {"message": "SuperMango API is running."}
