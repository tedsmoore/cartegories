import os
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine


DEFAULT_DATABASE_URL = "postgresql+psycopg://cartegories:password@localhost:2345/cartegories"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    import api.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
