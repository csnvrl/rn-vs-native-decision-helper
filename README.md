# RN vs Native – Decision Helper

A tiny single‑page app to answer a few weighted questions and get a recommendation between **React Native** and **Native**.

## Quick start

```bash
npm install
npm run dev
# or
pnpm install
pnpm dev
# or
yarn
yarn dev
```

Open the printed local URL in your browser.

## Build

```bash
npm run build && npm run preview
```

## Customize

Edit `src/App.tsx` → the `QUESTIONS` constant controls the questionnaire and weights.

## Deploy to GitHub Pages

This project is preconfigured for GitHub Pages using Vite + Actions.

### 1. Repo Settings
In GitHub: Settings → Pages → Build & deployment → Source: GitHub Actions (should auto‑detect once the first workflow run succeeds).

### 2. Push to `main`
A workflow at `.github/workflows/deploy.yml` will:

1. Install dependencies
2. Build the site (`yarn build`)
3. Upload `dist` as a Pages artifact
4. Deploy via `actions/deploy-pages`

### 3. Base Path
Vite `base` is set to `/rn-vs-native-decision-helper/` in `vite.config.ts`. If you rename the repo, update that value accordingly.

### 4. Access URL
After the first successful run, your site will be available at:

```
https://csnvrl.github.io/rn-vs-native-decision-helper/
```

### 5. Local Preview (same base)
Vite will still serve from `/` locally; the `base` only affects build output asset paths.

### 6. Common Troubleshooting
- Blank page after deploy: confirm `base` matches repo name.
- 404 on refresh: Single Page App routing would need a 404.html redirect copy (not required here since only root is used). If later adding routes, duplicate `index.html` as `404.html` in `dist` post-build.
- Old assets showing: Hard refresh or clear cache; GitHub Pages can cache aggressively.

### 7. Manual Redeploy
Trigger via the Actions tab → select the deploy workflow → Run workflow.

## License
MIT — adapt freely.
