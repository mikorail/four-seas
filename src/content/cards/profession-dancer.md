title: Steps of the Road
profession: dancer
badge: Dancer's Road

# beat: festival-dance
where: city
speaker: performer
title: Festival drummer
---
The drums of **{city}** are calling. **{npc}** beckons you into the circle. "Show us how they dance where you come from."

## left: Dance your homeland’s dance
fx: renown +8, fortune +4
tags: art
set: dancer_q1
text: They copy your steps by the third song.

## right: Learn theirs instead
fx: vigor +6, renown +4
tags: art, talk
set: dancer_q1
text: You are terrible, then less terrible, then wonderful.

## up(Dancer): Dance both, at once
requires_profession: dancer
fx: renown +14
tags: art
set: dancer_q1
text: A new dance is born. Children will do it for years and never know where it came from.

# beat: injury
where: travel
requires: dancer_q1
speaker: healer
title: Bone-setter
---
Your ankle turned on a mountain path. **{npc}** examines it. "Rest it for a month, or dance on it and risk dancing never again."

## left: Rest
fx: vigor +10
days: 4
tags: rest, illness
set: dancer_q2
text: Slow days. You learn to watch dancers instead of being one, which teaches you more than you expected.

## right: Dance on it
tags: gamble, art
set: dancer_q2
gamble: 0.6 | win: renown +8 ; It holds. Barely. | lose: vigor -16 ; It does not hold.

## up(Dancer): Bind it the way your teacher taught
requires_profession: dancer
fx: vigor +4, renown +6
tags: illness, art
set: dancer_q2
text: Old knowledge, old cloth, and you are dancing in a week.

# beat: palace-dance
where: city
requires: dancer_q2
speaker: noble
title: Queen’s lady-in-waiting
---
**{npc}** brings an invitation: dance for the palace on the night of the full moon. Every dancer in **{city}** would kill for it — some may try.

## left: Dance for the palace
fx: renown +18, silver +12
tags: art, official
set: dancer_q3, dancer_done
text: Silence, then gold thrown on the floor. You do not stop to pick it up until the last note.

## right: Share the stage with the local dancers
fx: renown +12, fortune +8
tags: art, mercy
set: dancer_q3, dancer_done
text: The queen asks who choreographed it. You point to all of them.

## up(Dancer): Dance a story nobody has danced before
requires_profession: dancer
fx: renown +24
tags: art
set: dancer_q3, dancer_done
text: Afterwards, three different people tell you it was about them.
