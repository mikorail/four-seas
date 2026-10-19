campaign: imjin-war
id: imjin-war
title: The Imjin War
blurb: 1592. Toyotomi Hideyoshi’s legions land at Busan and march north toward the Yalu. Carry royal dispatches between burning fortresses and Admiral Yi’s fleet.
start: hanseong
home: hanseong
destination: pyongyang
years: 1592-1598
year: 1592
deadline: 180
item: the Royal Court's secret war dispatches
patron: Chief State Councillor Ryu Seong-ryong
culture: korean

# beat: burning-palace
at: any
where: any
speaker: official
name: Ryu Seong-ryong
title: Chief State Councillor of Joseon
culture: korean
gender: m
weight: 250
---
Rain falls on the charred timbers of Gyeongbokgung Palace in Hanseong. Japanese divisions under Konishi Yukinaga and Kato Kiyomasa are marching north from Busan. **Ryu Seong-ryong** binds a wax-sealed bamboo tube to your belt: "The court rides north toward Pyongyang and the Yalu, while Admiral **Yi Sun-sin** prepares his fleet on the southern sea. Carry our dispatches between the northern road and the coast, or all Joseon will be cut in two." In the courtyard shadows, a Tsushima scout whispers that Japanese commanders pay handsomely for the King's itinerary.

## left: Swear loyalty to Joseon and the Righteous Army
fx: renown +8, silver +8, vigor +4
tags: loyal
set: stage1, righteous
standing: 8
text: Ryu clasps your forearm. You ride out through the west gate with fresh relay horses and royal travel silver.

## right: Take the Tsushima scout's cipher and play both sides
fx: silver +14, fortune +4
tags: talk, crime
set: stage1, double_agent
text: You pocket a silk pass stamped with Konishi's crest alongside the royal bamboo tube. Both armies will open their gates to you.

## up(Soldier): Rally the scattered palace guards into an escort
requires_trait: soldier
fx: renown +12, vigor +6, silver +6
tags: fight, loyal
set: stage1, righteous
text: Six archers with composite horn bows fall in behind your horse as the capital gates close.

# beat: imjin-ferry
at: any
where: any
speaker: soldier
name: Shin Rip
title: Garrison commander at the Imjin River
culture: korean
gender: m
weight: 220
---
At the swollen **Imjin River**, refugees crowd the reed banks while signal fires burn from peak to peak. Matchlock smoke drifts across the southern ferry crossing. **{npc}** struggles to hold the ferry boats for military couriers while families beg for room on the last barges heading north toward Kaesong.

## left: Guard the ferry and bring the refugees across first
fx: renown +8, vigor +4, silver +4
tags: mercy, loyal
karma: 6
set: stage2, saved_ferry
remember: favor | held the Imjin ferry until the villagers crossed
text: Grateful merchants press dried fish and road silver into your hands before the barges cast off and burn the southern landing.

## right: Commandeer the fastest skiff for the war dispatches
fx: silver +8, fortune +4, vigor +2
tags: official
set: stage2
text: Your oarsmen cut across the dark current before the first arquebus volleys hit the riverbank.

## up(Double agent): Flash the Tsushima pass to slip through the scouts
requires_flag: double_agent
fx: silver +12, renown +6
tags: talk
set: stage2, scout_maps
text: Forward riders of the First Division wave you past their pickets and even share a sketch of their march toward Pyongyang.

# beat: red-coat-general
at: any
where: any
speaker: scholar
name: Gwak Jae-u
title: Red Coat General of the Righteous Army
culture: korean
gender: m
requires: stage1, stage2
weight: 250
---
In a pine-shrouded gorge, drums echo from every cliff. **Gwak Jae-u**, dressed in crimson silk dyed with his own oath, leads a band of Righteous Army scholars and hunters who ambush Japanese supply columns along the mountain roads. "Regular generals fled," he tells you over a map of the passes, "so the villages rose. Help us strike their powder train at dawn, or carry our signals to the fleet."

## left: Ride with the Righteous Army against the supply train
fx: renown +12, silver +8, vigor +2
tags: fight, loyal
set: stage3, uibyeong_strike
remember: favor | rode with the Red Coat General in the mountain pass
text: Decoy drums draw the guards into the mist while your horsemen seize twenty pack-mules of dry powder and silver coin.

## right: Carry Gwak's mountain intelligence to the naval couriers
fx: renown +8, fortune +6, silver +6
tags: talk, loyal
set: stage3, naval_intel
text: You memorize every ambushed ford and burned granary, turning guerrilla raids into a strategy for the whole kingdom.

