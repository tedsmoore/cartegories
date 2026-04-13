from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, func, select

from api.db import get_session
from api.models.deck import Card, CardItem, CardItemRead, CardRead, Deck, DeckRead

router = APIRouter(prefix="/api")


@router.get("/decks", response_model=list[DeckRead])
def list_decks(session: Session = Depends(get_session)) -> list[DeckRead]:
    """Full catalog with card counts, ordered by priority."""
    stmt = (
        select(Deck, func.count(Card.id).label("card_count"))
        .outerjoin(Card, Deck.id == Card.deck_id)
        .group_by(Deck.id)
        .order_by(col(Deck.priority))
    )
    results = session.exec(stmt).all()
    return [
        DeckRead(
            id=deck.id,
            name=deck.name,
            priority=deck.priority,
            image=deck.image,
            is_free=deck.is_free,
            product_id=deck.product_id,
            card_count=count,
        )
        for deck, count in results
    ]


@router.get("/decks/{deck_id}/cards", response_model=list[CardRead])
def get_deck_cards(
    deck_id: str, session: Session = Depends(get_session)
) -> list[CardRead]:
    """Cards for a specific deck, with active items only."""
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    cards = session.exec(select(Card).where(Card.deck_id == deck_id)).all()
    result = []
    for card in cards:
        active_items = session.exec(
            select(CardItem)
            .where(CardItem.card_id == card.id, CardItem.is_active == True)  # noqa: E712
            .order_by(col(CardItem.position))
        ).all()
        result.append(
            CardRead(
                id=card.id,
                category=card.category,
                fact=card.fact,
                deck_id=card.deck_id,
                items=[
                    CardItemRead(
                        id=item.id,
                        text=item.text,
                        position=item.position,
                        is_active=item.is_active,
                    )
                    for item in active_items
                ],
            )
        )
    return result


@router.get("/catalog-version")
def get_catalog_version() -> dict:
    """Version string for client cache invalidation."""
    return {"version": "2018-03-31"}
