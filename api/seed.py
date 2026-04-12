"""Seed the database from data/decks.json."""

import json
import re
from pathlib import Path

from sqlmodel import Session, select

from api.db import engine
from api.models.deck import Card, CardItem, Deck


def slugify(name: str) -> str:
    """Port of mobile/src/utils/slugify.ts — must produce identical IDs."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower())
    return slug.strip("-")


def seed_decks() -> None:
    data_path = Path(__file__).resolve().parent.parent / "data" / "decks.json"
    with open(data_path) as f:
        data = json.load(f)

    with Session(engine) as session:
        if session.exec(select(Deck)).first():
            print("Decks already seeded, skipping.")
            return

        deck_count = 0
        card_count = 0
        item_count = 0

        for deck_json in data["decks"]:
            deck_id = slugify(deck_json["name"])
            deck = Deck(
                id=deck_id,
                name=deck_json["name"],
                priority=deck_json["priority"],
                image=deck_json["image"],
                is_free=deck_json["isFree"],
                product_id=deck_json.get("productId"),
            )
            session.add(deck)
            deck_count += 1

            for card_json in deck_json["cards"]:
                card = Card(
                    id=card_json["key"],
                    category=card_json["category"],
                    fact=card_json.get("fact"),
                    deck_id=deck_id,
                )
                session.add(card)
                card_count += 1

                for position, item_text in enumerate(card_json["items"]):
                    item = CardItem(
                        text=item_text,
                        position=position,
                        is_active=True,
                        card_id=card_json["key"],
                    )
                    session.add(item)
                    item_count += 1

        session.commit()
        print(f"Seeded {deck_count} decks, {card_count} cards, {item_count} items.")


if __name__ == "__main__":
    seed_decks()
