from sqlmodel import Field, Relationship, SQLModel


# ── Deck ──────────────────────────────────────────────────────────────


class DeckBase(SQLModel):
    id: str = Field(primary_key=True)
    name: str
    priority: int = Field(default=0)
    image: str | None = None
    is_free: bool = Field(default=False)
    product_id: str | None = None


class Deck(DeckBase, table=True):
    __tablename__ = "decks"

    cards: list["Card"] = Relationship(back_populates="deck")


class DeckRead(DeckBase):
    card_count: int = 0


# ── Card ──────────────────────────────────────────────────────────────


class CardBase(SQLModel):
    id: int = Field(primary_key=True)
    category: str
    fact: str | None = None
    deck_id: str = Field(foreign_key="decks.id")


class Card(CardBase, table=True):
    __tablename__ = "cards"

    deck: Deck | None = Relationship(back_populates="cards")
    items: list["CardItem"] = Relationship(back_populates="card")


class CardItemRead(SQLModel):
    text: str
    position: int
    is_active: bool = True


class CardRead(CardBase):
    items: list[CardItemRead] = []


# ── CardItem ──────────────────────────────────────────────────────────


class CardItemBase(SQLModel):
    text: str
    position: int = Field(default=0)
    is_active: bool = Field(default=True)
    card_id: int = Field(foreign_key="cards.id")


class CardItem(CardItemBase, table=True):
    __tablename__ = "card_items"

    id: int | None = Field(default=None, primary_key=True)
    card: Card | None = Relationship(back_populates="items")
