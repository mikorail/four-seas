campaign: great-game
id: great-game
title: Tournament of Shadows
blurb: 1838. Across the Kazakh steppe and the khanates of Khiva and Bukhara, Russian captains and British surveyors in disguise play the Great Game for the approaches to India. Carry a diplomat's cipher through the desert courts to Dost Mohammad's Kabul.
start: moscow
home: moscow
destination: kabul
years: 1837-1840
year: 1838
deadline: 190
item: Sealed cipher of the Northern Passes
patron: Count Nesselrode's Asiatic Department
culture: steppe

# beat: orenburg-line
at: any
where: any
speaker: official
name: Captain Jan Witkiewicz
title: Envoy of the Asiatic Department
culture: european
gender: m
weight: 250
---
Snow swirls across the parade ground on the road from **Moscow** toward the Orenburg frontier, where Cossack pickets look out over the endless Kazakh steppe. **Captain Jan Witkiewicz**, a Polish exile turned Russian frontier rider, hands you a brass cylinder containing the **Sealed cipher of the Northern Passes** and astronomic tables of the Oxus. "In Kabul, Amir Dost Mohammad seeks allies to recover Peshawar, and the Scotsman **Alexander Burnes** is already at his court," Witkiewicz says. "Ride south across the steppe. Trust neither uniform, and keep the cipher from the British pundits."

## left: Travel openly with a Cossack horse-relay pass and Imperial gold
fx: renown +8, silver +10, vigor +4
tags: loyal, official
set: stage1, imperial_envoy
standing: 8
text: You strap the brass cylinder inside a Turkoman saddlebag and ride south with a string of hardy Bashkir ponies.

## right: Disguise yourself as an Armenian horse-trader bound for Bukhara
fx: silver +14, fortune +6
tags: talk, trade
set: stage1, shadow_player
text: Dressed in a quilted chapan with sample astrakhan pelts, you pass through frontier posts where uniformed officers would be turned back.

## up(Scholar): Memorize the astronomical bearings so the maps can never be seized
requires_trait: scholar
fx: renown +12, fortune +6, silver +6
tags: art, loyal
set: stage1, imperial_envoy
text: Every mountain pass, well depth, and compass variation between the Aral Sea and the Hindu Kush is locked safely behind your eyes.

# beat: ustyurt-wells
at: any
where: any
speaker: elder
name: Batyr Kenesary
title: Chieftain of the Middle Horde Steppe
culture: central-asian
gender: m
requires: stage1
weight: 240
---
Across the wind-scoured **Ustyurt plateau** between the Aral and Caspian seas, your caravan reaches a stone well ringed by felt yurts. **Batyr Kenesary** and his Kazakh horsemen water their herds before the winter frost locks the salt pans. "Russian forts creep down from Orenburg, and the Khan of Khiva taxes every camel train," Kenesary tells you over a bowl of fermented mare's milk. "Why should a courier of empires cross our grass?"

## left: Share your compass instruments and warn him of the frontier garrison's march
fx: renown +10, vigor +6, silver +6
tags: talk, mercy
karma: 6
set: stage2, steppe_guide
remember: favor | shared honest word at the Ustyurt wells
text: Kenesary assigns two eagle-hunters to guide your camels across the dry chalk cliffs to the Oxus Oasis.

## right: Pay the customary herd-tribute in silver rubles and brick tea
fx: silver +8, fortune +6, vigor +4
tags: trade, loyal
set: stage2, steppe_guide
text: Fair payment wins fresh two-humped Bactrian camels capable of marching ten days between brackish wells.

## up(Shadow player): Trade frontier rifle flints for a safe-conduct tally to Khiva
requires_flag: shadow_player
fx: silver +16, renown +8
tags: trade, talk
set: stage2, steppe_guide
text: With the chieftain's tamga branded on a horn tally, every nomadic camp along the Syr Darya gives you shelter.

# beat: registan-square
at: any
where: any
speaker: official
name: Kushbegi Hakim Biy
title: Grand Vizier of the Bukhara Emirate
culture: central-asian
gender: m
requires: stage2
weight: 240
---
Beneath the turquoise-tiled domes and towering madrasas of **Bukhara**, Emir Nasrullah's guards watch every foreign caravan entering the silk bazaar. Two British officers, Stoddart and Conolly, are rumoured to be riding into the Emir's dangerous court without gifts. In a cool arcade off the **Registan**, the **Kushbegi** summons you beside a silk merchant who secretly works as a surveyor for the East India Company, counting his paces on a string of hundred-bead rosaries.

## left: Present diplomatic gifts in proper Bukharan court protocol
fx: renown +12, silver +8, vigor +4
tags: official, talk
set: stage3, bukhara_pass
standing: 8
text: By dismounting at the Ark gate and bowing with two clocks and fine broadcloth, you win the Emir's stamped road-firman to Balkh.

## right: Outwit the Company surveyor in the bazaar and copy his Hindu Kush route-book
fx: renown +10, fortune +8, silver +8
tags: talk, crime
set: stage3, pundit_notes
text: Over pomegranates and green tea, you swap brass sextant lenses and transcribe his secret elevation notes of the Bamyan pass.

