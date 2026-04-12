from fastapi.testclient import TestClient
from sqlmodel import Session

from api.models.deck import Card, CardItem, Deck


def _seed_deck(session: Session, deck_id: str = "general", priority: int = 50) -> Deck:
    deck = Deck(id=deck_id, name="General", priority=priority, is_free=True)
    session.add(deck)
    session.commit()
    return deck


def _seed_card_with_items(
    session: Session, deck_id: str = "general", card_id: int = 1000
) -> Card:
    card = Card(id=card_id, category="Test Category", fact="A fun fact", deck_id=deck_id)
    session.add(card)
    session.flush()
    for i, text in enumerate(["Item A", "Item B", "Item C"]):
        session.add(CardItem(text=text, position=i, is_active=True, card_id=card_id))
    session.commit()
    return card


# ── GET /api/decks ────────────────────────────────────────────────────


def test_list_decks_empty(client: TestClient):
    resp = client.get("/api/decks")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_decks_with_card_count(client: TestClient, session: Session):
    _seed_deck(session)
    _seed_card_with_items(session)
    resp = client.get("/api/decks")
    assert resp.status_code == 200
    decks = resp.json()
    assert len(decks) == 1
    assert decks[0]["id"] == "general"
    assert decks[0]["card_count"] == 1


def test_list_decks_ordered_by_priority(client: TestClient, session: Session):
    session.add(Deck(id="low", name="Low", priority=10))
    session.add(Deck(id="high", name="High", priority=90))
    session.add(Deck(id="mid", name="Mid", priority=50))
    session.commit()

    resp = client.get("/api/decks")
    ids = [d["id"] for d in resp.json()]
    assert ids == ["low", "mid", "high"]


# ── GET /api/decks/{id}/cards ─────────────────────────────────────────


def test_get_deck_cards(client: TestClient, session: Session):
    _seed_deck(session)
    _seed_card_with_items(session)
    resp = client.get("/api/decks/general/cards")
    assert resp.status_code == 200
    cards = resp.json()
    assert len(cards) == 1
    assert cards[0]["category"] == "Test Category"
    assert len(cards[0]["items"]) == 3
    assert cards[0]["items"][0]["text"] == "Item A"


def test_get_deck_cards_excludes_inactive(client: TestClient, session: Session):
    _seed_deck(session)
    card = Card(id=2000, category="Mixed", deck_id="general")
    session.add(card)
    session.flush()
    session.add(CardItem(text="Active", position=0, is_active=True, card_id=2000))
    session.add(CardItem(text="Inactive", position=1, is_active=False, card_id=2000))
    session.commit()

    resp = client.get("/api/decks/general/cards")
    items = resp.json()[0]["items"]
    assert len(items) == 1
    assert items[0]["text"] == "Active"


def test_get_deck_cards_not_found(client: TestClient):
    resp = client.get("/api/decks/nonexistent/cards")
    assert resp.status_code == 404


# ── GET /api/catalog-version ──────────────────────────────────────────


def test_catalog_version(client: TestClient):
    resp = client.get("/api/catalog-version")
    assert resp.status_code == 200
    assert resp.json() == {"version": "2018-03-31"}
