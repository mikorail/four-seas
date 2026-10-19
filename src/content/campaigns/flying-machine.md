campaign: flying-machine
title: The Flying Machine
blurb: 1784. Word arrives in Macao that the French have flown in a silk bag of hot air. Build one in the East — and fly it to the Emperor in Peking.
start: macau
destination: beijing
years: 1784-1795
deadline: 160
item: the Montgolfier plans
patron: a Jesuit astronomer of the Imperial Observatory
culture: european

# beat: news
at: macau
speaker: monk
title: Jesuit astronomer
culture: european
weight: 200
---
In the library of St Paul's, **{npc}** unfolds an engraving still smelling of the ship from Lisbon: a striped balloon rising over Versailles, a sheep, a duck and a rooster in the basket. "The Emperor collects clocks and automata. Imagine his face if a Chinese balloon flew over the Forbidden City."

## left: Take the plans
fx: renown +4
item: balloon-plans
set: plans
text: Diagrams in French, notes in Latin, and a great deal of optimism.

## right: Take the plans — and a French instrument-maker's address in Canton
fx: silver -6
item: balloon-plans
set: plans, maker
text: "Ask for Monsieur Riviere. Do not lend him money."

# beat: silk
at: hangzhou, suzhou, nanjing, guangzhou
speaker: merchant
title: Silk weaver
culture: han
---
The envelope needs a hundred bolts of the lightest silk. **{npc}** runs the cloth through her fingers. "For a flying bag? You are mad. I like mad customers — they pay in advance."

## left: Pay for the finest silk
fx: silver -14
item: good:silk
set: silk
text: Bolts light as smoke, wrapped in rice paper.

## right: Talk her into making it as an experiment
tags: talk
gamble: 0.5 | win: renown +6 ; She weaves it for the honour of being first. | lose: silver -18 ; She charges you double "for the madness".
set: silk

# beat: lacquer
at: guangzhou, hangzhou, kyoto, nagasaki, hue
speaker: performer
title: Lacquer master
---
Hot air leaks through silk. **{npc}**, a lacquer master, dips a brush in tung oil and smiles. "Seven thin coats. It will hold smoke the way a bowl holds soup."

## left: Pay for seven coats
fx: silver -10
item: good:lacquerware
set: varnish

## right: Use cheap varnish to save money
fx: silver -3
set: varnish, cheap
text: It smells terrible. It will probably be fine.

# beat: test
at: city
speaker: child
title: Astonished urchin
requires: silk, varnish
weight: 150
---
In a temple courtyard you assemble the great bag over a brazier of straw and wool. It swells, rises, tugs at its ropes. **{npc}** and half the city are watching from the walls.

## left: Send it up empty first
fx: renown +8
text: It sails over the river and comes down in a duck pond. The crowd goes wild.
flag: balloon

## right: Climb in yourself
gamble: 0.6 | win: renown +16, fortune +6 ; You rise over the rooftops. The world goes silent and enormous. | lose: vigor -14, renown +6 ; Up, up — and down into a persimmon tree. Bruised but famous.
flag: balloon

## up(Cheap varnish): Patch the leaks before it is too late
requires_flag: cheap
fx: silver -6
flag: balloon
text: A night of frantic patching. By dawn it holds.

# beat: macartney
at: beijing
speaker: noble
name: The Qianlong Emperor
title: Son of Heaven
culture: han
gender: m
weight: 200
---
The Forbidden City. Lord Macartney's British embassy has just been politely dismissed: the **Qianlong Emperor** told the King of England that the Celestial Empire "possesses all things in abundance and has no need of your country's manufactures." Now he regards your folded silk bag. "And what is this?"

## left: Fly it over the Forbidden City
fx: renown +25
ending: won | Above the Forbidden City | The balloon rises over the golden roofs while eunuchs faint. The Emperor watches for a long time without a word, then has a poem written about a "heavenly lantern". It is filed away in a library. You keep flying.

## right: Present it humbly as a gift
fx: silver +20, renown +10
tags: loyal
ending: won | A Curiosity in the Palace | The balloon is catalogued with ten thousand clocks and automata in the Palace collection. You are rewarded richly and forgotten quickly. A century later someone wishes they had paid attention.

## up(Instrument maker): Explain how the hot air lifts it
requires_flag: maker
fx: renown +18
ending: won | The Emperor's Natural Philosopher | You explain heat, air and weight with a teapot and a feather. The Emperor laughs, appoints you to the Observatory, and asks you to make it carry a dragon next time.
