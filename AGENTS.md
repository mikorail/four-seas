# AGENTS.md: Four Seas

Reigns-style swipe game plus an 80 Days-style travel globe, set in Asia (and beyond) from 1500 to 1900. You are a courier with a commission, a deadline and a life of your own. Fully client-side static PWA, no backend. Deep architecture notes are in `CLAUDE.md` (system by system; read it before touching `src/lib/game/`). Open work is in `ROADMAP.md`. Visual direction is in `DESIGN.md`. Card and campaign authoring is in `src/content/README.md`.

## Stack
SvelteKit 3, Svelte 5 runes, TypeScript, `adapter-static` (SPA, `ssr=false`, fallback `200.html`). Runtime deps: `d3-geo`, `topojson-client`, `world-atlas`, `@fontsource/*`, optional `@anthropic-ai/sdk` + `zod` (bring-your-own-key cards, lazy). Globe is SVG (`geoOrthographic`). Saves live in `localStorage`.

## Commands
Node must be v22+ (Vite 8). The machine default is older, so every npm script goes through `scripts/run-with-nvm.sh` (nvm v24).
- `npm install`
- `npm run dev` serves on http://localhost:5173 (port is strict; never start a second dev server)
- `npm test` runs vitest (about 130 tests incl. a fuzz test of every engine feature)
- `npm run check` runs svelte-check (must show 0 errors)
- `npm run build` writes the static site to `build/` (regenerates CJK fonts and content first)
- `npm run e2e` runs Playwright on a production build (desktop, phone, offline)
- `npm run e2e:monkey` random-clicks the real UI hunting crashes (slow, run alone)
- `npx tsx scripts/sim.ts 400 courier` balance sim; baselines pilgrim ~91% · courier ~80% · ronin ~64% · legend ~45%
- `npx tsx scripts/campaign-sim.ts` plays every Markdown campaign

Always run `npm test` and `npm run check` before finishing a change; run the sim after touching odds, stats or difficulty.

## Layout (short)
- `src/lib/data/`: static tables (world, cultures, faiths, traits, items, skills, goals, voices, venues, market, codex). No run state.
- `src/lib/game/`: engine. `engine.ts` holds `newRun`, `choose`, `depart`, arrival, endings, saves and migrations; features live in their own files (`life.ts`, `people.ts`, `market.ts`, `events.ts`, `turmoil.ts`, `thoughts.ts`, `tales.ts`, `langs.ts`, `bag.ts`, …).
- `src/lib/game/cards/`: card templates (`Template` with `weight`, `where`, `once`, `rare`, `make`), registered in `cards/index.ts`.
- `src/content/`: Markdown cards and campaigns, bundled by `scripts/content.mjs` into `src/lib/content/raw.gen.ts`.
- `src/lib/components/`: Svelte UI. `src/routes/+page.svelte` is the game shell (globe stage + side panel).

## Rules that will bite you
- **Serializable cards:** Card, Choice and Outcome are plain data saved mid-run. No functions, no class instances.
- **Determinism:** use the run's seeded RNG (`c.rng`, `Rng` from `#lib/rng`), never `Math.random()` in engine or card code. Daily journeys must replay identically.
- **Saves:** when the `Run` shape changes, bump `SCHEMA` and add a step to `MIGRATIONS` in `engine.ts`, and default new fields with `??`. `repairRun` must still untangle any old save.
- **Never strand the player:** closed roads, wars, disasters and detours always keep at least one way out. Fuzz and monkey tests check this.
- **Template weights:** a weight of 0 filters the card; guard anything `make` dereferences (crew, mount, romance) in `weight`.
- **Hidden option:** `card.up` always carries a `why` (trait, item, companion or skill that unlocked it).
- **Soft caps:** stat gains are damped ×0.55 above 70 and ×0.35 above 88; caps grow via `capOf`. Keep in mind when tuning.
- **Luck is not morality:** mercy/cruel choices never change Fortune.
- **Imports:** Node subpath imports. `#lib/*` maps to `src/lib/*.ts`; directories need `/index` (`#lib/game/cards/index`).
- **CJK glyphs:** after adding new CJK characters run `npm run fonts` or they render as tofu offline.
- **Content:** cultures and faiths are real; keep them respectful. No sacred figures of living faiths as villains.
- **Copy style:** short, concrete card text; commit messages and comments short and factual.

## Working with several agents at once
Same playbook as Realmforge.
1. **One git worktree per agent**, each on its own branch. Never let two agents edit the same checkout.
2. **Disjoint files.** New features go in new files (`game/<feature>.ts`, `cards/<feature>.ts`). Shared files (`engine.ts`, `types.ts`, `cards/index.ts`, `+page.svelte`, `Drawer.svelte`) get only tiny additive edits: an optional field, one hook call, one registry line.
3. **Waves.** Refactors (e.g. the `engine.ts` split) land first and alone, then features in parallel.
4. **Small prompts.** Name the roadmap item, files to read first, verify commands, commit trailer, and a short final report.
5. **Merge one branch at a time**; keep both sides when two agents appended to the same list. Run `npm test`, `npm run check`, `npm run build` after every merge.
6. **Update docs.** Tick `ROADMAP.md`, add a short bullet to `CLAUDE.md`, and a `CODEX` entry in `data/codex.ts` for any player-facing system.
7. **Verify in a browser when UI changed** (`preview_start` "four-seas", set a viewport, inject a run via `exportRun`), then clear `four-seas:run` and `four-seas:tips`.

Ready-made prompts for the open roadmap items are in `docs/AGENT_PROMPTS.md`.

## Deploy
Static site: `npm run build`, publish `build/`. Needs HTTPS for the service worker; serve `200.html` as SPA fallback and the service worker with `no-cache`. Production preview: `scripts/prod.sh` (port 5194).

## Status
Core game is complete (Milestones A–M). Open items: see "Next: prioritized TODO" in `ROADMAP.md`.
