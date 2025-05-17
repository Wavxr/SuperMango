from fastapi import FastAPI
from routes import core

app = FastAPI(title="SuperMango API")

app.include_router(core.router)

@app.get("/")
def root():
    return {"message": "SuperMango API is running."}
