# Four Seas

A swipe-card travel game across Asia, 1500 to 1900. You are a courier with a commission and a deadline. You cross a living globe by junk, camel, river barge and steamer, and every city has people, places and trouble of its own. Swipe left or right (sometimes up) to decide. Silver, Vigor, Renown, Fortune and Mind keep you alive; let any one run out, or overflow, and the journey ends.

## Features

- **A living globe**: about 140 historical cities joined by sea, river and land roads that open and close by era. Day and night, seasons, typhoons, wars, plague, earthquakes and floods all move across it. A route planner shows the best path, its legs and its dangers.
- **Cities with places and people**: inns, temples, bazaars, palaces, academies, harbours and festivals. Tap a place to see who is there as swipe profiles with traits, tastes and a match percentage; befriend, recruit or fall in love.
- **A whole life**: 28 professions (courier, ronin, pirate, painter, thief, priest, prospector, bard, mercenary…), a life goal, 17 life skills that grow with use, ageing, titles the world gives you, collections, letters home, and a house to come back to.
- **Inner voices**: 20 Disco Elysium-style voices comment on every card, a Thought Cabinet of ideas to carry, and a Mind stat that can fray into madness (or numb into apathy).
- **History that happens around you**: rebellions you can join on either side, deaths of kings, succession crises, riots that block roads and spawn bounties, messages and treasure hunts. Rare cards meet real figures like Ricci, Bashō and Hokusai.
- **Secrets and contraband**: rumours reveal hidden roads; stolen seals, banned books and war plans can be smuggled, fenced or handed to rebels.
- **Campaigns and dynasties**: hand-written Markdown campaigns (Java War, Katipunan, Pilgrim's Road…), a daily seeded journey, and heirs who inherit your relics and enemies.
- **Forgiving when you want it**: four difficulties, undo and rewind on the easiest, export/import of saves, a searchable Codex.
- **Plays anywhere**: installable PWA, works offline, phone and desktop layouts, colourblind-safe globe, reduced motion, large text. Optional Claude-written cards with your own API key.

## Development

Needs Node 22+ (the npm scripts pick nvm's Node 24 automatically).

```bash
npm install
```

```bash
npm run dev
```

The dev server runs on http://localhost:5173. `npm test`, `npm run check`, `npm run e2e` and `npm run build` cover tests, types, browser tests and the static build. See `AGENTS.md` for the rules and `ROADMAP.md` for open work.

## Privacy

Everything runs in your browser and saves to `localStorage`. The only network call is the optional Claude card generator, which uses the API key you enter and talks directly to Anthropic.
