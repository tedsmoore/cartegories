# cartegories

A category game for the car! Or the bar! Or the couch!

## Getting started

### Backend

Setup the virtual environment:
```bash
uv sync
```

Run the development server:
```bash
uv run fastapi dev app.py
```

### Frontend

Install [fnm](https://github.com/Schniz/fnm), then:

```bash
fnm install        # installs the Node version from .nvmrc
corepack enable    # enables pnpm via corepack
pnpm install       # install dependencies
```

Run the development mobile app:
```bash
cd mobile
pnpm start
```
