---
where: city
cultures: han, viet, malay, siamese
weight: 1.2
speaker: merchant
title: Night-market cook
---
After dark, **{city}** turns into one long kitchen. Lanterns, smoke and shouting; {npc} flips {food} in a wok the size of a cartwheel and waves you over with a ladle.

## left: Buy a bowl and keep walking
fx: silver -1, vigor +5
tags: food

## right: Stay all night, trading stories for food
fx: vigor +8, renown +4
tags: food, talk
text: By midnight you know every cook's feud and three secret recipes.
