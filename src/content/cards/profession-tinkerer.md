title: Gears and Wonders
profession: tinkerer
badge: Tinkerer's Road

# beat: broken-clock
where: city
speaker: official
title: Palace clock-keeper
---
The great clock of **{city}**, gift of a foreign king, has stopped. **{npc}** is terrified: the ruler checks it every morning.

## left: Repair it
tags: trade, gamble
set: tinkerer_q1
gamble: 0.55 | win: silver +16, renown +8 ; Tick. Tock. The clock-keeper kisses your hands. | lose: renown -4 ; A spring flies across the room. It is now more broken.

## right: Recommend a foreign clockmaker
fx: renown +4
tags: talk
set: tinkerer_q1
text: Someone else’s problem now.

## up(Tinkerer): Repair it — and make it play a tune
requires_profession: tinkerer
fx: renown +16, silver +12
tags: trade, art
set: tinkerer_q1
text: At noon it plays the ruler’s favourite song. You are a court favourite by evening.

# beat: pump
where: any
requires: tinkerer_q1
speaker: elder
title: Drought-hit farmer
---
The fields are dry and the river is low. **{npc}** has heard you build machines. "Can you make the water climb?"

## left: Build a treadle pump
fx: vigor -6, renown +10
karma: 4
days: 2
tags: trade, mercy
set: tinkerer_q2
text: Two days of sawing and lashing. The water climbs. So do your spirits.

## right: Teach them to build it themselves
fx: renown +8
tags: talk, mercy
set: tinkerer_q2
text: Next year every village in the valley has one.

## up(Tinkerer): Build a windmill that never sleeps
requires_profession: tinkerer
fx: renown +16, fortune +6
days: 2
tags: trade
set: tinkerer_q2
text: It is still turning when you leave, and long after.

# beat: invention
where: city
requires: tinkerer_q2
speaker: scholar
title: Academy master
---
**{npc}** has seen your drawings. "A machine to print a thousand pages a day? Show the academy. Or sell it to the merchants. Or burn it, before the scribes lose their jobs."

## left: Show the academy
fx: renown +20
tags: art, trade
set: tinkerer_q3, tinkerer_done
text: The scholars argue for a week. Then they ask for ten.

## right: Sell it to the merchants
fx: silver +28
tags: trade
set: tinkerer_q3, tinkerer_done
text: Rich. The scribes curse your name for a generation.

## up(Tinkerer): Give the plans to every printer in the city
requires_profession: tinkerer
fx: renown +16, fortune +12
tags: mercy, trade
set: tinkerer_q3, tinkerer_done
text: Books become cheap. Somewhere a child learns to read because of you.
