title: Voices of the Dead
profession: medium
badge: Medium's Road

# beat: haunted-house
where: city
speaker: ghost
title: Restless dead
---
A house in **{city}** nobody will rent. At midnight **{npc}** sits at the foot of the stairs and stares at you. You are the only one who can see them.

## left: Ask what they need
fx: fortune +8
tags: faith, mercy
set: medium_q1
text: A name carved on a tablet, a bowl of rice. The house is quiet by morning.

## right: Order them to leave
tags: faith, gamble
set: medium_q1
gamble: 0.5 | win: renown +8 ; They go. | lose: vigor -10, fortune -6 ; They do not go. They follow you for a week.

## up(Spirit Medium): Let them speak through you
requires_profession: medium
fx: renown +12, fortune +6
tags: faith
set: medium_q1
text: A dead woman’s voice in your mouth names her murderer. The magistrate is very interested.

# beat: seance
where: city
requires: medium_q1
speaker: noble
title: Grieving noble
---
**{npc}** pays you to reach their dead son. You feel nothing at the table — or almost nothing.

## left: Tell the truth: he is not here
fx: renown +6
tags: faith, mercy
set: medium_q2
text: They are angry, then grateful. You did not lie to them.

## right: Tell them what they want to hear
fx: silver +14
karma: -4
tags: crime
set: medium_q2
text: Comfort, bought and paid for. It sits badly with you.

## up(Spirit Medium): Wait longer, until he comes
requires_profession: medium
fx: fortune +10, renown +10
tags: faith
set: medium_q2
text: At the third candle, a cold hand on your shoulder, and a nickname only his mother knew.

# beat: gate-of-the-dead
where: any
requires: medium_q2
speaker: spirit
title: Gatekeeper of the dead
---
**{npc}** stands in your dream at a gate of white bone. "You hear us too well. Pass through and you will hear everything forever. Or close your ears, and live like everyone else."

## left: Pass through
fx: fortune +16, vigor -10
tags: faith
set: medium_q3, medium_done
text: You wake hearing whispers in every room. You are never alone again.

## right: Close your ears
fx: vigor +10
tags: rest
set: medium_q3, medium_done
text: Silence, for the first time since you were a child. It is strange. It is lovely.

## up(Spirit Medium): Ask to be a messenger, not a resident
requires_profession: medium
fx: renown +16, fortune +10
tags: faith, talk
set: medium_q3, medium_done
text: A bargain: you carry their words, they leave you your sleep.
