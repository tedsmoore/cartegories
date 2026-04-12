from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from api.models.deck import Card, CardItem, Deck
from api.seed import seed_decks, slugify


# ── slugify parity with mobile ────────────────────────────────────────


def test_slugify_deck_names():
    """Must match mobile/src/utils/slugify.ts output for all 15 decks."""
    cases = {
        "Cartoons & Animation": "cartoons-animation",
        "Food & Drink": "food-drink",
        "General": "general",
        "Harry Potter": "harry-potter",
        "History & Geography": "history-geography",
        "Lord of the Rings": "lord-of-the-rings",
        "Music": "music",
        "Sci-Fi & Fantasy": "sci-fi-fantasy",
        "Science & Nature": "science-nature",
        "Sports & Leisure": "sports-leisure",
        "Star Wars": "star-wars",
        "TV & Movies": "tv-movies",
        "Theater": "theater",
        "Video Games": "video-games",
        "Wordplay": "wordplay",
    }
    for name, expected in cases.items():
        assert slugify(name) == expected, f"slugify({name!r}) != {expected!r}"


def test_slugify_edge_cases():
    assert slugify("---hello---") == "hello"
    assert slugify("  spaced  ") == "spaced"
    assert slugify("A & B & C") == "a-b-c"


def test_slugify_produces_unique_ids():
    names = [
        "Cartoons & Animation", "Food & Drink", "General", "Harry Potter",
        "History & Geography", "Lord of the Rings", "Music", "Sci-Fi & Fantasy",
        "Science & Nature", "Sports & Leisure", "Star Wars", "TV & Movies",
        "Theater", "Video Games", "Wordplay",
    ]
    ids = [slugify(n) for n in names]
    assert len(set(ids)) == 15


# ── seed_decks ────────────────────────────────────────────────────────


def _make_test_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


def test_seed_loads_all_data(monkeypatch):
    engine = _make_test_engine()
    monkeypatch.setattr("api.seed.engine", engine)

    seed_decks()

    with Session(engine) as session:
        decks = session.exec(select(Deck)).all()
        cards = session.exec(select(Card)).all()
        items = session.exec(select(CardItem)).all()
        assert len(decks) == 15
        assert len(cards) == 1733
        assert len(items) > 0
        # Each card should have items
        assert len(items) >= len(cards)


def test_seed_creates_items_with_positions(monkeypatch):
    engine = _make_test_engine()
    monkeypatch.setattr("api.seed.engine", engine)

    seed_decks()

    with Session(engine) as session:
        # Grab items for the first card
        first_card = session.exec(select(Card)).first()
        items = session.exec(
            select(CardItem).where(CardItem.card_id == first_card.id)
        ).all()
        positions = sorted(item.position for item in items)
        assert positions == list(range(len(items)))
        assert all(item.is_active for item in items)


def test_seed_is_idempotent(monkeypatch, capsys):
    engine = _make_test_engine()
    monkeypatch.setattr("api.seed.engine", engine)

    seed_decks()
    seed_decks()

    captured = capsys.readouterr()
    assert "already seeded" in captured.out

    with Session(engine) as session:
        assert len(session.exec(select(Deck)).all()) == 15
