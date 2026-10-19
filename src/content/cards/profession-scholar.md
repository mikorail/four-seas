title: The Forbidden Annals
profession: scholar
badge: Scholar's Path

# beat: forbidden-scroll
where: city
speaker: scholar
title: Imperial Archivist
---
In a dusty alcove of the academy library in **{city}**, the retired archivist **{npc}** whispers behind a stack of commentaries. "The official court history was sanitized after the purge. Here is the true chronicle of the succession war. If the censors discover it, it burns."

## left: Hide the scroll among philosophical treatises
fx: renown +8, fortune +6
tags: art, talk
set: scholar_q1
text: You slip the sheets between volumes of the Classic of Filial Piety. Censors overlook what they take for granted.

## right: Transcribe copies secretly to distribute among academies
fx: vigor -6, renown +14
tags: art
set: scholar_q1
text: You write through three nights until your knuckles ache with ink, sending copies along river barges.

## up(Scholar): Re-annotate the text with classical allusions
requires_profession: scholar
fx: renown +16, fortune +8
tags: art
set: scholar_q1
text: You weave the forbidden truths into elegant allegorical verse that only fellow masters can decipher.

# beat: court-debate
where: city
requires: scholar_q1
speaker: official
title: Chief Imperial Examiner
---
At the triennial gathering of examiners in **{city}**, the haughty grand secretary **{npc}** challenges your interpretations of statecraft. "Young literati babble of principle while kingdoms starve. Justify your scholarship before the court."

## left: Argue for humanitarian governance and tax relief
fx: renown +16, silver -4
tags: official, mercy
set: scholar_q2
text: The junior scholars erupt in applause. The grand secretary nods reluctantly, defeated by classical precedent.

## right: Present pragmatic canal irrigation and fiscal reforms
fx: silver +14, renown +12
tags: official, trade
set: scholar_q2
text: The ministers pore over your diagrams with hungry eyes; your counsel is written into provincial law.

## up(Scholar): Quote the Founder's forgotten edicts verbatim
requires_profession: scholar
fx: renown +22, fortune +10
tags: official
set: scholar_q2
text: You quote thirty passages from memory without dropping a tone. The court falls into stunned, reverent silence.

# beat: grand-chancellor
where: any
requires: scholar_q2
speaker: noble
title: Imperial Regent
---
The highest minister of the realm, **{npc}**, summons you to the pavilion of mirrors. "The dynasty requires minds that see beyond provincial boundaries. We wish to appoint you Grand Historiographer of Four Seas."

## left: Accept the brush and record an unflinching history
fx: renown +35, silver +15
tags: art, loyal
text: For forty years your brush records truth without fear or favor. Your histories become the benchmark of the era.

## right: Decline high office to establish a frontier academy
fx: renown +25, fortune +20, vigor +10
tags: rest, art
text: Beyond the frontiers, your academy draws students from seven realms. Your disciples reshape empires.
