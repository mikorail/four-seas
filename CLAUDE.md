# Four Seas

Reigns-style swipe game + 80 Days-style world travel, set in Asia (and beyond) 1500–1900. Fully client-side, static, installable PWA.

## Stack
SvelteKit 3 + Svelte 5 runes + TS, `adapter-static` (SPA, `ssr=false`, fallback `200.html`). Map: `d3-geo` + `topojson-client` + `world-atlas/land-50m` (lazy). Optional Claude cards: `@anthropic-ai/sdk` (lazy, browser, BYO key) + `zod`. Tests: `vitest`. No backend; saves in `localStorage` (`four-seas:run` v2, `four-seas:chronicle`, `four-seas:sound`, `four-seas:claude`).

## Run
- Agent rules + parallel-work playbook: `AGENTS.md`; agent prompts for open items: `docs/AGENT_PROMPTS.md`. Roadmap / status: `ROADMAP.md`. Card & campaign authoring guide: `src/content/README.md` (in-game editor at `/editor`).
- Node version: Vite 8 requires Node >= 22 (system node v21 too old). `.nvmrc` specifies `v24.14.0`, and `scripts/run-with-nvm.sh` automatically wraps `package.json` scripts (`npm run build`, `npm run dev`, `npm test`, etc.) to use the available nvm Node v24.
- Dev: `npm run dev` or `./scripts/dev.sh`. Port 5173 (strict — set in `vite.config.ts`). Preview configs "four-seas" (dev) and "four-seas-prod" (`scripts/prod.sh`: build + `vite preview` on 5194 — the only place the service worker/offline actually runs) live in the parent `claude-projects/.claude/launch.json`.
- `npm run check` · `npm test` (vitest; `pretest` bundles content) · `npm run e2e` (Playwright on a production build, desktop + phone, incl. offline) · `npm run build` → `build/` (`prebuild` regenerates CJK fonts + content).
- `npx tsx scripts/campaign-sim.ts` — plays every campaign; reports beats seen + endings.
- Balance sim: `npx tsx scripts/sim.ts 400 [difficulty] [hardship]`. Baselines (2026-10-16): pilgrim ~94% · courier ~81% · ronin ~69% · legend ~43% · courier+deaths-door 11%.

## PWA / phone
- `static/manifest.webmanifest` (shortcuts `/?daily=1`, `/?chronicle=1`), icons in `static/`, safe-area padding + no overscroll in `app.css`, `PwaBar.svelte` (install prompt, iOS "Add to Home Screen" hint, update-ready → `SKIP_WAITING`, persistent storage, offline badge).
- Service worker lives in `src/service-worker/index.ts` with its own `tsconfig.json` extending `$app/tsconfig/service-worker` (Kit 3 requirement). It only reloads the page on a real update (not on first install).
- Service worker precaches the app, static files, Latin/Vietnamese font subsets and `/fonts/*` (CJK). Matching uses `ignoreVary` (preview server sends `Vary: Origin`; module/font requests carry Origin). It does nothing in dev.
- Fonts are self-hosted via `@fontsource/*`. CJK: `scripts/cjk-fonts.mjs` scans `src/` for CJK glyphs, copies only the Shippori Mincho subsets that contain them to `static/fonts/` and writes `src/lib/fonts-cjk.css` (import it relatively — `#lib/*` appends `.ts`). Run `npm run fonts` after adding new CJK characters.

## Imports
Kit 3 uses Node subpath imports, not `$lib`. `package.json#imports`: `#lib/*` → `src/lib/*.ts`; `#lib/components/*` and `#lib/assets/*` pass through (keep `.svelte`/`.svg`). Directories need an explicit `/index` (e.g. `#lib/game/cards/index`). Service worker uses Kit 3 modules `$app/manifest`, `$app/env`, `$app/service-worker`.

