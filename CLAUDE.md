# Project rules for AI agents

## Attribution — do NOT add AI/Claude attribution anywhere
- Never append `Co-Authored-By: Claude ...` (or any AI co-author) to commit messages.
- Never add "Generated with Claude Code", "Created by Claude", or similar lines to commits,
  PR descriptions, code comments, or any output.
- Write commit messages and PRs as plain, human-authored text with no tool/AI mention.

## Project context
- Static **Astro** site (bilingual ca/es) for FoodCoop BCN. Tailwind v4 design tokens in
  `src/styles/tokens.css`. Content collections (Markdoc) for the blog.
- **No client-side rendering** — content pages must stay pre-rendered with no/minimal JS.
- **Keystatic** CMS is gated behind `ENABLE_KEYSTATIC` (set in `npm run dev` / `npm run cms`);
  production builds omit it. Don't enable it in production builds.
- **Deploy**: push to `main` → GitHub Actions builds and deploys to Netlify (production).
  PRs get a preview deploy. Commit/push only when asked.
- Run `npm run build` to verify before pushing.
