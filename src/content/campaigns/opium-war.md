campaign: opium-war
id: opium-war
title: The Opium War
blurb: Canton, 1839. Commissioner Lin burns twenty thousand chests of British opium at Humen, and Royal Navy warships gather in the Pearl River estuary.
start: guangzhou
home: guangzhou
destination: beijing
years: 1839-1842
year: 1839
deadline: 180
item: Commissioner Lin's coastal defense memorial
patron: Imperial Commissioner Lin Zexu
culture: han

# beat: humen-trench
at: any
where: any
speaker: official
name: Lin Zexu
title: Imperial Commissioner at Canton
culture: han
gender: m
weight: 250
---
At the lime pits of **Humen**, salt water and quicklime boil through twenty thousand chests of confiscated British opium. **Commissioner Lin Zexu** watches the gray plume rise over the Pearl River estuary, then hands you a cloth-wrapped memorial for the Daoguang Emperor. "Captain Elliot's warships are already blockading the Bogue," he says. "Carry my defense charts and translated foreign gazettes north to the court, before the appeasers in Peking trade away the coast." In the Thirteen Factories, a Cohong merchant offers you silver to carry a second packet for the British superintendent.

## left: Serve Commissioner Lin and the coastal batteries
fx: renown +8, silver +8, vigor +4
tags: loyal, official
set: stage1, lin_envoy
standing: 8
text: Lin stamps your pass with his vermilion seal and provides relay funds for the post roads north.

## right: Accept the Cohong merchant's silver and carry both packets
fx: silver +14, fortune +4
tags: trade, talk
set: stage1, cohong_broker
text: You tuck the merchant's cipher beneath Lin's memorial. Both the river forts and the foreign clippers will listen to you.

## up(Scholar): Translate the English newspapers for Lin's compendium
requires_trait: scholar
fx: renown +12, silver +8, fortune +4
tags: art, official
set: stage1, lin_envoy
text: Your notes on steam paddle-ships and parliamentary debates are bound into the Haiguo Tuzhi, the Illustrated Treatise on the Maritime Kingdoms.

# beat: bogue-forts
at: any
where: any
speaker: captain
name: Guan Tianpei
title: Admiral of the Guangdong Navy
culture: han
gender: m
weight: 220
---
At the **Bogue Forts** guarding the narrows of the Pearl River, **Admiral Guan Tianpei** has stretched iron chains across the channel and mounted heavy brass cannon on Weiyuan Island. Out in the mist, the iron paddle-steamer *Nemesis* moves against wind and tide alike, firing Congreve rockets into the war junks.

## left: Help haul powder and sighting quadrants to the shore batteries
fx: renown +10, vigor +4, silver +6
tags: fight, loyal
set: stage2, stood_with_guan
remember: favor | stood beside Admiral Guan at the Bogue batteries
text: Your gunners hull a British frigate twice before the tide turns, buying time for the inner river boats to slip north.

## right: Evacuate the wounded sailors and naval charts upriver
fx: renown +8, vigor +6, silver +6
tags: mercy
karma: 6
set: stage2
text: You load the injured gunners and soundings of the estuary onto fast sampans bound for the northern road.

## up(Cohong broker): Board the truce boat to gauge British naval targets
requires_flag: cohong_broker
fx: silver +12, renown +8
tags: talk, sea
set: stage2, fleet_course
text: Under a merchant flag you learn that the squadron intends to bypass Canton and sail north toward Chusan and Ningbo.

# beat: sanyuanli-militia
at: any
where: any
speaker: elder
name: Wei Changhui
title: Village gentry leader of Sanyuanli
culture: han
gender: m
requires: stage1, stage2
weight: 250
---
North of the city walls at **Sanyuanli**, a sudden summer thunderstorm drenches the paddy fields. Ten thousand villagers bearing three-star banners, hoes, and pikes have surrounded a detachment of British marines whose flintlock powder is soaked by the rain. **{npc}** calls on you to help guide the militia columns across the flooded causeways.

## left: Lead the village banners along the stone dikes
fx: renown +12, vigor +4, silver +6
tags: fight, loyal
set: stage3, sanyuanli
text: The marines are pinned in the mud until the prefect arrives to negotiate their withdrawal; the villages celebrate for weeks.

## right: Escort the prefect's truce riders to prevent the city from being shelled
fx: silver +10, renown +6, fortune +4
tags: talk, official
set: stage3
text: You part the angry lines so the garrison hostages can be exchanged, sparing the western suburbs from naval bombardment.

## up(Commissioner's envoy): Record the militia tactics in your northern report
requires_flag: lin_envoy
fx: renown +14, fortune +6, silver +6
tags: art, loyal
set: stage3, sanyuanli
text: Your account proves that rain, pikes, and local levies can check foreign muskets when the coast forts fall.

