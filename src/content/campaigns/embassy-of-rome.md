campaign: embassy-of-rome
id: embassy-of-rome
title: The Tenshō Embassy
blurb: 1584. Four young Japanese Christian envoys step ashore in Lisbon after two years at sea. Escort Mancio Itō and his companions across Philip II's Spain, the Medici court of Florence, and the papal halls of Rome.
start: lisbon
home: lisbon
destination: rome
years: 1584-1586
year: 1584
deadline: 150
item: Folding screens of Azuchi Castle
patron: Father Alessandro Valignano
culture: japanese

# beat: tagus-landfall
at: any
where: any
speaker: monk
name: Mancio Itō
title: Chief Envoy of the Kyushu Daimyō
culture: japanese
gender: m
weight: 250
---
August 1584. After two years and six months sailing from Nagasaki past Macau, Malacca, Goa, and the Cape of Good Hope aboard the carrack *Santiago*, four teenage Japanese noblemen step ashore at **Lisbon**. **Mancio Itō**, representing Ōtomo Sōrin of Bungo, checks the camphor-wood crates containing the **Folding screens of Azuchi Castle**, painted in gold leaf by Kanō school masters as a gift from Oda Nobunaga to the Pope. Jesuit Father Diogo de Mesquita turns to you: "Father **Alessandro Valignano** stayed in Goa and charged us to keep the boys humble, yet every court in Europe wants a pageant. How shall we conduct the embassy?"

## left: Keep Valignano's strict rule and guard the envoys from courtly intrigue
fx: renown +8, silver +10, vigor +4
tags: loyal, faith
set: stage1, valignano_rule
standing: 8
text: Lodging quietly at the Jesuit House of São Roque, you inspect the gold-leaf *byōbu* screens and hire reliable mule-littles for the Spanish road.

## right: Embrace the royal pageantry to win the patronage of Europe's princes
fx: silver +14, renown +8
tags: talk, official
set: stage1, court_pageant
text: Cardinal Archduke Albert of Austria receives the boys at Sintra and fills your travel chest with three hundred gold cruzados.

## up(Japanese): Speak with Mancio Itō and Julião Nakaura in their native tongue
requires_trait: scholar
fx: renown +12, fortune +6, silver +6
tags: talk, art
set: stage1, valignano_rule
text: Hearing familiar words so far from Kyushu, the four young envoys entrust you with their private journals of European architecture and music.

# beat: escorial-audience
at: any
where: any
speaker: noble
name: King Philip II
title: King of Spain and Portugal
culture: european
gender: m
requires: stage1
weight: 240
---
In November 1584, the embassy reaches **Madrid** and the vast granite monastery-palace of **El Escorial**. Dressed in Japanese silk *kataginu* and wearing two swords, Mancio Itō, Miguel Chijiwa, Martinho Hara, and **Julião Nakaura** (already shaking with a high fever) are received by **King Philip II**, ruler of both Spain and Portugal. Standing beside his young heir in the Hall of Ambassadors, the King studies the letters written on bamboo paper from the Kyushu lords.

## left: Present the Kyushu letters with samurai dignity and tend to Nakaura's fever
fx: renown +10, vigor +6, silver +8
tags: loyal, mercy
karma: 6
set: stage2, philip_passport
text: Philip II sends his own royal physician to bleed and cool Nakaura's fever, and signs a golden safe-conduct for the Mediterranean galleys.

## right: Display the lacquer bamboo desk and request Spanish support for the Nagasaki trade
fx: silver +14, renown +8, fortune +4
tags: trade, official
set: stage2, spanish_silver
text: Enchanted by the maki-e gold lacquer, the King orders the royal treasury at Alicante to provision your ship to Italy at Crown expense.

## up(Court pageant): Arrange for the four envoys to play the organ and viol at the Escorial chapel
requires_flag: court_pageant
fx: renown +14, fortune +6, silver +8
tags: art, faith
set: stage2, philip_passport
text: The Spanish court marvels that boys from the far edge of the world play Victoria's polyphony with faultless grace.

# beat: alicante-crossing
at: any
where: any
speaker: captain
name: Giannettino Spinola
title: Captain of the Tuscan Merchant Carrack
culture: european
gender: m
requires: stage2
weight: 240
---
Embarking from Alicante across the winter **Mediterranean**, storm winds drive your vessel off Majorca while Barbary corsair galleys out of Algiers prowl the horizon. Below deck, **Miguel Chijiwa** quietly questions why European kings fight one another while preaching a single faith, and seawater threatens to seep into the hold where the **Folding screens of Azuchi Castle** are lashed.

## left: Wrap the Azuchi screens in tarred canvas and haul them to the captain's cabin
fx: vigor +6, renown +10, silver +6
tags: loyal, sea
set: stage3, screens_intact
text: Not a drop of salt spray touches Kanō Eitoku's painted castles and tigers as the carrack rides out the gale into Livorno harbour.

## right: Stand watch at the swivel-guns alongside the Genoese and Spanish sailors
fx: renown +12, vigor +4, silver +8
tags: fight, sea
set: stage3, corsair_repelled
text: Two warning shots from the stern chasers keep the corsair lateen-sails at bay until the lighthouse of Livorno appears.

