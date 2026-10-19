# Ready-made agent prompts

Paste one into a fresh agent that has its own worktree. Start each with: "Read AGENTS.md and CLAUDE.md first." Prompts 1 and 2 must land alone and in order; 3–6 are independent of each other and touch different files.

Common rules for every prompt: seeded RNG only, cards stay plain data, bump `SCHEMA` + add a `MIGRATIONS` step if the `Run` shape changes, tests in a new test file, `npm test` + `npm run check` + `npm run build` green, tick the ROADMAP box, add a short CLAUDE.md bullet and a `CODEX` entry for player-facing systems, commits ending with the required Co-Authored-By trailer. Final report: branch, commits, how to see it in game, risks.

## 1. Save size guard (strongest model)
Task: ROADMAP P1 "Save size guard".
- In `src/lib/game/engine.ts`, snapshots used by `rememberForUndo` / `keepRestorePoint` keep only the last 40 `log` entries and no `trend` history beyond 60 points.
- Add `fflate` as a dependency and compress saves with it (`strToU8` + `zlibSync`, base64) behind `exportRun`/`parseRun`; `parseRun` must still read old plain-JSON saves.
- Wrap every `localStorage.setItem` for the run in try/catch; on `QuotaExceededError` drop restore points, retry, and show a toast.
- Test: a 3000-step pilgrim journey with assignments stays under 1 MB; old v4 JSON saves still load.

## 2. Split engine.ts (strongest model)
Task: ROADMAP P1 "Split engine.ts". Pure refactor, no behaviour change.
- New folder `src/lib/game/engine/`: `arrival.ts`, `choose.ts`, `endings.ts`, `saves.ts` (SCHEMA, MIGRATIONS, parse/export/import, repairRun), `undo.ts`. `engine.ts` re-exports everything so no import elsewhere changes.
- Verify with the same seeds: `npx tsx scripts/sim.ts 400 courier` must print identical numbers before and after.

## 3. Guild rank and warehouse (mid-tier model)
Task: ROADMAP P2 "Guild rank + warehouse".
- New `src/lib/game/guild.ts`: `run.guild` rank 0–5 from trade volume; `run.warehouse` (already in types) holds goods in up to 3 cities; `store`, `retrieve`, `shipTo` (costs days and silver, risk on sea routes).
- New `src/lib/game/cards/guild.ts`: rank-up ceremony, guild contracts, a rival guild, a warehouse fire.
- UI: a "Warehouse" section in Drawer → World and a button in `Market.svelte` when one is here. Only small additive edits to shared files.

## 4. Japanese and Chinese campaign texts (cheap model)
Task: ROADMAP P3 "Japanese and Chinese campaign texts".
- Follow how Indonesian titles/blurbs are done in `src/lib/i18n.svelte.ts`; add `ja` and `zh` for every campaign title and blurb in `src/content/campaigns/*.md`.
- Run `npm run fonts` afterwards so new CJK glyphs are bundled; check one page offline in the prod preview.

## 5. Keyboard play and contrast audit (mid-tier model)
Task: ROADMAP P5 "Keyboard play" and "Contrast and focus audit".
- Key handling in a new `src/lib/keys.svelte.ts` wired once in `+page.svelte`: ←/→/↑ swipe, 1–9 routes, `J` journal, `Esc` closes the top modal; ignore keys while typing in inputs.
- Check text/background pairs in every culture theme (`data/themes.ts`) against WCAG AA; fix tokens, not individual components. Add visible `:focus-visible` rings.
- Verify in the browser at 1440×900 and 375×812; add one Playwright test for keyboard swipes.

## 6. Per-profession balance sim (cheap model)
Task: ROADMAP P4 "Per-profession and per-goal sim".
- Extend `scripts/sim.ts` with `--by profession|goal` that prints win rate, average days and top ending per group, and flags groups more than 10 points from the mean.
- Do not change game numbers; report the outliers in the final message only.
