campaign: siege-of-vienna
id: siege-of-vienna
title: The Gates of Vienna
blurb: 1683. Grand Vizier Kara Mustafa Pasha marches two hundred thousand men up the Danube toward Habsburg Vienna, while King Jan Sobieski's winged hussars ride south. Carry diplomatic ciphers across a continent on fire.
start: istanbul
home: istanbul
destination: venice
years: 1683-1684
year: 1683
deadline: 160
item: Grand Vizier's siege dispatches
patron: Dragoman of the Sublime Porte
culture: ottoman

# beat: edirne-horsetails
at: any
where: any
speaker: official
name: Alexander Mavrocordatos
title: Grand Dragoman of the Sublime Porte
culture: ottoman
gender: m
weight: 250
---
Six horsetail standards fly before the imperial pavilions as the Ottoman host musters on the road north from **Constantinople**. Grand Vizier **Kara Mustafa Pasha** has sworn to take the Red Apple of Vienna itself. In a silk tent scented with mastic and coffee, Grand Dragoman **Alexander Mavrocordatos**, a Paduan-educated Greek scholar who translates for the Sultan, presses a cylinder of **Grand Vizier's siege dispatches** and Venetian cipher keys into your hand. "Victory has a hundred fathers, but if the siege falters, only diplomacy will save the peace," he tells you. "Carry our secret dispatches up the Danube and across to **Venice**."

## left: Swear to serve the Sublime Porte and guard the Grand Vizier's war ciphers
fx: renown +8, silver +10, vigor +4
tags: loyal, official
set: stage1, porte_courier
standing: 8
text: Mavrocordatos gives you an ivory-inlaid yataghan and a firman commanding fresh post-horses at every *menzilhane* station to the Danube.

## right: Carry a parallel cipher for the Venetian Bailo's peace party
fx: silver +14, fortune +6
tags: talk, trade
set: stage1, dragoman_channel
text: Hidden inside the false bottom of your inkhorn is a second key addressed to the Venetian Senate, hedged against whichever side wins the summer campaign.

## up(Scholar): Speak with Mavrocordatos in Latin and Greek to learn the full secret treaty terms
requires_trait: scholar
fx: renown +12, fortune +6, silver +6
tags: talk, art
set: stage1, dragoman_channel
text: Impressed by your classical learning, the Grand Dragoman entrusts you with his private assessment of Jan Sobieski's Polish alliance.

# beat: belgrade-bridge
at: any
where: any
speaker: soldier
name: Sari Süleyman Pasha
title: Commander of the Danube Pontoon Train
culture: ottoman
gender: m
requires: stage1
weight: 240
---
At **Belgrade**, where the Sava joins the broad brown **Danube**, boat-bridges groan under the weight of brass basilisks, camel trains, and Janissary regiments marching toward Buda. Rain turns the riverbanks to mire as **Sari Süleyman Pasha** struggles to pass supply wagons ahead of the Crimean Tatar vanguard. Hungarian *kuruc* riders and Balkan carters crowd the toll-gate.

## left: Ride with the artillery engineers to clear the pontoon bottleneck
fx: renown +10, vigor +6, silver +6
tags: loyal, river
set: stage2, danube_crossed
text: By lashing empty wine-casks beneath the sagging pontoons, you get the heavy siege train across before the river rises.

## right: Hire Ragusan river-merchants to ferry your dispatches past the army columns
fx: silver +10, fortune +6, vigor +4
tags: trade, river
set: stage2, ragusan_contacts
text: A swift Dubrovnik river-galley carries you past forty miles of mud-bound baggage carts in a single afternoon.

## up(Dragoman channel): Secure safe-conduct passes for the Ragusan and Venetian hospital wagons
requires_flag: dragoman_channel
fx: renown +12, silver +10
tags: mercy, talk
karma: 6
set: stage2, ragusan_contacts
text: Neutral merchants bless your name and share word of Habsburg troop movements along the Raab.

# beat: lobau-trenches
at: any
where: any
speaker: soldier
name: Count Ernst Rüdiger von Starhemberg
title: Commander of the Vienna Garrison
culture: european
gender: m
requires: stage2
weight: 240
---
August 1683. Around the star-shaped bastions of **Vienna**, twenty miles of Ottoman saps and labyrinthine trenches creep toward the Burg and Löbel ravelins. Beneath the earth, Ottoman *lağımcı* miners and Habsburg counter-miners fight by candlelight with pistols and spades. Under a white parley flag at the palisade, you witness a tense exchange of dispatches while Polish scout **Jerzy Franciszek Kulczycki** slips through the siege lines disguised in Turkish dress, singing Ottoman marching songs.

## left: Inspect the forward mine-galleries and report the siege's true peril
fx: renown +12, vigor +4, silver +6
tags: fight, loyal
set: stage3, trench_witness
text: You see at once that while the ravelin is crumbling, Kara Mustafa has left the wooded heights of the Vienna Woods unguarded against a relief army.

## right: Parley discreetly with Kulczycki over a pot of captured Yemeni coffee
fx: renown +10, fortune +8, silver +8
tags: talk, food
set: stage3, coffee_parley
text: Recognizing your courier's bearing, the multilingual scout trades news of the Danube bridges over steaming cups of dark coffee.

