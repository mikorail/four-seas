---
where: city
cultures: japanese
years: 1580-1900
weight: 1.5
speaker: performer
title: Tea master
---
In a four-and-a-half-mat room in {city}, **{npc}** whisks bitter green tea in perfect silence. The bowl is older than your grandmother, and cracked — mended with gold.

## left: Decline politely
fx: renown -2
text: {npc} bows. The silence follows you out into the street.

## right: Kneel and drink
fx: vigor +6, fortune +3
tags: rest, art
days: 1
text: Three sips, a turn of the bowl, and the noise of the road falls away for a whole afternoon.

## up(Wandering Poet): Compose a verse for the mended bowl
requires_trait: poet
fx: renown +12
tags: art
text: "Broken, and so — gold." {npc} writes it on the box lid.
