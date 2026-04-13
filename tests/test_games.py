from fastapi.testclient import TestClient
from sqlmodel import Session

from sqlmodel import select

from api.models.deck import Card, CardItem, Deck
from api.models.game import PlayedGame, PlayedGameResult


def _seed_deck_with_items(session: Session) -> list[int]:
    """Seed a deck with a card and 3 items. Returns item IDs."""
    deck = Deck(id="general", name="General", priority=50, is_free=True)
    session.add(deck)
    session.flush()

    card = Card(id=1000, category="Test Category", deck_id="general")
    session.add(card)
    session.flush()

    item_ids = []
    for i, text in enumerate(["Item A", "Item B", "Item C"]):
        item = CardItem(text=text, position=i, is_active=True, card_id=1000)
        session.add(item)
        session.flush()
        item_ids.append(item.id)
    session.commit()
    return item_ids


def _make_game_payload(
    game_id: str = "550e8400-e29b-41d4-a716-446655440000",
    item_ids: list[int] | None = None,
) -> dict:
    results = []
    if item_ids:
        results = [
            {"card_item_id": item_ids[0], "nailed": True},
            {"card_item_id": item_ids[1], "nailed": False},
        ]
    return {
        "id": game_id,
        "score": 7,
        "played_at": "2026-04-13T10:30:00Z",
        "results": results,
    }


class TestCreateGames:
    def test_batch_insert(self, client: TestClient, session: Session):
        item_ids = _seed_deck_with_items(session)
        payload = {
            "anonymous_id": "anon-uuid-1",
            "games": [
                _make_game_payload("game-1", item_ids),
                _make_game_payload("game-2", item_ids),
                _make_game_payload("game-3", item_ids),
            ],
        }
        resp = client.post("/api/games", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["accepted"] == 3
        assert data["duplicates"] == 0

        games = session.exec(select(PlayedGame)).all()
        assert len(games) == 3

    def test_idempotent_duplicate(self, client: TestClient, session: Session):
        item_ids = _seed_deck_with_items(session)
        payload = {
            "anonymous_id": "anon-uuid-1",
            "games": [_make_game_payload("game-1", item_ids)],
        }
        client.post("/api/games", json=payload)

        resp = client.post("/api/games", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["accepted"] == 0
        assert data["duplicates"] == 1

    def test_empty_batch(self, client: TestClient):
        payload = {"anonymous_id": "anon-uuid-1", "games": []}
        resp = client.post("/api/games", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["accepted"] == 0
        assert data["duplicates"] == 0

    def test_missing_fields(self, client: TestClient):
        payload = {"anonymous_id": "anon-uuid-1", "games": [{"score": 5}]}
        resp = client.post("/api/games", json=payload)
        assert resp.status_code == 422

    def test_mixed_new_and_duplicate(self, client: TestClient, session: Session):
        item_ids = _seed_deck_with_items(session)
        first = {
            "anonymous_id": "anon-uuid-1",
            "games": [_make_game_payload("game-1", item_ids)],
        }
        client.post("/api/games", json=first)

        second = {
            "anonymous_id": "anon-uuid-1",
            "games": [
                _make_game_payload("game-1", item_ids),  # dup
                _make_game_payload("game-2", item_ids),  # new
                _make_game_payload("game-3", item_ids),  # new
            ],
        }
        resp = client.post("/api/games", json=second)
        data = resp.json()
        assert data["accepted"] == 2
        assert data["duplicates"] == 1

    def test_game_results_stored(self, client: TestClient, session: Session):
        item_ids = _seed_deck_with_items(session)
        payload = {
            "anonymous_id": "anon-uuid-1",
            "games": [_make_game_payload("game-1", item_ids)],
        }
        client.post("/api/games", json=payload)

        results = session.exec(select(PlayedGameResult)).all()
        assert len(results) == 2
        nailed = [r for r in results if r.nailed]
        missed = [r for r in results if not r.nailed]
        assert len(nailed) == 1
        assert len(missed) == 1
        assert nailed[0].card_item_id == item_ids[0]
        assert missed[0].card_item_id == item_ids[1]
