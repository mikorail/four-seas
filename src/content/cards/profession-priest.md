title: The Mission
profession: priest
badge: Priest's Road

# beat: sick-village
where: city
speaker: healer
title: Village headwoman
---
Fever in the hill village above **{city}**. **{npc}** does not care which god you pray to. "Can your god carry water?"

## left: Carry water and pray
fx: vigor -8, fortune +6
karma: 6
days: 3
tags: faith, mercy
set: priest_q1
text: Seven days. Four recover. They remember the stranger who stayed.

## right: Fetch a physician from the city
fx: silver -8, renown +6
tags: mercy
set: priest_q1
text: Medicine first, sermons later.

## up(Priest): Pray in their way, not yours
requires_profession: priest
fx: fortune +10, renown +6
tags: faith
set: priest_q1
text: Their spirits and your saints sit side by side. Nobody is offended, least of all the sick.

# beat: debate
where: city
requires: priest_q1
speaker: monk
title: Rival preacher
---
In the square of **{city}**, **{npc}** challenges you to debate before the crowd: whose faith is true?

## left: Debate with fire
tags: faith, talk, gamble
set: priest_q2
gamble: 0.5 | win: renown +12 ; The crowd follows you home. | lose: renown -6 ; The crowd follows him home.

## right: Agree on what you share
fx: fortune +8
tags: faith, mercy
set: priest_q2
text: Mercy, honesty, bread for the hungry. The crowd is confused, then moved.

## up(Priest): Ask him to pray with you
requires_profession: priest
fx: renown +14
tags: faith
set: priest_q2
text: Two preachers, two faiths, one prayer. People talk about it for years.

# beat: persecution
where: city
requires: priest_q2
speaker: official
title: Magistrate with an edict
---
An edict has banned your faith in **{city}**. **{npc}** reads it aloud and looks at you. "Renounce, leave, or be arrested."

## left: Leave quietly with the faithful
fx: vigor -6
tags: faith, loyal
set: priest_q3, priest_done
text: A column of families on the road at night. You lead them across the border.

## right: Stay and be arrested
fx: renown +16
days: 7
tags: faith, loyal
set: priest_q3, priest_done
text: A week in a cell. Visitors bring rice and courage. The edict is quietly forgotten.

## up(Priest): Hide the faithful in plain sight
requires_profession: priest
fx: fortune +12
tags: faith, crime
set: priest_q3, priest_done
text: Saints painted as local gods, prayers set to folk songs. Faith survives in disguise.
