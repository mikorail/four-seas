title: The Sword for Hire
profession: mercenary
badge: Mercenary's Road

# beat: contract
where: city
speaker: official
title: Recruiting captain
---
**{npc}** needs swords to guard a tax convoy out of **{city}**. "Good pay. Bad roads. Bandits who know exactly when the silver leaves."

## left: Take the contract
days: 2
tags: fight, gamble
set: mercenary_q1
gamble: 0.55 | win: silver +16, renown +6 ; Ambush at the ford — and you see it coming. | lose: vigor -14, silver +8 ; Ambush at the ford. You are paid, bleeding.

## right: Ask who told the bandits the timing
fx: renown +8
tags: talk
set: mercenary_q1
text: The captain goes pale. There is an informer. You just found him.

## up(Mercenary): Take the contract, change the route
requires_profession: mercenary
fx: silver +20, renown +8
tags: fight
set: mercenary_q1
text: The bandits wait at the ford all day. The convoy crosses upriver.

# beat: both-sides
where: any
requires: mercenary_q1
speaker: noble
title: Lord with a feud
---
**{npc}** offers you double to fight for him — against the lord who hired you last week.

## left: Switch sides for double
fx: silver +20
karma: -4
tags: crime
set: mercenary_q2
text: Your old employer will not hire you again. Or anyone he talks to.

## right: Keep your contract
fx: renown +10
tags: loyal
set: mercenary_q2
text: Honour among mercenaries is rare. It is remembered.

## up(Mercenary): Make them pay you both to stay out of it
requires_profession: mercenary
fx: silver +24
tags: talk, crime
set: mercenary_q2
text: Two lords, two purses, one fight that never happens.

# beat: company
where: city
requires: mercenary_q2
speaker: soldier
title: Veteran sergeant
---
**{npc}** and a dozen old soldiers want a captain: you. "Your own company. Your own banner. Your own debts."

## left: Raise your banner
fx: renown +16, silver -10
tags: fight, loyal
set: mercenary_q3, merc_done
text: A company of twelve, a flag sewn by a sergeant’s wife, and a reputation to build.

## right: Decline; you ride alone
fx: fortune +6
set: mercenary_q3, merc_done
text: They understand. They drink to you anyway.

## up(Mercenary): Raise it, and swear you will never fight for tyrants
requires_profession: mercenary
fx: renown +20, fortune +6
tags: loyal
set: mercenary_q3, merc_done
text: A mercenary company with a creed. People can hardly believe it.
