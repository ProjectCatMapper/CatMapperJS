# CatMapper frontend

React and Vite frontend for [CatMapper](https://catmapper.org). It provides dataset upload and editing, search and translation, maps, Network Explorer, administration, account workflows, and the Excel add-in.

## Repository map

- `src/components/` contains the application views and reusable UI components.
- `src/api/`, `src/utils/`, and `src/excelAddin/` contain API, shared, and workbook integrations.
- `tests/` contains Playwright browser tests.
- Co-located `*.test.js` and `*.test.jsx` files contain Vitest unit tests.
- `manifest.xml` and `manifest.dev.xml` configure the Excel add-in.
- `vite.config.mjs` defines the production and development build.

## Requirements

- Node.js 20.19 or newer.
- A local `.env` with the API, Auth0, and Mapbox settings required by the selected environment. Never commit credentials or tokens.

Install dependencies:

```bash
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm start`
### `npm run dev`

Starts the Vite dev server.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Runs unit tests with Vitest.

### `npm run test:watch`

Runs Vitest in watch mode.

### `npm run test:e2e`

Runs Playwright end-to-end tests.


### `npm run build`

Builds the app for production into the `dist` folder.

### `npm run preview`

Serves the built `dist` output locally for preview.

### `npm run addin:validate`

Validates both Excel add-in manifests.

## Testing and review

Before submitting changes, run the checks relevant to the affected surface:

```bash
npm test
npm run build
npm run test:e2e
```

Browser tests require Playwright's browser dependencies and a suitable API/test environment. The Playwright workflow in `.github/workflows/playwright.yml` is currently not a substitute for a verified local browser run; inspect its enabled state when reviewing CI coverage.

## Commit versions and deployment

Enable the repository-managed pre-commit hook:

```bash
git config core.hooksPath .githooks
```

The hook updates the version in `package.json` and `package-lock.json` as part of every commit. Deployment builds and tags that already-versioned commit instead of creating a deployment-only version commit.

Production and development publishing are orchestrated from the CatMapper superproject. Direct production deployment requires a clean, fast-forwardable checkout and the server-specific `.env`.

## Security

Do not commit `.env` files, Auth0 secrets, Mapbox tokens, API keys, exported user data, or production workbooks containing private data. Report sensitive security findings privately to the CatMapper maintainers.
