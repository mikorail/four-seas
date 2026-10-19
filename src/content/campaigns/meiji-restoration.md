campaign: meiji-restoration
id: meiji-restoration
title: Dawn of Meiji
blurb: 1868. The last shogun resigns in Kyoto, Boshin warfires sweep toward Edo, and couriers race between imperial loyalists and samurai holdouts.
start: kyoto
home: kyoto
destination: edo
years: 1868-1869
year: 1868
deadline: 150
item: the Imperial brocade commission and Princess Kazunomiya's peace appeal
patron: Saigo Takamori of the Imperial Council
culture: japanese

# beat: toba-fushimi
at: any
where: any
speaker: soldier
name: Saigo Takamori
title: Commander of the Satsuma Imperial Guard
culture: japanese
gender: m
weight: 250
---
In the January snow outside **Kyoto**, Armstrong cannon thunder along the roads of **Toba and Fushimi**. Shogun Tokugawa Yoshinobu has resigned his office, yet fifteen thousand shogunate troops and Shinsengumi swordsmen clash with Satsuma and Choshu riflemen flying the gold-and-red Imperial brocade banner. **Saigo Takamori** hands you a lacquered dispatch box: "We march east along the Tokaido to take Edo. Ride ahead with our orders, or carry Princess Kazunomiya's private appeal to spare the city from fire."

## left: Ride for the Satsuma-Choshu Imperial Vanguard
fx: renown +8, silver +8, vigor +4
tags: fight, loyal
set: stage1, imperial_side
standing: 8
text: A gold chrysanthemum badge is pinned to your cloak as you spur east toward the barrier stations.

## right: Carry the secret peace letters for the Tokugawa retainers
fx: silver +12, fortune +6, vigor +2
tags: talk, loyal
set: stage1, peace_envoy
text: Hidden beneath your saddlecloth is a letter from the Emperor's aunt, widow of the fourteenth shogun, begging both sides not to burn Edo.

## up(Merchant): Contract with Thomas Glover's agents to supply both camps
requires_trait: merchant
fx: silver +16, renown +6
tags: trade
set: stage1, peace_envoy
text: With bills of lading from Nagasaki and Yokohama, every quartermaster along the highway welcomes your horses.

# beat: eejanaika-road
at: any
where: any
speaker: performer
name: O-Haru
title: Leader of the Ee Ja Nai Ka festival dancers
culture: japanese
gender: f
weight: 220
---
Along the **Tokaido highway**, paper talismans from the Grand Shrine of Ise flutter from the sky like snow. Thousands of townsfolk in brightly painted silks dance through the post-stations chanting *"Ee ja nai ka! Why not, what does it matter!"* while drums and flutes drown out the sound of marching armies. **{npc}** pulls your sleeve into the swirling crowd at the river ford.

## left: Dance through the barrier gate disguised among the revelers
fx: fortune +8, vigor +4, silver +6
tags: art, talk
set: stage2, danced_past
text: The checkpoint guards toss their spears aside to drink sweet sake, and you cross the river without showing a single pass.

## right: Hire the festival palanquin bearers as swift relays
fx: silver +8, renown +8, vigor +4
tags: trade
set: stage2, swift_bearers
text: Four bare-shouldered river porters carry you across the Oi River rapids faster than a general's warhorse.

## up(Imperial courier): Raise the brocade banner to part the crowd in awe
requires_flag: imperial_side
fx: renown +14, fortune +4, silver +6
tags: official
set: stage2, danced_past
text: At the sight of the Imperial chrysanthemum, dancers and station masters alike drop to their knees on the gravel.

# beat: hakone-pass
at: any
where: any
speaker: soldier
name: Hijikata Toshizo
title: Vice-Commander of the Shinsengumi
culture: japanese
gender: m
requires: stage1, stage2
weight: 250
---
In the cedar mists of the **mountain passes**, you come upon remnants of the **Shinsengumi**, now wearing Western wool coats and French boots alongside their twin swords. **Hijikata Toshizo**, cool-eyed and unbroken after Toba-Fushimi, blocks the narrow stone road: "Swords alone could not stop cannon, so we learned rifles. Tell me what you carry toward Edo before my men open fire."

## left: Stand your ground and earn his respect with an honest answer
fx: renown +12, vigor +4, silver +6
tags: talk, fight
set: stage3, met_hijikata
remember: favor | spoke honestly with Hijikata on the mountain road
text: Hijikata lowers his revolver. "A courier who does not flinch deserves the road. Tell Edo we are not dead yet."

## right: Tend the wounded Shinsengumi troopers in the mountain inn
fx: renown +10, vigor +6, silver +6
tags: mercy
karma: 6
set: stage3, met_hijikata
text: You leave lint bandages and salve for the young swordsmen; their scouts guide you safely down the eastern slope.

