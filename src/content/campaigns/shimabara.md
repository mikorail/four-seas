campaign: shimabara
id: shimabara
title: The Shimabara Rebellion
blurb: 1637. Starving peasants and hidden Christians raise the banner of a sixteen-year-old prophet at Hara Castle against the Tokugawa shogunate.
start: nagasaki
home: nagasaki
destination: kyoto
years: 1637-1638
year: 1637
deadline: 160
item: the secret petition of Shimabara and the tax ledgers of Matsukura
patron: Elder Magdalena of the Nagasaki Kakure Kirishitan
culture: japanese

# beat: mino-dance
at: any
where: any
speaker: elder
name: Magdalena of Urakami
title: Hidden Christian elder
culture: japanese
gender: f
weight: 250
---
In a Fisherman's hut outside **Nagasaki**, behind a shelf where a statue of Kannon conceals a tiny cross inside its hollow wood, **Magdalena** hands you a ledger stained with soot. "Lord Matsukura taxes the peasants of Shimabara until they eat roots, and dresses those who cannot pay in straw coats to burn them alive," she whispers. "Thirty thousand farmers and masterless samurai have risen under sixteen-year-old **Amakusa Shiro**. Carry proof of Matsukura's crimes to the imperial nobles in Kyoto, or take the magistrate's gold to spy on Hara Castle."

## left: Swear to help the rebels and carry the petition
fx: renown +8, silver +8, vigor +4
tags: faith, loyal
set: stage1, kirishitan_ally
standing: 8
text: She blesses your journey in Latin and old Portuguese, pressing hidden travel silver into your palm.

## right: Accept the Nagasaki magistrate's warrant as a shogunate scout
fx: silver +14, fortune +4
tags: official, talk
set: stage1, bakufu_agent
text: With the magistrate's iron pass at your hip, every barrier gate from Kyushu to the Inland Sea will bow as you pass.

## up(Christian): Reveal your own hidden medal of St. Francis
requires_faith: christian
fx: renown +12, fortune +8, silver +6
tags: faith, loyal
set: stage1, kirishitan_ally
text: Tears fill Magdalena's eyes. She entrusts you with the secret names of sympathizers in every port along the Inland Sea.

# beat: amakusa-strait
at: any
where: any
speaker: noble
name: Amakusa Shiro
title: Sixteen-year-old prophet of the rebellion
culture: japanese
gender: m
weight: 220
---
Across the **Ariake Sea**, white banners painted with angels and the chalice fly over the ruined cliffside ramparts of **Hara Castle**. Young **Amakusa Shiro**, calm beyond his years and flanked by veteran ronin of Konishi Yukinaga's old house, meets your boat on the shingle beach. "The shogun sends a hundred thousand men against fishermen and widows," he says softly. "Will you bring powder into our walls, or carry our story out to the world?"

## left: Smuggle matchlock powder and rice into Hara Castle
fx: renown +10, vigor +4, silver +6
tags: mercy, fight
karma: 6
set: stage2, supplied_hara
remember: favor | brought rice and powder to the besieged families at Hara Castle
text: Under cover of sea fog, your boats unload thirty sacks of grain and saltpeter at the base of the sea cliff.

## right: Record the names of the besieged families and slip past the blockade
fx: renown +8, fortune +6, silver +6
tags: art, talk
set: stage2, family_rolls
text: Master painter Yamada Emosaku sketches your portrait on a scrap of silk and gives you the roster of the thirty-seven thousand souls inside.

## up(Shogunate scout): Map the castle's water wells and sea gates
requires_flag: bakufu_agent
fx: silver +14, renown +8
tags: official
set: stage2, castle_charts
text: Posing as a grain peddler from Hizen, you note that the outer walls are strong against assault but have no spring if the siege drags into spring.

# beat: dutch-gunship
at: any
where: any
speaker: captain
name: Nicolaes Couckebacker
title: Chief Factor of the Dutch East India Company at Hirado
culture: european
gender: m
requires: stage1, stage2
weight: 250
---
Off the coast of **Shimabara**, the Dutch warship *de Rijp* lies at anchor, ordered by the shogunate to bombard Hara Castle from the sea. Factor **Nicolaes Couckebacker** paces his quarterdeck uneasily: "If I refuse the shogun, the Company loses all trade in Japan. If I fire on Christians, every court in Europe will curse my name. Even the samurai mock us for doing their butcher's work."

## left: Persuade Couckebacker to withdraw his ship to Hirado
fx: renown +12, fortune +6, silver +6
tags: talk
set: stage3, dutch_withdrew
text: Moved by your words and a Rebel arrow that snaps his rigging, Couckebacker weighs anchor after a token cannonade and sails away.

## right: Trade coastal pilotage for Dutch silver and medical chests
fx: silver +14, vigor +6, renown +4
tags: trade, sea
set: stage3, dutch_trade
text: The Dutch surgeon stocks your pack with Peruvian bark and guilders before the ship turns back toward Hirado.

