campaign: manila-galleon
title: The Manila Galleon
blurb: Once a year a single ship crosses the empty Pacific, carrying the silk of China to the silver of Mexico. This year, you are aboard.
start: manila
destination: acapulco
years: 1600-1780
deadline: 210
item: the Governor's sealed dispatches
patron: the Governor of the Philippines

# beat: muster
at: manila
speaker: official
title: Governor's secretary
culture: european
weight: 200
---
The galleon rides at anchor off Cavite, fat and high-sided, the largest thing you have ever seen float. The Governor's secretary, **{npc}**, slides the dispatches across his desk. "You sail as supercargo. A berth costs nothing — but the space in it is worth a fortune, if you take my meaning."

## left: Take the honest berth
fx: renown +4
tags: loyal
set: honest
text: A narrow plank bed, a sea chest, and a clear conscience.

## right: Fill your berth with untaxed silk
fx: silver -6
tags: crime
heat: 10
set: smuggler
text: Every inch of your cabin is packed with bolts of silk. You will sleep sitting up for four months.

# beat: parian
at: manila
speaker: merchant
title: Sangley silk merchant
culture: han
requires: smuggler
---
In the Parián, the walled Chinese quarter, **{npc}** unrolls Suzhou damask by lamplight. "The Spaniards tax my silk twice and massacre us every twenty years. I will sell to you cheaply — if you carry a letter to my cousin in Acapulco."

## left: Just the silk, thank you
fx: silver -4
set: silk

## right: Carry the letter too
fx: silver -2
tags: mercy
set: silk, sangley-letter
remember: favor | carried a letter for the Sangley quarter
text: A thin envelope sealed with a red chop. "Do not let the Inquisition read it."

# beat: strait
at: sea
speaker: captain
title: Galleon pilot
culture: european
---
In the San Bernardino Strait the galleon must thread between reefs with the monsoon behind it. **{npc}**, the pilot, is drunk. The captain looks at you: "You have a steady hand. Take the whipstaff?"

## left: Leave it to the pilot
gamble: 0.55 | win: renown +2 ; The drunk pilot steers like a saint. | lose: vigor -10 ; The keel scrapes coral; you are thrown across the deck.

## right: Take the whipstaff yourself
tags: sea
gamble: 0.6 | win: renown +10 ; Through the strait without a scratch. The crew starts calling you "pilot". | lose: vigor -8, renown -4 ; A sickening crunch. Pumps all night.
set: steered

# beat: scurvy
at: sea
speaker: healer
title: Ship's surgeon
culture: european
weight: 120
---
Two months out and the gums of the crew are turning black. **{npc}** the surgeon counts the last lemons. "Scurvy. There is fruit enough to save the officers — or to give everyone a little less than enough."

## left: Officers first
tags: loyal, cruel
fx: vigor +4
text: The officers keep their teeth. Below deck, men stop singing.

## right: Share it with every sailor
fx: vigor -8
tags: mercy
set: crew-loves-you
text: Everyone is a little sick and nobody dies yet. The crew notices who argued for them.

# beat: guam
at: guam
speaker: elder
title: Chamorro chief
culture: pacific
---
The Marianas. Canoes race out to the galleon with coconuts, fish and fresh water. **{npc}** stands in the lead canoe, watching the cannon carefully. Some of the soldiers are already reaching for their muskets.

## left: Let the soldiers take what they need
tags: cruel
fx: vigor +10
standing: -20
text: Fresh water — and a village burning on the shore as you sail away.

## right: Trade fairly, and stop the soldiers
fx: silver -4, vigor +8
tags: mercy
standing: 15
set: chamorro-friends
remember: favor | traded fairly and stopped the soldiers
text: Breadfruit, fish and a necklace of shells for the trouble.

