campaign: tulip-mania
id: tulip-mania
title: The Tulip and the Ledger
blurb: 1636. In the taverns of Haarlem and Amsterdam, a single striped tulip bulb trades for the price of a canal mansion. Carry a sealed bulb casket and VOC bills of exchange from the North Sea to the Sultan's gardens in Constantinople before the market collapses.
start: amsterdam
home: amsterdam
destination: istanbul
years: 1636-1637
year: 1636
deadline: 180
item: Semper Augustus bulb casket
patron: Regents of the Amsterdam Bourse
culture: european

# beat: haarlem-tavern
at: any
where: any
speaker: merchant
name: Hendrick van der Voort
title: Regent of the Amsterdam Bourse
culture: european
gender: m
weight: 250
---
Tobacco smoke and the clink of pewter tankards fill a back-room *college* in **Amsterdam**, where florists and weavers bid thousands of guilders on paper *windhandel* contracts for tulips still sleeping in the frozen earth. **Hendrick van der Voort** locks a brass-bound walnut casket containing three offsets of **Semper Augustus**, crimson-flamed upon pure white petals, alongside East India bills of exchange bound for the Levant Company in Constantinople. "The bubble is swelling too fast," he warns in a low voice. "Carry these true bulbs and our bullion drafts back to the imperial gardens of the Porte before the winter auctions break."

## left: Bind yourself to the Bourse regents and guard the bullion drafts
fx: renown +8, silver +10, vigor +4
tags: loyal, trade
set: stage1, bourse_factor
standing: 8
text: Van der Voort hands you a waxed leather portfolio of bills drawn on Venice and Smyrna, with road guilders for the Rhine post-coaches.

## right: Buy a speculative futures note in the tavern before departing
fx: silver +16, fortune +4
tags: gamble, trade
set: stage1, windhandel_speculator
text: You trade a silver watch for a third-hand florist's promissory script on forty *Viceroy* bulbs, betting you can cash it before February.

## up(Merchant): Audit the tavern slate and hedge the cargo with Levant silk contracts
requires_trait: merchant
fx: silver +14, renown +8, fortune +4
tags: trade, talk
set: stage1, bourse_factor
text: Seeing the paper fever cannot survive the spring thaw, you convert half your commission advance into hard silver rixdollars.

# beat: hortus-botanicus
at: any
where: any
speaker: scholar
name: Doctor Nicolaes Tulp
title: Praelector of Anatomy and Botanist
culture: european
gender: m
requires: stage1
weight: 240
---
Before your carriage clears the canal gates toward the Rhine road, **Doctor Nicolaes Tulp** and a botanical painter descended from Carolus Clusius's Leiden circle inspect your walnut casket by lantern light. "The broken flame in the petals is beautiful, yet it weakens the mother bulb each season," Tulp observes, sketching the papery tunic in red chalk. "Thieves paid by rival Haarlem syndicates are watching the post-boats to steal or swap the *Semper Augustus*."

## left: Pack the bulbs in dry dune sand and seal the casket with the civic signet
fx: renown +8, vigor +6, silver +6
tags: official, loyal
set: stage2, clusius_seal
text: Tulp's wax impression and a tin lining keep out both river damp and prying fingers along the German post-roads.

## right: Commission a water-color florilegium of the bulb to sell to court collectors
fx: silver +12, renown +6, fortune +4
tags: art, trade
set: stage2, tulip_album
text: Executed on vellum in vermilion and lapis, the painted folio fetches immediate gold from noblemen who cannot buy the bulb itself.

## up(Speculator): Substitute a common white bulb in a decoy box for the syndicate thieves
requires_flag: windhandel_speculator
fx: silver +14, fortune +8
tags: talk, crime
set: stage2, clusius_seal
text: At the Utrecht ferry a cutpurse steals the decoy chest and pays his own fence in counterfeit notes, leaving your real casket untouched.

# beat: frankfurt-clearing
at: any
where: any
speaker: merchant
name: Isaak Oppenheim
title: Bullion broker at the Imperial Post
culture: european
gender: m
requires: stage2
weight: 240
---
Along the winter post-road through **Frankfurt** and the Alpine passes, riders arrive on lathered horses with word from Holland: at the Haarlem auction of early February 1637, not a single buyer bid for a pound of *Switsers* bulbs. The paper market has shattered overnight. **Isaak Oppenheim** weighs your Dutch drafts on his brass scales: "Florists who thought themselves lords yesterday are bankrupt today. Every courier from Amsterdam is being stopped by creditors trying to seize tangible goods."

## left: Redeem the VOC drafts in silver thalers before the panic reaches Venice
fx: silver +12, renown +8, vigor +4
tags: trade, talk
set: stage3, hard_thalers
text: Because your bills are backed by East India spice rather than tulip paper, Oppenheim honors them in heavy Maria Theresa silver.

## right: Aid a ruined Haarlem grower stranded at the post-inn
fx: renown +10, vigor +4, silver +4
tags: mercy, loyal
karma: 8
set: stage3, grower_rescued
remember: favor | paid a ruined florist's debt when the tulip market crashed
text: You settle the old gardener's hostel bill; in gratitude he teaches you how to ventilate the bulb casket for the warm Mediterranean air.

