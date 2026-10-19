campaign: pilgrims-road
title: The Pilgrim's Road
blurb: Like the monk Xuanzang a thousand years before, walk from Chang'an across deserts and mountains to the Deer Park where the Buddha first taught — and bring the true sutras home.
start: xian
destination: varanasi
years: 1500-1900
deadline: 280
item: an empty sutra chest
patron: the Abbot of the Great Wild Goose Pagoda
culture: han

# beat: abbot
at: xian
speaker: monk
title: Abbot of the Great Wild Goose Pagoda
culture: han
weight: 200
---
Under the seven-storey pagoda that Xuanzang himself built to house his scriptures, **{npc}** hands you an empty lacquered chest. "The sutras we have are copies of copies, full of errors. Walk the old road west, as the Master did. Fill this at the Deer Park, where the Wheel was first turned."

## left: Take the vow of a pilgrim
fx: fortune +6, silver +10
tags: faith
set: vow
text: You take the pilgrim's bowl and the strings of copper given by pious layfolk.

## right: Go as a scholar, not a monk
fx: renown +4, silver +8
tags: art
set: scholar
text: "The road does not care why you walk it," the abbot says, offering travel funds for the long road.

# beat: dunhuang
at: dunhuang
speaker: monk
title: Guardian of the Mogao Caves
culture: han
---
At the edge of the desert, a thousand painted caves glow in the cliff. **{npc}** lets you copy a forgotten map of the old pilgrims' wells. "Without it the Taklamakan will drink you."

## left: Copy the map by candlelight
fx: vigor -3, silver +6
days: 1
set: wells
text: Wells, cairns, and a warning about singing sands. The monastery provisions you with dried fruit and road money.

## right: Pray in the cave of the reclining Buddha
fx: fortune +8, silver +8
tags: faith
text: Devout merchants offering incense press traveling alms into your hands for prayers in the waste.

# beat: desert
at: land
speaker: ghost
title: Desert mirage
requires: vow
---
Day after day of sand. Water runs low. In the haze ahead, a caravan of the dead walks backwards, beckoning. The pilgrims of old wrote about this.

## left: Follow the old wells
fx: vigor -4, silver +4
text: You walk from cairn to cairn and find coins left at stone stupas by grateful caravans.

## right: Chant the Heart Sutra until the visions pass
fx: fortune +10
tags: faith
gamble: 0.6 | win: vigor +4 ; The mirage dissolves. A real oasis lies beyond it. | lose: vigor -12 ; You wander a day off course before the sutra brings you back.

## up(Dunhuang map): Follow the forgotten wells from your map
requires_flag: wells
fx: vigor +6
text: Sweet water in a place every caravan thinks is dry.

# beat: thugs
at: land, river
speaker: bandit
title: River bandits
weight: 100
---
On a river crossing in Hindustan, bandits seize the boat. Their leader **{npc}** looks you over and smiles: "The goddess wants a fair-skinned stranger this year. You will do." Exactly this happened to Xuanzang.

## left: Pray calmly, as the Master did
tags: faith
gamble: 0.55 | win: fortune +14, renown +10 ; A sudden storm overturns their altar. Terrified, they beg your forgiveness and become your disciples. | lose: vigor -14 ; You escape in the storm, half-drowned.

## right: Buy them off with road silver
fx: silver -8
tags: bribe
text: The goddess, apparently, accepts modest silver.

## up(Pilgrim Monk): Chant the Three Jewels
requires_trait: pilgrim
fx: fortune +12, renown +6
tags: faith
text: You sit in the boat and recite the Dharma. Shaken to the soul, the bandits fall to their knees, return your bowl, and row you ashore in reverence.

# beat: stupa
at: kathmandu, lahore, srinagar, kashgar, lhasa
speaker: monk
title: Keeper of the great stupa
weight: 120
---
Prayer flags crack in the wind over a white dome with painted eyes. **{npc}** gives you a cup of butter tea and news of the road ahead. "The Deer Park is still there. The monks are few. They will be glad of a pilgrim."

## left: Circle the stupa 108 times
fx: fortune +8, vigor -2, silver +6
tags: faith
days: 1
text: Fellow pilgrims share butter tea, parched barley, and a little copper for the shrines of Sarnath.

## right: Copy the inscriptions for your chest
fx: renown +6, silver +4
tags: art
set: inscriptions
text: An inquisitive trader pays you for a rubbing of the ancient Sanskrit verse.

# beat: deer-park
at: varanasi
speaker: monk
title: Monk of Sarnath
culture: indian
weight: 200
---
**Sarnath.** The ruins of the Deer Park lie quiet under neem trees; a few monks still chant where the Buddha first taught. **{npc}** opens a cedar box of palm-leaf sutras, older than any in China. "You came the whole way? Then these are yours to carry."

## left: Fill your chest and walk home
fx: renown +20, fortune +10
tags: faith
ending: won | The Sutras Come Home | You carry the palm leaves back across mountains and deserts. In Chang'an the abbot weeps over the chest, and the translations made from it are chanted for three hundred years.

## right: Stay at the Deer Park as a monk
fx: fortune +16
tags: faith
ending: won | The Quiet Monk of Sarnath | You never go home. You sweep the Deer Park every morning, and teach every pilgrim who arrives — as tired and amazed as you once were.

## up(Scholar): Translate the sutras here, in both languages
requires_flag: scholar
fx: renown +24
ending: won | The Translator | Twenty years of work produce a bilingual canon copied in Lhasa, Kyoto and Hanseong. Your name sits beside Xuanzang's in the colophons.
