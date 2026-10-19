title: The Troupe of Shadows
profession: performer
badge: Performer's Path

# beat: banned-puppet
where: city
speaker: performer
title: Puppet Master
---
In an alley behind the temple bazaar in **{city}**, an elderly puppeteer **{npc}** hurriedly packs leather shadow puppets into a wicker basket. "The magistrates banned our satirical play about the greedy prefect! Without an actor of true charisma, the watch will confiscate our stage tonight."

## left: Step onto the street and sing a mocking topical ballad
fx: renown +12, silver +8
tags: art, talk
set: performer_q1
text: A crowd of hundreds forms instantly, laughing at your witty rhymes and dropping copper coins into your hat.

## right: Hide the troupe's props in your travelling luggage
fx: fortune +8, silver -2
tags: mercy, rest
set: performer_q1
text: When the constables arrive, they find only a quiet traveller reading poetry. The troupe slips away safely.

## up(Performer): Stage a dazzling quick-change illusion
requires_profession: performer
fx: renown +18, silver +10
tags: art
set: performer_q1
text: In three breaths you switch between five comical masks. The constables themselves are too entertained to make arrests.

# beat: festival-duel
where: any
requires: performer_q1
speaker: noble
title: Royal Master of Ceremonies
---
At the great seasonal festival in **{city}**, the court entertainer **{npc}** glares from an elevated pavilion. "These wandering vagabonds think they know music! We shall hold a contest before the governor: court elegance against street rhythm!"

## left: Play the haunting sorrow songs of the frontier roads
fx: renown +18, vigor -4
tags: art
set: performer_q2
text: Tough soldiers and grand dames weep openly as your melodies evoke the distance of lost homelands.

## right: Ignite the crowd with explosive drumming and acrobatics
fx: renown +16, silver +14
tags: art, gamble
set: performer_q2
gamble: 0.65 | win: renown +20, fortune +10 ; You leap from the tent poles onto the stage rim; ten thousand spectators chant your name. | lose: vigor -10, renown +8 ; You misjudge the leap, landing awkwardly, but finish the verse on your knees to wild applause.

## up(Performer): Blend classical court themes with street satire
requires_profession: performer
fx: renown +24, fortune +12
tags: art
set: performer_q2
text: The synthesis of high poetics and street vernacular stuns both the commoners and the governor into a standing ovation.

# beat: voice-of-four-seas
where: city
requires: performer_q2
speaker: elder
title: Grand Dramatist
---
In the royal amphitheatre in **{city}**, masters of song, shadow play and masked drama present you with a gilded lute and silver mask. **{npc}** bows: "You give voice to those who have no courts to speak in. You are the Laureate of Four Seas."

## left: Found a permanent school of dramatic arts for commoners
fx: renown +35, fortune +20, silver +15
tags: art, mercy
text: Your plays are staged from Edo to Batavia. Even when monarchs fall, your verses are sung in taverns.

## right: Travel forever as the living legend of song
fx: renown +40, vigor +15
tags: art, rest
text: Wherever your caravan stops, children run ahead through the gates shouting that the Grand Performer has arrived.
