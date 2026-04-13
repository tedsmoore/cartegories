from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ── PlayedGame ───────────────────────────────────────────────────────


class PlayedGameBase(SQLModel):
    id: str = Field(primary_key=True)  # UUID generated on mobile
    anonymous_id: str = Field(index=True)
    score: int
    played_at: datetime


class PlayedGame(PlayedGameBase, table=True):
    __tablename__ = "played_games"

    created_at: datetime = Field(default_factory=utc_now)
    results: list["PlayedGameResult"] = Relationship(back_populates="played_game")


# ── PlayedGameResult ─────────────────────────────────────────────────


class PlayedGameResultBase(SQLModel):
    card_item_id: int = Field(foreign_key="card_items.id")
    nailed: bool


class PlayedGameResult(PlayedGameResultBase, table=True):
    __tablename__ = "played_game_results"

    id: int | None = Field(default=None, primary_key=True)
    played_game_id: str = Field(foreign_key="played_games.id")
    played_game: PlayedGame | None = Relationship(back_populates="results")


# ── Request / Response schemas ───────────────────────────────────────


class PlayedGameResultCreate(SQLModel):
    card_item_id: int
    nailed: bool


class PlayedGameCreate(SQLModel):
    id: str
    score: int
    played_at: datetime
    results: list[PlayedGameResultCreate]


class PlayedGameBatchRequest(SQLModel):
    anonymous_id: str
    games: list[PlayedGameCreate]


class PlayedGameBatchResponse(SQLModel):
    accepted: int
    duplicates: int
