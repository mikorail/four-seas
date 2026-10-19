title: The Caravan Master
profession: trader
badge: Trader's Road

# beat: price-war
where: city
speaker: merchant
title: Rival caravan master
---
**{npc}** has dropped his prices in **{city}** to ruin you. "There is room on this road for one caravan. Mine."

## left: Match his prices
fx: silver -6
tags: trade
set: trader_q1
text: You both lose money. He loses more.

## right: Trade somewhere he cannot follow
fx: silver +10
days: 3
tags: trade, land
set: trader_q1
text: A mountain market three days off the road. Your goods sell twice over.

## up(Caravan Trader): Buy his caravan
requires_profession: trader
fx: silver -12, renown +10
tags: trade
set: trader_q1
text: He was more in debt than you were. Now he works for you.

# beat: desert-well
where: travel
requires: trader_q1
speaker: elder
title: Well-keeper
---
The well at the caravanserai is nearly dry. **{npc}** rations it by the cup. Your camels are thirsty; so are the pilgrims behind you.

## left: Pay for your share
fx: silver -6
tags: trade
set: trader_q2
text: Expensive water. Living camels.

## right: Give your share to the pilgrims
fx: vigor -8
karma: 6
tags: mercy
set: trader_q2
text: Your camels grumble. The pilgrims pray for you for three days.

## up(Caravan Trader): Dig the well deeper with your caravan hands
requires_profession: trader
fx: renown +10, vigor -4
tags: land, mercy
set: trader_q2
text: Six feet down, sweet water. The well-keeper weeps.

# beat: silk-road-deal
where: city
requires: trader_q2
speaker: merchant
title: Guild master
---
The merchant guild of **{city}** offers you a seat: the right to trade without tolls on every road it controls — for a share of everything you carry.

## left: Join the guild
fx: silver +16, renown +8
tags: trade, loyal
set: trader_q3, trader_done
text: The gates open faster now. The share stings.

## right: Stay free
fx: fortune +8
tags: trade
set: trader_q3, trader_done
text: Tolls, haggling, bribes — and nobody to answer to.

## up(Caravan Trader): Negotiate a better share
requires_profession: trader
fx: silver +24
tags: trade, talk
set: trader_q3, trader_done
text: They agree to half what they asked. They respect you for it.