## Layout
- `src/lib/rng.ts` — seeded mulberry32; engine persists `run.rng` between actions → runs reproducible from seed. Daily journey seed = `daily-YYYY-MM-DD`.
- `src/lib/data/` — `difficulty.ts` (4 difficulties, 7 hardship starts, `PERK_TILT` easier/harder per trait, score multiplier), `faiths.ts` (10 faiths with holy cities, culture/city religion, `kindred` syncretism, 7 ideals with love/hate tags), `themes.ts` (per-culture art style: palette + motif tile → `themeStyle()` CSS vars, `.themed` in app.css), `cultures.ts` (13 cultures, era-aware ruler/hat), `world.ts` (~115 cities, SEA/RIVER/LAND edge strings with optional `@year`, vessels by era, Dijkstra), `traits.ts` (stats, traits, professions; `unlock` field = locked until Chronicle rule), `items.ts` (items/relics, bags, mounts, crew roles — passive effects are `Perk`-shaped).
- `src/lib/game/`
  - `types.ts` — `Run` v2: bag/bagKind, mount, crew, heat, rival, legends, month0, daily.
  - `mods.ts` — `perksOf(run)` merges profession + traits + carried gear + crew; `modFx`, `gambleBonus`, `weightMult`, `travelMult` (mount, guide, navigator).
  - `economy.ts` — calendar/seasons (typhoon, monsoon, winter by route culture+mode), dynamic sell/buy prices.
  - `engine.ts` — newRun (commission, rival, starting kit), availableRoutes, depart (wages→loyalty, fatigue, heat decay, mount wear), choose (`left|right|up`, gamble outcomes with side effects, items/mount/crew/flags, `loy:<id>` flags, relic rescues), endings (incl. `jailed`, `second`), useItem/dropItem/dismiss, score, save/load.
  - `chronicle.ts` — meta-progression across runs; `RULES` map unlock id → condition.
  - Engine extras: conscience (ideal love/hate tags → ±3 fortune), devotion (+4 fortune for `faith` choices among kindred faith), quests (`run.quests`: contract/bride/relic/cure/map with `item`/`needs`/`visit`/`ward`, resolved on arrival), conversion, difficulty knobs (odds, soft cap, loss cushion, wages, rival speed, deadline).
  - `cards/` — `faith.ts` (pilgrimage, missionaries, fellow believers, forbidden feasts, fasts, Akbar's Ibadat Khana, fumi-e, Shimabara, Rites controversy, langar, ideal tests), `stories.ts` (delivery contracts, royal bride, stolen relic, plague cure, cartographer survey), `helpers.ts` (Ctx, npc, odds, `up()` hidden option), `travel.ts`, `city.ts` (markets, luggage, beast trader, outfitter, hiring), `underworld.ts` (crime/heat + retinue/mount events), `era.ts` (historical events), `legends.ts` (18 legends + codex `LEGENDS`), `arcs.ts` (rival, ronin, Jesuit, lost heir — staged via `arc:<name>` flags), `index.ts` (`TEMPLATES`, reactive stat-edge cards, `buildDeck`).
- `src/lib/ai.ts` — Claude card generator (`claude-opus-5-5`, effort low, JSON schema output, server-side fallbacks, zod-validated, fx clamped ±18). One per city visit, inserted after the current card.
- `src/lib/audio.ts` — Web Audio synth (plucks, swipe whoosh, coins, gong, sea waves) + haptics. Off by default.
- `src/lib/share.ts` — 1080×1350 PNG share card (canvas; portrait SVG inlined with resolved CSS vars).
- `src/lib/components/` — `Portrait` (8 facial "folks": eye/nose/lip/brow/jaw/hair-texture/facial-hair per people + bindi, nose ring, kohl, turquoise, ohaguro, beni), `CityScene` (procedural skylines per culture / sea / land), `SwipeCard` (swipe up = hidden option), `Swipeable`, `Creator` (locked perks), `StatBar`, `WorldMap` (taller on phones, rival marker), `JourneyStrip`, `Drawer` (Bag / Retinue / Ledger / Journal), `ChronicleView`.
- `src/service-worker.ts` — precache + cache-first; never touches `api.anthropic.com`.

## Systems added 2026-10-13
- Merit (`run.karma`) + ties (`run.ties`): mercy/cruel tags (or `remember:`) record people who return later via `cards/karma.ts`. Mercy/cruel choices never change Fortune — luck ≠ morality. Ideals affect Vigor.
- Calendar: `game/calendar.ts` (Gregorian/lunar/Hijri/Easter, festivals) → `cards/festivals.ts`; header shows local reckoning.
- Standing per culture (`run.standing`), ventures (`game/ventures.ts`, `run.ventures`, `run.treasury`, bank in Fleet tab), dynasty (`successors`, `legacyOf`, `run.lineage`/`generation`).
- World events (`game/events.ts`, `run.world`): typhoon tracks, spreading plague, wars closing land borders (never strands the player); cards in `cards/world.ts`.
- Secrets: `SECRETS` in `data/world.ts` (hidden edges + 4 hidden cities, `secret: true` → not "existing" unless via a secret edge); clues & hidden-place cards in `cards/secrets.ts`; flags `secret:<id>`.
- Content: Markdown cards/campaigns in `src/content/**` → `scripts/content.mjs` → `src/lib/content/raw.gen.ts` (also a Vite plugin) → `lib/content/parse.ts`. Campaigns disable auto-victory; endings via `ending:`.
- Mini-games (`components/games/*`, `MiniGame.svelte`) decide `gamble`-tagged choices via `choose(run, side, forceWin)`.
- Presentation: `Portrait` moods + blink, `LegendArt`, generative regional music (`audio.ts` → `playMusic`), i18n UI (`lib/i18n.svelte.ts`, `t()`; translations excluded from the CJK font scan), accessibility (aria-live announcer, reduced motion, Okabe–Ito colors, large text).
- Map is Pacific-centred (`ROT = 140`), routes crossing the Atlantic seam wrap.

## Systems added 2026-10-13 (later)
- Venues (`data/venues.ts`): every city has an inn; towns in `TINY` have little else; others get square (alun-alun/maidan/meydan…), temple, market or great bazaar, harbour, palace, academy, bridge, landmark (era-gated, e.g. Taj from 1653), festival. `VenueIcon.svelte` ink icons, `VenueBar.svelte` in map + city phase. Visiting a venue unshifts its card (`cards/venues.ts`, `visitVenue`), once per stay (`flags.stay`, `v:<id>`).
- Energy: `run.energy`, `energyMax()` in `game/market.ts` (difficulty base 4/3/3/2, ±vigor, +1 tidy Meticulous). Venues and first market open cost 1; `restDay` refills; inn room `energy: 2`. Campaign header `energy: unlimited|N`.
- Market (`data/market.ts`, `game/market.ts`, `Market.svelte`): outfits (`run.outfit`, perk via `perksOf`, `hat`/`robe` override on Portrait, `local` → no `foreign` tag), curios (sell 2–3× where `prized`), secret-route charts, riddle maps (`RiddleDialog`, `solveRiddle` → treasure quest), extra bags. Cards gate on `dressed(c, …)`; Markdown `requires_outfit`, choice `outfit:`.
  - Stock limits: Garb stock is strictly 1 per stay (0 if already carried). Map stock is strictly 1 (charts & riddles). Supplies have per-stay stock limits. Buy buttons are disabled and labeled "Sold out" when stock is 0.
  - Outfits in inventory (transmog): All outfits are physical items in `ITEMS` (`kind: 'outfit'`, tile shapes in `bag.ts`). Buying places them in `run.bag` and equips them; players can equip, swap, unequip ("Take off"), or drop/sell second-hand directly from the Bag grid.
  - Consumables for ailments, effects & stat management: `fever-tonic` & `ginseng-tonic` (fever / low vigor cure; saves from vigor death), `incense` & `rice-wine` (clears wanted `heat` / suspicious eyes), and stat reduction items (`ascetic-tea` reduces renown, `calming-draught` reduces manic vigor, `joss-paper` reduces excessive fortune, `alms-pouch` reduces dangerous silver) to prevent lethal 100-stat game overs (`*-high` endings).
- Romance (`cards/romance.ts`, `run.romance`, Choice/Outcome `romance`): meet → letters → family/rival → proposal → wedding by culture; affection decays while apart.
- Rebellions (`cards/rebellion.ts`, `UPRISINGS` ×15): `rev:<id>` rebel/crown/both, missions underground/battlefield/intrigue (`revp:<id>` via Choice `bump`), turncoat offers, climax by history. Campaigns `java-war.md`, `katipunan.md` play both sides.
- Traits: flaws (`flaw: true`, `opposite`), `likedBy`/`dislikedBy` roles → `rapportOf` (±6% odds/step, ±12%/10% fx), shown on cards; `mercurial` → `moodOf`. Creator: ≤3 virtues + ≤2 flaws; `randomHero` never picks flaws.
- Tile bag (`game/bag.ts`, `BagGrid.svelte`): item shapes (`shapeOf`), packs = main bag + mount packs + `run.extraBags`; `run.grid` placements synced with `run.bag` (`syncGrid`; `addItem` uses `canFit`); tidy = everything pushed top-left (`flags.tidy`, Meticulous ±).
- Game over: `endingCause()` + `EndingWhy.svelte` (stat sparkline from `run.trend`, last straw from `log[].fx`, run-up, tip).
- Profession quests (`src/content/cards/profession-*.md`): multi-beat quest lines for all 11 professions via `# beat: id` with `requires_profession:` / `profession:`, giving unique narrative arcs, dilemmas, and titles.
- Journal book export (`lib/journal-book.ts`, `Drawer.svelte`): downloads complete travel log as a self-contained, printable HTML book with frontispiece, chapters per city/leg, drop caps, and `@media print` styling.
- Touch drag-and-drop (`BagGrid.svelte`): pointer events (`pointerdown`, `pointermove`, `pointerup`) with active floating drag ghost and coordinate-to-grid snapping for mobile phones/tablets.
- Pilgrims Road balance (`src/content/campaigns/pilgrims-road.md`): added realistic monastery hospitality, alms bowls, and reduced bandit silver demands, reducing Penniless deaths from ~31% down to ~14%.
- Accident & Unmarked Settlement Detour mechanic:
  - Travel hazards (`accident-shipwreck`, `accident-rockslide`, `accident-sandstorm`, `accident-river-spate` in `cards/travel.ts`) can trigger a detour (`run.flags.detour`) on rough routes.
  - Generates an intimate 3-card mini-deck (`buildDetourDeck`) set in off-the-map settlements (`UNMARKED_T`: herbalist, wandering scholar, mountain shrine, highland guide, dilemma) with `scene: 'rustic'`.
  - Preserves `run.route` and destination city lookups; clears detour and smoothly resumes the original journey upon completion.
  - Atmospheric journal prose openers generated via `sceneLine` for rustic settlements.
- Local Legends expanded to 24:
  - Activated Ching Shih (`ching-shih`) and added 6 new cultural legends: Nasreddin Hodja (`nasreddin`), Sun Wukong (`sun-wukong`), Nyai Roro Kidul (`roro-kidul`), Dokkaebi (`dokkaebi`), Garuda (`garuda`), and Al-Khidr (`al-khidr`).
  - Added new relics in `ITEMS`: `garuda-feather`, `dokkaebi-token`, `emerald-sash`.
  - Illustrated ink-wash SVG vector art in `LegendArt.svelte` for all 24 legends.
- Rustic Visual Polish & Venues:
  - Added rustic venue IDs (`hearth`, `well`, `herbalist`, `shrine`) in `venues.ts` and custom SVG glyphs in `VenueIcon.svelte`.
  - Added rustic skyline mode in `CityScene.svelte` (thatched roof cottages, smoking hearth chimneys, rolling hills) rendered when `card.scene === 'rustic'` or in detours.
- Game Balance Tuning:
  - High renown and fortune reactive cards (`r-famous`, `r-blessed`) now provide proactive ways to deflect scrutiny or give alms instead of unavoidable stat death.
  - Soft-cap dampening in `applyFx`: stat gains above 88 are scaled down to 0.35x.
  - Adjusted deadline margins in `newRun` (`* 1.65 + 16`).
  - Updated simulation win rates: Pilgrim: 87%, Courier: 75%, Ronin: 66%, Legend: 52%.
- Freedom Way of Life & Settle Down (`settle` in `engine.ts`, `Drawer.svelte`):
  - Settle peacefully in any visited city to conclude the run on the traveler's own terms (`EndingKind = 'settled'`).
  - Personalized epilogue based on local romance, family home, trade house, or temple devotion; records a positive chronicle ending.
- Faction Reputation System (`types.ts`, `data/traits.ts`, `market.ts`, `Drawer.svelte`):
  - 5 factions: Outlaws (`outlaw`), Religious Orders (`faith`), Imperial Crown (`crown`), Mercenary Companies (`mercenary`), and Merchant Guilds (`guild`).
  - Standing tracked in `run.factions` (-100 to +100) via Choice/Outcome `faction`.
  - Faction standing drives merchant discounts (Guild 15%, Outlaw 20% on contraband, Faith 15% on medicine), dialogue choices, and Drawer standing indicators.
- Permanent Traits Acquired Mid-Journey (`data/traits.ts`, `engine.ts`):
  - Dynamic traits earned through deeds and dilemmas: `battle-hardened` (combat resilience), `haggler` (market silver edge), `cautious` (hazard avoidance), `reckless` (gamble multiplier), `ascetic` (reduced rations & worldly needs).
  - Choice outcomes support `traitAdd` and `traitRemove`.
- Permanent Ailments & Spiritual Boons (`types.ts`, `data/traits.ts`, `mods.ts`, `engine.ts`):
  - Conditions tracked in `run.statuses`: ailments (`one-eyed`, `limp`, `miasma-lung`, `battle-scarred`) and boons (`enlightened`, `master-courier`, `blessed-hands`, `oath-keeper`).
  - Affects gameplay directly: `limp` (+14% travel days), `master-courier` (-12% travel days), `one-eyed` (-5% gamble odds), `enlightened` (+8% gamble odds). Displayed under Conditions in Drawer.
- Branching Storylines & Continuing Assignments (`nextAssignment` in `engine.ts`, `+page.svelte`):
  - Upon completing the primary commission, couriers can take on a new grand assignment across the four seas.
  - Preserves active side quests (`run.quests`), riddle treasures, and delivery contracts while rolling a new destination, item, and deadline. Awards `master-courier` status.
- Unique Iconic City Skylines (`CityScene.svelte`):
  - Handcrafted architectural silhouettes for 17 major historical cities: Kyoto (To-ji pagoda & Torii), Beijing (Tiananmen Meridian Gate & corner watchtowers), Edo (Castle keep & Mt. Fuji), Samarkand (Registan iwan & turquoise dome), Constantinople (Hagia Sophia & 4 minarets), Venice (Campanile & Doge's palace), Agra (Taj Mahal & minarets), Malacca (Sultan palace & A Famosa), Lhasa (Potala Palace & Himalayas), Batavia (stepped gables & drawbridge), Nagasaki (Dejima & VOC ship), Canton (Thirteen Factories & Flower Pagoda), Ayutthaya (Wat Chaiwatthanaram prangs), Baghdad (Abbasid arch & spiral minaret), Nara (Todai-ji Daibutsuden), Manila (Intramuros & San Agustin), Alexandria (Qaitbay citadel).
- World Map Zoom & Focus Controls (`WorldMap.svelte`):
  - Extended zoom range from 0.75x to 8.5x with relaxed pan boundaries for complete bird's-eye viewing.
  - Added quick-focus buttons: `🎯 Focus Route` (centers on destination with optimal scale), `🌐 World View` (resets to full globe view), and `◎ Here` (centers on current city).
- War & Invasion Accidents (`events.ts`, `market.ts`, `cards/world.ts`):
  - Dynamic warzone detection via `isWarZone(run, cityId)` based on active conflicts in `run.world.wars`.
  - Warzones trigger critical supply price spikes (1.85x on rations, medicine, weapons) and special dilemma cards (military checkpoints, refugee caravans, field hospitals) offering trait and status rewards.
- Wandering Caravans & Nomadic Encampments (`events.ts`, `WorldMap.svelte`, `cards/travel.ts`):
  - Seasonal mobile waypoints moving along historical trade corridors: Kirghiz Nomadic Aul, Great Hajj Pilgrim Caravan, Ancient Tea-Horse Caravan, and Bugis Spice Flotilla.
  - Intercept encounters grant safe wartime escort, tariff-free nomadic barter, campfire feasts, and pathfinder guides. Rendered as animated yurts `⛺` and sails `⛵` on `WorldMap.svelte`.
- Wilderness Survival & Foraging (`items.ts`, `cards/travel.ts`, `cards/index.ts`):
  - Stranded detour accidents feature item-aware survival and foraging beats: `survival-camp` (pitching oiled umbrella bivy, striking campfire with flint & steel), `survival-foraging` (field-dressing mountain game with hunting knife, brewing fever tonics with tea bricks), `survival-coastal` (tide pool foraging, shipwreck flotsam salvage), `survival-mount-care` (field poultices for strained mount hocks).
  - New survival tools: `hunting-knife` and `flint-steel`.
- Folkloric Cryptids & Celestial Omens (`events.ts`, `cards/world.ts`, `WorldMap.svelte`):
  - Dynamic celestial omens: The Great Broom Star (Comet), Phosphorescent Red Tide (Sea of Ghosts), Solar Eclipse, Altai Sky-Fire (Aurora). Shift public mood, provoke panic/fasting, open imperial infiltration opportunities, and render celestial glyphs on `WorldMap.svelte`.
  - Folkloric cryptid encounters: The Qilin in sacred bamboo (requires high karma $\ge 25$, bestows `blessed-hands` or `enlightened`), The Baku (dream eater consuming nightmares and purging `miasma-lung`), and The Umibozu (sea monk titan of midnight squalls).
- Rural Micro-Histories & Generational Dynasty Memory (`engine.ts`, `cards/travel.ts`, `items.ts`):
  - Heirs in Dynasty mode inherit ancestral heirlooms (`ancestral-crest` or `heirloom-blade`) and carry forward ancestral deeds.
  - Generations 2+ trigger bespoke rural encounters: `dynasty-ancestors-well` (elders recognize family clan crest from a well built decades ago), `dynasty-spared-lineage` (outlaw chieftain honors forebear's mercy and escorts party), and `dynasty-sacred-tree` (sapling planted by ancestor grown into a colossal sacred ginkgo).
- Inkle *80 Days*-style 3D Globe World Map (`WorldMap.svelte`):
  - True 3D spherical Earth projection using `geoOrthographic()`, `geoInterpolate()`, `geoDistance()`, and `geoPath()` with `.clipAngle(90)`.
  - Seamless deep zoom range from orbital planet view (`scale = 220`) right down to intimate city/route detail (`scale = 3400+`).
  - Signature *80 Days* camera framing: Gaussian tilt function places the curved planetary horizon across the upper sky with realistic oblique perspective while keeping the active regional journey centered in the viewport.
  - Atmospheric presentation: Twilight/dawn celestial sky gradient (`#skyGrad`), starlit celestial backdrop, soft atmospheric glowing halo along the planetary limb (`feGaussianBlur`), and rich oceanic depth gradient (`#oceanGrad`).
  - Great Circle route rendering: Traveled trail rendered as a vibrant, thick vermilion ribbon (`stroke="var(--vermilion)"`) with glowing underlay and visited station nodes; available routes rendered as luminous mode-tinted arcs (jade sea dashed lines, azure rivers, golden sand roads) with pulsing destination beacon.
  - Adaptive city typography: Smart horizon culling fades city labels as they approach the limb of the sphere, preventing distortion or edge clutter; adaptive zoom density ensures major hubs and reachable destinations stay clear and legible.
  - 1:1 spherical drag physics for both mouse and touch pointers, pinch zoom, smooth momentum animation (`animateTo`) with cubic ease-out for `◎ Here`, `🎯 Focus Route`, `🌐 World View`, and `+`/`−` zoom steps.
- Day & Night Diurnal Cycle (`time.ts`, `WorldMap.svelte`):
  - Diurnal time progression (Dawn, Day, Dusk, Night) with astronomical subsolar tracking and seasonal declination.
  - Real-time spherical solar terminator shadow on the 3D Globe using `d3-geo` `geoCircle()`, with golden night city lights glowing across the dark hemisphere.
  - Dynamic diurnal sky gradients responding to time of day (fiery magenta/gold sunrise at dawn matching screenshot, bright sunlit azure at day, burning amber at dusk, and deep starlit space at night).
  - Top HUD pill: displays `{currency} {silver} · DAY {day} · {DOW} · {timeStr}`.
  - Conveyance roundel badge on active routes (airship, sailing ship, steamer, steed, camel).
- Multicultural Iconography Customization (`settings.svelte.ts`, `+page.svelte`):
  - Configurable in Settings: `multicultural` (adaptive regional currencies and symbols: Arabic dinar `د.ع`, Indic rupee `₹`, Malay real `🪙`, Far Eastern silver `銀`, Western pound `£`), `heraldic` (minimalist high-contrast vector roundels from *80 Days*), and `woodblock` (classic Far Eastern calligraphy and woodblock ink stamps).
- Interactive Zoomable City Fresco Panorama (`CityFresco.svelte`):
  - Dedicated full-bleed architectural and nautical panorama matching *80 Days* city arrival screens (e.g. Port Royal).
  - Grand typography with uppercase city title and cultural blurb.
  - Diurnal lighting: sky, ambient tint, starfield, and glowing lantern windows adapt dynamically to Dawn, Day, Dusk, or Night.
  - Multi-layered vector depth: far mountain ridges (Fuji/Himalayas), midground citadels/palaces/pagodas/minarets/palms, foreground high-contrast tall ships with billowing sails or caravans, and rolling cloud mist along the base.
  - Interactive Zoom & Pan: zoom from 0.75x to 2.6x to inspect intricate rigging and battlements, drag to pan across the panoramic skyline, with `+`/`−`/`Reset` controls.
  - Bottom venue action roundels: Market (scales), Hotel/Inn (bed), Landmark/Harbour (anchor/crown), Routes (compass) allowing direct interaction. Seamless toggle between 3D Globe Map (`🌐`) and City Fresco (`🏙️`).
- Extensive City & Route Expansion (`world.ts`):
  - 27 new historical cities added across Joseon Korea (`kaesong`, `jeonju`, `gangneung`, `jeju`, `uiju`), Feudal Japan (`kanazawa`, `sendai`, `hiroshima`, `shimonoseki`, `naha`, `matsumae`), China & Silk Road (`datong`, `luoyang`, `wuhan`, `chongqing`, `khotan`, `yarkand`, `hami`, `kham`), Nusantara & SE Asia (`semarang`, `surabaya`, `banjarmasin`, `patani`), and Central Asia/Persia/India (`tashkent`, `shiraz`, `yazd`, `pondicherry`).
  - All connected via geographically coherent `SEA`, `RIVER`, and `LAND` routes.
- Procedural City Lore & Street Rumor Engine (`prose.ts`, `getCityLore`):
  - Generates deterministic, time-aware diurnal atmosphere (dawn, day, dusk, night), seasonal weather, authentic street rumors across 10 regional cultures, trade specialties, and poetic headlines.
  - Surfaced in `.routes` drawer card and city arrival screens.
- UI Overhaul & 3D Globe Hero Presentation (`+page.svelte`, `WorldMap.svelte`):
  - Desktop layout expands up to 1420px (`min(96vw, 1420px)`) to give the 3D globe cinematic scale without crowding.
  - Globe height dynamically scales to 640px–660px.
  - 4-quadrant cartographic label staggering (`labelOffset`) preventing text collisions between neighboring cities in dense regions.
  - Clean lacquer `.routes` card with culture badges, lore banners, and scrollable departure routes.
  - Culture-sensitive pack horse `🐎` vs desert camel `🐪` iconography.

## Systems added 2026-10-14
- Layout: globe is the stage (`.stage`, `WorldMap fill` / `CityFresco fill`), everything textual lives in `.panel` (right sidebar ≥900px; bottom sheet under a 42dvh globe on phones). Panel children must not flex-shrink.
- Assignments: `nextAssignment` uses `clearEnding` (drops `flags.end*`, turns a finished campaign into a free journey), resets the rival, and always leaves a briefing card (`id: 'assignment'`) — never an empty city. Text from `game/assignments.ts` (`rollAssignment`: patron × item × reason × stakes).
- `newRun` clamps the year into a campaign's era and moves a hero whose home does not exist (or has no roads) that year.
- Procedural text: `game/grammar.ts` (`expand` Tracery-style, per-culture sound/sight/smell, asides reacting to stats/crew/mount/romance/rival/deadline); `prose.ts` `climateOf`/`localWeather` (no frost in the tropics, southern seasons flipped).
- Inner voices (`data/voices.ts`, `game/thoughts.ts`): 12 Disco-Elysium-style voices (Instinct, Annals, Dream Ink, Sworn Brotherhood, Tiger's Shadow, Appetite, Heart-Reading, Face, Will, Wind & Water, Reason, Eloquence), levels 1–6 on `hero.voices` (base from calling/traits + 4 creator points). `innerThoughts(run, card)` → passive checks shown under card text; Instinct/Reason give real hints; +2% odds per level above 2 on their tags.
- Mind (`run.mind` 0–100, `run.apathy`): failed gambles, heavy losses, cruelty, heartbreak lower it; rest/faith/art/food/romance/mercy raise it; Will softens losses. <35 frayed (−5% odds, voices may lie `[???]`), <15 unravelling (−10%, 18% of choices panic and lose their good effects), 0 → `mind-low` ending "Lost in the Dream". Flaw `stone-heart`: losses become apathy instead (≥40 = Numb, voices go quiet).
- Tests: `assignment.test.ts`, `fuzz.test.ts` (random journeys × all difficulties/hardships/campaigns with venues, market, bag moves, riddles, rests, assignments, save/load; invariants every step), `mind.test.ts`, `market.test.ts`.

## Systems added 2026-10-14 (later)
- Voices: 20 (adds Brush & Ink, The Mask, Silk Thread, Iron Bones, Hawk Eye, Wind Steps, Clever Hands, The Ancestors); `effectiveVoices` in `mods.ts` (base + creator points + finished thoughts, up to 8). `thoughts.ts` ranks candidates by relevance: keywords in the card text (`KEYWORDS`), the actual choices (risk, net value, crime/talk/art, hidden option, costly), this NPC (rapport, rank, culture), your past (ties in this city, last visit from the log, ancestors, relics, weakest companion, sweetheart), then the place.
- Thought Cabinet (`data/cabinet.ts`, `run.cabinet`): 17 thoughts (5 rare) discovered by `when(run)` conditions or Choice `thought:`; internalize up to 3 (`internalize`), progress by travel days (`thinkFor` on arrival, `restDay`); `during` / `done` effects are Perk-shaped (`perksOf`), plus `voices` and `mindLoss`. UI in Drawer → Retinue.
- Rare events (`cards/rare.ts`, Template `rare: true`): max one per deck, flag `rare:<id>`; historical figures gated by city+years (Ricci, Bashō, Hokusai, Xu Xiake, Kaempfer, Cao Xueqin) and uncanny ones (mirror, Go with an immortal, comet, letter from yourself, last speaker, whale fall, ghost market, the old road). Chronicle records `rarities` and `thoughts`.
- Procedural strangers (`cards/wayfarers.ts`): who × predicament × twist through `grammar.ts`; twists can reveal secret-path hints.
- Hidden paths: 16 `SECRETS` (8 new). Hints accumulate in `hint:<id>` flags (Choice/Outcome `bump`); 2 reveal the path. Sources: inn/harbour talk, wayfarers, refugees, disasters, rare events (`nearSecret(c, hops)` in helpers).
- Catastrophes (`events.ts` `DISASTERS`, `startDisaster`, `disasterAt`): 11 kinds, culture/season-gated, spread `reach` hops; slow routes; `disasterCloses` cuts roads at the epicenter (fallback keeps you unstranded); `DAMAGE` damages/closes venues (crushed inn = worse rest, destroyed bridge/harbour closed, damaged market ×1.5 prices); cards in `cards/disasters.ts`; globe rings.
- Deaths of notable figures (`startDeath`, `deathAt`, kind `death`): popular → mourning (festivals suppressed), royal → succession crisis, unloved → riots; cards `DEATH_T`. 25% of disasters kill someone.
- Turmoil (`game/turmoil.ts`: uprisings, successions, riots) slows roads ×1.2–1.3 and holds some land roads for a month; `cards/turmoil.ts`: roadblocks (detour/bribe/password/papers/disguise), turmoil quests (`message`, `bounty`, `treasure` Quest kinds), refugee escorts.

## Systems added 2026-10-16
- Balance: Brink of Fate per difficulty (`isCrisis`: pilgrim/courier once per stat, ronin once per journey, legend never). Stat caps (`capOf` in `mods.ts`): 100 + traits (`TRAIT_CAP`) + experience (`run.xp`, +5 per 150 moved; ronin ×2 / legend ×2.5 slower; max +30); the cap is both the max and the deadly edge; soft caps scale with it; `StatBar` gets `caps`; 🏅 note on raise.
- Saves: `SCHEMA` + `MIGRATIONS` in `engine.ts` (`parseRun`); `exportRun` / `importRun`; Settings → Save file. Add a migration step whenever the Run shape changes.
- People at venues (`game/people.ts`, `PeopleStack.svelte`): tapping a venue shows who is there as swipe profiles (portrait, traits, likes/dislikes, looking-for, bio, % match from `compatibility`); right = `meetPerson` (costs the venue visit) → `hangoutCard`; Choice/Outcome `person` → `personStep` (`run.people`, bond, stage acquaintance→friend→confidant→sweetheart / rival); known people return; recruit those looking for work; notables drop in.
- Drawer tabs: Bag / Self (character, repertoire, languages, voices, cabinet, merit, heat) / People (retinue, heart, people you know) / World (standing, factions, causes, almanac, fleet) / Tasks / Journal. Old ids `retinue`/`fleet` alias to people/world.
- Onboarding: `data/codex.ts` (`CODEX` entries with `when(run)`), `Tip.svelte` (one tip at a time, once ever, `four-seas:tips`), `Codex.svelte` (searchable, from Settings and tips). Voices stay quiet for the first 2 cards.
- Bones of the Road: `Chronicle.graves` (recorded in `recordRun` for deaths and settled/retired), copied to `run.graves` at start; `cards/graves.ts` (pay respects → lesson, take their relic, finish their commission as a quest, ancestor oath → thought); globe markers.
- Storyteller: `game/tales.ts` (`talesFrom` after choices → `run.repertoire`, `TASTE` per culture, `taleFit`), `cards/storyteller.ts`; told tales wear thin (`told:` bump).
- Languages: `game/langs.ts` (`langLevel` 0–3, `hearLanguage` on arrival/rest/city talk); conversational removes the `foreign` tag; +3% per level on talk/trade/romance gambles; −4% prices per level.
- Trade fairs: `data/fairs.ts` (`fairIn`), `fairHere` in market (all curios on sale, ×1.3 curio prices, the bazaar renamed/added), `cards/fairs.ts` auctions; route warnings 🎪.
- Rival: delayed by disasters/turmoil on their path (`rivaldis:`/`rivaltur:` flags, logged); `rival-ally` card after you helped them.
- Perf: modals/pages lazy-loaded in `+page.svelte` (`load<Component>()` + `{#await}`); globe drag batched per animation frame and hides minor labels while dragging. Sounds: `sfx.forNotes` (rumble for disasters/deaths/brink, shimmer for rare/thoughts/secrets/caps). HUD chips use `InkIcon.svelte`.
- i18n: campaign titles/blurbs + new UI labels in Indonesian (ja/zh still UI only).

## Systems added 2026-10-17
- Life skills (`data/skills.ts`): 17 skills (art, thievery, athletics, martial, strength, knowledge, luck, cooking, crafting, machinery, puzzles, creativity, medicine, devotion, mystic/third eye, aura/presence, composure) as xp in `run.skills`; `levelOf` (lvl n needs 12·n(n+1)/2, max 10); trained by choice tags in `choose` (+5 win / +3 loss / +2 plain, 📈 note); level perks via `perksOf`; `START_SKILLS` per profession/trait; `skill(c, id)` in card helpers gates `up` options (`cards/roadside.ts`: 17 skill-check road events).
- Professions: +17 (thief, painter, writer, bard, playwright, actor, dancer, prospector, trader, priest, treasure-hunter, adventurer, mercenary, troupe, medium, tinkerer, cook), each with `src/content/cards/profession-<id>.md` (≥3 beats).
- Life goal (`data/goals.ts`, `hero.goal`, 14 goals, `progress(run)`); `checkGoal` → +20 renown/+10 fortune/+20 mind, +400 score. Creator goal chips; Self tab.
- Contraband & intel (`items.ts` `contraband`/`intel`/`value`; `cards/contraband.ts`: steal, customs search, fence, spymaster → rebels via `bump revp`, smuggling run, forbidden reader).
- Life (`game/life.ts`, `cards/life.ts`): letters (`sendLetter`, replies after travel time, `read:<id>`), home (`HOME_PRICE` 40, `flags.buyHome`, stash ≤12, garden income, better rest), ageing (`lifeStage` perks), titles (12, `titleLikes` → rapport), collections (dishes/bridges/landmarks/temples/harbours → perks). All via `lifePerks` (only when `'log' in run`).
- Companions: 3-chapter crew stories (`arc-crew:<id>`), dilemmas (`cards/companions.ts`).
- QoL: undo (once per stay; unlimited on pilgrim) + rewind to last 3 arrivals (`restorePoints`), route planner (tap far city → `shortestPath` legs + warnings, `flags.course`), news toast, photo mode, "sell all prized curios", price memory (World tab), journal search, colourblind globe (`data-cb`), seasonal weather glyphs, `quickOutcomes` setting. SCHEMA 4.
- Not done: shared/backend daily ghosts (only local graves), guild rank / `run.warehouse`, ja/zh campaign texts.

## Bug-hunting tools (2026-10-16)
- `src/lib/game/fuzz.test.ts` plays random journeys through every engine feature (venues, market, bag, riddles, hangouts, districts, companion errands, dress helper, inventions, cabinet, assignments, save/load) checking invariants every step.
- `e2e/monkey.spec.ts` clicks randomly through the real UI (desktop + phone) and fails on any page/console error or if play stops progressing. Opt-in (long, CPU-heavy): `npm run e2e:monkey` (excluded from `npm run e2e` unless `MONKEY=1`).
- Service worker skips dotfiles and caches with `allSettled` (a stray `static/.DS_Store` 404 used to break offline install entirely).
- Fixed 2026-10-16: Brink-of-Fate crisis triggered from the map (rest/use item) was hidden in the deck (stat silently saved, game felt stuck) → now opens as a city card; recommended-dress standing farmable → once per city; companion errands farmable → each errand once per companion per stay; crisis NPC names now fit the local culture.

## Conventions
- Cards are plain serializable data (saved mid-run). No functions in Card/Choice/Outcome.
- Choice tags drive perk multipliers; travel auto-adds the route mode tag, foreign NPC adds `foreign`.
- Template weights of 0 are filtered before picking; `when` guards anything `make` dereferences (mount, crew, cargo).
- Hidden option (`card.up`) always carries `why` (the trait/item/companion that unlocked it).
- Stat gains are damped ×0.55 above 70 (soft cap) and ×0.35 above 88 — keep in mind when tuning.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept, even for read-only requests. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: download `antislop.md` again, or run `npx antislop-ai --update` if it was installed as skill folders.
<!-- antislop:end -->
