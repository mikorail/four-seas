# Four Seas — Roadmap

Started 2026-10-13. Milestones are worked in order; each is checked off only after `npm run check`, `npm test` and a play-through in the browser.

## Milestone A — Consequences & readability
- [x] Merit (karma) meter; mercy / cruelty / crime / bribes move it — luck stays separate (fortune ≠ morality)
- [x] People remember you: favors return as gifts, information, rescue, free companions; grudges as ambushes, informers, theft
- [x] Beggar who may be an Immortal; merit-based inn / penance events
- [x] Key info highlighted in cards and outcomes (names, places, amounts, items, days)
- [x] Journal-style writing: scene line on each card, first-person journal entries

## Milestone B — Living calendar
- [x] Real dates: Gregorian/Julian + local calendars (Hijri, Chinese lunar, Buddhist Era, Vikram Samvat, Japanese era style)
- [x] Festivals on real dates: Lunar New Year/Tết/Seollal, Mid-Autumn/Chuseok, Dragon Boat, Obon, Ramadan & Eid, Nowruz, Songkran, Vesak, Diwali, Holi, Losar, Easter, Christmas

## Milestone C — Depth
- [x] Standing per region (prices, card odds, courts, constables)
- [x] Persistent relationships: lovers, spared bandits, sworn brothers, dismissed crew, legends
- [x] Ships & caravans you own; trade runs; treasury; Merchant Prince retirement
- [x] Dynasty: continue as child / apprentice / companion with inheritance

## Milestone D — World
- [x] Typhoon tracks, spreading plague, wars closing routes (shown on map)
- [x] Americas, Siberia, Australia & the Pacific filled in (new Pacific culture)

## Milestone E — Stories & play
- [x] Card format in Markdown (`src/content/cards`) + in-app editor with live preview
- [x] Four campaigns: The Manila Galleon, The Mughal Succession, The Fall of the Ming, The Opening of Japan
- [x] Mini-games: mahjong tiles, hanafuda, chaupar, bao, go

