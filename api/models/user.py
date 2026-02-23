from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserBase(SQLModel):
    username: str | None = Field(
        default=None,
        index=True,
        nullable=True,
        sa_column_kwargs={"unique": True},
    )
    anonymous_id: str = Field(index=True, sa_column_kwargs={"unique": True})
    is_anonymous: bool = Field(default=True)
    last_seen_at: datetime = Field(default_factory=utc_now)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_column_kwargs={"onupdate": utc_now},
    )


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
