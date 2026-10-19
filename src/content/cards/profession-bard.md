title: Songs of the Road
profession: bard
badge: Bard's Road

# beat: tavern-duel
where: city
speaker: performer
title: Rival singer
---
In the busiest tavern in **{city}**, **{npc}** challenges you to a song duel. Loser buys every drink in the house.

## left: Sing a song from home
tags: art, gamble
set: bard_q1
gamble: 0.55 | win: silver +12, renown +8 ; The room sings the chorus back at you. | lose: silver -10 ; They loved your rival more. You buy a great many drinks.

## right: Sing together instead
fx: renown +6, fortune +4
tags: art, food
set: bard_q1
text: The duet is better than either of you. Free drinks all night.

## up(Bard): Improvise a song about the rival
requires_profession: bard
fx: renown +14, silver +8
tags: art, talk
set: bard_q1
text: Rhymes about their hat. The tavern howls. Even they laugh.

# beat: lament
where: any
requires: bard_q1
speaker: elder
title: Widow of a drowned fisherman
---
**{npc}** asks you for a lament: her husband went out in the storm and never came back. "Nobody sang for him."

## left: Write and sing the lament
fx: fortune +6
karma: 4
tags: art, mercy
set: bard_q2
text: The whole village comes to listen. The song stays in that harbour long after you leave.

## right: Teach her a song she can sing herself
fx: renown +4
tags: art, mercy
set: bard_q2
text: Her voice is cracked and perfect.

## up(Bard): Sing until the sea answers
requires_profession: bard
fx: fortune +12
tags: art, faith
set: bard_q2
text: At the last verse, a gull lands on the empty boat. Nobody speaks.

# beat: royal-song
where: city
requires: bard_q2
speaker: noble
title: Court chamberlain
---
The ruler of **{city}** has heard your songs are sung in the markets. **{npc}** brings an invitation: one song, at court, tonight.

## left: Sing the song the markets love
fx: renown +16, silver +12
tags: art, official
set: bard_q3, bard_done
text: The court pretends to be shocked, then hums it all week.

## right: Sing a song of the ruler’s ancestors
fx: renown +12, silver +20
tags: art, loyal
set: bard_q3, bard_done
text: Tears at the high table. A purse at your feet.

## up(Bard): Sing the song the court does not want to hear
requires_profession: bard
fx: renown +22
heat: 12
tags: art, crime
set: bard_q3, bard_done
text: Silence, then one person claps: the ruler’s youngest daughter. You leave before dawn, famous.
