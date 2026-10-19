campaign: sultanate-of-women
title: The Sultanate of Women
blurb: 1648. A child sits on the Ottoman throne, and two queen mothers fight over him through letters, rumours and poison. You are the courier everybody wants to own.
start: aleppo
destination: istanbul
years: 1648-1651
deadline: 90
item: a sealed letter for the Valide Sultan
patron: Kösem Sultan, grandmother of the Sultan
culture: ottoman

# beat: kosem
at: aleppo
speaker: noble
name: Kösem Sultan
title: Grand Valide, grandmother of the Sultan
culture: ottoman
gender: f
weight: 200
---
In a cool upstairs room of the Aleppo bazaar, the agent of **Kösem Sultan** hands you a letter sealed in green wax. "Our mistress has ruled through three sultans. The young mother, Turhan, thinks it is her turn. Carry this to the Old Palace. Speak to no one. Everyone will want to speak to you."

## left: Swear to carry it unread
tags: loyal
set: kosem
text: The agent nods. "Good. The last courier was curious."

## right: Ask what you are getting into
tags: talk
fx: renown +3
text: "Into history," he says, "if you are lucky."

# beat: coffeehouse
at: city
speaker: performer
title: Coffee-house storyteller
culture: ottoman
weight: 140
---
In a coffee house thick with tobacco smoke, **{npc}** tells the crowd the latest palace gossip: the Grand Vizier is plotting, the janissaries have not been paid, and the young Valide Turhan is "a lioness in silk". Someone in the corner is watching you very closely.

## left: Listen and remember everything
fx: renown +4
tags: talk
set: gossip
text: Names, debts, who hates whom. Better than any map.

## right: Plant a rumour of your own
tags: talk, crime
gamble: 0.5 | win: renown +8 ; By evening the whole city repeats your story. | lose: renown -6 ; Your rumour is traced back to "a foreign courier". Not ideal.
set: gossip, rumour

# beat: janissary
at: land, city
speaker: soldier
title: Janissary aga
culture: ottoman
---
A janissary officer, **{npc}**, stops you with a hand on your satchel. "The Corps has not been paid in months. Kösem Sultan pays us. Turhan Sultan pays us better. Which letter do you carry, courier?"

## left: Bribe him
fx: silver -12
tags: bribe
text: Silver speaks every language in the Empire.

## right: Tell him the truth
tags: talk
gamble: 0.5 | win: renown +6 ; "Kösem's man? Then pass, and tell her we have not forgotten her." | lose: vigor -10 ; He keeps you a night in the guardhouse to think about loyalty.

## up(Gossip): Mention the aga's debts, quietly
requires_flag: gossip
fx: renown +6
text: He goes pale and waves you through.

# beat: turhan
at: istanbul
speaker: noble
name: Turhan Hatice Sultan
title: Valide, mother of the boy Sultan
culture: ottoman
gender: f
weight: 160
---
Before you reach the Old Palace, a black eunuch leads you blindfolded through the Topkapı harem to **Turhan Sultan**: twenty-four, sharp-eyed, holding her son's future in her hands. "I know what Kösem's letter says. Give it to me, and you will have a house on the Bosphorus. Refuse, and you will have nothing at all."

## left: Give Turhan the letter
fx: silver +30
tags: crime
set: turhan
karma: -6
text: She reads it, smiles and burns it. "You chose the winning side."

## right: Refuse her
tags: loyal
set: refused-turhan
remember: grudge | refused to betray Kösem
text: "Then you chose the other side," she says softly.

# beat: night
at: istanbul
speaker: noble
title: Chief Black Eunuch
culture: ottoman
weight: 150
unless: turhan
---
September 1651. Night in the Old Palace. Torches in the corridors, running feet — Turhan's men have come for Kösem. **{npc}** grabs your arm: "She asked for you. Now, before it is too late."

## left: Run to warn Kösem
tags: loyal, fight
fx: renown +18, vigor -10
ending: won | The Last Courier of Kösem | You reach her too late to save her, in time to hear her last words. When Turhan rules, she remembers who was loyal — even to an enemy — and spares you.

## right: Slip out of the palace and leave Istanbul
fx: fortune +6
ending: won | Out of the Harem | You are on a Venetian ship by dawn. In Venice they pay a fortune to hear what you saw that night, and you never tell the same story twice.

## up(Gossip): Spread the word among the janissaries to save her
requires_flag: gossip
tags: talk
fx: renown +20
ending: won | The Rumour That Saved a Queen | The janissaries march on the palace believing Kösem is in danger. She lives — for now. History will say otherwise, but you were there.

# beat: turhan-ending
at: istanbul
speaker: noble
name: Turhan Hatice Sultan
title: Valide Sultan
culture: ottoman
gender: f
requires: turhan
weight: 200
---
Kösem is dead; Turhan rules through her son. A house on the Bosphorus waits for you, as promised. **Turhan** receives you once more. "Loyal servants of mine build mosques. Will you?"

## left: Take the house and the reward
fx: silver +30
ending: won | A House on the Bosphorus | You live well, by the water, in a house paid for with a letter. At night you hear the old palace bells and wonder what Kösem's letter actually said.

## right: Fund the New Mosque at Eminönü in her name
fx: renown +16, silver -10
tags: faith
ending: won | The Builder | The Yeni Cami rises at the water's edge. Your name is not on it — but your silver is in every stone.