# beat: mutiny-plot
at: sea
speaker: sailor
title: Bosun
culture: european
requires: crew-loves-you
---
Past the halfway mark, **{npc}** finds you at the rail after midnight. "The captain is a butcher and the officers eat while we starve. Half the crew will follow you. Say the word and the ship is ours — and so is the silver of Mexico."

## left: Warn the captain
tags: loyal, cruel
standing: 10
set: loyal-to-captain
text: Three men are put in irons. The bosun looks at you once, and never again.

## right: Lead the mutiny
tags: crime
heat: 40
set: mutineer
text: At four bells the officers are locked in the great cabin. The ship is yours.

# beat: privateer
at: sea
speaker: captain
title: English privateer
culture: european
unless: mutineer
---
A sail on the horizon — English colours. A privateer has waited all season for exactly this ship. **{npc}** hails you through a speaking trumpet: "Strike your flag and no one need die."

## left: Strike the flag
fx: silver -15
clear: silk
text: They take the silk, the wine and the captain's silver plate, and sail off whistling.

## right: Fight
tags: fight
gamble: 0.5 | win: renown +16 ; Broadside for broadside — the privateer limps away dismasted. | lose: vigor -16, silver -10 ; They board you. You keep your life and little else.

# beat: fair
at: acapulco
speaker: official
title: Royal customs officer
culture: european
requires: smuggler
weight: 150
---
Acapulco: a hot little bay that wakes up once a year for the galleon fair. Merchants from Mexico City crowd the beach. **{npc}**, of the royal customs, raps on your sea chest with his cane. "And what is this, señor?"

## left: Bribe him
fx: silver -10, renown -2
tags: bribe
set: sold-silk
text: The cane stops tapping. The silk sells for six times what you paid in Manila.

## right: Bluff it out
tags: talk
gamble: 0.45 | win: silver +30 ; "Personal effects, of course." The silk sells for a fortune. | lose: silver -10, renown -10 ; Seized, fined, and named in the town square.

# beat: arrival
at: acapulco
speaker: noble
title: Viceroy's envoy
culture: european
weight: 100
unless: mutineer
---
At last: the bells of Acapulco, the smell of land, mule trains waiting to carry silk to Mexico City. **{npc}**, envoy of the Viceroy, waits on the quay for the Governor's dispatches — and for you.

## left: Deliver the dispatches and sail home with the galleon
fx: renown +12, silver +10
tags: loyal
ending: won | The Galleon Comes Home | You hand over the dispatches, sell what you carried, and a season later sail west again with a hold full of Mexican silver. Few people cross the Pacific twice. You are one of them.

## right: Deliver the dispatches, then stay in New Spain
fx: renown +8
ending: won | A New Life in New Spain | You ride the mule road to Mexico City with the silk trains, and never quite leave. Your grandchildren will speak Spanish, Nahuatl and — oddly — a little of the language of Manila.

## up(Sangley letter): Deliver the Sangley merchant's letter as well
requires_flag: sangley-letter
fx: renown +6, silver +12
ending: won | Friend of Two Shores | The Chinese cousin in Acapulco reads the letter and weeps; a family split by an ocean is joined again. Their trade house carries your name on its ledger for a hundred years.

# beat: pirate-ending
at: acapulco, panama, lima
speaker: sailor
title: Mutineer bosun
culture: european
requires: mutineer
weight: 160
---
The mutineers anchor out of cannon range. Behind you, the Governor's officers are still locked in the great cabin. **{npc}** grins: "The silver of Mexico is out there, captain. Where do we take her?"

## left: Return the ship and plead for mercy
fx: renown -10
tags: loyal
ending: lost | In Chains in Acapulco | The Viceroy is not merciful. Neither is the rope. Your crew remembers you kindly, from the gallows.

## right: Sail away under no flag at all
fx: silver +30
tags: crime
ending: won | Pirate of the Pacific | For eleven years a galleon with no name raids the coasts from Panama to the Moluccas. Sailors sing about you in four languages. Nobody ever catches you.