## up(Hidden Christian ally): Sabotage the warship's powder magazine at night
requires_flag: kirishitan_ally
fx: renown +14, vigor +4, silver +8
tags: crime, fight
set: stage3, dutch_withdrew
text: You row under the stern gallery in the dark and foul the spare touch-holes; at dawn *de Rijp* limps out of range.

# beat: izu-camp
at: any
where: any
speaker: official
name: Matsudaira Nobutsuna
title: Senior Councillor, called Izu-no-kami the Clever
culture: japanese
gender: m
requires: stage1, stage2
weight: 220
---
After the first shogunate commander Itakura Shigemasa falls in a reckless New Year's Day charge, **Matsudaira Nobutsuna** arrives from Edo to take command. In his pavilion overlooking the trenches, he studies the starving castle and then turns to your tax ledgers: "Lord Matsukura's cruelty caused this fire. Even when Hara Castle falls, the shogunate cannot allow a daimyo whose greed drives a province to madness."

## left: Present the proof of Matsukura's torture and extortion
fx: renown +12, silver +8, fortune +4
tags: official, talk
set: stage4, matsukura_doomed
text: Nobutsuna seals the ledger coldly. For the first time in Tokugawa history, a ruling daimyo will be stripped of his domain and beheaded for misrule.

## right: Plead for clemency for the women and children inside the walls
fx: renown +10, vigor +6, silver +6
tags: mercy, talk
karma: 8
set: stage4, pleaded_mercy
text: Nobutsuna grants you a bundle of safe-conduct passes stamped with his own crest for anyone you can persuade to slip out before the final storm.

## up(Shogunate scout): Deliver your secret soundings of Hara Castle's granaries
requires_flag: bakufu_agent
fx: silver +16, renown +10
tags: official, loyal
set: stage4, matsukura_doomed
text: Your report confirms that the defenders have run out of gunpowder and barley; Nobutsuna orders the army to wait rather than waste samurai lives.

# beat: inland-sea-passage
at: any
where: any
speaker: sailor
name: Murakami Tadashi
title: Inland Sea coaster captain
culture: japanese
gender: m
requires: stage3, stage4
weight: 250
---
Sailing east through the **Seto Inland Sea** toward Osaka and Kyoto, shogunate patrol boats inspect every junk for fleeing rebels and foreign priests. Captain **Murakami**, descendant of the old sea-lords of Iyo, hides a dozen refugee children and a wrapped bundle of Yamada Emosaku's Christian paintings beneath his cargo of dried kelp.

## left: Use your papers and silver to pass the checkpoint boats
fx: renown +12, silver +6, vigor +6
tags: talk, mercy
karma: 6
set: stage5, refugees_saved
text: You drink sake with the barrier captain on deck while the tide carries the hidden families safely past Tomonoura toward Sakai.

## right: Steer through the Naruto whirlpools by night to outrun the patrols
fx: renown +14, fortune +6, silver +6
tags: sea
set: stage5, whirlpool_run
text: With oars lashed and sails taut, your vessel shoots the roaring tide-race under a crescent moon without a patrol boat daring to follow.

## up(Shogunate scout): Command the patrol boat to escort your vessel straight to Osaka
requires_flag: bakufu_agent
fx: silver +12, renown +10, vigor +4
tags: official
set: stage5, official_escort
text: None of the inspectors dare look beneath the floorboards of a boat flying Senior Councillor Nobutsuna's courier pennant.

# beat: kyoto-memorial
at: any
where: any
speaker: noble
name: Konoe Nobuhiro
title: Imperial Regent and calligrapher at Kyoto
culture: japanese
gender: m
requires: stage5
weight: 250
---
Spring cherry blossoms drift across the gravel courtyards of **Kyoto**. Word arrives from Kyushu that Hara Castle has fallen after four months of siege, and that Lord Matsukura has been condemned to death for his tyranny while Japan seals its ports for two centuries of *sakoku*. In a quiet temple pavilion, **Konoe Nobuhiro** unrolls the scrolls and banners you carried out of the fire.

## left: Entrust the Shimabara chronicles and paintings to a hidden temple vault
fx: renown +22, fortune +10
tags: faith, art
ending: won | The Hidden Bells of Urakami | Sealed inside a Kyoto pagoda and passed down in secret villages around Nagasaki, the prayers and paintings you saved survive two hundred and fifty years of silence, until the hidden Christians step back into the light.

## right: Deliver the tax ledgers to reform provincial governance across the realm
fx: renown +20, silver +12
tags: official, loyal
ending: won | The Fall of a Tyrant | Matsukura Katsuie is executed in Edo as a warning to every lord in Japan. Because of the evidence you carried, famine relief granaries are ordered across Kyushu, and two centuries of Great Peace settle over the islands.

## up(Shogunate scout): Accept a post as inspector of the Nagasaki trade and Dejima
requires_flag: bakufu_agent
fx: silver +24, renown +16
tags: official, trade
ending: won | Warden of the Single Window | Appointed to oversee Dejima and the Chinese quarter in Nagasaki, you become the quiet gatekeeper through whom Dutch telescopes, medical books, and world news still trickle into a closed Japan.
