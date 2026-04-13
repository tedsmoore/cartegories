from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from api.db import get_session
from api.models.game import (
    PlayedGame,
    PlayedGameBatchRequest,
    PlayedGameBatchResponse,
    PlayedGameResult,
)

router = APIRouter(prefix="/api")


@router.post("/games", response_model=PlayedGameBatchResponse)
def create_games(
    payload: PlayedGameBatchRequest, session: Session = Depends(get_session)
) -> PlayedGameBatchResponse:
    """Batch-insert played game results. Skips duplicates by UUID."""
    accepted = 0
    duplicates = 0

    for game_data in payload.games:
        existing = session.exec(
            select(PlayedGame).where(PlayedGame.id == game_data.id)
        ).first()
        if existing:
            duplicates += 1
            continue

        game = PlayedGame(
            id=game_data.id,
            anonymous_id=payload.anonymous_id,
            score=game_data.score,
            played_at=game_data.played_at,
        )
        session.add(game)
        session.flush()

        for result_data in game_data.results:
            session.add(
                PlayedGameResult(
                    played_game_id=game.id,
                    card_item_id=result_data.card_item_id,
                    nailed=result_data.nailed,
                )
            )
        accepted += 1

    session.commit()
    return PlayedGameBatchResponse(accepted=accepted, duplicates=duplicates)
