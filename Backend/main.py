from fastapi import FastAPI
from routes import resnet, weather, prescription

app = FastAPI(title="SuperMango API")

app.include_router(resnet.router)
app.include_router(weather.router)
app.include_router(prescription.router)

@app.get("/")
def root():
    return {"message": "SuperMango API is running."}
