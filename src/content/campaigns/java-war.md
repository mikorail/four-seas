campaign: java-war
title: The Java War
blurb: 1825. The Dutch drive a road through the graves of Prince Diponegoro's ancestors. Java rises. Fight in the forest, smuggle in the night, scheme in the kraton — for the Prince, or for the Company's heirs.
start: mataram
destination: batavia
years: 1825-1830
deadline: 220
item: a kris wrapped in batik
patron: no one — yet
culture: malay

# beat: tegalrejo
at: mataram
speaker: elder
title: Gravekeeper of Tegalrejo
culture: malay
weight: 200
---
Survey stakes have been hammered through the graves of **Prince Diponegoro**'s ancestors at Tegalrejo for a Dutch road. The Prince's men have pulled them up and planted spears in their place. **{npc}** grips your arm: "The Resident's soldiers come tonight. Choose, stranger — everyone in Java will have to."

## left: Ride with the Prince's men into the hills
tags: loyal, fight
set: rebel
standing: 8
text: The house at Tegalrejo burns behind you. Ahead: the caves of Selarong, and a holy war.

## right: Carry the Resident's dispatch to Batavia's soldiers
tags: official
fx: silver +10
set: dutch
text: The Resident's seal opens every gate. People look at you differently now.

## up(Javanese dress): Melt into the crowd and listen to both sides
requires_outfit: local-dress, beggar-rags
set: rebel, spy
fx: renown +4
text: In a sarong and blangkon nobody looks at you twice. You will be the Prince's ears inside the Dutch towns.

# beat: santri
at: land, city
speaker: monk
title: Santri of the pesantren
culture: malay
requires: rebel
weight: 130
---
**{npc}**, a student from a Qur'an school, runs the underground: rice, gunpowder and messages hidden in batik bundles, carried by market women past Dutch posts. "The Prince fights in the open. We fight in the dark. Will you carry a bundle to the hills?"

## left: Carry the gunpowder yourself
tags: crime
gamble: 0.55 | win: renown +10 ; Under the noses of the patrol, wrapped in the finest batik in Java. | lose: vigor -12 ; A soldier slashes the bundle open. You run through the paddies with musket balls cracking past.
set: powder
heat: 10

## right: Organise the market women instead
tags: talk
fx: renown +6
days: 2
set: powder, network
text: Forty women, forty baskets, one secret. Not one of them talks.

## up(Disguise): Walk it through as a pilgrim
requires_outfit: pilgrim-garb, monk-robes, beggar-rags
set: powder
fx: renown +8
text: The patrol bows to the holy traveller and waves you through.

# beat: benteng
at: land, city
speaker: soldier
name: Hendrik Merkus de Kock
title: Lieutenant-General of the Dutch army
culture: european
gender: m
requires: dutch
weight: 130
---
General **de Kock** has a new plan: the *benteng stelsel* — hundreds of small forts linked by roads, closing the net village by village. "You know the country. Guide my columns. Or are you too fond of these people?"

## left: Guide the column
tags: loyal, land
fx: silver +12, renown +6
set: forts
text: Fort after fort goes up. The forest shrinks around the Prince.

## right: Warn the villages before the column arrives
tags: mercy
karma: 6
set: warned, forts
remember: favor | warned them before the soldiers came
text: The villages are empty when the soldiers arrive. Nobody suspects the guide. Yet.

## up(Company coat): Command a fort yourself
requires_outfit: company-uniform
fx: renown +14
set: forts, commander
text: A captain's coat makes a captain. You hold a crossroads for a season.

# beat: kraton
at: mataram
speaker: noble
title: Prince of the Yogyakarta court
culture: malay
weight: 140
---
Inside the **kraton**, behind white walls, the court of the boy Sultan is split down the middle. **{npc}** pours tea and speaks in courtly Javanese so formal it takes a minute to understand it is treason. "Half of us love the Prince. Half of us love our pensions from the Dutch. Which half are you carrying letters for?"

## left: Carry letters to the Prince's friends at court
tags: talk, crime
gamble: 0.5 | win: renown +8 ; Three princes slip out of the kraton that week to join Diponegoro. | lose: renown -6 ; A servant sells the letters to the Resident.
set: court
heat: 8

## right: Buy pensioned princes for the Dutch
tags: bribe, official
fx: silver -10, renown +6
set: court, bought
text: Gold, titles, a promise of the throne. Loyalty, it turns out, has a price list.

## up(Court dress): Speak at the council in the Sultan's name
requires_outfit: local-dress, silk-turban, mandarin-robe, merchant-silks
fx: renown +12
set: court
text: Dressed right, spoken right, you sway the council for a day. A day is enough.

# beat: gawok
at: land, city
speaker: soldier
name: Sentot Prawirodirjo
title: Diponegoro's young cavalry commander
culture: malay
gender: m
requires: rebel
weight: 170
---
**Sentot**, barely twenty, commands the Prince's horsemen. "A Dutch column comes down the valley at dawn. In the open we lose. In the rice terraces and the mist, we win. Ride with me?"

