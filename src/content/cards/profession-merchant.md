title: The Guild of Four Seas
profession: merchant
badge: Merchant's Path

# beat: spice-cartel
where: city
speaker: merchant
title: Guild Factor
---
In the shaded courtyard of the merchant guild in **{city}**, an elder factor **{npc}** taps an open ledger. "A rival syndicate is cornering nutmeg and cloves, bleeding the small shops. We need a merchant with clean hands and sharp wits to break their grip."

## left: Expose their false manifests
fx: renown +10, silver +12
tags: trade, talk
set: merchant_q1
text: You audit the port customs logs by candlelight. Three corrupt clerks flee before dawn.

## right: Buy into their cartel quietly
fx: silver +22, renown -6
tags: trade, crime
set: merchant_q1
text: Silver speaks louder than scruples. You walk away with a private percentage of the monopoly.

## up(Merchant): Corner their warehouses with guild credit
requires_profession: merchant
fx: silver +18, renown +12
tags: trade
set: merchant_q1
text: Using your own promissory notes, you purchase the surplus cargo beneath their noses.

# beat: credit-crisis
where: any
requires: merchant_q1
speaker: noble
title: High Commissioner of Trade
---
Word of your commercial maneuvers reaches the imperial customs commissioner **{npc}**. "Your credit letters circulate from Nagasaki to Malacca. But credit is paper; empires run on trust. Can your guild weather a sudden trade panic?"

## left: Open your coffers to back every note
fx: silver -10, renown +18, fortune +10
tags: loyal, trade
set: merchant_q2
text: Every payee is satisfied to the copper cash. Your reputation becomes as solid as silver ingots.

## right: Offer a high-risk maritime insurance pool
fx: silver +15, fortune -4
tags: trade, gamble
set: merchant_q2
gamble: 0.6 | win: silver +20, renown +12 ; Your insurance convoy docks safely; merchants crown you the shrewdest trader in Asia. | lose: silver -12, vigor -6 ; A winter storm sinks two junks; you spend weeks soothing angry creditors.

## up(Merchant): Arbitrage exchange rates between copper and silver
requires_profession: merchant
fx: silver +25, renown +10
tags: trade
set: merchant_q2
text: You exploit regional valuation disparities across frontiers, turning a paper panic into substantial gain.

# beat: merchant-prince
where: city
requires: merchant_q2
speaker: elder
title: Dean of the Grand Syndicate
---
In **{city}**, the grand merchant council gathers to honour you. **{npc}** presents you with an ivory abacus and the hereditary seal of the Grand Factors. "Few understand both the wind and the coin. The trade routes of four seas answer to you."

## left: Endow public granaries and maritime hospices
fx: renown +25, fortune +15, silver +20
tags: mercy, trade
text: Your name is carved upon temple stelae across the coastline. Generations of sailors drink to your memory.

## right: Reinvest everything into overseas armadas
fx: silver +45, renown +15
tags: trade
text: Five galleons bear your pennant across the ocean. When your fleets hoist sail, port cities celebrate.
