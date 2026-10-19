# Four Seas — Design Direction & Style Specification

> **Dial**: `ENERGY 2 / RHYTHM 3 / MOTION 2`

---

## 1. Product Identity & Soul

*Four Seas* is a swipe-driven historical narrative roguelike and grand journey across Asia, the Indian Ocean, and the Silk Road from 1500 to 1900. It synthesizes the mechanical elegance of *Reigns* and the panoramic geographical scope of *80 Days* with the psychological depth of *Disco Elysium*.

The visual language draws directly from classical East Asian woodblock prints (ukiyo-e and Ming/Qing woodcut albums), Persian illuminated manuscripts, and maritime Dutch cartography. It feels like handling a weathered traveller's journal bound in oiled leather, stamped with cinnabar seals, and annotated with sumi ink.

---

## 2. Personality & Voice

- **Literary & Grounded**: Language is sensory, historical, and unhurried. It avoids modern anachronisms, hollow hype, or marketing buzzwords.
- **Anti-Slop Copywriting**: No em dashes (`—`) in UI copy. Prose uses colons, periods, commas, or parentheses. Sentences are concise, direct, and human.
- **Multicultural Authenticity**: Cities reflect era-accurate reckonings (Hijri, Lunar, Gregorian, Regnal eras), localized currencies (taels, dinars, rupees, pounds), and authentic cultural etiquette.

---

## 3. Color Palette & Hierarchy

### Core Tones
| Token | Light (Parchment) | Dark (Lacquer) | Role |
| :--- | :--- | :--- | :--- |
| `--paper` | `#f2e8d2` | `#17130f` | Primary canvas and ground plane |
| `--paper-2` | `#e9dcbf` | `#221c16` | Recessed containers and cards |
| `--ink` | `#211b15` | `#eadfc6` | Primary high-contrast typography |
| `--muted` | `#6f6353` | `#a8997f` | Subordinate captions and metadata (WCAG AA $\ge$ 4.5:1) |
| `--line` | `#c9b892` | `#4a3e2f` | Delicate structural borders and dividers |

### Narrative Accents (Purpose-Gated)
- **Cinnabar Vermilion** (`#b5321f` / `#e0583f`): Danger, crises, official seals, urgent departures.
- **Jade Celadon** (`#2f6b5a` / `#5fae94`): Sanctuaries, medicinal cures, virtuous karma, restorative venues.
- **Antique Gold** (`#b8902e` / text `--gold-text: #7c5900`): Curios, relics, renown, sacred shrines.
- **Indigo / Azure** (`#2a4a7c` / `#7fa3db`): Ocean voyages, stellar navigation, river currents.

---

## 4. Typography

- **Display & Headings**: `Cormorant Garamond` — classic editorial elegance, graceful capitals, humanist proportions.
- **Body & Dialogue**: `EB Garamond` — warm, highly readable, historical book face.
- **CJK Ideographs & Seals**: `Shippori Mincho` — authentic brushwork terminals and woodblock stroke dynamics.
- **Monospace Usage**: Restricted exclusively to raw card authoring tools (`/editor`).

---

## 5. Liveliness Dials & Mechanical Levers

### `ENERGY: 2` (Balanced)
- Confident, understated character. High contrast without neon ostentation.
- The interface respects the historical subject matter with quiet dignity rather than distracting flash.

### `RHYTHM: 3` (Varied & Dynamic)
- Seamless transitions across four distinct structural rhythms:
  1. *The Intimate Card Table*: Centered portrait, ink-wash dialogue, dual-choice swipe mechanics.
  2. *The Panoramic City Fresco*: Full-bleed architectural silhouettes, diurnal skies, atmospheric weather.
  3. *The 3D Orthographic Globe*: Spherical navigation with solar day/night terminator and Great Circle arcs.
  4. *The Grid Baggage Ledger*: Tactile spatial inventory management with physical slot constraints.

### `MOTION: 2` (Purposeful & Measured)
- Physics-based card swipe mechanics with tactile spring-back.
- Smooth spherical momentum drag on the 3D globe.
- Day-night sky transitions tied to diurnal passage.
- **Banned**: Arbitrary decorative CSS bouncing, floating card loops, or template fade-ins.

---

## 6. Structural & Accessibility Standards

- **Touch & Tap Ergonomics**: All interactive buttons maintain a minimum tap target of 44px on coarse-pointer/touch viewports.
- **Radius Scale**: Deliberate visual hierarchy using `--radius-sm` (4px), `--radius-md` (8px), and `--radius-lg` (12px), reserving pill shapes strictly for status tags.
- **Glassmorphism Constraint**: Backdrop blur is restricted exclusively to the primary central HUD pill. All secondary controls utilize opaque high-contrast dark tones.
- **Theme Resilience**: Light (Parchment), Dark (Lacquer), and System modes must all pass 100% WCAG AA contrast tests with verified click-through functionality.
