# main.py

import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import your routes
from routes import core

# Configuration
PORT = int(os.getenv("PORT", 8000))
NGROK_DOMAIN = os.getenv("NGROK_DOMAIN", "gopher-loved-largely.ngrok-free.app")

# Create FastAPI app
app = FastAPI(title="SuperMango API")

# Include your routers
app.include_router(core.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"https://{NGROK_DOMAIN}",
        "http://localhost:19000",  # Expo Go
        "http://localhost:8081",   # Metro bundler
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {"message": "SuperMango API is running."}

def start_ngrok():
    """
    Launch ngrok in its own console window so you can see its logs.
    """
    cmd = ["ngrok", "http", str(PORT), "--domain", NGROK_DOMAIN]
    try:
        proc = subprocess.Popen(
            cmd,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        print(f"🔌 ngrok tunnel started on https://{NGROK_DOMAIN}")
        return proc
    except Exception as e:
        print(f"❌ Failed to start ngrok: {e}")
        return None

if __name__ == "__main__":
    # Start ngrok in a new console
    ngrok_proc = start_ngrok()

    # Start the FastAPI server
    print(f"🚀 Starting SuperMango API on http://0.0.0.0:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)

    # When the server stops, terminate ngrok
    if ngrok_proc:
        print("🛑 Terminating ngrok tunnel")
        ngrok_proc.terminate()