## Milestone D2 — Secrets & more places
- [x] 11 more cities (Yangzhou, Suzhou, Kaifeng, Nara, Shimoda, Gyeongju, Ava, Penang, Srinagar, Mashhad, Kandahar)
- [x] Secret routes revealed by clues (Tea Horse Road, Wakhan Corridor, smugglers' run, Northern Sea Route)
- [x] Four hidden legendary places (Shambhala, Penglai, Suvarnadvipa, Waq-waq) with unique relics

## Milestone F — Presentation
- [x] Portraits blink and react to your choice
- [x] Generative music per culture (guzheng, koto, gamelan, sitar, oud…)
- [x] Illustrated scenes for all 18 legends
- [x] Interface translations: Indonesian, Japanese, Chinese (story cards still English)

## Milestone G — Quality
- [x] Accessibility: screen-reader labels, live announcements, reduced motion, colorblind-safe colors
- [x] Automated browser test (Playwright): create, swipe, travel, offline

## Already in-game deadlines
- Commission deadline (header countdown, "Too Late" ending)
- Every task/contract has a due day (Tasks tab); late = failed, −renown
- Rival courier's arrival day (beat it or settle for "Second to Arrive")

## Done — 2026-10-13
All milestones complete. Verified with `npm run check` (0 errors), `npm test` (24 unit tests), `npm run e2e` (10 Playwright tests, desktop + phone, incl. offline), balance sims (pilgrim 87% · courier 72% · ronin 57% · legend 42% · death's door 12%) and `npx tsx scripts/campaign-sim.ts` (every campaign beat reachable).

## Ideas for later
- Translate story cards (start with campaigns), online daily leaderboard (needs a backend), cloud save, more campaigns written in Markdown.

## Milestone G — Towns, trade & people (2026-10-13)
- [x] City venues: inn everywhere; squares, temples, markets/great bazaars, harbours, palaces, academies, bridges, landmarks (Great Wall, Taj, Borobudur…), festivals — small towns get only an inn and a shrine
- [x] Energy: a few actions per city stay (difficulty-based; campaigns can set unlimited); rest a day or take an inn room
- [x] Market: outfits/transmog that change perks, access and how locals treat you; curios worth 2–3× where prized; secret-route charts; riddle maps → treasure quests
- [x] Romance arc: courtship, letters, families, rivals, proposals, weddings in local custom, married life
- [x] Rebellions & independence (15 historical uprisings) — rebel, crown or double agent; underground, battlefield, intrigue; Java War & Katipunan campaigns
- [x] Flaws (bad traits with opposites) + NPCs who like / dislike your traits; Mercurial moods
- [x] Tile luggage: shaped items, rotate/arrange, extra bags, Meticulous trait rewards a tidy pack
- [x] Game-over screen explains why: fatal stat over time, last straw, run-up, tip

## Next ideas (Completed)
- [x] Profession quest lines (Markdown per profession for all 11 professions with multi-beat parser)
- [x] Download the journal as a book (standalone printable HTML with chapters, drop caps and print styling)
- [x] Ease Pilgrim's Road (many Penniless deaths resolved via realistic alms/hospitality and adjusted bandit demands)
- [x] Drag-and-drop on touch for the bag (pointer events, ghost drag preview, coordinate snapping)
- [x] Market buy bug fix & stock limits (garb stock strictly 1, map stock strictly 1, finite supplies; disabled buttons & "Sold out" indicator)
- [x] Outfits in inventory (transmog in tile luggage, equip/unequip/swap from bag, second-hand market selling)
- [x] Consumable items for stat management, ailments & effects (fever tonic, ginseng elixir, incense to clear wanted heat, ascetic tea / calming draught / joss paper / alms pouch to shed excessive stats and prevent lethal 100-stat endings)
- [x] Travel accidents & unmarked settlement detours (shipwreck, rockslide, sandstorm, river spate trigger off-the-map intimate encounters: herbalist, wandering scholar, quiet shrine, mountain guide, village dilemma)
- [x] Expanded Local Legends to 24 (Ching Shih activated; Nasreddin Hodja, Sun Wukong, Nyai Roro Kidul, Dokkaebi, Garuda, Al-Khidr added with relics & custom ink-wash art)
- [x] Rustic visual polish (hearth, well, herbalist, shrine venue glyphs + procedural thatched-roof rustic skyline in CityScene)
- [x] Rebalance & simulation tuning (Pilgrim 87% · Courier 75% · Ronin 66% · Legend 52%; renown/fortune escape valves; extreme stat damping ×0.35 at ≥88)
- [x] Freedom way of life & settle down (`settle` ending in any visited city with personalized epilogue based on local romance, family, trade or monastic devotion)
- [x] Faction reputation system (5 factions: Outlaws, Faith, Imperial Crown, Mercenaries, Guilds; tracks -100 to +100 standing influencing market prices, dialogues, wages, and heat)
- [x] Mid-journey permanent traits (dynamic traits: battle-hardened, haggler, cautious, reckless, ascetic earned via dilemmas and trials)
- [x] Permanent ailments & spiritual boons (conditions: one-eyed, limp, miasma-lung, battle-scarred, enlightened, master-courier, blessed-hands, oath-keeper modifying travel speed and gambling)
- [x] Branching storylines & continuing assignments (accept new grand assignments after completing primary delivery without canceling active side quests, riddle maps, or contracts)
- [x] Unique iconic city skylines (handcrafted architectural silhouettes for 17 major historical cities: Kyoto, Beijing, Edo, Samarkand, Constantinople, Venice, Agra, Malacca, Lhasa, Batavia, Nagasaki, Canton, Ayutthaya, Baghdad, Nara, Manila, Alexandria)
- [x] World map zoom & focus controls (extended zoom range 0.75x–8.5x, relaxed pan boundaries, quick-focus buttons: Focus Route, World View, and Here)
- [x] War & invasion accidents (warzone detection, 1.85x price spikes on rations/medicine/weapons, military checkpoints, refugee caravans, field hospitals)
- [x] Wandering Caravans & Nomadic Encampments (Kirghiz Aul, Hajj Pilgrim Caravan, Tea-Horse Caravan, Bugis Spice Flotilla moving seasonally with animated map markers ⛺/⛵, safe passage through warzones, tariff-free barter, and campfire hospitality)
- [x] Wilderness Survival & Foraging (item-aware survival beats during detours: camp pitching with umbrella/flint-steel, mountain foraging/hunting with hunting knife/tea brick, coastal beachcombing/reef salvage, and field mount care)
- [x] Folkloric Cryptids & Celestial Omens (The Great Broom Star comet, Phosphorescent Red Tide, Solar Eclipse, Altai Sky-Fire with map animations; sacred Qilin in bamboo, Baku dream-eater purging illness, and Umibozu sea giant)
- [x] Rural Micro-Histories & Generational Dynasty Memory (dynasty heirs inherit ancestral crests and blades; village elders recognize past well-digging deeds, outlaw chieftains honor grandfather's spared life, and sacred ancestral trees)
- [x] Inkle *80 Days*-style 3D Globe World Map (true spherical D3-Geo Orthographic projection, seamless deep zoom from orbital planet view to close-up city routes, signature tilted horizon camera framing, glowing atmospheric halo, twilight starlit backdrop, vibrant red traveled journey ribbon with node pips, mode-colored glowing route arcs, and horizon-fading adaptive typography)
- [x] Day & Night Diurnal Cycle (astronomical solar position, real-time night terminator shadow on 3D globe with glowing city lights, dynamic sky gradients for Dawn, Day, Dusk, Night, top HUD time pill, and courier roundel badges)
- [x] Multicultural Iconography Setting (customizable in Settings: Multicultural adaptive regional symbols, Heraldic 80 Days minimalist roundels, and Classic Far Eastern woodblock seals)
- [x] Zoomable City Fresco Panorama (Port Royal-style architectural & nautical arrival panorama, diurnal sky & glowing lantern windows, multi-depth silhouettes with tall ships, pagodas, citadels, rolling mist, interactive 0.75x–2.6x zoom/pan controls, and circular venue roundels)
- [x] Extensive City & Route Network Expansion (27 new historical cities added across Joseon Korea, Japan, China, Silk Road, Nusantara, Persia, and India: Kaesong, Jeonju, Gangneung, Jeju, Uiju, Kanazawa, Sendai, Hiroshima, Shimonoseki, Naha, Matsumae, Datong, Luoyang, Wuchang, Chungking, Hotan, Yarkand, Hami, Kangding, Semarang, Surabaya, Banjarmasin, Patani, Tashkent, Shiraz, Yazd, Pondicherry with geographically verified Sea, River, and Land edges)
- [x] Procedural City Lore, Street Rumors & Atmosphere Engine (`getCityLore` generating deterministic time-aware diurnal scenes, seasonal weather, culture-authentic street rumors, trade specialties, and poetic headlines in route drawers and frescos)
- [x] Cinematic UI & 3D Globe Hero Presentation (expanded `main` up to 1420px on desktop to eliminate cramped viewport; 640px–660px globe height; redesigned lacquer `.routes` card with culture tags, lore banners, smooth scrolling; 4-quadrant cartographic label staggering preventing collisions in dense clusters; culture-sensitive pack horse `🐎` vs desert camel `🐪` iconography)

## Milestone J — Ancient Citadels, Inventions & The Night Market (2026-10-14)
- [x] 8 Venerable Ancient Cities: Alexandria, Damascus, Athens, Angkor, Patna (Pataliputra), Taxila, Antioch, Carthage (Tunis) connected to the maritime and Silk Road networks with authentic landmarks, academies, palaces, and great bazaars.
- [x] Energy-Based 3-Stage Diurnal System (Morning / Dawn, Day / Afternoon, Night): In cities, time directly mirrors player energy. Golden morning at full energy, afternoon hustle with mid energy, deep night with lanterns lit at 0 energy. Diurnal phase drives 3D globe lighting, dynamic sky gradients, and stage-specific dialogue and venue atmosphere across inns, squares, temples, harbors, palaces, and academies.
- [x] Night Market (*Guishi* 鬼市 / Shab-Bazaar / Pasar Malam): When energy runs out, shady stalls open selling contraband (Forged Imperial Passes, Master Skeleton Keys, Smoke Pellets, Smuggled Poppy Resin, Plundered Temple Relics). Greenwood brotherhood outlaw discounts apply!
- [x] Inventions & Patronage Track: Sponsoring astronomers (*Celestial Chronometer* +14 deadline days), shipwrights (*Watertight Bulkhead Plans* reef immunity), typographers (*Movable Metal Type Foundry* +15 Renown on entering new cities), medical botanists (*Quinine Distillation Still* malaria immunity & extra vigor), artillery pyrotechnicians (*Thunder-Fire Rocket Artillery* combat triumphs), and reformist jurists (*Imperial Commercial Charter* gate toll immunity & trade profits).
- [x] Regional Cultural Affinities & Politics: Deep cultural politics covering Confucian meritocracies, Samurai Bushido, Maritime Sultanates, Island Chiefdoms, and European Merchant Republics. Dynamic localized titles (Literatus, Sensei, Seonbi, Mirza, Effendi, Nakhoda) and trade hospitality discounts based on favored traits, kindred faiths, and noble stature.

## Further ideas
- Expanded dialect/lore flavor in rural encounters.
- Regional trade fairs & seasonal harbor markets.
- Translate story cards (start with campaigns), online daily leaderboard (needs a backend), cloud save.



## Milestone H — Stability, voices & the globe (2026-10-14)
- [x] Fix: "Next assignment" left an empty city (blank screen); rival / campaign flags carried over
- [x] Fix: campaigns started outside their era stranded the player; impossible home cities
- [x] Fuzz tests: hundreds of random journeys doing everything, invariants checked every step
- [x] Procedural text grammar: local senses per culture, personal asides, climate-aware weather, generated commissions
- [x] Inner voices (12) with passive checks and real hints; Mind stat, madness ending, Stone Heart apathy
- [x] Globe-first layout: world map as the stage, cards and text in a sidebar / bottom sheet

## Milestone I — A deeper, stranger world (2026-10-14)
- [x] 20 inner voices; thoughts react to the card's words, its choices, the person and your own past
- [x] Thought Cabinet: 17 thoughts (5 rare) to discover and internalize
- [x] Rare events: historical figures in their own time and place, uncanny encounters; recorded in the Chronicle
- [x] Procedural strangers with twists; 8 new hidden paths revealed by rumours that add up
- [x] Catastrophes that spread to neighbours, cut roads, damage inns/bridges/harbours/markets
- [x] Deaths of rulers and notables: mourning, succession crises, riots
- [x] Turmoil slows and holds roads; roadblocks force detours; message runs, bounties, treasure hunts

## Milestone J — Ancient Cities, Inventions & Diurnal Cycle (2026-10-15)
- [x] 8 ancient & culturally revered cities (Alexandria, Damascus, Athens, Angkor, Patna, Taxila, Antioch, Carthage) with authentic routes, faiths, and landmarks
- [x] Multi-disciplinary Invention & Patronage system across Astronomy, Navigational Architecture, Printing, Medicine, Pyrotechnics, and Statesmanship with incubation progress
- [x] Regional Cultural Politics & Standing across 14 cultures, affecting prices, dialogues, and choices
- [x] Diurnal 3-stage day cycle (Morning, Day, Night) tied dynamically to city energy
- [x] Night Market (Ghost Bazaar · 鬼市 / Shab-Bazaar / Pasar Malam) with illicit contraband goods and outlaw discounts

## Milestone K — The Brink of Fate, Social Ties & Urban Quarters (2026-10-16)
- [x] **Brink of Fate Crisis System**: Before fatal stat overflow or depletion (Silver, Vigor, Renown, Fortune), triggers high-stakes crisis cards allowing players to "Shake it off" at a steep cost or succumb to their dramatic ending
- [x] **Unique Resident Notables & Hangout Feature**: Every city features resident cultural figures (scholars, tea masters, factors, chroniclers); downtime hangout action with tea, boardgames, debates, and secret rumors
- [x] **Multi-Companion Manager & Task Delegation**: Companions have distinct personal traits and can be assigned city tasks (Procure Provisions, Gather Intel, Scout Routes, Stand Guard)
- [x] **Companion Journey Baggage**: Outlaw companions attract bounty hunters, noble wards draw royal court intrigue, and warrior champions draw wandering duelists
- [x] **City Arrival Garb Helper**: Arrival etiquette advisory with 1-tap dress switching into recommended cultural attire (+10 Cultural Standing bonus)
- [x] **City Security Profiles & Districts**: Cities categorized by security order (`peaceful`, `lawful`, `notorious-crime`, `fractured`); multi-tier districts (Slums & Underground, Downtown Bazaar, Aristocratic Heights, Colonial Complex) with specialized interactive buildings


## Milestone L — Polish, people & the road remembers (2026-10-16)
- [x] Difficulty-scaled Brink of Fate; stat caps that grow with experience and traits
- [x] Versioned saves with migrations; export / import a journey
- [x] People at every venue as swipe profiles (traits, tastes, match %), friendships, sweethearts, recruits
- [x] Drawer reorganised (Self / People / World); first-time tips + searchable Codex
- [x] Bones of the Road: graves and shrines of past travellers, unfinished commissions
- [x] Storyteller's repertoire; languages learned by living; seasonal trade fairs with auctions; a rival who lives in the same world
- [x] Lazy-loaded UI (−42% page chunk), smoother globe dragging, ink HUD icons, event sounds
- [x] Translate campaign texts into Japanese and Chinese (Indonesian, Japanese, and Chinese titles/blurbs for all 15 campaigns)

## Milestone M — A whole life (2026-10-17)
- [x] 17 life skills with levels, perks and skill-check road events
- [x] 17 new professions (artists, thieves, prospectors, priests, mercenaries, troupes…) with quest lines
- [x] Life goals; contraband, stolen goods and intel that move rebellions
- [x] Letters, a home, ageing, titles, collections; companion stories and dilemmas
- [x] Undo/rewind, route planner, news toast, photo mode, quick-sell, price memory, journal search, colourblind globe, map weather
- [x] Guild rank + warehouse (`run.warehouse` across up to 3 cities, shipping, rank 0–5, guild cards)
- [ ] Shared daily ghosts (needs a backend)

## Next: prioritized TODO (proposed 2026-10-19)
Sizes: S = an hour or two, M = a day, L = several days. Ready-made agent prompts are in `docs/AGENT_PROMPTS.md`.

### P1 · Foundation (protects everything else)
- [x] **First git commit** (S): `main` has no commits yet; nothing is recoverable. Commit, then work in branches/worktrees (see `AGENTS.md`).
- [x] **Save size guard** (M): a save holds the run plus `undo` plus 3 `restorePoints` (≈4 copies; measured 200 KB avg, 420 KB worst on short runs). Long dynasty runs can hit the ~5 MB `localStorage` limit and fail silently. Trim `log` in snapshots to the last 40 entries, compress with `fflate` (new dep; Realmforge uses it), catch `QuotaExceededError` and show a toast.
- [x] **Split `engine.ts`** (~1.9k lines, L): move arrival, choose/outcome, endings, saves/migrations and undo into `game/engine/*.ts` behind the same exports. Land alone before feature work.
- [ ] **Split `+page.svelte`** (~1.7k) and `Drawer.svelte` (~1.3k) (M): one component per drawer tab (`drawer/Self.svelte`, …) and a `Hud.svelte`.
- [x] **Deploy config** (S): `netlify.toml` (Node 24, SPA fallback `/200.html`, `no-cache` for `service-worker.js`), like Realmforge.

### P2 · Depth that is half-built
- [x] **Guild rank + warehouse** (M): `run.warehouse` exists but is unused. Rank 0–5 per guild from trade volume; warehouses in up to 3 cities store goods; buy low, ship, sell high; rank unlocks contracts and discounts.
- [x] **Letters with consequences** (S): replies currently give a mood or a gift. Let friends send quests, warnings about the rival, or money; a sweetheart letter can trigger the proposal beat.
- [ ] **Skill mini-games** (M): reuse `components/games/*` for skill checks (puzzles → lock riddle, martial → timing, art → tracing).
- [x] **Rival as a person** (S): rival appears in People with bond, can become friend or nemesis; letters to the rival.
- [x] **Goal endings** (S): finishing a life goal offers a unique "retire into it" epilogue (bard opens a story house, thief retires rich…).

### P3 · Content
- [x] **Japanese and Chinese campaign texts** (M): titles, blurbs, then card text; keep CJK fonts regenerated (`npm run fonts`).
- [x] **New campaigns** (M each): Imjin War 1592 (Korean/Japanese sides), Opium War 1839 (Canton), Shimabara 1637, Meiji Restoration 1868, Tea-Horse Road, plus European/Ottoman/Steppe campaigns: The Tulip and the Ledger 1636, Tournament of Shadows (Great Game) 1838, The Gates of Vienna 1683, The Tenshō Embassy 1584 (all 19/19 campaigns at 100% beat reachability in `scripts/campaign-sim.ts`).
- [x] **Europe, Ottoman, Caucasus, Central Asia & Africa World Expansion** (L): 31 new historical cities (Seville, Madrid, Paris, Marseille, Genoa, Florence, Antwerp, Hamburg, Vienna, Prague, Kraków, St. Petersburg, Stockholm, Ragusa, Belgrade, Smyrna, Trebizond, Caffa, Kazan, Tiflis, Baku, Kokand, Merv, Balkh, Orenburg, Kulja, Karakorum, Algiers, Fez, Timbuktu, Sofala), 4 secret routes (Amber Road, Dariel Pass, Tuareg Salt Trail, Caspian Naphtha Run), 3 outfits, 6 curios, 5 rare historical encounters (Galileo, Rembrandt, Evliya Çelebi, Ulugh Beg's astronomers, Linnaeus's apostle), 6 custom SVG skylines, and regional street rumors.
- [ ] **Per-culture quests** (M): 2+ quest lines per culture with their own items and places (as Realmforge's sphere quests).
- [ ] **More profession beats** (S each): new professions have 3 beats; grow the most played ones to 5 with an ending.

### P4 · Balance
- [x] **Per-profession and per-goal sim** (S): `scripts/sim.ts` reporting win rate by profession and goal completion rate; flag outliers (>±10% from mean); tuned `dancer`, `scholar`, `performer`, `smuggler` perks and eased steep life-goal thresholds.
- [x] **Skill inflation check** (S): average skill level at day 300; make sure level 6+ perks do not trivialise legend.
- [ ] **Economy pass** (M): silver curve over a long journey with home garden, fences and fairs; contraband should be tempting, not dominant.

### P5 · UX
- [ ] **First-journey tutorial** (M): a short guided campaign that teaches swipe, routes, venues, bag in 10 cards instead of tips alone.
- [x] **Keyboard play** (S): ←/→/↑ to swipe, number keys for routes, `J` journal, `Esc` closes; show hints on focus.
- [x] **Contrast and focus audit** (S): check panel text and chips against WCAG AA in all culture themes; visible focus rings.
- [ ] **Phone panel** (S): drag handle on the bottom sheet to expand/collapse; remember height.

### P6 · Performance & size
- [ ] **Code-split card templates** (M): the main chunk is ~700 KB; lazy-load rare, festival, rebellion and campaign templates when first needed.
- [ ] **Lighter land data on phones** (S): use `land-110m` below 600px and when zoomed out; swap to 50m when zoomed in.
- [ ] **Globe label budget** (S): cap rendered labels per frame by importance; measure with the Performance panel on a mid phone.

### Later
- [ ] Shared daily ghosts (graves of other players on the daily seed; needs a small backend or a static daily file).
- [ ] Optional LLM-written letters and tavern tales (the BYO-key Claude path already exists in `lib/ai.ts`).
- [ ] Steam/desktop wrapper (Tauri) with cloud save via exported files.
