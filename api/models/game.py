from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ── Game ─────────────────────────────────────────────────────────────


class GameBase(SQLModel):
    id: str = Field(primary_key=True)  # UUID generated on mobile
    anonymous_id: str = Field(index=True)
    score: int

    played_at: datetime


class Game(GameBase, table=True):
    __tablename__ = "games"

    created_at: datetime = Field(default_factory=utc_now)
    results: list["GameResult"] = Relationship(back_populates="game")


# ── GameResult ───────────────────────────────────────────────────────


class GameResultBase(SQLModel):
    card_item_id: int = Field(foreign_key="card_items.id")
    nailed: bool  # "nailed" or "missed"


class GameResult(GameResultBase, table=True):
    __tablename__ = "game_results"

    id: int | None = Field(default=None, primary_key=True)
    game_id: str = Field(foreign_key="games.id")
    game: Game | None = Relationship(back_populates="results")


# ── Request / Response schemas ───────────────────────────────────────


class GameResultCreate(SQLModel):
    card_item_id: int
    nailed: bool


class GameCreate(SQLModel):
    id: str
    score: int

    played_at: datetime
    results: list[GameResultCreate]


class GameBatchRequest(SQLModel):
    anonymous_id: str
    games: list[GameCreate]


class GameBatchResponse(SQLModel):
    accepted: int
    duplicates: int