## left: Ride in the ambush
tags: fight, loyal
gamble: 0.55 | win: renown +16, vigor -6 ; Out of the mist, down the terraces — the column breaks and runs. | lose: vigor -18 ; Dutch artillery finds the terraces. You carry Sentot's wounded banner-bearer out.
set: battle

## right: Lead the villagers to safety first
tags: mercy
karma: 6
set: battle
text: The battle goes on without you. Two hundred people sleep in the forest tonight instead of under the guns.

# beat: cholera
at: land, city
speaker: healer
title: Army surgeon
culture: european
requires: dutch
weight: 110
---
More Dutch soldiers are dying of cholera and fever than of bullets. **{npc}**, a surgeon, has three hundred sick men and no medicine. "There is a Javanese healer in the next village. The army will not ask her. Will you?"

## left: Ask the healer
tags: talk, mercy
gamble: 0.55 | win: renown +8 ; She comes, for the sake of the sick, not the army. Half the men live. | lose: renown -4 ; She spits at your feet. You cannot blame her.
set: healer

## right: Requisition supplies from the villages
tags: cruel, official
fx: silver +6
karma: -6
text: You take their rice and their medicine. The sick soldiers live. The village does not forgive.

# beat: turned
at: city
speaker: official
title: Agent of the other side
weight: 90
requires: court
---
**{npc}** finds you at night. "We know what you are and whom you serve. Come over to our side — names, routes, everything — and you will be rich and safe when this ends. You know how it ends."

## left: Refuse
tags: loyal
fx: renown +4
remember: grudge | refused to turn traitor
text: You close the door. You do not sleep.

## right: Turn your coat
tags: crime
fx: silver +16
karma: -6
set: turncoat
text: By morning you work for the other side. It looks exactly the same from the inside.

# beat: magelang-rebel
at: city
speaker: noble
name: Prince Diponegoro
title: Ratu Adil, the Just King
culture: malay
gender: m
requires: rebel, battle
unless: turncoat
weight: 200
---
March 1830. Five years, two hundred thousand dead. The Dutch have invited **Prince Diponegoro** to peace talks in Magelang during Ramadan, under a white flag. "They have given their word," he says. "Shall I go?"

## left: Go with him, and stand by his side
tags: loyal
fx: renown +18
ending: won | Under the White Flag | General de Kock arrests the Prince at the table, against his word. You are beside Diponegoro when he is taken to the ship; he gives you his prayer beads. The war is lost. His name becomes Indonesia's.

## right: Warn him it is a trap
tags: talk
gamble: 0.4 | win: renown +24 ; He listens. He does not go. | lose: renown +10 ; He goes anyway. "A promise is a promise, even to them."
ending: won | The Prince Who Listened | Whether he went or not, you told the truth when it mattered. In the songs, a stranger warned the Just King. History says he was taken in Magelang; the dalang puppeteers tell it differently.

## up(Network): Use the santri network to keep the war alive
requires_flag: network
fx: renown +20
ending: won | The Long Resistance | The Prince is taken, but the network you built survives. A century later, its grandchildren declare independence.

# beat: magelang-dutch
at: city
speaker: soldier
name: Hendrik Merkus de Kock
title: Lieutenant-General
culture: european
gender: m
requires: dutch, forts
unless: turncoat
weight: 200
---
**De Kock** shows you his orders: the Prince will come to Magelang for peace talks under a white flag — and will be arrested at the table. "War is cheaper this way. You will stand guard at the door."

## left: Obey
tags: official, loyal
fx: silver +20, renown +8
karma: -8
ending: won | The Company's Peace | The Prince is shipped to Makassar. You are decorated in Batavia. The medal feels heavier every year.

## right: Refuse to dishonour the white flag
tags: loyal, mercy
fx: renown +10
karma: 8
ending: won | A Matter of Honour | You resign your post rather than stand at that door. The arrest happens anyway — but a Dutch officer's letter of protest survives in the archives, and so does your name.

## up(Warned the villages): Leak the plan to the Prince
requires_flag: warned
tags: crime
fx: renown +16
ending: won | The Guide Who Changed Sides | The Prince receives a whispered warning in a basket of mangosteens. What he does with it is his choice. What you did with yours is the story you tell your grandchildren.

# beat: turncoat-end
at: city
speaker: official
title: Paymaster
requires: turncoat
weight: 200
---
The war is ending. **{npc}**, paymaster of your new masters, counts out your reward — and studies your face. "Those who change sides once can change them twice. We will be watching you."

## left: Take the silver and leave Java
fx: silver +24
ending: won | The Double Life | You sail from Batavia rich, under another name. Some nights you still dream in both languages of the war.

## right: Use the silver to ransom prisoners from both sides
tags: mercy
fx: renown +14
karma: 10
ending: won | What the Silver Bought | Forty prisoners walk free — Dutch, Javanese, Chinese. Nobody can quite agree whose side you were on. Perhaps that was the point.
