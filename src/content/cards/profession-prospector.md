title: Colour in the Pan
profession: prospector
badge: Prospector's Road

# beat: rumour
where: any
speaker: elder
title: Old miner with a cough
---
**{npc}** lowers his voice: "Gold in the stream below the old shrine. I am too old to dig. Half for me, half for you."

## left: Dig with him
fx: vigor -8
tags: land, gamble
set: prospector_q1
gamble: 0.5 | win: silver +20 ; Colour in the pan — real colour. | lose: fortune -4 ; Fool’s gold, and a sore back.

## right: Buy his map
fx: silver -6, fortune +4
tags: trade
set: prospector_q1
text: It might be worthless. It might be everything.

## up(Prospector): Read the rocks yourself
requires_profession: prospector
fx: silver +18
tags: land
set: prospector_q1
text: You were right about the quartz vein. He was right about the stream. Together, rich.

# beat: claim-jumpers
where: travel
requires: prospector_q1
speaker: bandit
title: Claim jumper
---
Three men with shovels and knives say your claim is theirs. **{npc}** spits. "Walk away, or get buried in it."

## left: Fight for the claim
tags: fight, gamble
set: prospector_q2
gamble: 0.45 | win: silver +16, renown +6 ; They run, and leave their shovels. | lose: vigor -14, silver -8 ; They take the claim and your boots.

## right: Sell them the claim
fx: silver +10
tags: trade
set: prospector_q2
text: They pay. They will find out it is nearly dry.

## up(Prospector): Show them the deed and the magistrate’s seal
requires_profession: prospector
fx: renown +8
tags: official
set: prospector_q2
text: Paper beats shovels, this time.

# beat: mother-lode
where: any
requires: prospector_q2
speaker: merchant
title: Assayer
---
**{npc}** weighs your last find twice. "This came from a seam. A big seam. If you file the claim, you are rich. If you tell the town, the town is rich."

## left: File the claim
fx: silver +30
tags: trade
set: prospector_q3, prospector_done
text: Rich. Very rich. People look at you differently now.

## right: Tell the town
fx: renown +18
karma: 8
tags: mercy
set: prospector_q3, prospector_done
text: They name the mine after you and build a school with the first silver.

## up(Prospector): Sell it to the mining guild for a share forever
requires_profession: prospector
fx: silver +20, fortune +8
tags: trade
set: prospector_q3, prospector_done
text: A small sum, every year, wherever you are.
