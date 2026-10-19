title: Mapping the Terra Incognita
profession: cartographer
badge: Cartographer's Path

# beat: false-shoals
where: city
speaker: captain
title: Sea Pilot
---
Over a sea tavern table in **{city}**, a seasoned navigator **{npc}** slams down a parchment chart soaked in brine. "The royal maps show deep water where three junks broke on sunken reefs last winter! The court geographers draw dragons where there are only rocks."

## left: Buy their dead-reckoning logbooks for good silver
fx: silver -8, renown +10
tags: trade, art
set: cartographer_q1
text: You purchase five years of handwritten soundings and wind compass bearings jotted in grease-pencil.

## right: Offer to survey the bay shoals yourself at low tide
fx: vigor -6, renown +12
tags: sea, art
set: cartographer_q1
text: Wading hip-deep in breakers with lead-line and surveyor's rod, you mark the true channel in vermilion ink.

## up(Cartographer): Cross-reference Portuguese astrolabe data with local star lore
requires_profession: cartographer
fx: renown +18, fortune +8
tags: art
set: cartographer_q1
text: By harmonizing southern cross declination with traditional star-paths, you correct thirty leagues of error.

# beat: triangulation-peak
where: land, sea
requires: cartographer_q1
speaker: scholar
title: Imperial Surveyor
---
On a windswept promontory overlooking coastlines and river valleys, an imperial surveyor **{npc}** struggles with a brass quadrant. "The horizon dips with the curvature of the earth! How do we anchor the longitudes without clock towers?"

## left: Use lunar distance calculations and eclipse tables
fx: vigor -4, renown +16
tags: art
set: cartographer_q2
text: By recording the precise passage of the moon through the constellations, you pin the city's true longitude.

## right: Survey the baseline with chained iron rods across the valley
fx: vigor -10, renown +14, silver +6
tags: rest, art
set: cartographer_q2
text: Ten days of dragging iron chains through brush yields an exact baseline ten thousand paces long.

## up(Cartographer): Employ spherical trigonometry and triangulation angles
requires_profession: cartographer
fx: renown +22, fortune +10
tags: art
set: cartographer_q2
text: Your calculations align the mountain peaks into an unbreakable geometric web across three provinces.

# beat: the-four-seas-atlas
where: city
requires: cartographer_q2
speaker: noble
title: Grand Chancellor
---
In the royal cartographic bureau in **{city}**, ministers and admirals gather around your magnificent drafted atlas. **{npc}** traces the coasts of Asia and the Pacific in awe. "No kingdom has ever possessed a true mirror of the world until now."

## left: Dedicate the atlas to safe navigation for all seafaring people
fx: renown +35, fortune +15, silver +20
tags: mercy, art
text: Engravers produce copperplate impressions sold in every harbor. Shipmasters pray for you before weighing anchor.

## right: Keep the secret passages for royal merchant convoys
fx: silver +45, renown +20
tags: official, loyal
text: The Emperor rewards you with an estate overlooking the very bay you charted, and a pension for life.
