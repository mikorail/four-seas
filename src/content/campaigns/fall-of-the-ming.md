campaign: fall-of-the-ming
title: The Fall of the Ming
blurb: Spring 1644. Rebels are at the gates of Peking, the Manchus wait beyond the Great Wall, and the imperial seal must reach the southern capital.
start: beijing
destination: nanjing
years: 1643-1645
deadline: 90
item: the jade seal of the Southern Court
patron: the Chongzhen Emperor
culture: han

# beat: eunuch
at: beijing
speaker: official
title: Palace eunuch
culture: han
weight: 200
---
Smoke over the Forbidden City. Li Zicheng's rebel army is inside the outer walls. **{npc}**, a palace eunuch with a burnt sleeve, pushes a heavy silk bundle into your arms. "The seal. His Majesty has gone up Coal Hill and will not come down. Take it to Nanjing — the dynasty lives as long as the seal does."

## left: Escape by the Grand Canal
tags: loyal
set: canal
text: You slip out through the water gate in a night-soil barge. Nobody searches a night-soil barge.

## right: Hide in the city until the fighting ends
days: 4
set: hid
text: Four days in a coffin-maker's loft, listening to the city change hands.

# beat: coal-hill
at: beijing
speaker: child
title: Palace servant
culture: han
requires: hid
---
When you creep out, **{npc}**, a palace kitchen boy, tells you the news in a whisper: the Emperor hanged himself from a tree on Coal Hill, alone, with a note written on his sleeve. The rebels are looting the palace.

## left: Pay respects at the tree, at night
fx: fortune +6
tags: faith, loyal
text: A crooked locust tree. Someone has already left a bowl of rice beneath it.

## right: Leave at dawn with the refugees
fx: vigor -4
text: Ten thousand people on the southern road, and every one of them carrying something precious.

# beat: wu-sangui
at: land, river
speaker: soldier
title: Courier of General Wu Sangui
culture: han
weight: 120
---
**{npc}**, a courier from Shanhai Pass, shares your campfire. "General Wu holds the Great Wall with forty thousand men. The rebels have taken his father — and his concubine, Chen Yuanyuan. He is thinking of opening the gate to the Manchus." He looks at your silk bundle. "A token from the true court might change his mind."

## left: Keep the seal hidden
tags: loyal
text: The courier shrugs and rides north. History will do what it does.

## right: Send a message to Wu Sangui: hold the Wall
tags: talk
gamble: 0.3 | win: renown +14 ; Months later you hear Wu hesitated three whole days before opening the gate. You bought the Ming three days. | lose: renown +2 ; The courier never arrives. The gate opens. The Manchus pour through.
set: wrote-wu

# beat: rebel-patrol
at: land, river
speaker: bandit
title: Shun rebel patrol
culture: han
---
A patrol of Li Zicheng's "Shun dynasty" soldiers stops the boats. **{npc}** pokes your bundle with a spear. "Gold for the new emperor's army. Everyone pays."

## left: Pay them
fx: silver -12
tags: bribe

## right: Talk your way through
tags: talk
gamble: 0.5 | win: renown +4 ; "Night soil," you say. They wave you on very quickly. | lose: silver -18, vigor -6 ; They search everything and take what they like — but miss the seal.

# beat: kong
at: qufu
speaker: scholar
title: Duke Yansheng, heir of Confucius
culture: han
---
In Qufu, **{npc}**, the 65th-generation descendant of Confucius, is burying ancestral scrolls in the temple grounds. "Every dynasty falls. The Way does not. Help me hide the Analects — whoever rules next will need them."

## left: Hurry on to Nanjing
fx: vigor +2

## right: Dig through the night with him
fx: vigor -6, renown +6
tags: art, faith
days: 1
set: scrolls
text: By dawn the scrolls lie under a pine older than the Ming itself.

# beat: hongguang
at: nanjing
speaker: official
name: Ruan Dacheng
title: Minister of the Southern Court
culture: han
weight: 150
---
Nanjing has crowned a new emperor — the Hongguang Emperor, who is mostly interested in actresses. His minister **Ruan Dacheng**, famous for corruption and excellent plays, holds out a soft hand for the seal. "And a little something for the ministry's expenses."

## left: Give the seal to Ruan
fx: silver +10
set: gave-ruan
text: He weighs it, smiles, and locks it in a drawer with his scripts.

## right: Find the loyal general Shi Kefa instead
tags: loyal
standing: 10
set: shi-kefa
text: You find him in Yangzhou, in plain armour, writing letters to men who will never answer.

# beat: yangzhou
at: nanjing, yangzhou, hangzhou
speaker: soldier
name: Shi Kefa
title: Grand Secretary, defender of Yangzhou
culture: han
gender: m
requires: shi-kefa
weight: 200
---
Spring 1645. The Manchu banners have crossed the Yangtze. **Shi Kefa** takes the seal from you with both hands. "Yangzhou will hold for ten days, no more. After that — every man must choose."

## left: Stand with him at Yangzhou
fx: renown +20
tags: loyal, fight
ending: lost | The Ten Days of Yangzhou | The city falls. Shi Kefa refuses to submit and is executed; you fall at the east gate. Three centuries later your name is on a memorial wall that schoolchildren still visit.

## right: Carry the seal south to the Zheng fleet
fx: renown +10
tags: sea
ending: won | Sail with the Zhengs | You reach Fujian, where the pirate-admiral Zheng Zhilong and his son — later called Koxinga — keep the Ming alive at sea for forty more years. The seal sails with them to Formosa.

## up(Confucian): Bury the seal with the Analects
requires_faith: confucian
fx: fortune +10
ending: won | The Seal Beneath the Pine | You ride back to Qufu and bury the seal beside the scrolls. Dynasties pass. The pine is still there.

# beat: queue
at: nanjing
speaker: official
title: Qing magistrate
culture: han
requires: gave-ruan
weight: 200
---
Nanjing surrenders without a fight. The new Qing magistrate, **{npc}**, reads the shaving edict aloud in the square: every man must shave his forehead and braid a queue within ten days. "Keep your hair, lose your head."

## left: Shave, and live under the Qing
fx: renown -6
ending: won | The Queue | You shave, trade, marry and grow old under a new dynasty. Sometimes, drunk, you tell your grandchildren you once carried the seal of the Ming. They do not believe you.

## right: Refuse, and flee into the hills
fx: renown +12
tags: loyal
ending: won | The Last Loyalist | You live out your life as a hermit-poet in the hills of Zhejiang, writing verses dated by the reign of an emperor who no longer exists.
