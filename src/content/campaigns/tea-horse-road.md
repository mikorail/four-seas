campaign: tea-horse-road
id: tea-horse-road
title: The Tea-Horse Road
blurb: 1720. Brick tea from Sichuan must cross the Hengduan gorges by mule train to Lhasa before the snows seal the high passes.
start: chengdu
home: chengdu
destination: lhasa
years: 1718-1722
year: 1720
deadline: 160
item: golden-seal Sichuan brick tea and the Imperial border dispatches
patron: the Commissioner of the Sichuan Tea and Horse Bureau
culture: tibetan

# beat: yaan-kilns
at: any
where: any
speaker: merchant
name: Master Luo
title: Chief Tea-Presser of the Sichuan Guild
culture: han
gender: m
weight: 250
---
Steam rises from the bamboo presses outside **Chengdu** as fermented tea leaves are hammered into dense, hide-wrapped bricks stamped with the imperial mark. In 1720, Dzungar horsemen occupy Lhasa while the Qing army marches west escorting the young **Seventh Dalai Lama**, Kelzang Gyatso. **Master Luo** tightens the rawhide straps on your lead mule: "An army on the roof of the world lives on butter tea, and the monasteries await the golden-seal bricks for the enthronement. Will you lead the guild caravan for profit, or carry the military dispatches for the Emperor's vanguard?"

## left: Take the Imperial vanguard commission and escort the sacred tea
fx: renown +8, silver +8, vigor +4
tags: loyal, official
set: stage1, imperial_caravan
standing: 8
text: You receive a brass tally from the Tea and Horse Bureau and a team of hardy mountain mules shod in iron.

## right: Sign with the Khampa merchant guild for a share of the horse barter
fx: silver +14, fortune +4
tags: trade
set: stage1, khampa_trader
text: Master Luo adds ten extra packs of fine Ya'an tea wrapped in waterproof yak-hide, worth their weight in silver beyond the passes.

## up(Tibetan): Chant the road-blessing with the caravan drovers
requires_trait: pilgrim
fx: fortune +10, renown +8, silver +6
tags: faith
set: stage1, imperial_caravan
text: The veteran muleteers tie five-colored prayer flags to your lead mare's bridle and swear to follow you through any blizzard.

# beat: ludings-chains
at: any
where: any
speaker: soldier
name: Captain Zhao
title: Warden of the Luding Iron-Chain Bridge
culture: han
gender: m
weight: 220
---
At the roaring gorge of the **Dadu River**, thirteen wrought-iron chains span three hundred feet of white water between sheer granite cliffs. Planks sway in the gale as pack-mules balk at the abyss. On the western bank lies **Kangding**, the mountain throat where Han porters carrying two hundred pounds of tea on wooden T-frames hand their loads over to Tibetan yak caravans.

## left: Unload the mules and carry the heavy tea packs across by hand
fx: vigor +6, renown +8, silver +6
tags: loyal
set: stage2, crossed_dadu
text: Walking step for step with the *beifu* tea-porters, you steady the swaying planks until every single brick and mule reaches the western cliff.

## right: Hire local rope-men and pay the bridge toll to speed the crossing
fx: silver +8, fortune +6, vigor +4
tags: trade, talk
set: stage2, crossed_dadu
text: Blindfolded mules are led safely across on matted straw while the river thunders fifty paces below.

## up(Khampa trader): Barter Sichuan silk at Kangding for long-haired pack yaks
requires_flag: khampa_trader
fx: silver +12, vigor +8
tags: trade
set: stage2, yak_train
text: At the Dartsendo market you trade lowland bolts for twenty black yaks that never slip on glacier ice.

# beat: hengduan-gorges
at: any
where: any
speaker: bandit
name: Gonpo Namgyal
title: Chieftain of the Nyarong Gorge riders
culture: tibetan
gender: m
requires: stage1, stage2
weight: 250
---
High in the **Hengduan gorges**, where three great rivers carve canyons deeper than the clouds, a troop of Khampa horsemen with coral-studded braids and matchlocks slung across sheepskin coats blocks the cliff trail. **Gonpo Namgyal** spurs his pony forward: "Dzungar raiders stripped the valley monasteries, and the lowland soldiers requisition our barley. Pay the mountain custom in brick tea, stranger, or turn back."

## left: Share boiled brick tea and salt by the campfire to win his brotherhood
fx: renown +12, fortune +6, silver +4
tags: talk, food
set: stage3, khampa_allies
remember: favor | shared brick tea and salt in the Hengduan gorge
text: After three bowls of salted butter tea, Gonpo laughs and sends four of his best riders to guard your flanks as far as Chamdo.

## right: Stand firm and display the banner of the Seventh Dalai Lama
fx: renown +14, vigor +4, silver +6
tags: faith, loyal
set: stage3, khampa_allies
text: Seeing the sacred seals bound for the Potala, the riders dismount, touch their foreheads to your saddle, and clear the rockslide ahead.