## up(Bourse factor): Arbitrage the discounted Dutch bills for Venetian ducats
requires_flag: bourse_factor
fx: silver +18, renown +8
tags: trade
set: stage3, hard_thalers
text: Buying solid merchant paper from panicked hands at half value, you double your patron's reserve before crossing the Brenner Pass.

# beat: adriatic-galley
at: any
where: any
speaker: captain
name: Lorenzo Bembo
title: Sopracomito of the Venetian Levantine Galley
culture: european
gender: m
requires: stage3
weight: 240
---
At the **Venetian lagoon**, Levantine merchant galleys load glass beads, wool broadcloth, and silver coin for the Aegean run. Captain **Lorenzo Bembo** eyes your sealed casket beside the compass binnacle as salt spray lashes the oars. "The Ottomans call the flower *lâle*, written with the very same Arabic letters as the name of God," he remarks. "The Bailo of Venice wants first look at your Dutch bulbs to sweeten his customs treaty with the Grand Vizier."

## left: Refuse to break the seal and pay full passage in silver
fx: renown +10, vigor +6, silver +6
tags: loyal, sea
set: stage4, unbroken_seal
text: You sleep with the walnut casket lashed to your sea-chest until the minarets of the Golden Horn rise out of the morning mist.

## right: Gift the Bailo's envoy one painted vellum leaf and a secondary offset
fx: silver +14, renown +8, fortune +4
tags: talk, trade
set: stage4, bailo_favor
text: Delighted by the diplomacy, the Venetian envoy grants you diplomatic immunity through the Aegean customs islands.

## up(Tulip album): Exhibit the vellum florilegium in the Doge's botanical cabinet
requires_flag: tulip_album
fx: renown +14, silver +12
tags: art, talk
set: stage4, bailo_favor
text: Paduan scholars copy your plates and award you a purse of gold sequins for advancing the science of flora.

# beat: galata-customs
at: any
where: any
speaker: official
name: Evliya Efendi
title: Inspector of the Imperial Gardens at Galata
culture: ottoman
gender: m
requires: stage4
weight: 240
---
Across the **Golden Horn**, where Dutch flutes and Ragusan carracks crowd the quays of Galata, **Evliya Efendi** examines your papers under a canopy of cypresses. "A century ago the Fleming Busbecq carried our wild Anatolian bulbs west to Vienna and Leiden," he smiles, touching the brass lock of your casket. "In Holland you turned a prayer into a gambling house. In **Constantinople**, Sultan Murad's gardeners judge a tulip not by its price on a tavern slate, but by the slender grace of its dagger-like petals."

## left: Present the bulbs with humility as a tribute returning to its homeland
fx: renown +12, fortune +8, silver +8
tags: talk, faith
set: stage5, imperial_tribute
standing: 10
text: Evliya stamps your pass with the crimson tughra and summons a caique rowed by six Bostancı guards to cross to Seraglio Point.

## right: Settle the Levant Company's silver accounts with the Galata bankers
fx: silver +16, renown +8, vigor +4
tags: trade, official
set: stage5, galata_settled
text: While paper fortunes vanish along the Amstel, your hard silver and spice bills clear every Dutch ledger in the Ottoman capital.

## up(Bourse factor): Establish a joint clearing-house between Amsterdam and Galata
requires_flag: bourse_factor
fx: silver +18, renown +12
tags: trade, official
set: stage5, galata_settled
text: You sign a permanent mohair-and-bullion charter that insulates both trading houses from future speculative fevers.

# beat: seraglio-gardens
at: any
where: any
speaker: noble
name: Ibrahim Agha
title: Chief Gardener of the Topkapı Palace
culture: ottoman
gender: m
requires: stage5
weight: 250
---
Within the quiet third courtyard of **Topkapı Palace**, fountains murmur beside beds of hyacinths, carnations, and crimson *lâle* tiles from Iznik. **Ibrahim Agha**, Master of the Imperial Flowers, opens your walnut casket. Beneath the dry sand, the three **Semper Augustus** bulbs are firm, cool, and sprouting pale green tips ready for the Bosphorus soil. Far to the north, the Dutch courts are cancelling thousands of empty tulip contracts, but here in the garden the flower itself endures.

## left: Deliver the bulbs to the Sultan's garden and return to Amsterdam with the cleared ledgers
fx: renown +22, silver +16
tags: loyal, trade
ending: won | The Flower Outlives the Fever | You bring home the signed Levantine bullion receipts that save your patrons from the crash of 1637. Whenever you pass the Haarlem fields in spring, you remember that a flower belongs in the earth, not on a tavern ledger.

## right: Remain in Constantinople as factor and botanist between the two seas
fx: renown +20, fortune +12
tags: art, official
ending: won | Keeper of the Lâlezar | You take a stone house above the Bosphorus and cultivate cross-bred Anatolian and Dutch bulbs for the palace courtyards. Poets compose couplets for your garden long after the great mania is forgotten.

## up(Speculator): Auction the last rare offset to the European ambassadors in Pera
requires_flag: windhandel_speculator
fx: silver +28, renown +14
tags: trade, gamble
ending: won | The Last Tulip Broker | Even after the Haarlem crash, princes still covet what they cannot have. You sell the final offset for a chest of Venetian gold and retire as the only speculator of 1636 who walked away rich.