## up(Double agent): Sell the supply train route to both commanders
requires_flag: double_agent
fx: silver +16, renown +6
tags: trade, talk
set: stage3, uibyeong_strike
text: You warn Gwak where the silver chests ride and warn the rear guard too late to save the wagons, profiting from both camps.

# beat: hansando-wings
at: any
where: any
speaker: captain
name: Yi Sun-sin
title: Admiral of the Left Jeolla Navy
culture: korean
gender: m
requires: stage1, stage2
weight: 220
---
Down by the coastal beacon towers, naval runners bring word from **Admiral Yi Sun-sin** off Hansan Island. His spiked, iron-roofed **turtle ships** have lured Wakisaka Yasuharu's fleet into open water and encircled them in the Crane Wing formation. Smoke and cannon thunder roll across the straits; Japanese armies in the north are now cut off from sea provisions.

## left: Relay the victory beacons north to hearten the fortresses
fx: renown +14, vigor +6, silver +6
tags: loyal
set: stage4, crane_wing
text: Five fires rise on every ridge from the southern coast to the Taedong River. Starving garrisons cheer when they hear the sea still belongs to Joseon.

## right: Salvage iron cannon and powder from the wrecked transports
fx: silver +12, vigor +4, renown +6
tags: sea, trade
set: stage4, salvaged_guns
text: Coastal fishermen haul bronze swivel-guns and dry rations from the shoals to provision your northern ride.

## up(Righteous Army): Coordinate coastal militias with Admiral Yi's ships
requires_flag: righteous
fx: renown +16, fortune +6, silver +8
tags: fight, loyal
set: stage4, crane_wing
text: Beacon watchers on the headlands signal every enemy sail straight to the turtle ships waiting in the narrows.

# beat: yalu-vanguard
at: any
where: any
speaker: soldier
name: Li Rusong
title: Supreme Commander of the Ming Relief Army
culture: han
gender: m
requires: stage3, stage4
weight: 250
---
Cold wind blows down from the Yalu River as forty thousand Ming horsemen and bronze breach-cannons march south to join the Korean divisions before **Pyongyang**. General **Li Rusong** studies your wax-sealed dispatches beside Korean commander Kim Myeong-won. "Konishi holds the northern walls and Peony Peak," Li says. "Give me a courier who knows the Chilsong Gate and the river ice, and we strike at dawn."

## left: Guide the allied artillery to Chilsong Gate
fx: renown +12, vigor +6, silver +8
tags: fight, loyal
set: stage5, allied_assault
text: You lead the heavy tiger-crouching cannon along frozen ox-paths into range of the northern bastion before daybreak.

## right: Slip into Pyongyang by night to prepare the inner gates
fx: renown +10, fortune +6, silver +8
tags: talk, crime
set: stage5, gate_opened
text: Using forgotten drainage culverts beneath the willow banks, you reach townsfolk ready to unbar the postern when the drums sound.

## up(Double agent): Open a secret parley with Konishi's envoy at Peony Peak
requires_flag: double_agent
fx: silver +16, renown +10
tags: talk
set: stage5, secret_truce
text: Under a moonlit truce flag, you arrange which gate will be left unguarded so the garrison retreats south without burning the granaries.

# beat: liberation-of-pyongyang
at: any
where: any
speaker: official
name: Ryu Seong-ryong
title: Chief State Councillor of Joseon
culture: korean
gender: m
requires: stage5
weight: 250
---
Firearrows and thunder-crash bombs light the snow around **Pyongyang**. Warrior-monks under **Seosan Daesa** storm Peony Peak while Korean and Ming banners surge through the breached walls. As the invaders retreat south across the frozen Taedong River, **Ryu Seong-ryong** rides into the liberated citadel to receive your final dispatches.

## left: Deliver the royal dispatches and ride south with the Righteous Army
fx: renown +22, silver +12
tags: loyal, fight
ending: won | Banner of the Righteous | Pyongyang stands free, and Admiral Yi's ships hold the southern sea. You carry the court's orders south as the capital is reclaimed, your name recorded in the Veritable Records beside the commanders who saved Joseon.

## right: Present your dispatches and chronicle the war for posterity
fx: renown +18, fortune +10
tags: art, official
ending: won | The Book of Corrections | Alongside Ryu Seong-ryong, you compile the dispatches, beacon logs, and naval reports that become the Jingbirok, so future generations will never again be caught unprepared.

## up(Double agent): Broker the cease-fire talks between Beijing, Hanseong, and Nagoya
requires_flag: double_agent
fx: silver +24, renown +16
tags: talk, trade
ending: won | The Envoy Between Three Courts | Only you hold the ciphers of Joseon, the Ming generals, and the Tsushima envoys. Your quiet negotiations buy the kingdom crucial years to rebuild its fortresses and cast new turtle ships before the war's final act.
