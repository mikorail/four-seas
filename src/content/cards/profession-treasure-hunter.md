title: X Marks the Spot
profession: treasure-hunter
badge: Treasure Hunter's Road

# beat: old-map
where: city
speaker: merchant
title: Map seller
---
**{npc}** swears this map was drawn by a pirate who sank with his gold. The ink is suspiciously fresh.

## left: Buy it anyway
fx: silver -6
tags: trade, gamble
set: treasure_hunter_q1
gamble: 0.4 | win: silver +20 ; Fresh ink, real gold: the pirate's grandson copied it. | lose: fortune -3 ; The X is a fish market.

## right: Laugh and walk on
set: treasure_hunter_q1
text: You hear him sell it to the next traveller for twice the price.

## up(Treasure Hunter): Read the map’s real age from the paper
requires_profession: treasure-hunter
fx: silver +16
tags: art
set: treasure_hunter_q1
text: The paper is old even if the ink is not. A real copy of a real map.

# beat: trap
where: travel
requires: treasure_hunter_q1
speaker: spirit
title: Guardian spirit of the tomb
---
Deep in a ruin, a voice from the dark: **{npc}**. "Three doors. One leads to treasure, one to the river, one to me."

## left: Choose the left door
tags: gamble
set: treasure_hunter_q2
gamble: 0.34 | win: silver +24 ; Treasure, of a sort. | lose: vigor -10 ; The river. Very cold.

## right: Bow and leave the tomb in peace
fx: fortune +8
tags: faith
set: treasure_hunter_q2
text: The voice laughs. It has not been respected in a long time.

## up(Treasure Hunter): Read the doors’ carvings first
requires_profession: treasure-hunter
fx: silver +26, renown +6
tags: art
set: treasure_hunter_q2
text: The middle one. Obviously the middle one.

# beat: the-hoard
where: any
requires: treasure_hunter_q2
speaker: elder
title: Last keeper of a lost family
---
At last: the hoard is real. But **{npc}**, the last of the family who buried it, is living in poverty next door.

## left: Take the treasure
fx: silver +30
tags: crime
set: treasure_hunter_q3, hunter_done
text: It is yours by the law of finders. Is it yours?

## right: Give it to the family
fx: renown +18, fortune +10
karma: 10
tags: mercy
set: treasure_hunter_q3, hunter_done
text: They give you a tenth. You never had a better payday.

## up(Treasure Hunter): Split it, and keep the map
requires_profession: treasure-hunter
fx: silver +18, renown +8
tags: trade
set: treasure_hunter_q3, hunter_done
text: Half for them, half for you, and the map goes in your collection.
