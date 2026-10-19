title: The Master's Vow
profession: ronin
badge: Ronin's Path

# beat: broken-banner
where: city
speaker: soldier
title: Old Clan Retainer
---
Under the eaves of a rain-swept teahouse in **{city}**, an old scarred warrior **{npc}** kneels before you. "I recognise your school's stance. Our lord's banner fell twenty years ago, but the traitor who sold the castle now commands the river garrisons."

## left: Swear an oath to avenge the fallen clan
fx: vigor +8, renown +6, silver -4
tags: loyal, fight
set: ronin_q1
text: You bind white cord around your scabbard. An old blood debt wakes after two decades of wandering.

## right: Refuse: the dead sleep, and the living must eat
fx: fortune +8, silver +6
tags: rest, talk
set: ronin_q1
text: "A blade without a master belongs to the wind," you answer. The old soldier sighs, but leaves you a pouch of rice wine.

## up(Ronin): Accept only your former master's broken heirloom blade
requires_profession: ronin
fx: vigor +10, renown +10
tags: fight
set: ronin_q1
item: sword
text: You draw the chipped steel from its oilcloth. The balance is familiar as your own heartbeat.

# beat: defend-the-pass
where: land, river
requires: ronin_q1
speaker: bandit
title: Warlord's Enforcer
---
At a mountain ford, a warband led by the brutal enforcer **{npc}** blocks the refugee caravans. "Pay three taels a head, or the river runs red today." Unarmed pilgrims look to you in terror.

## left: Draw steel and stand alone in the shallows
fx: vigor -10, renown +18
tags: fight, mercy
set: ronin_q2
gamble: 0.65 | win: renown +14, fortune +10 ; Three strokes in the spray; their leader's spear snaps in two. The band scatters in fear. | lose: vigor -14, renown +6 ; You take a shallow cut across the shoulder, but the bridge holds until the farmers cross.

## right: Challenge their commander to single combat
tags: fight
set: ronin_q2
gamble: 0.7 | win: renown +20, silver +10 ; A single clean cut before the eyes of fifty men. The warband bows in silence and departs. | lose: vigor -16, fortune -4 ; You barely parry their heavy nodachi, carrying deep bruises for leagues.

## up(Ronin): The One-Sword Stance of your lost school
requires_profession: ronin
fx: renown +24, vigor -4
tags: fight
set: ronin_q2
text: You step forward into the high stance. Recognizing the dead master's legend, their veterans sheath their weapons in awe.

# beat: sword-saint
where: any
requires: ronin_q2
speaker: elder
title: Blind Swordmaster
---
At the summit of a windy pass, the venerable hermit **{npc}** sits cross-legged on a flat rock. "You have proved your steel against common cutthroats. Now tell me: does your sword exist to spill blood, or to keep it inside the veins of men?"

## left: Sheath the sword forever and teach the art of peace
fx: renown +25, fortune +20, vigor +10
tags: rest, mercy
text: You plant your katana in the mountain soil. Students seek your mountain hut from across the islands.

## right: Become the supreme swordmaster of the four seas
fx: renown +35, vigor +15
tags: fight
text: Your duel at dawn becomes the stuff of woodblock prints and street theater across three hundred ports.
