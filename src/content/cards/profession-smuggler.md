title: The Midnight Tide
profession: smuggler
badge: Smuggler's Path

# beat: false-bottom-skiff
where: city, sea
speaker: bandit
title: Wharf Runner
---
In the dripping shadow of the salt docks in **{city}**, a nervous runner **{npc}** taps on your boat gunwale. "The customs magistrate doubled the maritime tariff on raw silk. We have three crates of unstamped brocade hidden in the reeds. We need a runner with nerves of iron."

## left: Hide the silk beneath barrels of foul salt herring
fx: silver +18, renown -4
heat: 8
tags: crime, trade
set: smuggler_q1
text: The customs inspector gags at the stench of the fish barrels and waves your barge through without poking beneath.

## right: Bribe the night patrol guard with clean silver
fx: silver -6, renown +6
heat: -4
tags: bribe, talk
set: smuggler_q1
text: A quiet exchange of silver sleeves; the lantern beam conveniently turns toward the far jetty.

## up(Smuggler): Row the shallows on the blind side of the tide
requires_profession: smuggler
fx: silver +22, fortune +6
tags: crime
set: smuggler_q1
text: You ride the mud flats where patrol cutters would run aground, sliding silently into the canal warehouse.

# beat: double-cross-pier
where: any
requires: smuggler_q1
speaker: official
title: Corrupt Port Surveyor
---
At a lantern-lit tavern near the waterfront, the broker **{npc}** leans across the table, surrounded by concealed constables. "You brought the goods, but the price of liberty has risen. Surrender half the cargo or spend the winter in the harbour cage."

## left: Overturn the oil lamps and vanish into the maze of alleys
fx: vigor -6, silver +14
heat: 10
tags: crime, fight
set: smuggler_q2
gamble: 0.7 | win: silver +16, renown +8 ; You vault across the canal roofs with the pouch intact; the constables crash into fish carts. | lose: vigor -14, silver -10 ; You escape into a sewer drain, soaking wet and bruised, but still free.

## right: Expose the broker's own embezzlement to the captain of the watch
fx: renown +14
heat: -8
tags: talk, official
set: smuggler_q2
text: You produce the surveyor's private ledger of bribes. The constables arrest their own employer instead.

## up(Smuggler): Signal your crew to seal the tavern doors from outside
requires_profession: smuggler
fx: silver +25, renown +12
tags: crime
set: smuggler_q2
text: Your wharf lads bar the exits and strip the constables of their purses before they can draw a single cutlass.

# beat: sovereign-of-the-straits
where: city
requires: smuggler_q2
speaker: merchant
title: Syndicate Master
---
In a hidden vault beneath the old harbor fortress in **{city}**, the underworld elders gather. **{npc}** hands you a jade token etched with a rising wave. "Governments write tariffs on parchment; we write trade upon the water. You are the Master of the Midnight Tide."

## left: Build a covert network to transport refugees and forbidden medicine
fx: renown +30, fortune +25, silver +20
tags: mercy, crime
text: Desperate families whisper your name in gratitude. No naval blockade can stop your ghost fleets.

## right: Monopolize the secret contraband trade across four archipelagos
fx: silver +55, renown +15
tags: crime, trade
text: You retire with secret vaults across ten islands, wealthier and freer than any landlocked emperor.