## up(Valignano rule): Counsel Miguel Chijiwa honestly about the flaws and virtues of Christendom
requires_flag: valignano_rule
fx: renown +12, fortune +8, silver +6
tags: talk, faith
set: stage3, chijiwa_trust
text: Rather than hiding Europe's quarrels behind pious fables, your candor wins Miguel's lifelong respect as the ship makes port in Tuscany.

# beat: palazzo-vecchio
at: any
where: any
speaker: noble
name: Bianca Cappello
title: Grand Duchess of Tuscany
culture: european
gender: f
requires: stage3
weight: 240
---
At **Pisa** and **Florence**, Grand Duke Francesco I de' Medici and Grand Duchess **Bianca Cappello** welcome the Japanese envoys with banquets, falconry, and a ball in the **Palazzo Vecchio**. While Mancio Itō dances the pavane with the noblewomen of Tuscany, Florentine scholars and printers crowd around you asking for specimens of Japanese paper, ink-stones, and a movable-type press to send back to Asia.

## left: Purchase a European Gutenberg printing press and Latin-Japanese matrices
fx: renown +12, silver +8, vigor +4
tags: art, official
set: stage4, kirishitan_press
text: Loaded onto your baggage carts, this press will one day print the *Heike Monogatari* and Aesop's Fables in Nagasaki and Amakusa.

## right: Trade duplicate Japanese silk fans and porcelain with the Medici art cabinet
fx: silver +16, fortune +6, renown +6
tags: trade, art
set: stage4, medici_gold
text: The Grand Duke places the porcelain in the Uffizi tribune and presents your party with gold chains and Tuscan post-horses to Rome.

## up(Court pageant): Commission a Florentine court portraitist to sketch the four envoys
requires_flag: court_pageant
fx: renown +16, silver +10
tags: art, talk
set: stage4, kirishitan_press
text: Engravings of the four young ambassadors spread to Venice, Augsburg, and Paris before your horses even cross the Tiber.

# beat: sala-regia
at: any
where: any
speaker: monk
name: Pope Gregory XIII
title: Bishop of Rome and Sovereign Pontiff
culture: european
gender: m
requires: stage4
weight: 240
---
March 23, 1585. Cannon boom from the **Castel Sant'Angelo** and papal Swiss Guards line the streets as the cavalcade enters **Rome**. Dressed in kimono embroidered with birds and cherry blossoms, the envoys ride to the Vatican and ascend to the **Sala Regia**, where the eighty-three-year-old **Pope Gregory XIII** weeps with joy upon hearing **Martinho Hara**'s Latin oration and unrolling the golden **Folding screens of Azuchi Castle**. Days later, the old Pope falls fatally ill, and Rome plunges into a papal conclave.

## left: Guard the Japanese delegation through the interregnum until Sixtus V is crowned
fx: renown +14, vigor +6, silver +8
tags: loyal, official
set: stage5, knights_golden_spur
text: The new Pope Sixtus V knights all four youths into the Order of the Golden Spur, with cardinal ambassadors buckling on their golden spurs.

## right: Escort the envoys to the Capitol where the Roman Senate grants them patrician citizenship
fx: renown +12, fortune +8, silver +8
tags: talk, art
set: stage5, roman_patricians
text: Signed on vellum with a seal of solid gold, the senate charter makes the boys from Kyushu citizens of Eternal Rome.

## up(Kirishitan press): Secure the Vatican's blessing and funding for the Nagasaki printing house
requires_flag: kirishitan_press
fx: silver +16, renown +14
tags: faith, art
set: stage5, knights_golden_spur
text: Both popes endow the mission with a thousand ducats yearly and cases of freshly cast movable type for the return voyage.

# beat: return-to-the-east
at: any
where: any
speaker: official
name: Pasquale Cicogna
title: Doge of Venice and Host of the Envoys
culture: european
gender: m
requires: stage5
weight: 250
---
As the embassy prepares for its long homeward journey through Venice, Tintoretto paints their portraits, Andrea Gabrieli composes choral brass music in St. Mark's, and Abraham Ortelius's *Theatrum Orbis Terrarum* world atlas is packed alongside the printing press. The **Folding screens of Azuchi Castle** now shine in the halls of **Rome**, the first monumental work of Japanese art ever seen in Europe.

## left: Sail back to Goa and Nagasaki with Mancio Itō and the movable-type press
fx: renown +22, silver +16
tags: loyal, sea
ending: won | The Press of Amakusa | After eight years and half a world of sea, you step ashore in Nagasaki with the four envoys, Arabian horses, and the Gutenberg press. Even after Toyotomi Hideyoshi's edicts change the winds of Japan, the books printed on your press and the music played at the court in Kyoto endure for centuries.

## right: Remain in Italy as curator of the Azuchi screens and translator of East Asian letters
fx: renown +20, fortune +12
tags: art, official
ending: won | Keeper of the Golden Castle | Though Azuchi Castle itself burned in Japan, its golden towers live on upon the screens you brought to Rome. Scholars from across Europe visit your library in Rome and Florence to learn the scripts and arts of the Far East.

## up(Miguel's trust): Write the true, unvarnished chronicle of the four youths' journey across two worlds
requires_flag: chijiwa_trust
fx: renown +24, silver +14
tags: art, talk
ending: won | Chronicle of the Four Envoys | While official Jesuit dialogues turn the boys into polished Latin mouthpieces, your private manuscript preserves their real voices: Mancio's steadfastness, Martinho's eloquence, Julião's quiet martyrdom, and Miguel Chijiwa's searching heart.
