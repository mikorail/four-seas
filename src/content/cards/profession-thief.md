title: The Long Fingers
profession: thief
badge: Thief's Road

# beat: jade-pendant
where: city
speaker: noble
title: Bored magistrate’s wife
---
At a crowded opera in **{city}**, **{npc}** wears a jade pendant worth a year of honest work. She is not watching it. She is watching the actor playing the general.

## left: Lift it during the battle scene
fx: silver +16
heat: 10
tags: crime
set: thief_q1
text: Drums, gongs, a cheering crowd — and a pendant slipping into your sleeve.

## right: Leave it; tonight you only watch
fx: fortune +4
tags: art
set: thief_q1
text: The play is good. You have a strange, honest evening.

## up(Thief): Swap it for a perfect fake
requires_profession: thief
fx: silver +22, renown +2
heat: 4
tags: crime
set: thief_q1
text: She will wear glass for a decade and never know.

# beat: fence
where: city
requires: thief_q1
speaker: merchant
title: Fence with a jeweller’s loupe
---
**{npc}** turns your haul under a lamp. "Hot. Very hot. The governor’s men are asking every pawnshop in {city}. I can give you a third of its worth, or you can sit on it until the heat cools."

## left: Take the third and run
fx: silver +10
heat: -6
tags: trade, crime
set: thief_q2
text: Small money, clean hands. Relatively.

## right: Hold out for a better buyer
heat: 6
tags: gamble, crime
set: thief_q2
gamble: 0.5 | win: silver +24 ; A Portuguese captain pays in gold, no questions. | lose: renown -6 ; The buyer was the governor’s informer. You run.

## up(Thief): Fence it through the night market yourself
requires_profession: thief
fx: silver +20
tags: crime
set: thief_q2
text: You know the right stall, the right password, the right price.

# beat: big-job
where: city
requires: thief_q2
speaker: bandit
title: Old master thief
---
**{npc}**, the most famous thief in three provinces, is too old to climb. "One last job. The treasury of {city} keeps the tax silver in a tower with one window. I know the window. You have the knees."

## left: Do the job
heat: 18
tags: crime, gamble
set: thief_q3, thief_done
gamble: 0.55 | win: silver +30, renown +10 ; In through the window, out with the silver, home before the night watch turns. Songs are sung about this. | lose: vigor -14, renown -8 ; The tower guard was awake. You leave by the same window, faster.

## right: Turn him in for the reward
fx: silver +14
karma: -6
tags: official, cruel
set: thief_q3
text: The old man spits at your feet as they take him. You will hear that sound for a while.

## up(Thief): Plan it so nobody gets hurt
requires_profession: thief
fx: silver +26, fortune +6
heat: 10
tags: crime
set: thief_q3
text: A forged order, a fake fire, a door left open. Not a single drop of blood.
