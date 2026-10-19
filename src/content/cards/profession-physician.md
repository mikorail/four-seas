title: The Great Pestilence
profession: physician
badge: Healer's Path

# beat: pestilence-ward
where: city
speaker: healer
title: Apothecary Warden
---
In the crowded docks of **{city}**, yellow quarantine flags flap in the wind. The chief apothecary **{npc}** runs out coughing into a cloth. "A strange fever arrived with the last monsoon fleet. The standard remedies turn the pulse to lead. We need someone who can read the meridians."

## left: Enter the quarantine tents with boiling vinegar and masks
fx: vigor -6, renown +12, silver -4
tags: illness, mercy
set: physician_q1
text: You wash the beds in hot vinegar and lance the swelling nodes. By dusk, thirty patients are breathing softly.

## right: Quarantine the ships and isolate the harbor basins
fx: silver -8, renown +10
tags: official, illness
set: physician_q1
text: Merchants curse you for the delays, but the epidemic halts at the waterfront wall.

## up(Physician): Diagnose the rare marsh miasma by three-finger pulse
requires_profession: physician
fx: renown +18, vigor -2
tags: illness
set: physician_q1
item: medicine
text: You identify the root as a swamp spore, prescribing crushed wormwood that breaks the delirium in hours.

# beat: snow-lotus
where: land, river
requires: physician_q1
speaker: elder
title: Herbal Gatherer
---
High in the rocky passes, an elderly herb gatherer **{npc}** points with a bamboo staff to misty crags. "The only cure that purges the black fever deep in the marrow is the thousand-year root, blooming upon the cliff face."

## left: Climb the slick rocks in freezing rain
fx: vigor -10, fortune +12
tags: rest, illness
set: physician_q2
gamble: 0.65 | win: renown +16, vigor +8 ; You reach the white bloom undamaged; the mountain spirits seem to guide your footing. | lose: vigor -14, fortune -4 ; A rock gives way; you slide down the scree with bleeding palms, but the roots stay clenched in your teeth.

## right: Trade valuable silver coin for the gathered stock
fx: silver -14, renown +8
tags: trade
set: physician_q2
text: The old gatherer accepts your silver gladly, handing over two wicker hampers of dried mountain herbs.

## up(Physician): Synthesize a compound from common wayside roots
requires_profession: physician
fx: renown +20, silver +6
tags: illness
set: physician_q2
text: Your knowledge of comparative botany lets you combine wild gentian and licorice into an equivalent panacea.

# beat: grand-pharmacopoeia
where: city
requires: physician_q2
speaker: noble
title: Royal Physician
---
In the marble courtyard of the capital in **{city}**, the royal court doctor **{npc}** bows deeply. "You have stopped an epidemic that threatened three kingdoms. The Emperor commissions you to compile the Comprehensive Pharmacopoeia of the Four Seas."

## left: Publish the compendium freely for all village healers
fx: renown +30, fortune +20, silver +15
tags: mercy, art
text: From Korea to Bengal, wandering doctors carry copies of your handbook in their wooden chests.

## right: Accept the appointment as Court Physician Supreme
fx: silver +40, renown +25
tags: official, loyal
text: You take residence in the imperial palace, with jade medicine jars and gardens of medicinal saplings.
