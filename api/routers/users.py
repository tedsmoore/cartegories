from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from api.db import get_session, engine
from api.models import User, UserCreate, UserRead

from fastapi import APIRouter

router = APIRouter()


@router.get("/users", response_model=list[UserRead])
def list_users(session: Session = Depends(get_session)) -> list[User]:
    return list(session.exec(select(User)))


@router.post("/users", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, session: Session = Depends(get_session)) -> User:
    if payload.username is not None:
        existing = session.exec(
            select(User).where(User.username == payload.username)
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Username already exists")

    existing_anon = session.exec(
        select(User).where(User.anonymous_id == payload.anonymous_id)
    ).first()
    if existing_anon:
        raise HTTPException(status_code=409, detail="Anonymous ID already exists")

    user = User.model_validate(payload)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


if __name__ == "__main__":
    with Session(engine) as sessio:
        create_user(UserCreate(username="ted", anonymous_id="local-dev-ted"), sessio)
