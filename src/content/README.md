# Writing Four Seas content

Cards and campaigns are plain Markdown. Drop a `.md` file into `src/content/cards/` or
`src/content/campaigns/` — the dev server picks it up instantly. Try ideas live in the
in-game editor first: **Title screen → ✎ Card editor**.

## A single card (`src/content/cards/*.md`)

```md
---
id: tea-ceremony          # unique id (defaults to the file name)
where: city               # city | travel | any
cultures: japanese        # optional, comma list of culture ids
modes: sea                # optional, travel only: sea | land | river
years: 1600-1868          # optional
weight: 2                 # how often it appears (1 = normal)
once: true                # optional: at most once per run
speaker: innkeeper        # merchant, official, monk, bandit, sailor, captain, noble, scholar,
                          # healer, performer, child, elder, soldier, ghost, spirit, lover, innkeeper, hero
title: Tea master         # optional — the speaker's title
name: Sen no Rikyū        # optional — fixed name (otherwise generated)
culture: japanese         # optional — speaker's culture
gender: m                 # optional — m | f
badge: Story              # optional — little label under the card
---
In a four-and-a-half-mat room in {city}, {npc} whisks bitter green tea in silence.
The bowl is older than your grandmother.

## left: Decline politely
fx: renown -2
text: {npc} bows. The silence follows you out.

## right: Kneel and drink
fx: vigor +6, fortune +4
tags: rest, art
days: 1
text: Three sips, a turn of the bowl, and the noise of the road falls away.

## up(Poet): Compose a verse for the bowl
requires_trait: poet
fx: renown +12
```

**Placeholders:** `{city}` `{npc}` `{hero}` `{drink}` `{food}` `{festival}` `{holy}` `{ruler}` `{year}`.
Wrap important words in `**double stars**` to highlight them.

**Choice keys** (all optional):

| key | example | meaning |
|---|---|---|
| `fx` | `silver -5, renown +10` | stat changes (silver, vigor, renown, fortune) |
| `tags` | `mercy, faith` | fight, talk, faith, illness, food, gamble, trade, romance, art, official, rest, crime, mercy, cruel, bribe, loyal |
| `days` | `2` | time spent |
| `text` | `…` | what happens afterwards |
| `gamble` | `0.5 \| win: renown +10 ; You win. \| lose: vigor -8 ; You lose.` | luck decides |
| `item` / `lose_item` | `charm` | give / take an item |
| `heat` | `20` | wanted level |
| `karma` | `5` | merit |
| `standing` | `10` | standing with the local culture |
| `remember` | `favor \| saved their child` | this person will come back later |
| `set` / `clear` | `met-dara` | campaign flags |
| `flag` | `balloon` | global flag that lasts the whole run (e.g. `balloon` unlocks balloon travel) |
| `ending` | `won \| Title \| Closing text` | end the run (campaigns) |
| `requires_trait` / `requires_item` / `requires_flag` / `requires_faith` / `requires_outfit` | `poet` | only for `## up(...)` hidden options |

`mercy` and `cruel` choices never change Fortune (luck isn't morality) — they move Merit.

## A campaign (`src/content/campaigns/*.md`)

A header, then beats introduced by `# beat: id`. Beats use the card format above plus:

- `at:` a city id (or several, comma separated), `sea`, `land`, `river`, `travel`, `city` or `any`
- `requires:` / `unless:` campaign flags set by earlier choices with `set:` (global flags work too)
- `requires_item:` / `requires_faith:` / `requires_outfit:` (outfit ids from `src/lib/data/market.ts`, comma list = any of) on any card or beat

```md
campaign: manila-galleon
title: The Manila Galleon
blurb: Four months across the empty Pacific with a hold full of silk.
start: manila
destination: acapulco
years: 1600-1780
deadline: 200
item: the Governor's dispatches
patron: the Governor of the Philippines

# beat: muster
at: manila
speaker: captain
---
Text…
## left: …
## right: …
set: berth
```

Endings come from a choice with `ending: won | Title | text`. The commission's normal
victory is switched off for campaigns — write at least one ending at the destination.

## Campaign header extras
- `energy: unlimited` (or a number) — how many venue actions per city stay in this campaign.
- Choices may set `outfit: <id>` to dress the hero, or award/remove outfit items (`item: monk-robes`, `lose_item: monk-robes`).

## Items & Consumables
- **Outfits as Items**: All outfits (`OUTFITS` in `src/lib/data/market.ts`) are physical inventory items (`kind: 'outfit'`) stored in luggage. They can be worn, packed, swapped, or dropped.
- **Consumables**: Consumables in `ITEMS` (`kind: 'supply'`) can be used from the bag via `use: { fx, text, heat }`:
  - `fever-tonic`: heals vigor (+15), cures fever, saves from vigor-low death.
  - `incense`: burns sandalwood to purge heat (-25) and calm pursuers.
  - `ascetic-tea`: lowers renown (-15) to escape dangerous imperial notice, adds fortune (+8), lowers heat (-10).
  - `calming-draught`: lowers manic vigor (-15) to prevent reckless game over, adds fortune (+8).
  - `joss-paper`: burns ghost money to lower excessive fortune (-15) and deflect Heaven's scrutiny, adds renown (+6).
  - `alms-pouch`: scatters silver (-15) to beggars to evade greedy bandits and assassination, adds renown (+8), fortune (+8).
  - `rice-wine`: warms the spirit, restores vigor (+8), cools heat (-15).
  - `ginseng-tonic`: potent restorative (+25 vigor), saves from vigor-low death.
