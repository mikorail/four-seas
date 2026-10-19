campaign: opening-of-japan
title: The Opening of Japan
blurb: 1853. For two hundred years Japan has kept the world out. Now four black ships are steaming toward Edo, and you are carrying a warning nobody wants to hear.
start: nagasaki
destination: edo
years: 1852-1858
deadline: 120
item: the Dutch factor's warning
patron: the Nagasaki magistrate
culture: japanese

# beat: dejima
at: nagasaki
speaker: official
title: Dutch factor of Dejima
culture: european
weight: 200
---
On the fan-shaped island of Dejima, **{npc}** pours you genever and unrolls a newspaper from Batavia. "The Americans are sending a squadron of steamships to force open your ports. The magistrate ignored our warning last year. Take this letter to Edo yourself — perhaps they will listen to one of their own."

## left: Take the warning to Edo
tags: loyal
set: warning
text: A thin packet in Dutch and Japanese, sealed with the Company's mark.

## right: Ask the factor to teach you English first
tags: art, talk
days: 3
set: warning, english
text: Three days of grammar, newspapers and very bad pronunciation. "Good morning. I am a friend."

# beat: shoin
at: land, sea
speaker: scholar
name: Yoshida Shōin
title: Young samurai scholar
culture: japanese
gender: m
weight: 120
---
On the road you meet **Yoshida Shōin**, a fierce, laughing young scholar who has walked the length of Japan. "When the black ships come, I mean to stow away on one and see the world with my own eyes. The law says death. Will you help me?"

## left: Tell him it is madness
tags: loyal
text: "Then I will be mad," he says, and walks on whistling.

## right: Promise to help him
tags: crime
heat: 15
set: shoin
remember: favor | promised to help him see the world
text: You shake hands like Westerners. He finds it hilarious.

# beat: ronin
at: kyoto, osaka
speaker: soldier
title: Sonnō jōi swordsman
culture: japanese
---
In {city} a band of young samurai stop you at sword-point. Their banner reads **sonnō jōi** — revere the Emperor, expel the barbarians. **{npc}**: "You smell of Dutch tobacco. Are you a friend of the foreigners?"

## left: Swear you are a loyalist too
tags: talk
set: joi
text: They let you pass — and invite you to a secret meeting in Kyoto.

## right: Tell them the truth: the ships are coming whether they like it or not
tags: talk
gamble: 0.4 | win: renown +10 ; One of them lowers his sword. "Then we must learn their cannon." | lose: vigor -14 ; A sword flat across your back, and your purse gone.

# beat: black-ships
at: edo
speaker: official
name: Abe Masahiro
title: Chief Senior Councillor of the shogunate
culture: japanese
gender: m
weight: 200
requires: warning
---
Four black ships, smoking, anchored in Edo Bay; their guns could flatten the shore. **Abe Masahiro**, the young chief councillor, reads the Dutch warning you brought — a year too late. "We have no navy and no answer. The American commodore demands a reply. Can you read their letter?"

## left: Translate it faithfully
tags: talk, loyal
set: translated
text: "...friendship, commerce, coal and provisions, and protection for our shipwrecked people." And beneath the polite words, the guns.

## right: Soften the threats in translation
tags: talk
gamble: 0.5 | win: renown +12 ; Both sides think the other more polite than they are. The talks begin. | lose: renown -8 ; An American officer speaks Dutch, and notices.
set: translated

## up(English lessons): Speak to the Americans directly
requires_flag: english
fx: renown +16
set: translated, spoke-english
text: "Good morning. I am a friend." The commodore's officers stare, then laugh, then listen.

# beat: manjiro
at: edo
speaker: sailor
name: Nakahama Manjirō
title: Castaway who lived ten years in America
culture: japanese
gender: m
requires: translated
---
**Nakahama Manjirō**, a fisherman's son shipwrecked as a boy and raised in Massachusetts, has been brought to Edo to explain the Americans. "They are not demons," he tells you. "They are greedy, and generous, and in a great hurry. Like us, but with steam."

## left: Learn everything he knows
fx: renown +6
tags: art
days: 2
set: manjiro
text: Whaling, railways, elections, apple pie. You fill a notebook.

## right: Thank him and go
fx: fortune +2

## up(Shōin's friend): Ask him to help Yoshida Shōin
requires_flag: shoin
tags: mercy
set: manjiro-shoin
text: Manjirō sighs. "The ships leave from Shimoda in spring. I did not tell you that."

# beat: ending-treaty
at: edo
speaker: official
title: Shogunate envoy
culture: japanese
requires: translated
weight: 150
---
In the spring of 1854 a treaty is signed at Kanagawa. Ports will open; consuls will come. **{npc}** offers you a post as official interpreter. Outside, samurai mutter about traitors.

## left: Accept the post
fx: renown +14, silver +15
tags: official
ending: won | Interpreter of a New Age | You stand between two worlds at every negotiation for fifteen years — at Shimoda, at Yokohama, at the end of the shogunate. When the new Meiji government sends an embassy around the world, you are on the ship.

## right: Decline and go home to Nagasaki
fx: fortune +4
ending: won | Back to Dejima | You go home to the fan-shaped island and the Dutch genever. When the world finally arrives in Nagasaki, it finds you already waiting, with a phrasebook.

## up(Loyalist): Join the loyalists who want the barbarians gone
requires_flag: joi
fx: renown +8
tags: fight
ending: won | Revere the Emperor | You join the radicals of Chōshū and Satsuma. The shogunate falls in 1868 — and the new imperial government, ironically, opens Japan wider than anyone dared.

## up(Shōin's friend): Stow away on the black ship with Shōin
requires_flag: manjiro-shoin
tags: crime
heat: 40
ending: won | Stowaway | In the dark you row out to the flagship together. Shōin is sent back — but the Americans, amused, keep you. You see San Francisco before you see Edo again.
