from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat

app = FastAPI()

# List of allowed origins (domains). For development, you can use ["*"] to allow all.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or use ["*"] for all origins (not recommended in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Chatbot API!"}