## up(Peace envoy): Show him the Tokugawa family's private seal
requires_flag: peace_envoy
fx: renown +14, silver +10
tags: talk, loyal
set: stage3, met_hijikata
text: Hijikata salutes the hollyhock crest in silence and assigns two riders to clear bandit roadblocks ahead of you.

# beat: yokohama-legations
at: any
where: any
speaker: official
name: Sir Harry Parkes
title: British Minister to Japan
culture: european
gender: m
requires: stage1, stage2
weight: 220
---
At the foreign settlement by the bay, British redcoats and French military advisors watch one another across the Bund while ironclads ride at anchor. **Sir Harry Parkes** warns that if Edo is put to the torch, foreign trade will collapse and his hospital surgeons in Yokohama will be overwhelmed by fifty thousand casualties.

## left: Secure British medical support and neutrality guarantees for the talks
fx: renown +12, fortune +6, silver +6
tags: talk, official
set: stage4, parkes_backing
text: Parkes writes a stern dispatch warning that no foreign power will countenance the burning of a city of a million souls.

## right: Buy Spencer repeating carbines and telegraph wire from the port merchants
fx: silver +12, renown +8, vigor +4
tags: trade
set: stage4, port_supplies
text: Your pack train leaves the Bund with modern signaling gear and hard silver Mexican dollars.

## up(Imperial courier): Convince the legations to recognize the young Emperor's court
requires_flag: imperial_side
fx: renown +16, silver +8
tags: talk, official
set: stage4, parkes_backing
text: By presenting the new court's pledge to uphold international treaties, you keep the foreign ironclads out of the civil war.

# beat: satsuma-estate
at: any
where: any
speaker: captain
name: Katsu Kaishu
title: Commander of the Shogunate Navy and Commissioner of Edo
culture: japanese
gender: m
requires: stage3, stage4
weight: 250
---
On the outskirts of **Edo**, fifty thousand imperial soldiers ring the city with torches and cannon, ready to attack on March 15. **Katsu Kaishu**, the former captain of the steamer *Kanrin Maru* who now speaks for the retired shogun, waits in a plain cotton haori to meet **Saigo Takamori**. "If we fight tomorrow, Edo burns to ashes and foreign warships will carve up what remains," Katsu tells you. "Walk with me into Saigo's camp."

## left: Carry Katsu's terms into the Satsuma headquarters at Takanawa
fx: renown +14, fortune +6, silver +8
tags: talk, loyal
set: stage5, edo_saved
text: Saigo reads Princess Kazunomiya's plea and looks Katsu in the eye. He cancels the dawn assault on the spot.

## right: Ride to the city fire brigades to disarm the arson squads
fx: renown +12, vigor +6, silver +8
tags: fight, mercy
karma: 8
set: stage5, fires_doused
text: All through the night you race from Nihonbashi to Asakusa, turning Katsu's firemen into peacekeepers so no spark sets off a panic.

## up(Peace envoy): Arrange the personal meeting between Saigo and Yamaoka Tesshu
requires_flag: peace_envoy
fx: renown +18, silver +10
tags: talk, loyal
set: stage5, edo_saved
text: Sword master Yamaoka walks straight through the Satsuma lines at your side; two old rivals sit on tatami mats and save a million lives over tea.

# beat: dawn-over-tokyo
at: any
where: any
speaker: official
name: Kido Takayoshi
title: Drafter of the Five Charter Oath
culture: japanese
gender: m
requires: stage5
weight: 250
---
Edo Castle opens its gates without a single building burned. Soon the sixteen-year-old Emperor rides east from Kyoto, renames the shogun's capital **Tokyo**, and proclaims the **Charter Oath**: deliberative assemblies shall be established, evil customs of the past broken, and knowledge sought throughout the world. **Kido Takayoshi** offers you a place in the new era you helped bring to birth.

## left: Join the new Meiji government and sail with the Iwakura Mission
fx: renown +22, silver +14
tags: official, art
ending: won | Knowledge Throughout the World | You help draft the telegraph and railway charters of Tokyo, then board a Pacific steamer with the Iwakura Embassy to see San Francisco, London, and Paris with your own eyes.

## right: Ride north to Hakodate to make peace with the last samurai holdouts
fx: renown +20, fortune +10
tags: mercy, talk
ending: won | The Last Truce at Goryokaku | Carrying Katsu Kaishu's letters to Enomoto Takeaki at the star fort of Hakodate, you persuade the surviving shogunate officers to lay down their arms and build the new nation together.

## up(Peace envoy): Open a printing house and newspaper on the Ginza brick street
requires_flag: peace_envoy
fx: silver +24, renown +18
tags: art, trade
ending: won | Voice of the New Capital | Beneath the gas lamps of Tokyo, your daily broadsheet prints the debates of the new age, read by rickshaw pullers, scholars, and former samurai alike.
