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

## Copy rules (all user-facing text)

Applies to every string a visitor can read: page content, UI labels in `src/i18n/ui.ts`,
content collections (`src/content/**`), blog posts, form copy, alt text, and SEO
`title`/`description` metadata. It also applies to English text in the repo.

### No em dashes
- Never use `—` (em dash) or `–` (en dash) as punctuation. Rewrite with a comma, a colon,
  parentheses, or two sentences.
  - Bad: `Fes-te sòcia — 40 €, retornables`
  - Good: `Fes-te sòcia: 40 €, retornables`
- The hyphen `-` stays available for compounds and for numeric ranges (`10-12 h`), though
  `de 10 a 12 h` reads better in ca/es.
- Exempt: the `—` glyph used as a "no value" placeholder in tables and stat cells
  (always `aria-hidden`, with the meaning carried by an `sr-only` label). That is an icon,
  not punctuation.
- Commit messages and PR descriptions follow the same rule. Existing code comments are
  not worth churning over, but write new ones without em dashes.

### Register: always informal "tu" (ca) / "tú" (es)
- Address the reader as one person, informally. Never `vostè`/`vostès` (ca) or
  `usted`/`ustedes` (es), and never the plural `vosaltres`/`vosotros` for a generic reader.
- Keep the register consistent within a page and between the ca and es versions of the
  same page. Don't mix `tu` forms with impersonal `es pot` / `se puede` in the same block
  when you are speaking to the reader.
- Verb forms, possessives and pronouns must all agree with `tu`:
  - ca: `pots`, `fes`, `vine`, `el teu torn`, `apunta't`, `informa't`, `t'expliquem`
  - es: `puedes`, `haz`, `ven`, `tu turno`, `apúntate`, `infórmate`, `te explicamos`

### Grammar and spelling must be verified, not assumed
Before committing ca/es copy, check it reads as native text:

**Catalan**
- Accents and open/closed vowels: `què` vs `que`, `més`, `sòcia`, `perquè` vs `per què`.
- Geminated l: use the punt volat `l·l` (`col·lectiu`, `cel·la`), never `ll` or `l.l`.
- Weak pronouns and apostrophes: `apunta't`, `informa-te'n`, `l'horari`, `d'aquí`.
- Correct imperatives: `fes`, not `fas`; `vine`, not `véns`.
- Barbarisms: prefer `sòcia` over `socia`, `recollida` over `recogida`, `targeta` over
  `tarjeta`, `cop` / `vegada` over `vez`.

**Spanish**
- Tildes, including on enclitics: `apúntate`, `infórmate`, `está`, `más`, `aquí`.
- Interrogative and exclamative accents: `qué`, `cómo`, `cuándo`, `dónde`.
- Opening marks are required: `¿...?` and `¡...!`.
- Gender and number agreement throughout (`las socias`, `los productos ecológicos`).

**Both**
- Don't machine-translate one language into the other word for word. Each version must be
  idiomatic on its own.
- Keep terminology consistent with the glossary already used on the site (`sòcia`/`socia`,
  `torn`/`turno`, `quota`/`cuota`, `cistella`/`cesta`).
