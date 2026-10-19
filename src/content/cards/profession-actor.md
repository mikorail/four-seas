title: A Thousand Faces
profession: actor
badge: Actor's Road

# beat: imposter
where: city
speaker: official
title: Clerk of the yamen
---
**{npc}** mistakes you for the inspector everyone in **{city}** is dreading. Bows. Offers tea. Offers a bribe.

## left: Play the inspector
fx: silver +14
heat: 8
tags: crime, talk
set: actor_q1
text: You inspect with great severity. You leave before the real one arrives.

## right: Correct the mistake
fx: renown +4
tags: talk
set: actor_q1
text: He laughs with relief and gives you the tea anyway.

## up(Actor): Play the inspector, and actually fix things
requires_profession: actor
fx: renown +12, silver +6
tags: talk, mercy
set: actor_q1
text: Two corrupt clerks dismissed, a granary opened. The real inspector gets the credit.

# beat: role-of-a-lifetime
where: city
requires: actor_q1
speaker: performer
title: Theatre manager
---
**{npc}** offers you the lead in a famous tragedy — the role every actor dreams of. Rehearsals start tomorrow.

## left: Take the role
fx: renown +14, vigor -6
days: 3
tags: art
set: actor_q2
text: Seven performances. On the last, a stranger in the front row cries so loudly the cast stops.

## right: Recommend a young unknown instead
fx: fortune +6
tags: mercy, art
set: actor_q2
text: They are brilliant. They never forget who gave them the chance.

## up(Actor): Play both the hero and the villain
requires_profession: actor
fx: renown +20
days: 3
tags: art
set: actor_q2
text: Quick changes behind a screen. Nobody notices it is the same person until the bows.

# beat: mask-off
where: any
requires: actor_q2
speaker: noble
title: Someone who knew you before
---
**{npc}** recognises you — not the role, the person underneath. "I know who you were before you started pretending. Shall I tell them?"

## left: Pay for their silence
fx: silver -10
tags: bribe
set: actor_q3, actor_done
text: They take it, and the secret stays a secret.

## right: Tell the truth yourself, on stage
fx: renown +16, fortune +6
tags: art, talk
set: actor_q3, actor_done
text: Your best performance: yourself. The applause goes on for a long time.

## up(Actor): Convince them they are mistaken
requires_profession: actor
fx: renown +6
tags: art, crime
set: actor_q3, actor_done
text: By the end of the conversation, they are not sure who they are.
