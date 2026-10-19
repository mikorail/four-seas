campaign: katipunan
title: The Katipunan
blurb: Manila, 1896. A secret society signs its oath in blood and plans to free the islands from three centuries of Spain. Join the cells in Tondo — or the Guardia Civil hunting them.
start: manila
destination: hongkong
years: 1896-1898
deadline: 200
item: a membership roll written in code
patron: a Tondo warehouse clerk named Andrés
culture: malay

# beat: oath
at: manila
speaker: merchant
name: Andrés Bonifacio
title: Supremo of the Katipunan
culture: malay
gender: m
weight: 200
---
In a back room in Tondo, by candlelight, **Andrés Bonifacio** — a warehouse clerk who reads Victor Hugo — shows you a knife and a sheet of paper. "The Kataas-taasang, Kagalang-galangang Katipunan ng mga Anak ng Bayan. We sign in our own blood. Will you?"

## left: Sign in blood
tags: loyal
fx: renown +6
set: katipunero
heat: 10
standing: 8
text: A nick on the forearm, a name in code, a new brotherhood. You are now a son — or daughter — of the nation.

## right: Walk out, and tell the friar what you saw
tags: official
fx: silver +12
karma: -6
set: spanish
text: The parish priest listens, crosses himself, and sends a boy running to the Guardia Civil.

## up(Disguise): Sign under a false name and keep a foot in both camps
requires_outfit: beggar-rags, local-dress, merchant-silks
set: katipunero, double
fx: renown +4
text: Two names, two faces. Bonifacio trusts you. So, soon, will the Guardia Civil.

# beat: printing
at: manila, city
speaker: scholar
name: Emilio Jacinto
title: Brains of the Katipunan
culture: malay
gender: m
requires: katipunero
weight: 140
---
**Emilio Jacinto**, nineteen and brilliant, edits the society's newspaper *Kalayaan* — Freedom. "The press is hidden under a floor in Binondo. The paper must reach every town in Luzon by Sunday. The Guardia Civil reads everything that moves."

## left: Distribute the papers yourself
tags: crime
gamble: 0.55 | win: renown +10 ; Inside fish baskets, under altar cloths, folded into cigarettes. Thousands join that month. | lose: vigor -10 ; A patrol searches your cart. You lose the papers and nearly your life.
set: kalayaan
heat: 12

## right: Teach the cells to read the code instead
tags: talk, art
fx: renown +6
days: 2
set: kalayaan
text: Slower, safer, and the words stay in their heads where no one can confiscate them.

# beat: guardia
at: manila, city
speaker: soldier
title: Teniente of the Guardia Civil
culture: european
requires: spanish
weight: 140
---
**{npc}** of the Guardia Civil has a list of suspected Masons and filibusteros — and a bigger list of people he would simply like to hang. "You have friends in Tondo. Bring me names. Real ones, this time."

## left: Bring real names
tags: official, cruel
fx: silver +14
karma: -8
set: informer
text: Arrests that night. Screams in Fort Santiago. Your purse is heavier.

## right: Bring names of people already safely abroad
tags: talk
fx: silver +6, renown +4
set: informer, misled
text: He is delighted with your list. None of them will ever be caught.

## up(Uniform): Inspect the cells in a Spanish officer's coat
requires_outfit: company-uniform
set: informer
fx: renown +6
text: Nobody questions a uniform. You learn everything, and choose what to report.

# beat: discovery
at: manila
speaker: monk
title: Augustinian friar of Tondo
culture: european
weight: 150
requires: kalayaan
---
August 19, 1896. A Katipunero confessed everything to **{npc}**, a friar — and the friar went straight to the authorities. Printing press seized, membership lists found. Arrests are starting street by street. You have one night.

## left: Burn the rolls in your keeping
tags: loyal
fx: renown +8
set: burned
text: Ash in a clay pot. A hundred families who will never know you saved them.

## right: Run to warn Bonifacio
tags: loyal, land
fx: vigor -6
days: 1
set: warned
text: You find him at dawn. "Then it begins now," he says.

# beat: pugad-lawin
at: land, city
speaker: merchant
name: Andrés Bonifacio
title: Supremo
culture: malay
gender: m
requires: katipunero
weight: 160
---
In the hills of Balintawak, a thousand Katipuneros gather. Bonifacio holds up his *cédula*, the Spanish tax certificate that says who owns them. "Tear it up! Long live the Philippines!" Then the Guardia Civil arrives.

