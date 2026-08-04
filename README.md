# Jazmín’s Homepage

Personal homepage built with React, Vite, and TypeScript.

## Project structure

- `src/` — React components, page data, TypeScript types, and site styles.
- `public/assets/` — images, icons, SVGs, and videos only.
- `public/data/` — generated public data consumed by the site.
- `scripts/` — repository automation scripts.
- `.github/workflows/` — contribution syncing and GitHub Pages deployment.

## Development

```bash
npm install
npm run dev
```

## Validation and production build

```bash
npm run typecheck
npm run build
```

Vite writes the deployable site to `dist/`. Compiled JavaScript and CSS live in
`dist/static/`, while `dist/assets/` remains reserved for media resources.

## GitHub contribution data

`scripts/sync-github-contributions.mjs` fetches the rolling 26-week official
GitHub contribution calendar and writes `public/data/github-contributions.json`.
The scheduled workflow refreshes it every six hours, and a successful sync
automatically triggers a new Pages deployment.
