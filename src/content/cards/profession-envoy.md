title: The Sovereign's Seal
profession: envoy
badge: Envoy's Path

# beat: frontier-ultimatum
where: city, any
speaker: official
title: Border Governor
---
In the heavily guarded citadel of **{city}**, the anxious border governor **{npc}** seals a red-ribboned dispatch box with wax. "The neighboring kingdom mobilizes fifty thousand troops along the river! One intemperate word will ignite a twenty-year war across the provinces. We need an ambassador who can smile in the mouth of a cannon."

## left: Deliver the emperor's terms with unbending imperial dignity
fx: renown +12, silver -4
tags: official, talk
set: envoy_q1
text: Bearing the golden credential tassels, you ride straight past the frontier guards without blinking.

## right: Offer trade concessions and mutual border exemptions
fx: silver +10, renown +8, fortune +4
tags: trade, official
set: envoy_q1
text: You appeal to their ministers' mercantile interests, planting the seeds of mutual commerce over bloodshed.

## up(Royal Envoy): Invoke ancient diplomatic immunity protocols
requires_profession: envoy
fx: renown +18, fortune +8
tags: official
set: envoy_q1
text: You display the jade pass of the imperial chancery; the frontier captains strike their breastplates and form an honor escort.

# beat: pavilion-parley
where: any
requires: envoy_q1
speaker: noble
title: Foreign Field Marshal
---
In a pavilion pitched between two opposing armies, the foreign commander **{npc}** rests a gauntleted hand on a curved sabre. "Our sovereign was insulted by your court's insolence! Why should we stay our artillery when victory lies within our grasp?"

## left: Present the intercepted letters exposing corrupt warmongers in their own court
fx: renown +20, fortune +12
tags: official, talk
set: envoy_q2
text: The foreign general turns pale reading the names of ministers taking bribes to provoke war. The orders to attack are halted.

## right: Offer marriage and commercial alliances guaranteed by royal hostages
fx: renown +16, silver +12
tags: romance, loyal
set: envoy_q2
text: Compromise preserves the honor of both thrones; drums sound the retreat as campfires turn to banquets.

## up(Royal Envoy): Quote reciprocal sovereignty treaties word for word
requires_profession: envoy
fx: renown +26, fortune +10
tags: official
set: envoy_q2
text: Your flawless citation of international treaties leaves their jurists speechless and their marshals nodding in respect.

# beat: perpetual-peace
where: city
requires: envoy_q2
speaker: noble
title: Crown Prince
---
In the grand throne room in **{city}**, monarchs of both empires rise to welcome you. **{npc}** fastens the Grand Collar of the Jade Falcon around your shoulders. "Thousands of sons live today because of your courage. You are the Peacemaker of Four Seas."

## left: Ratify the Treaty of Four Seas with golden ink
fx: renown +45, fortune +20, silver +25
tags: official, loyal
text: Church bells and temple gongs ring out together across three hundred cities to celebrate the dawn of peace.

## right: Settle as Ambassador-Plenipotentiary with a grand river palace
fx: silver +50, renown +25
tags: official, rest
text: Your riverside embassy becomes the center of international diplomacy, culture, and statecraft for decades to come.
