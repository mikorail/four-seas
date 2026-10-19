title: The Seven Holy Peaks
profession: pilgrim
badge: Pilgrim's Path

# beat: monastery-gate
where: city
speaker: monk
title: Prior of the Cloud Gate
---
Before the heavy bronze doors of the ancient mountain monastery in **{city}**, the head prior **{npc}** sweeps fallen pine needles. "Hundreds climb these steps seeking miracles. Only one in a generation seeks to empty their own bowl. Are you a sightseer or a seeker?"

## left: Kneel on the flagstones in the night rain
fx: fortune +10, vigor -4
tags: faith
set: pilgrim_q1
text: At dawn, the doors creak open. The monks welcome you with steaming barley gruel.

## right: Offer your travelling coin to feed the beggars at the gate
fx: silver -8, fortune +14, renown +6
tags: faith, mercy
set: pilgrim_q1
text: "Dana begins where grasping ends," the prior smiles, bowing until his cowl touches the gravel.

## up(Pilgrim Monk): Recite the ancestral lineage from memory
requires_profession: pilgrim
fx: fortune +16, renown +10
tags: faith
set: pilgrim_q1
text: You name twenty-eight generations of masters without hesitation. The prior drops his broom in reverence.

# beat: hermit-cave
where: land
requires: pilgrim_q1
speaker: spirit
title: Mountain Ascetic
---
High on a cliff path shrouded in cloud, a wizened ascetic **{npc}** sits wrapped in coarse wool. "You have crossed rivers and climbed peaks. Tell me, monk: where is the Buddha when your feet are bleeding?"

## left: Point quietly to your worn straw sandals
fx: fortune +16, vigor +4
tags: faith
set: pilgrim_q2
text: The hermit roars with laughter that echoes across the gorge. "Just so! The road itself is the temple."

## right: Chant through the freezing mountain blizzard
fx: vigor -8, fortune +20
tags: faith
set: pilgrim_q2
text: Your breath rises like white incense in the cold; by sunrise you feel a warmth that comes from no fire.

## up(Pilgrim Monk): Strike your wooden fish rhythmically with the wind
requires_profession: pilgrim
fx: fortune +24, renown +8
tags: faith
set: pilgrim_q2
text: The mountain wind falls quiet as though listening to the rhythm of your ancient wood-block prayer.

# beat: Great-Awakening
where: any
requires: pilgrim_q2
speaker: monk
title: Abbot of the Sacred Peak
---
At the shrine of the summit stupa, the ancient abbot **{npc}** hands you a lacquered mallet before a thousand-year-old bronze bell. "Strike it once for all who wander in darkness across the four seas."

## left: Strike the bell with all your heart
fx: fortune +35, renown +15, vigor +15
tags: faith, mercy
text: The deep tone vibrates through mountain valleys and seaport bays alike. Travellers stop and smile without knowing why.

## right: Give away your sandals and vow to walk barefoot forever
fx: fortune +45, silver -10, renown +10
tags: faith
text: Your footprints on dusty roads become holy places where travellers leave stones and wild flowers.
