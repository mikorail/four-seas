title: The Hanging Scroll
profession: painter
badge: Painter's Way

# beat: commission
where: city
speaker: merchant
title: Rich silk merchant
---
**{npc}** wants a portrait for the ancestral hall — "Dignified. Older. Wiser. And with more hair." The fee would feed you for a month.

## left: Paint him as he wishes to be
fx: silver +14
tags: art, trade
set: painter_q1
text: He weeps at his own nobility. He pays double.

## right: Paint him truthfully
fx: renown +8, silver +4
tags: art
set: painter_q1
text: He hates it. His grandmother loves it. It hangs in the hall for two hundred years.

## up(Painter): Paint him as his grandfather sees him
requires_profession: painter
fx: renown +12, silver +10
tags: art
set: painter_q1
text: Somehow you catch the boy he was. He says nothing for a long time.

# beat: landscape
where: travel
requires: painter_q1
speaker: monk
title: Old hermit painter
---
On a misty ridge, **{npc}** has been painting the same mountain for forty years. "Every morning it is different. Sit. Paint it with me today."

## left: Paint beside him until dusk
fx: fortune +6, vigor +4
days: 1
tags: art, rest
set: painter_q2
text: Your mountain is clumsy. His is perfect. He says yours is braver.

## right: Ask him for his secret
fx: renown +4
tags: art, talk
set: painter_q2
text: "Paint the mist. The mountain will take care of itself."

## up(Painter): Trade brushes — and styles
requires_profession: painter
fx: renown +10
tags: art
set: painter_q2
text: You leave with a brush older than your country and a new way of seeing.

# beat: court
where: city
requires: painter_q2
speaker: official
title: Court painting master
---
The court of **{city}** needs a painter for a great screen: the ruler’s procession, a hundred figures, gold leaf. **{npc}** has seen your work. "Can you finish in one season?"

## left: Accept the commission
fx: silver +24, renown +14, vigor -8
days: 4
tags: art, official
set: painter_q3, painter_done
text: A hundred faces, each one alive. Your name is written in the corner, very small.

## right: Paint the procession — and the beggars watching it
fx: renown +18
tags: art
set: painter_q3, painter_done
text: Some courtiers are scandalised. The ruler stands in front of the beggars for a long time.

## up(Painter): Hide a secret message in the gold leaf
requires_profession: painter
fx: renown +14, fortune +8
tags: art, crime
set: painter_q3, painter_done
text: Only you, and anyone who looks very closely, will ever know.
