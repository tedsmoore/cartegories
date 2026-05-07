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

### Claude Code (optional)

If you use Claude Code, the Expo plugin is worth installing. It bundles skills for the dev client, EAS deployment, SDK upgrades, and CI/CD workflows.

```
/plugin install expo@claude-plugins-official
```