# beat: ningbo-fall
at: any
where: any
speaker: soldier
name: Chen Huacheng
title: Garrison Commander of Jiangnan
culture: han
gender: m
requires: stage1, stage2
weight: 220
---
Along the **Yangtze and East China coast**, black-hulled warships take Dinghai and press toward Ningbo and the mouth of the river at Wusong. Old **General Chen Huacheng** inspects the earthen ramparts in plain cloth shoes, sharing coarse rice with his soldiers. "Court ministers want to pay ransom," he tells you, "but so long as I stand on this seawall, the river gate is not for sale."

## left: Reinforce the Wusong earthen batteries with sandbags and iron shot
fx: renown +12, vigor +6, silver +6
tags: fight, loyal
set: stage4, wusong_wall
text: You help pile wet earth and cotton bales along the parapet to absorb the heavy broadsides from the river.

## right: Secure the Grand Canal grain barges before the blockade closes
fx: silver +12, renown +6, vigor +4
tags: trade, official
set: stage4, grain_saved
text: Hundreds of tribute junks slip past Zhenjiang into the northern canal locks before the steamers reach the crossroads.

## up(Cohong broker): Smuggle foreign percussion rifles and spyglasses to the defenders
requires_flag: cohong_broker
fx: silver +14, renown +10
tags: trade, crime
set: stage4, wusong_wall
text: Bought from American traders off Macao, two crates of brass telescopes and dry caps reach Chen's officers before dawn.

# beat: grand-canal-envoys
at: any
where: any
speaker: official
name: Qiying
title: Imperial Kinsman and Plenipotentiary
culture: han
gender: m
requires: stage3, stage4
weight: 250
---
On the road toward **Nanjing and Peking**, you encounter the retinue of **Qiying**, sent by a shaken court to open peace talks while Commissioner Lin has been ordered into exile in distant Ili. Qiying eyes the seal on your packet: "Lin Zexu provoked a storm he could not calm. Hand me his memorial so we may sign the treaty at Nanjing in peace, or ride on to Peking and risk the Emperor's wrath."

## left: Refuse Qiying and ride straight on to the capital with Lin's memorial
fx: renown +14, vigor +6, silver +6
tags: loyal
set: stage5, kept_memorial
text: You spur your horse past the plenipotentiary's guards, keeping Lin Zexu's coastal maps and translations intact.

## right: Copy the maps for the reformers before handing Qiying the outer scroll
fx: renown +10, fortune +8, silver +8
tags: talk, art
set: stage5, copied_charts
text: Qiying receives the formal cover letter while scholar Wei Yuan receives every chart of steamships, foundries, and coastal forts.

## up(Cohong broker): Join the treaty table at Nanjing to shape the tariff clauses
requires_flag: cohong_broker
fx: silver +16, renown +8
tags: talk, trade
set: stage5, treaty_drafter
text: Knowing both English trade law and Qing customs, you strike out three predatory clauses that the court translators missed.

# beat: meridian-gate
at: any
where: any
speaker: scholar
name: Wei Yuan
title: Historian and Statecraft Scholar
culture: han
gender: m
requires: stage5
weight: 250
---
In **Peking**, autumn leaves blow across the flagstones outside the Ministries. Though the Treaty of Nanjing has opened five ports and ceded Hong Kong Island, **Wei Yuan** and a circle of reformist officials gather by lantern light to receive what you carried from the south. "Commissioner Lin rides toward the western snows," Wei says, placing a hand on your shoulder, "but his eyes and yours have seen the new world. How shall we use what you brought?"

## left: Present the coastal memorial and found a school of maritime defense
fx: renown +22, silver +12
tags: loyal, art
ending: won | Learn the Superior Techniques | Your charts and translations become the cornerstone of Wei Yuan's fifty-volume treatise. Across China and even in distant Japan, reformers read the pages you carried from Canton to build the first modern shipyards and arsenals.

## right: Ride west to overtake Commissioner Lin on the road to Ili
fx: renown +18, fortune +12
tags: loyal
ending: won | The Exile's Companion | You catch up with Lin Zexu beyond the Jade Gate. Together you survey the irrigation canals of Xinjiang and map the northern frontier, until the court recalls him in honor once more.

## up(Cohong broker): Open a Chinese steamship and trading house in the new treaty ports
requires_flag: cohong_broker
fx: silver +26, renown +16
tags: trade
ending: won | Master of the Five Ports | Using your contacts from Canton to Shanghai, you launch the first Chinese-owned merchant steamers along the coast, turning the treaty ports' own commerce back in favor of native guilds.
