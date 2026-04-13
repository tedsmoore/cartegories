from fastapi import FastAPI

from api.routers.decks import router as decks_router
from api.routers.games import router as games_router
from api.routers.users import router as users_router

app = FastAPI()

app.include_router(users_router)
app.include_router(decks_router)
app.include_router(games_router)


@app.get("/")
async def read_root():
    return {"message": "Hello World"}
