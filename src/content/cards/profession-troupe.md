title: The Travelling Company
profession: troupe
badge: Troupe's Road

# beat: no-audience
where: city
speaker: performer
title: Your juggler
---
Rain in **{city}**, and the square is empty. **{npc}**, your juggler, sighs. "Six mouths, no audience. What now, boss?"

## left: Perform in the rain anyway
tags: art, gamble
set: troupe_q1
gamble: 0.5 | win: silver +12, renown +6 ; The crowd comes out under umbrellas. | lose: vigor -6 ; Six wet performers and one very wet tiger.

## right: Play in the teahouse for food
fx: vigor +8
tags: art, food
set: troupe_q1
text: Dumplings for everyone. Morale restored.

## up(Troupe Leader): Put on a show in the temple courtyard
requires_profession: troupe
fx: renown +10, silver +8
tags: art, faith
set: troupe_q1
text: Monks love a good comedy. They pass the hat.

# beat: runaway
where: any
requires: troupe_q1
speaker: child
title: Runaway
---
**{npc}**, a runaway with a good voice and bad shoes, begs to join your troupe. Their family is wealthy and will look for them.

## left: Take them in
fx: renown +6
heat: 6
karma: 4
tags: mercy
set: troupe_q2
text: A new voice in the company. A family searching the roads.

## right: Send them home
fx: fortune +2
tags: loyal
set: troupe_q2
text: They cry. You give them a song to take back.

## up(Troupe Leader): Write to the family and offer an apprenticeship
requires_profession: troupe
fx: renown +10, silver +6
tags: talk, mercy
set: troupe_q2
text: The family is so relieved they pay the fees.

# beat: grand-tour
where: city
requires: troupe_q2
speaker: noble
title: Royal impresario
---
**{npc}** offers your company a season at the royal theatre in **{city}** — with one condition: drop your two oldest performers for younger ones.

## left: Accept the condition
fx: silver +24, renown +10
karma: -4
tags: trade
set: troupe_q3, troupe_done
text: Fame. Money. Two empty seats at supper.

## right: Refuse
fx: fortune +10, renown +6
tags: loyal
set: troupe_q3, troupe_done
text: The old performers say nothing. They do not need to.

## up(Troupe Leader): Make the old performers the stars of the season
requires_profession: troupe
fx: renown +22, silver +12
tags: art, loyal
set: troupe_q3, troupe_done
text: A play about growing old, by people who have. The city sobs.
