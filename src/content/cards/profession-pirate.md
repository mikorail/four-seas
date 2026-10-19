title: The Corsair's Legacy
profession: pirate
badge: Pirate's Path

# beat: corsair-parchment
where: city, sea
speaker: sailor
title: One-Eyed Gunner
---
In a rough harbour den in **{city}**, an old corsair **{npc}** slides a stained piece of sailcloth across the rum-stained table. "Before the Great Black Flag fleet was burned, our admiral buried three chests of Manila silver on a limestone islet. I'm too old to sail, but you've got sea-salt in your blood."

## left: Buy the map and hire the gunner as advisor
fx: silver -10, renown +8
tags: sea, trade
set: pirate_q1
text: You pay for his tavern tab and take him aboard; the old gunner knows every reef from Taiwan to Borneo.

## right: Steal the map when the tavern brawl breaks out
fx: silver +6, fortune -4
heat: 10
tags: crime, fight
set: pirate_q1
text: A flying stool, a shattered lantern, and you slip through the salt spray with the chart tucked in your belt.

## up(Sea Rover): Name the forgotten pirate cove from memory
requires_profession: pirate
fx: renown +16, silver +8
tags: sea
set: pirate_q1
text: "Skull Rock on the Dragon's Shoal," you declare. The gunner gasps in astonishment and toasts your name.

# beat: mutiny-in-the-gale
where: sea
requires: pirate_q1
speaker: captain
title: Rebellious First Mate
---
During a violent squall off the rocky coast, the first mate **{npc}** draws a cutlass on the quarterdeck. "The silver is ours, not yours! Surrender the helm or feed the sharks tonight!"

## left: Disarm the mate in a lightning-fast duel on the slippery deck
fx: vigor -6, renown +18
tags: fight, sea
set: pirate_q2
gamble: 0.7 | win: renown +16, fortune +8 ; A kick to the knee and a disarming slash; you kick his blade overboard and command the helm. | lose: vigor -14, renown +6 ; You take a cut across the ribs, but smash him against the capstan and restore order.

## right: Offer the crew a double share of the treasure to turn on the mutineer
fx: silver -12, renown +12
tags: bribe, talk
set: pirate_q2
text: The deckhands tackle the first mate to the planks; self-interest makes loyal sailors every time.

## up(Sea Rover): Ride the rogue wave and steady the rudder yourself
requires_profession: pirate
fx: renown +24, vigor +6
tags: sea
set: pirate_q2
text: You grasp the whipstaff and steer through the breaker wall. Awed by your seamanship, the crew kneels in submission.

# beat: admiral-of-the-black-flag
where: city, sea
requires: pirate_q2
speaker: bandit
title: Pirate Fleet Captain
---
At the hidden lagoon base of the pirate armada, three dozen war-junks hoist black banners in salute. **{npc}** boards your vessel to present the Admiral's cutlass. "The colonial navies tremble at your sail. Lead the brotherhood, Admiral!"

## left: Lead the fleet into a sovereign maritime confederacy
fx: renown +40, silver +30, vigor +10
tags: sea, loyal
text: You establish a free maritime haven with laws, clinics, and fair shares for every sailor of the four seas.

## right: Disband the fleet, take your share of chests, and retire rich
fx: silver +60, renown +15
tags: crime, trade
text: You slip into an elegant coastal mansion under an assumed nobleman's name, rich beyond the dreams of emperors.
