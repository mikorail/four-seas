title: The Road Kitchen
profession: cook
badge: Cook's Road

# beat: food-stall
where: city
speaker: merchant
title: Rival noodle seller
---
You set up a stall in **{city}**’s night market. **{npc}**, the noodle king of the street, glares across the lanterns.

## left: Cook your homeland’s dish
tags: food, gamble
set: cook_q1
gamble: 0.55 | win: silver +14, renown +6 ; A queue forms, then a bigger one. | lose: silver -4 ; Too strange for local tastes. The noodle king smirks.

## right: Cook the local dish, your way
fx: silver +10
tags: food, trade
set: cook_q1
text: Familiar enough to trust, different enough to talk about.

## up(Wandering Cook): Invent a dish that is both
requires_profession: cook
fx: silver +18, renown +12
tags: food, art
set: cook_q1
text: By the end of the week, the noodle king is selling his own version. You take it as a compliment.

# beat: famine-pot
where: any
requires: cook_q1
speaker: elder
title: Hungry village
---
Famine in the valley. **{npc}** has one sack of millet and forty mouths. "Can you make this last?"

## left: Make it last a week
fx: vigor -6
karma: 8
tags: food, mercy
set: cook_q2
text: Soup with herbs, bark tea, a pinch of salt in every bowl. Nobody dies this week.

## right: Share your own supplies
fx: silver -8
tags: mercy
set: cook_q2
text: Your rations go into the pot. You eat with them.

## up(Wandering Cook): Forage the hills for what they do not know is food
requires_profession: cook
fx: renown +12, vigor +4
tags: food, land
set: cook_q2
text: Wild garlic, fiddleheads, a hillside of mushrooms the villagers feared. A feast.

# beat: imperial-kitchen
where: city
requires: cook_q2
speaker: official
title: Imperial head cook
---
The ruler of **{city}** is bored of every dish in the kingdom. **{npc}** gives you one chance: a single dish, tonight. Fail and you are thrown out. Succeed and…

## left: Cook the finest dish you know
fx: renown +18, silver +16
tags: food, official
set: cook_q3, cook_done
text: The ruler eats every grain. You are given a title nobody can pronounce.

## right: Cook the simplest dish of your childhood
fx: renown +14, fortune +8
tags: food
set: cook_q3, cook_done
text: The ruler’s eyes are wet. "My nurse made this." You are given a house.

## up(Wandering Cook): Cook a dish from every road you have travelled
requires_profession: cook
fx: renown +24
tags: food, art
set: cook_q3, cook_done
text: Twelve courses, twelve countries. The court does not stop talking for a month.
