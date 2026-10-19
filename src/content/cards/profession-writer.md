title: The Unfinished Book
profession: writer
badge: Writer's Road

# beat: publisher
where: city
speaker: merchant
title: Woodblock printer
---
**{npc}**’s print shop smells of ink and pear wood. "Travel books sell. Bring me chapters — real places, real scandal — and I will carve them."

## left: Sell him your journal, as it is
fx: silver +10
tags: art, trade
set: writer_q1
text: Your spelling is corrected. Your adventures are improved. It sells.

## right: Write the honest version
fx: renown +8
tags: art
set: writer_q1
text: Fewer dragons than he wanted. More truth than anyone expected.

## up(Writer): Write it under a pen name
requires_profession: writer
fx: renown +4, silver +12
tags: art, crime
set: writer_q1
text: Nobody knows "the Old Wanderer" is you. Yet.

# beat: censor
where: city
requires: writer_q1
speaker: official
title: Imperial censor
---
**{npc}** has read your book. "Chapter seven insults the governor. Chapter nine insults me. Remove them, or the blocks are burned."

## left: Cut the chapters
fx: silver +6
tags: official
set: writer_q2
text: The book lives, smaller. You keep the cut pages in your coat.

## right: Refuse
fx: renown +10
heat: 10
tags: loyal, art
set: writer_q2
text: The blocks burn. Copies are already travelling by smuggler’s junk.

## up(Writer): Rewrite them so cleverly he cannot object
requires_profession: writer
fx: renown +14
tags: art, talk
set: writer_q2
text: Every insult is still there, disguised as praise. He signs the permit.

# beat: masterpiece
where: any
requires: writer_q2
speaker: elder
title: Old reader
---
**{npc}** has walked three days to find you. "I have read your book eleven times. Will there be another? Tell me there will be another."

## left: Promise a second book
fx: fortune +8, renown +8
tags: art, loyal
set: writer_q3, writer_done
text: You start writing that night, by a bad lamp, very happily.

## right: Give them the last copy of your notes
fx: renown +12
tags: mercy, art
set: writer_q3, writer_done
text: They hold the notebook like a relic.

## up(Writer): Write them into the next chapter
requires_profession: writer
fx: renown +16, fortune +6
tags: art
set: writer_q3, writer_done
text: They cry. You have never had a better review.
