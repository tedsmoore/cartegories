from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, select

from api.db import create_db_and_tables, get_session
from api.models import User, UserCreate, UserRead

app = FastAPI()


@app.get("/")
async def read_root():
    return {"message": "Hello World"}