## up(Khampa trader): Strike a horse-for-tea compact with his clan
requires_flag: khampa_trader
fx: silver +16, renown +8
tags: trade, talk
set: stage3, khampa_allies
text: You promise thirty bricks of aged tea on every return trip in exchange for twelve swift Kham warhorses.

# beat: chola-blizzard
at: any
where: any
speaker: monk
name: Lama Tenzin
title: Medicine monk of Dege Printing Monastery
culture: tibetan
gender: m
requires: stage1, stage2
weight: 220
---
Crossing the **Chola Mountain pass** above sixteen thousand feet, an early autumn blizzard turns the sky white. The air is thin as a knife blade, and ice crusts the nostrils of the beasts. Near a cairn of mani stones, **Lama Tenzin** and a party of woodblock carvers from Dege shelter behind their yaks, tending a merchant whose lungs are rattling with mountain sickness.

## left: Boil butter tea with your brazier and share yak-hide blankets
fx: renown +10, vigor +6, silver +6
tags: mercy, faith
karma: 8
set: stage4, dege_blessing
text: Hot tea, roasted barley *tsampa*, and Tenzin's herbal pills bring the stricken travelers through the night until the sun breaks over the snow peaks.

## right: Follow the lead yak's tracks through the whiteout before the drift seals the col
fx: vigor +6, fortune +8, silver +6
tags: land
set: stage4, broke_the_pass
text: Old caravan yaks know where the ice bridges hold; by dusk you descend into the timberline valleys with every pack intact.

## up(Imperial caravan): Use the Bureau's signal rockets to guide stranded porters to shelter
requires_flag: imperial_caravan
fx: renown +14, vigor +6, silver +6
tags: loyal, mercy
karma: 6
set: stage4, dege_blessing
text: Red flares blossom against the storm, drawing two lost supply columns safely into the stone caravanserai.

# beat: nujiang-crossing
at: any
where: any
speaker: soldier
name: General Yanxin
title: Commander of the Qing Pacification Army
culture: han
gender: m
requires: stage3, stage4
weight: 250
---
Beyond **Chamdo** and the seventy-two switchbacks above the Nujiang River, you overtake the main camp of **General Yanxin** and Prince Yinti's western expedition. Dzungar horsemen under Tsering Dondub have been driven back from Damxung, and the golden palanquin of the **Seventh Dalai Lama** prepares for the final march into Lhasa. "Our troops are exhausted from the altitude and the Dzungar night raids," Yanxin says. "We need your tea bricks in the camp kettles tonight and a swift courier to ride ahead to the Potala."

## left: Distribute the brick tea to the freezing troops and ride with the honor guard
fx: renown +14, vigor +6, silver +8
tags: loyal, food
set: stage5, honor_guard
text: Steaming cauldrons of butter tea revive the camp; at dawn you ride at the head of the column beside the monastic banners.

## right: Ride ahead to Lhasa to assure the abbots of Sera and Drepung
fx: renown +12, fortune +8, silver +8
tags: talk, faith
set: stage5, lhasa_herald
text: Your arrival convinces the great monasteries to open the city gates without further bloodshed as the Dzungars withdraw north.

## up(Khampa trader): Remount the vanguard on your fresh Kham horses
requires_flag: khampa_trader
fx: silver +18, renown +12
tags: trade, loyal
set: stage5, honor_guard
text: Your hardy mountain horses replace the army's exhausted lowland mounts, earning a royal warrant from the quartermaster.

# beat: potala-enthronement
at: any
where: any
speaker: monk
name: Kelzang Gyatso
title: The Seventh Dalai Lama
culture: tibetan
gender: m
requires: stage5
weight: 250
---
Long copper horns sound from the white and crimson walls of the **Potala Palace** in **Lhasa**. Incense of juniper and cypress fills the Barkhor square as **Kelzang Gyatso**, the Seventh Dalai Lama, is enthroned upon the Fearless Lion seat while your golden-seal tea bricks are brewed in the great monastery kitchens for ten thousand monks.

## left: Receive the blessing of the Potala and lead the caravan back with Tibetan horses
fx: renown +22, silver +16
tags: faith, trade
ending: won | Master of the High Passes | With a white khata scarf around your shoulders and a string of three hundred prized Tibetan horses, you retrace the gorges to Sichuan. For thirty winters, every caravan on the Tea-Horse Road asks your blessing before crossing the Dadu bridge.

## right: Remain in Lhasa as Imperial Envoy and warden of the Barkhor trade
fx: renown +20, fortune +12
tags: official, loyal
ending: won | Envoy Beneath the Roof of the World | You take a stone house near the Jokhang Temple, arbitrating fairly between Sichuan tea guilds, Khampa drovers, and Lhasa nobles. Peace holds along the high road for a generation.

## up(Khampa trader): Establish a chain of relay caravanserais from Chengdu to Kathmandu
requires_flag: khampa_trader
fx: silver +26, renown +16
tags: trade
ending: won | The Caravan King of Kham | Your yak and mule relays link Sichuan, Kangding, Lhasa, and the Nepal valleys. Brick tea goes up the mountains, wool and gemstones come down, and your guild seal is honored across the Himalayas.
