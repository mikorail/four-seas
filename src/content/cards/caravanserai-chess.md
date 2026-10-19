---
where: city
cultures: persian, steppe, ottoman, indian
weight: 1
speaker: scholar
title: Chess player
---
In the courtyard of a caravanserai in {city}, **{npc}** sits over a shatranj board and a pot of {drink}. "One game. If you win, I tell you which road the bandits are watching."

## left: Decline
fx: renown -1

## right: Play
tags: talk
gamble: 0.45 | win: renown +6 ; Checkmate. You learn which pass to avoid. | lose: silver -4 ; Outplayed in twelve moves. You pay for the tea.