## left: Tear yours up, and fight
tags: fight, loyal
gamble: 0.5 | win: renown +16 ; The Cry of Pugad Lawin. The Guardia retreat. The revolution has begun. | lose: vigor -16, renown +8 ; Muskets in the bamboo. You fall back with the wounded, but you tore it up.
set: cry

## right: Guard the women and children's retreat
tags: mercy, fight
karma: 6
fx: vigor -6
set: cry
text: While the men shout, you get the families out by the river path.

# beat: rizal
at: manila
speaker: scholar
name: José Rizal
title: Novelist, physician, prisoner
culture: malay
gender: m
weight: 130
---
December 1896. In a cell in Fort Santiago sits **José Rizal**, author of *Noli Me Tángere*, accused of a revolution he did not even support. He is to be shot at dawn on the 30th. The guards will take a bribe for one visit. "Tell my people," he says, "I die without seeing the dawn of freedom. You will see it."

## left: Smuggle out his last poem
tags: art, loyal
fx: renown +14
set: ultimo
text: Hidden in an alcohol stove: *Mi Último Adiós*. It will be read in every school in the islands.

## right: Plan a rescue
tags: crime, fight
gamble: 0.3 | win: renown +10 ; He refuses to come. "My death will do more than my escape." | lose: vigor -14 ; The guards are waiting. You barely get away.
heat: 15

# beat: tejeros
at: city, land
speaker: soldier
name: Emilio Aguinaldo
title: General of Cavite
culture: malay
gender: m
requires: cry
weight: 120
---
March 1897, Tejeros. The revolution splits: **Emilio Aguinaldo**, the victorious young general of Cavite, is elected president over Bonifacio. The Supremo refuses to accept it. Both men want you on their side.

## left: Stand with Bonifacio
tags: loyal
set: supremo
remember: grudge | stood with Bonifacio at Tejeros
text: Two months later, Aguinaldo's men arrest Bonifacio and his brother. They are executed in the mountains. You were not there to stop it.

## right: Stand with Aguinaldo
tags: talk
fx: renown +8
set: aguinaldo
text: Unity, he says, before everything. Even before justice.

# beat: spanish-end
at: manila
speaker: official
name: Fernando Primo de Rivera
title: Governor-General of the Philippines
culture: european
gender: m
requires: informer
weight: 200
---
1897. The new Governor-General, **Primo de Rivera**, has negotiated the Pact of Biak-na-Bato: the rebel leaders go into exile in Hong Kong for 800,000 pesos. "Peace," he says, "bought cheaply. You served Spain well. What do you want?"

## left: A post and a pension
fx: silver +24
ending: won | Spain's Last Servant | You hold your post for one year. Then Dewey's fleet sails into Manila Bay, and Spain's three centuries end in an afternoon.

## right: Nothing — only the release of the prisoners in Fort Santiago
tags: mercy
fx: renown +12
karma: 10
ending: won | The Informer Who Freed Them | It is the strangest request he has ever had. He grants it. Some of the men walking out are men you named.

## up(Misled them): Admit you have been misleading Spain all along
requires_flag: misled
tags: talk
fx: renown +20
ending: won | The Double Game | You sail for Hong Kong with the exiles before anyone can stop you. Aguinaldo laughs for a full minute when he hears.

# beat: kawit
at: manila, hongkong
speaker: soldier
name: Emilio Aguinaldo
title: President of the Revolutionary Government
culture: malay
gender: m
requires: katipunero, cry
unless: informer
weight: 200
---
June 12, 1898, Kawit. From a window of his house, **Aguinaldo** proclaims the independence of the Philippines. A new flag is unfurled: sun and three stars. A band plays a march written days ago. American warships sit in the bay — allies, they say.

## left: Stand under the flag as it rises
tags: loyal
fx: renown +24
ending: won | Sun and Three Stars | The first free republic in Asia, for a little while. The Americans will come next, and another war. But you were there when the flag went up, and nobody can take that away.

## right: Warn Aguinaldo about the Americans
tags: talk
fx: renown +14
ending: won | The One Who Saw It Coming | "They promised," he says. You show him the newspapers from Washington. He goes quiet. The war with America begins in February. You are not surprised. You are still proud.

## up(Supremo): Lay a wreath for Bonifacio in the mountains
requires_flag: supremo
tags: faith, loyal
fx: renown +18
ending: won | The Supremo's Friend | Independence is declared without the man who began it. You walk to the Maragondon hills alone and plant a flag where he died. The nation will remember him; you make sure of it.
