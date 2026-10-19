title: Beyond the Horizon
profession: explorer
badge: Explorer's Path

# beat: unmapped-coast
where: city, any
speaker: scholar
title: Royal Naturalist
---
In the botanical gardens of **{city}**, a fellow naturalist **{npc}** sketches pressed specimens from the far southern archipelagos. "Beyond the chartered trade lanes lie islands where trees bleed scented gum and birds have plumes of fire. Every merchant is blind to them because there is no quick gold."

## left: Pledge to mount an expedition to the outer straits
fx: renown +12, silver -10, vigor +6
tags: sea, art
set: explorer_q1
text: You purchase dried rations, compass needles, and notebooks bound in calfskin.

## right: Trade for their pressed specimen albums
fx: silver -6, renown +8, fortune +6
tags: trade, art
set: explorer_q1
text: You gain dried seeds and sketches of plants unknown to the imperial academies.

## up(Explorer): Identify the prevailing trade wind that leads there
requires_profession: explorer
fx: renown +18, fortune +10
tags: sea
set: explorer_q1
text: You calculate the seasonal monsoon shift that blows directly toward the uncharted volcanic chain.

# beat: wild-rapids
where: land, river, sea
requires: explorer_q1
speaker: child
title: Island Guide
---
Far beyond the edge of imperial territory, an indigenous youth **{npc}** paddles a hollowed outrigger across boiling river rapids. "The falls are fierce ahead. Beyond them lies the sacred lake of the mountain spirits. Turn back, stranger, unless your canoe can fly."

## left: Shoot the rapids with steady paddles and daring turns
fx: vigor -8, renown +16
tags: river, rest
set: explorer_q2
gamble: 0.65 | win: renown +18, fortune +12 ; Your vessel slices cleanly through spray; you emerge upon a calm, mirror-like alpine lake. | lose: vigor -14, silver -4 ; The boat swamps on a boulder; you drag yourself ashore shivering, but preserve your notebooks.

## right: Port the outrigger overland through the thick bamboo forests
fx: vigor -10, fortune +10
tags: land, rest
set: explorer_q2
text: Two days of machete work and sore shoulders, but every cargo crate reaches the upper lake intact.

## up(Explorer): Read the currents and water eddies like open script
requires_profession: explorer
fx: renown +22, vigor +4
tags: river
set: explorer_q2
text: You guide the canoe along the gentle back-eddies with effortless mastery; the guide laughs in delight.

# beat: the-new-world
where: any
requires: explorer_q2
speaker: elder
title: Keeper of the World's End
---
On a high headland looking out across an endless, untracked ocean, an ancient voyager **{npc}** places a garland of sea orchids upon your shoulders. "Few possess the spirit to leave the familiar world behind. You have brought back wonders that will inspire dreamers for centuries."

## left: Present your discovery logs to the international academies
fx: renown +40, fortune +20, silver +20
tags: art, talk
text: Your detailed natural history of the southern seas is translated into ten languages across the continents.

## right: Keep the secret paradises hidden from greedy empires
fx: fortune +35, renown +20, vigor +15
tags: mercy, rest
text: You bury your maps on the headland. Some wonders are too pure to be sold to colonial syndicates.
