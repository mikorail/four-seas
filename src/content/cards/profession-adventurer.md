title: For the Joy of It
profession: adventurer
badge: Adventurer's Road

# beat: dare
where: city
speaker: child
title: Gang of street children
---
**{npc}** dares you to climb the tallest pagoda in **{city}** at night and ring the bell. Nobody has done it since their grandfathers.

## left: Climb it
tags: gamble, land
set: adventurer_q1
gamble: 0.55 | win: renown +10, fortune +4 ; The bell rings over the sleeping city. The children scream with joy. | lose: vigor -10 ; Halfway up, a tile breaks. You come down faster than planned.

## right: Tell them a story instead
fx: fortune +4
tags: talk
set: adventurer_q1
text: They want the climb. They get a story about a climb. Close enough.

## up(Adventurer): Race them to the top
requires_profession: adventurer
fx: renown +14
tags: land
set: adventurer_q1
text: They are faster. You are cleverer. You ring the bell together.

# beat: volcano
where: travel
requires: adventurer_q1
speaker: elder
title: Shepherd at the volcano
---
**{npc}** points at the smoking crater. "Nobody goes up there. That is why you want to, isn’t it."

## left: Go up
tags: land, gamble
set: adventurer_q2
gamble: 0.5 | win: renown +12, fortune +8 ; The crater glows like a forge in the dark. You will never see anything like it again. | lose: vigor -12 ; Sulphur, a burned boot and a very long walk down.

## right: Admire it from below
fx: vigor +4
tags: rest
set: adventurer_q2
text: It is beautiful from here too.

## up(Adventurer): Go up at dawn, when the gases are low
requires_profession: adventurer
fx: renown +16, fortune +10
tags: land
set: adventurer_q2
text: You pick the right hour and the right path. The sunrise inside a volcano.

# beat: edge-of-maps
where: any
requires: adventurer_q2
speaker: captain
title: Weathered navigator
---
**{npc}** unrolls a chart with blank edges. "Everyone sails to where the money is. I sail to where the map ends. Coming?"

## left: Go to the edge of the map
fx: renown +18, fortune +8, vigor -8
days: 6
tags: sea, gamble
set: adventurer_q3, adventurer_done
text: Nothing but sea, sky and an island nobody has named. You name it, very badly.

## right: Wish them well
fx: fortune +4
set: adventurer_q3, adventurer_done
text: Some adventures belong to other people.

## up(Adventurer): Draw the missing edge together
requires_profession: adventurer
fx: renown +22
days: 6
tags: art, sea
set: adventurer_q3, adventurer_done
text: Three months later, your names are on a chart in the harbour office.
