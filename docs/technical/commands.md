# Dev Commands

## Backend (run from project root)

```bash
uv sync                          # Install Python dependencies
uv run fastapi dev app.py        # Start FastAPI dev server with hot-reload
docker-compose up -d             # Start PostgreSQL (port 2345)
docker-compose down              # Stop PostgreSQL
alembic upgrade head             # Apply database migrations
alembic revision --autogenerate -m "description"  # Create new migration
uv run python -m api.seed             # Seed decks and cards into Postgres
uv run pytest                         # Run backend tests
uv run ruff check                     # Lint (auto-fix with --fix)
uv run ruff format                    # Format code
uv run ty check                       # Type check
uv run pre-commit install             # Install git pre-commit hooks (one-time)
uv run pre-commit run --all-files     # Run all checks manually
```

## Mobile (run from mobile/)

```bash
pnpm install                     # Install dependencies
pnpm start                       # Start Expo dev server
pnpm android                     # Run on Android
pnpm ios                         # Run on iOS
pnpm test                        # Run Jest tests
pnpm db:generate                 # Generate Drizzle migrations
pnpm db:push                     # Apply Drizzle migrations to local SQLite
npx expo export --platform ios   # Verify Metro bundle compiles (catch import errors)
```