## up(Shadow player): Sell measured whispers to both the Kushbegi and the Company agent
requires_flag: shadow_player
fx: silver +18, renown +8
tags: talk, trade
set: stage3, pundit_notes
text: You collect Indian gold mohurs from one side and Bukharan tillas from the other while keeping the true cipher sealed.

# beat: oxus-ferry
at: any
where: any
speaker: captain
name: Nazar Beg
title: Master of the Amu Darya Horse-Boats
culture: central-asian
gender: m
requires: stage3
weight: 240
---
At the broad, muddy current of the **Amu Darya**, the ancient Oxus River, flat-bottomed boats pulled by swimming Turkoman horses wait among the tamarisk reeds. Across the water rise the ruined walls of Balkh and the white wall of the **Hindu Kush**. **Nazar Beg** points upstream: "Alaman raiders from Maimana are sweeping the south bank for captives, and an English courier passed through at dawn."

## left: Cross at night through the reed shallows with muffled oars
fx: vigor +6, fortune +8, silver +6
tags: river, loyal
set: stage4, crossed_oxus
text: The swimming horses tow your barge silently past the watchfires, landing you on the Balkh road before sunrise.

## right: Ransomed a captive Persian scribe from the river raiders to serve as interpreter
fx: renown +12, vigor +4, silver +4
tags: mercy, talk
karma: 8
set: stage4, persian_scribe
remember: favor | ransomed him on the banks of the Oxus
text: The scribe knows every court dialect from Herat to Kabul and translates the marginal notes on your pass cipher.

## up(Imperial envoy): Rally the caravan guards to hold the ferry landing
requires_flag: imperial_envoy
fx: renown +14, vigor +6, silver +8
tags: fight, loyal
set: stage4, crossed_oxus
text: Two disciplined volleys across the water send the raiders wheeling back into the dunes, opening the river for every merchant behind you.

# beat: bamyan-snows
at: any
where: any
speaker: scholar
name: Alexander Burnes
title: Political Agent of the East India Company
culture: european
gender: m
requires: stage4
weight: 240
---
High in the **Hindu Kush**, below the cliff-carved giant Buddhas of **Bamyan**, an early storm forces two parties into the same stone caravanserai. Sitting by the dung-fire in Afghan dress is **"Sekunder" Burnes**, the famed Scottish traveller and British envoy to Kabul. He recognizes the cut of your boots immediately. "We are two players on a very cold chessboard," Burnes says, offering a tin cup of hot tea. "Simla wants war if Dost Mohammad receives your dispatches, though I have written to Lord Auckland that the Amir only asks for a fair friend."

## left: Debate Burnes through the night and part as honorable adversaries
fx: renown +14, fortune +6, silver +6
tags: talk, loyal
set: stage5, burnes_respect
text: Neither of you yields an inch of duty, yet at dawn Burnes warns you which mountain defile is blocked by Kohistani bandits.

## right: Slip out before dawn through the Shibar Pass while his escort sleeps
fx: vigor +6, renown +10, silver +8
tags: land, loyal
set: stage5, beat_burnes
text: Your hardy steppe ponies breast the snowdrifts three hours ahead of his guides, bringing you down into the Kabul valley first.

## up(Pundit notes): Compare your astronomical surveys to prove neither empire can hold the passes by force
requires_flag: pundit_notes
fx: renown +16, fortune +8, silver +8
tags: art, talk
set: stage5, burnes_respect
text: Together you draft a confidential memorandum on the lethal winter gorges that every sensible general in both capitals ought to heed.

# beat: bala-hissar
at: any
where: any
speaker: noble
name: Amir Dost Mohammad Khan
title: Ruler of Kabul
culture: central-asian
gender: m
requires: stage5
weight: 250
---
Above the orchards and bazaars of **Kabul**, the fortress walls of the **Bala Hissar** look out toward the Khyber and the snow-peaks of Paghman. In the hall of audience, **Amir Dost Mohammad Khan** breaks the seal on your brass cylinder while envoys from Petersburg, Calcutta, and Bukhara await his word. "Two great empires knock at my gates," the Amir says, weighing your cipher in his palm. "Tell me, courier: what have you learned on the road from Moscow?"

## left: Deliver the cipher faithfully and counsel the Amir to guard his mountain neutrality
fx: renown +22, silver +16
tags: loyal, official
ending: won | Master of the Northern Passes | Dost Mohammad honors your counsel and grants you a jewelled *khilat* robe of honor. Though armies march and retreat across the passes in the years that follow, your dispatches become legend in the archives of the Great Game.

## right: Warn the court of the coming invasion and remain as chronicler of the Bala Hissar
fx: renown +20, fortune +12
tags: talk, mercy
karma: 8
ending: won | The Witness of Kabul | Forewarned by your intelligence, the Amir prepares his mountain strongholds long before the British columns march up the Bolan Pass. Four years later, when Dost Mohammad returns in triumph to his throne, you ride beside his stirrup.

## up(Shadow player): Retire to Samarkand with the secret route-books of both empires
requires_flag: shadow_player
fx: silver +28, renown +16
tags: trade, talk
ending: won | The Grand Cartographer of Tartary | Neither Tsar nor Company owns the maps you carried out of the Hindu Kush. Published in Paris and Vienna under a pseudonym, your atlas of High Asia makes your fortune and keeps the geographers arguing for fifty years.
