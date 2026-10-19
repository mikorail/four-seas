campaign: mughal-succession
title: The Mughal Succession
blurb: Shah Jahan lies ill in Agra, and four sons reach for the Peacock Throne. A princess trusts you with a letter that could decide which one lives.
start: agra
destination: lahore
years: 1657-1659
deadline: 70
item: Princess Jahanara's letter
patron: Princess Jahanara Begum
culture: indian

# beat: jahanara
at: agra
speaker: noble
name: Jahanara Begum
title: Padshah Begum, eldest daughter of Shah Jahan
culture: indian
gender: f
weight: 200
---
Behind a marble screen in the Red Fort, **{npc}** presses a sealed letter and a ruby into your hands. Across the river, the white dome of her mother's tomb glows in the dusk. "My father is dying and my brothers are already at war. This must reach **Dara Shikoh** in Lahore before Aurangzeb's riders do. Trust no one wearing a white turban."

## left: Swear on the ruby
fx: renown +6
tags: loyal
set: sworn
text: She closes your hand around the ruby. "Then go tonight."

## right: Ask what is in the letter
tags: talk
gamble: 0.5 | win: renown +4 ; "The location of my father's treasury — and a plea for mercy for all four of my brothers." | lose: renown -4 ; "That is not your concern," she says coldly.
set: sworn

# beat: mir-jumla
at: agra, delhi
speaker: official
title: Agent of Prince Aurangzeb
culture: indian
weight: 140
---
In a caravanserai courtyard a man in a white turban sits down beside you uninvited. **{npc}** pours you {drink}. "Prince Aurangzeb will be emperor by spring. He would pay a lakh of rupees to read your letter first. And he remembers his friends — and the others."

## left: Refuse him
tags: loyal
set: refused-aurangzeb
remember: grudge | refused the Prince's silver
text: "As you wish." He smiles. That smile follows you for weeks.

## right: Sell him the letter
fx: silver +35
tags: crime, cruel
karma: -10
set: traitor
text: He breaks the seal, reads, and reseals it with a hot knife. "Deliver it anyway. The Prince likes his brothers to feel hopeful."

# beat: samugarh
at: land
speaker: soldier
title: Wounded Rajput
culture: indian
---
The road crosses the plain of Samugarh, where Dara's army broke three days ago. Elephants lie dead in the sun. **{npc}**, a Rajput officer with a spear wound, calls to you from the shade of an overturned howdah.

## left: Ride on — speed is everything
tags: cruel
text: You do not look back. The vultures are already circling.

## right: Bind his wound and put him on your horse
fx: vigor -6
tags: mercy
days: 1
set: rajput
remember: favor | carried them off the field of Samugarh
text: "I am Ratan Singh of Mewar," he says, "and I do not forget."

# beat: sarmad
at: delhi
speaker: monk
name: Sarmad Kashani
title: Naked Sufi saint
culture: persian
---
In the shadow of the Jama Masjid sits **Sarmad**, a Jewish-born Sufi poet who wears nothing at all and is loved by Dara Shikoh. He looks straight through you. "You carry a letter that is already too late. The question is only what you carry after it."

## left: Ask for his blessing
fx: fortune +8
tags: faith
text: He laughs and recites a quatrain about a lover who arrives after the funeral.

## right: Ask him which brother will win
fx: fortune +4
tags: talk
text: "The one who prays the most," he says, "and loves the least." You shiver.

# beat: pursuit
at: land
speaker: soldier
title: Aurangzeb's horseman
culture: indian
requires: refused-aurangzeb
weight: 120
---
Hoofbeats behind you on the Grand Trunk Road. A troop of horsemen in white turbans. **{npc}** draws his sword: "The letter. Now."

## left: Throw them a decoy and ride
tags: talk
gamble: 0.5 | win: renown +6 ; They stop to fight over an empty envelope. You are gone. | lose: vigor -12 ; They are not fooled. You escape, bleeding.

## right: Turn and fight
tags: fight
gamble: 0.4 | win: renown +12 ; Three riders down; the rest think better of it. | lose: vigor -18 ; You keep the letter, barely, and lose a great deal of blood.

## up(Rajput friend): Let Ratan Singh's men ambush them
requires_flag: rajput
fx: renown +10
text: Mewar cavalry pours out of the dhak trees. The pursuers never reach Lahore.

# beat: dara
at: lahore
speaker: noble
name: Dara Shikoh
title: Crown prince, translator of the Upanishads
culture: indian
gender: m
weight: 200
unless: traitor
---
**Dara Shikoh** receives you in a half-empty palace; his armies are melting away. He reads his sister's letter twice and sets it down very gently. "Jahanara asks me to make peace with Aurangzeb. My brother does not make peace." He looks up. "I am going west, to Sindh. Will you ride with me?"

## left: Ride with the prince
fx: renown +10
tags: loyal
ending: won | The Prince's Last Friend | You ride with Dara through Sindh and the Bolan Pass. He is betrayed in the end, as everyone knew he would be — but in the long nights he reads you Sanskrit and Persian side by side, and you understand why his sister loved him best.

## right: Deliver the letter and go home
fx: silver +15
ending: won | The Messenger | You did what a princess asked of you. Years later, in Agra, an old woman behind a marble screen sends you a single ruby with no note at all.

## up(Sufi): Persuade him to flee to Persia and live
requires_faith: muslim
tags: talk
fx: renown +14
ending: won | Exile in Isfahan | Dara takes your advice and crosses into Safavid Persia, where he dies old, in a garden, writing books nobody in Hindustan is allowed to read.

# beat: traitor-ending
at: lahore
speaker: soldier
title: Aurangzeb's commander
culture: indian
requires: traitor
weight: 200
---
In Lahore, Aurangzeb's commander is waiting for you at the gate, smiling. **{npc}** already knows every word of the letter. "You have served the Emperor-to-be. Now — where is his brother hiding?"

## left: Tell him
fx: silver +25
tags: cruel
ending: won | The Kingmaker's Coin | Dara is captured, paraded through Delhi on a filthy elephant, and executed. You are rich, and welcome at court, and you never again sleep through a night.

## right: Refuse, too late
fx: renown +6
tags: loyal
ending: lost | A Late Conscience | They take you to the fort. Aurangzeb has a long memory for those who serve him only halfway.
