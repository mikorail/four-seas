title: Curtain Call
profession: playwright
badge: Playwright's Road

# beat: patron
where: city
speaker: noble
title: Theatre-mad aristocrat
---
**{npc}** wants a new play for the spring festival — "Something with a ghost, a duel and a wedding. In that order. Or any order."

## left: Write the crowd-pleaser
fx: silver +14, renown +6
tags: art, trade
set: playwright_q1
text: Ghost, duel, wedding. Standing ovation.

## right: Write something new and strange
fx: renown +10
tags: art
set: playwright_q1
text: Half the audience walks out. The other half will never forget it.

## up(Playwright): Write the aristocrat into it — as the villain, subtly
requires_profession: playwright
fx: renown +14, silver +10
tags: art, crime
set: playwright_q1
text: He loves the villain. He does not notice.

# beat: troupe-crisis
where: city
requires: playwright_q1
speaker: performer
title: Lead actor
---
On opening night, **{npc}**, your lead, has lost their voice. The house is full. The manager is sweating.

## left: Play the part yourself
tags: art, gamble
set: playwright_q2
gamble: 0.5 | win: renown +14 ; You forget half the lines and invent better ones. | lose: renown -6 ; You are a playwright, not an actor. Everyone now knows.

## right: Rewrite the role as a silent one
fx: renown +10
tags: art
set: playwright_q2
text: A mute hero. Critics call it a masterstroke.

## up(Playwright): Make the lost voice part of the plot
requires_profession: playwright
fx: renown +16
tags: art, talk
set: playwright_q2
text: The audience thinks it was planned. You let them.

# beat: censored-play
where: city
requires: playwright_q2
speaker: official
title: Theatre censor
---
**{npc}** has banned your new play: it mocks the court, he says. Your company is out of work. The audience is waiting in the street.

## left: Perform it in the street anyway
fx: renown +18
heat: 14
tags: art, crime
set: playwright_q3, playwright_done
text: The street becomes the stage. Even the guards watch to the end.

## right: Make the cuts and save your actors’ wages
fx: silver +12
tags: official, loyal
set: playwright_q3, playwright_done
text: The play is tamer. Everyone eats.

## up(Playwright): Write a play about a censor who bans a play
requires_profession: playwright
fx: renown +22
tags: art
set: playwright_q3, playwright_done
text: It passes the censor. He doesn’t get the joke. Everyone else does.
