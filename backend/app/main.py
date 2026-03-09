from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from . import models , database
from .routers import  user, auth , company

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router,prefix="/api/v1")
app.include_router(auth.router,prefix="/api/v1")
app.include_router(company.router,prefix="/api/v1")


@app.get("/")
def get_message():
    return {"message":"Hello CMS"}