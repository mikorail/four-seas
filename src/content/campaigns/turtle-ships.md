campaign: turtle-ships
title: The Turtle Ships
blurb: 1592. A Japanese army of 150,000 lands at Busan. The capital falls in weeks. The kingdom's last hope is one admiral and a handful of iron-roofed ships.
start: hanseong
destination: busan
years: 1592-1598
deadline: 150
item: the King's commission for Admiral Yi
patron: King Seonjo of Joseon
culture: korean

# beat: capital-falls
at: hanseong
speaker: official
title: Royal secretary
culture: korean
weight: 200
---
Smoke over Hanseong; the King has fled north in the rain. **{npc}**, the last secretary left in the palace, presses a commission into your hands. "Admiral **Yi Sun-sin** holds the southern sea. The King names him commander of all three navies. Get this to him, whatever it costs."

## left: Ride south at once
tags: loyal
set: commission
text: You leave through the south gate as the first enemy banners appear in the north.

## right: First rescue the palace archives
fx: renown +8, vigor -6
tags: loyal, art
days: 1
set: commission, archives
text: You carry the Annals of the Joseon Dynasty out of the burning palace in an oxcart.

# beat: righteous-army
at: land, city
speaker: monk
name: Samyeong Daesa
title: Warrior monk of the Righteous Army
culture: korean
gender: m
weight: 120
---
In the mountains you meet the **Righteous Army**: farmers, scholars and Buddhist warrior-monks led by **Samyeong Daesa**. "The regulars ran. We did not. Fight with us for a week — then carry our report south with yours."

## left: Fight with the monks
fx: vigor -10, renown +14
tags: fight, loyal
days: 6
set: uibyeong
remember: favor | fought beside the Righteous Army

## right: Decline; the commission comes first
fx: fortune +2
text: "Go then. Tell the admiral the mountains are still Korean."

# beat: hansan
at: sea, busan, city
speaker: captain
name: Yi Sun-sin
title: Admiral of the Three Provinces
culture: korean
gender: m
weight: 150
requires: commission
---
At last: **Admiral Yi**, thin, stern, a man who keeps a diary every night of the war. He reads the King's commission without a change of expression. "Tomorrow at Hansan Island I will spread my ships like a crane's wings. Will you stand on the turtle ship's deck, or watch from shore?"

## left: Stand on the turtle ship
tags: fight, loyal
gamble: 0.65 | win: renown +20 ; The crane's wing closes. Fifty-nine Japanese ships sink. You feel the dragon-head cannon shake the deck beneath your feet. | lose: vigor -16, renown +10 ; An arquebus ball grazes you, but the battle is won.
set: hansan

## right: Write it all down from the shore
fx: renown +8
tags: art
set: hansan, diarist
text: Your account of the battle will be copied for centuries.

# beat: ming-army
at: pyongyang, hanseong, land
speaker: soldier
title: Ming general's aide
culture: han
---
A Ming army has crossed the Yalu to help. **{npc}**, an aide to General Li Rusong, needs a guide who knows the roads to Pyongyang. "We bring cannon and forty thousand men. We do not bring maps."

## left: Guide them
fx: renown +10, vigor -6
tags: loyal
days: 3
text: Pyongyang is retaken in the snow. The Ming general mentions you — briefly — in his report.

## right: Sell them a map instead
fx: silver +14
tags: trade

# beat: prison
at: city
speaker: official
title: Court investigator
culture: korean
requires: hansan
weight: 110
---
1597. Court rivals have accused Admiral Yi of disobeying orders. He is arrested, tortured, and demoted to a common soldier; his replacement promptly loses almost the entire fleet. **{npc}** asks you to testify.

## left: Testify for the admiral
fx: renown +10
tags: loyal, talk
standing: 10
set: testified
text: You are not thanked by the court. But the admiral hears of it.

## right: Keep your head down
fx: fortune -4
text: You say nothing. It is the prudent thing. It does not feel like it.

# beat: noryang
at: busan
speaker: captain
name: Yi Sun-sin
title: Admiral, restored to command
culture: korean
gender: m
weight: 200
---
December 1598. With twelve ships he once beat 133; now he leads the last battle of the war at the strait of **Noryang**, as the invaders try to sail home. Before dawn he tells you quietly: "If I fall, do not announce my death. The battle must go on."

## left: Fight at his side to the end
fx: renown +24
tags: fight, loyal
ending: won | Do Not Announce My Death | A stray bullet finds the admiral at the height of the battle. You hide his body behind a shield and beat his war drum yourself until victory. The war is over. Joseon remembers him forever, and you remember his last words.

## right: Carry his diary to safety
fx: renown +14
tags: art
ending: won | The War Diary | The admiral's Nanjung Ilgi survives the war because you kept it dry through the last battle. Four hundred years later, people still read it.

## up(Righteous Army): Bring the Righteous Army's boats to block the strait
requires_flag: uibyeong
fx: renown +20
ending: won | The Strait of Noryang | Fishing boats, monks and farmers seal the strait. The invasion ends in fire on the water. Songs about that night are sung in the mountains for generations.