## up(Porte courier): Warn the Janissary trench-masters that Christian relief signals flashed from Kahlenberg
requires_flag: porte_courier
fx: renown +14, vigor +6, silver +6
tags: loyal, official
set: stage3, trench_witness
text: Veteran Janissary officers heed your warning and prepare an orderly rear-guard battery to protect the camp's sacred standards.

# beat: kahlenberg-charge
at: any
where: any
speaker: noble
name: King Jan III Sobieski
title: King of Poland and Grand Duke of Lithuania
culture: european
gender: m
requires: stage3
weight: 240
---
September 12, 1683. From the wooded ridge of the **Kahlenberg** above Vienna, eighteen thousand horsemen levels their lances in the afternoon sun. **King Jan III Sobieski** leads three thousand Polish **Winged Hussars** down the slopes, wooden frames of eagle feathers thundering like a storm wind on their backs. The earth shakes under the greatest cavalry charge in European history as the Ottoman camp dissolves in fire and cannon smoke.

## left: Rescue the Grand Dragoman's diplomatic archives from the burning pavilion
fx: renown +14, vigor +4, silver +8
tags: loyal, fight
set: stage4, saved_archives
text: Amid falling tent-poles and stray shot, you lash the Dragoman's cedar treaty chests to a swift Anatolian mare and ride clear of the rout.

## right: Aid wounded soldiers and camp artisans trapped along the Wien river
fx: renown +12, vigor +4, silver +6
tags: mercy
karma: 8
set: stage4, camp_mercy
remember: favor | pulled wounded men from the Danube trenches at Vienna
text: Neither hussar nor Janissary harms the courier who binds wounds under the smoke; three grateful officers pledge you safe passage south.

## up(Coffee parley): Claim the abandoned sacks of green coffee beans with Kulczycki's pass
requires_flag: coffee_parley
fx: silver +18, fortune +8
tags: trade, food
set: stage4, vienna_coffee
text: While soldiers plunder silver stirrups, you load four mules with prime Mocha coffee sacks that will soon inspire Vienna's first coffeehouses.

# beat: karst-passes
at: any
where: any
speaker: official
name: Marc'Antonio Giustinian
title: Proveditore of the Venetian Terraferma
culture: european
gender: m
requires: stage4
weight: 240
---
Riding southwest through the limestone gorges of Carniola and the **Julian Alps** toward the Adriatic coast, your party reaches the frontier quarantine post of the **Most Serene Republic of Venice**. **Marc'Antonio Giustinian** and the inquisitors of the Council of Ten wait anxiously for verified word from the Danube. "Pope Innocent XI urges Venice to join the Holy League," Giustinian says, "while our merchants fear losing every warehouse in Constantinople and Smyrna."

## left: Present the verified dispatches proving how the battle at Kahlenberg turned
fx: renown +12, silver +10, vigor +4
tags: official, talk
set: stage5, senate_briefed
standing: 8
text: Your eyewitness charts of the Kahlenberg charge give the Venetian Senate the exact truth days before any imperial herald arrives.

## right: Smuggle the Dragoman's private peace-key directly to the Levantine merchant families
fx: silver +14, fortune +6, renown +6
tags: talk, trade
set: stage5, peace_key
text: The great patrician trading houses reward you richly for preserving a back-channel to the Sublime Porte despite the war fever.

## up(Dragoman channel): Draft a confidential protocol protecting merchants of both empires during wartime
requires_flag: dragoman_channel
fx: renown +16, silver +12
tags: talk, official
set: stage5, peace_key
text: Adopted quietly by both Galata and the Rialto, your clause keeps neutral ships sailing even after the League declarations.

# beat: doges-palace
at: any
where: any
speaker: noble
name: Francesco Morosini
title: Captain General of the Sea in Venice
culture: european
gender: m
requires: stage5
weight: 250
---
Lanterns shimmer on the dark water of the **Bacino di San Marco** as your gondola glides beneath the pink and white marble colonnades of the **Doge's Palace** in **Venice**. Inside the Hall of the Senate, beneath Tintoretto's ceiling, patricians in crimson robes and Ottoman dragomans in sable caps gather around your unsealed dispatch case. The siege of Vienna has remade the map of Europe, and your words will shape what follows.

## left: Deliver the final dispatches and return to Mavrocordatos as chief envoy of peace
fx: renown +22, silver +16
tags: loyal, talk
ending: won | The Dragoman's Peace | Armed with the secret protocols you carried through the fires of 1683, you work beside Alexander Mavrocordatos through the long years of war until you help draft the Treaty of Karlowitz, opening a new age of diplomacy between East and West.

## right: Stay in Venice and open an Oriental coffeehouse on the Piazza San Marco
fx: silver +22, fortune +12
tags: trade, food
ending: won | The Coffeehouse under the Clocktower | With the Mocha beans and Levantine contacts from your ride, your establishment under the Procuratie becomes the meeting place of diplomats, playwrights, and sea captains from across the Mediterranean.

## up(Peace key): Serve both the Rialto and the Sublime Porte as neutral master of ciphers
requires_flag: peace_key
fx: silver +26, renown +18
tags: official, trade
ending: won | Arbiter of the Adriatic | Whenever ambassadors are expelled and borders close, your Ragusan ships carry the letters no one else can deliver. Both the Doge and the Sultan honor your seal until the end of your days.
