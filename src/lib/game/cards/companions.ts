// Every companion has a story of their own (three chapters), and sometimes your people pull you in different directions.
import { CITY } from '#lib/data/world';
import type { Companion, CrewRole } from '../types';
import { ch, npc, place, skill, up, type Ctx, type Template } from './helpers';

type Chapter = { text: string; left: [string, string]; right: [string, string] };
const ARCS: Partial<Record<CrewRole, Chapter[]>> = {
	bodyguard: [
		{ text: '#name# is sharpening a blade that is not theirs. "It belonged to the master I failed. I swore I would carry it to his son."', left: ['"We’ll find the son together."', 'They say nothing. They sharpen a little more gently.'], right: ['"Some oaths should be put down."', '"Not this one," they say, and keep sharpening.'] },
		{ text: 'A man in #city# recognises #name#: "You are the guard who let our lord die." A crowd gathers. #name# does not deny it.', left: ['Stand beside them', 'The crowd thins. #name# looks at you for a long time.'], right: ['Let them answer for themselves', '#name# tells the truth: an ambush, forty against four. The man spits — and leaves.'] },
		{ text: 'The son, at last: a young farmer who has no idea who his father was. #name# holds out the blade, hands shaking.', left: ['Tell him everything', 'He weeps, and asks #name# to teach him to use it. They say yes.'], right: ['Let #name# just give it', 'The boy takes the blade, puzzled. #name# walks away lighter than you have ever seen them.'] }
	],
	navigator: [
		{ text: '#name# has charted a coast that appears on no map — and refuses to show anyone. "My first ship sank there. My crew is still on that reef."', left: ['"One day we’ll sail there."', 'They roll the chart up carefully. "One day."'], right: ['"Burn it. Let them rest."', 'They do not burn it. But they stop looking at it every night.'] },
		{ text: 'A sailor in #city# swears there were survivors of #name#’s wreck — living with the islanders. #name# goes pale.', left: ['Ask more', 'Names. One of them is #name#’s brother.'], right: ['Tell them not to hope', '#name# hopes anyway. You can see it.'] },
		{ text: 'The reef, at dawn. On the beach, a man with #name#’s face waves at the ship as if he has been waiting twenty years. He has.', left: ['Let them go ashore alone', 'You watch two figures run, then stop, then hold on to each other for a very long time.'], right: ['Go ashore with them', 'Fish, coconut wine, stories in three languages. #name# laughs for the first time you can remember.'] }
	],
	guide: [
		{ text: '#name# stops at a crossroads and will not go left. "My village is that way. I left it in disgrace."', left: ['"Then we go right."', 'They nod, grateful, and walk faster.'], right: ['"What happened?"', 'A stolen goat, a broken engagement, a curse from a grandmother. It all sounds smaller out loud.'] },
		{ text: 'Word reaches #name#: their grandmother — the one who cursed them — is dying, and asking for them.', left: ['"Go. I’ll wait."', 'They are gone three days and come back older and quieter.'], right: ['"We go together."', 'The old woman looks at you, then at #name#, and says "So you found someone to follow you." Then she laughs.'] },
		{ text: 'At the funeral, the village asks #name# to stay as their headman. Everyone is looking at you.', left: ['Tell them to stay', 'They stay. Every traveller on that road from now on gets a free meal and your name.'], right: ['Ask them to come with you', '"I am a guide," they say. "Guides go." The village cheers anyway.'] }
	],
	healer: [
		{ text: 'In #city# #name# freezes at the sight of a pharmacy. "I mixed the medicine that killed a governor’s son. I was not wrong. They hanged my teacher anyway."', left: ['"You can’t save everyone."', '"I know. I keep trying anyway."'], right: ['"Then save someone today."', 'They nod, and walk into the pharmacy with their chin up.'] },
		{ text: 'Plague in a village off the road. #name# wants to stay and treat it. It is dangerous. It is slow.', left: ['Stay and help', 'A week of fever and boiling water. Most live.'], right: ['Leave them to it, and come back', 'You come back. They are alive, thinner, and very proud.'] },
		{ text: 'The governor whose son died is now old and ill — and asks for #name# by name.', left: ['Let them go', 'They treat him. He lives. He apologises, and gives them back their teacher’s books.'], right: ['Warn them it might be a trap', '"Maybe," they say. "I’m still a healer."'] }
	],
	thief: [
		{ text: '#name# freezes in #city#: their old gang owns this street. "They think I owe them. I think they owe me."', left: ['"Keep your head down."', 'They pull their hood up. You walk faster.'], right: ['"Then let’s settle it."', 'A cold grin. "Not yet. Soon."'] },
		{ text: 'The old gang’s boss sends a message: one last job for #name#, or they come for both of you.', left: ['Do the job together', 'A clean job. Too clean. They wanted to see if #name# was still good.'], right: ['Refuse, and get ready', 'Nobody comes that night. Or the next. Then a dead pigeon on the doorstep.'] },
		{ text: 'The boss, at last, alone in a teahouse. #name# sits across from him. "I’m out," they say. Everyone is watching you.', left: ['Back them up', 'The boss looks at you, at the door, at #name#. "Out it is," he says.'], right: ['Let them handle it', '#name# slides a small packet across the table: everything they know about the boss. He goes very pale. They are free.'] }
	],
	cook: [
		{ text: '#name# has been searching for one recipe for twenty years: their mother’s fish soup. "There was a spice. I can’t remember it."', left: ['Ask every market', 'Every market, every spice. Not yet.'], right: ['"Cook what you remember."', 'It is almost right. They cry anyway.'] },
		{ text: 'In #city#, an old woman sells a soup that smells exactly like childhood. #name# cannot speak.', left: ['Ask her the secret', 'She laughs. "Long pepper and a little lime peel. Everybody knows that."'], right: ['Just eat', 'Three bowls each. You will remember this meal for years.'] },
		{ text: '#name# finally cooks the soup, perfectly, for everyone at the inn. Then sets aside one bowl, for no one.', left: ['Sit with them', 'You eat in silence. It is the best thing you have ever tasted.'], right: ['Toast their mother', 'The whole inn raises cups to a woman none of them knew.'] }
	]
};

const arcOf = (c: Ctx): { m: Companion; ch: Chapter; stage: number } | null => {
	for (const m of c.run.crew) {
		const chs = ARCS[m.role];
		if (!chs) continue;
		const stage = Number(c.run.flags['arc-crew:' + m.id] ?? 0);
		if (stage < chs.length && m.loyalty >= 35) return { m, ch: chs[stage], stage };
	}
	return null;
};

export const COMPANION_T: Template[] = [
	{
		id: 'crew-story',
		where: 'any',
		tags: ['loyal'],
		weight: (c) => (arcOf(c) ? 1.6 : 0),
		make: (c) => {
			const { m, ch: chap, stage } = arcOf(c)!;
			const name = m.npc.name.split(' ')[0];
			const fill = (s: string) => s.replace(/#name#/g, `**${name}**`).replace(/#city#/g, place(c));
			const next = { ['arc-crew:' + m.id]: stage + 1 };
			const last = stage === (ARCS[m.role]!.length - 1);
			return {
				id: 'crew-story',
				npc: { ...m.npc },
				badge: `${name}’s story · ${stage + 1}/3`,
				text: fill(chap.text),
				left: ch(fill(chap.left[0]), last ? { renown: 6, fortune: 6 } : {}, { tags: ['loyal', 'talk'], setFlag: next, loyalty: 8, text: fill(chap.left[1]) }),
				right: ch(fill(chap.right[0]), last ? { fortune: 8 } : {}, { tags: ['loyal'], setFlag: next, loyalty: 5, text: fill(chap.right[1]) }),
				up: skill(c, 'aura') >= 4 ? up(`Presence ${skill(c, 'aura')}`, 'Say exactly the right thing', { fortune: 4 }, { tags: ['talk', 'loyal'], setFlag: next, loyalty: 15, text: `${name} looks at you as if seeing you properly for the first time.` }) : undefined
			};
		}
	},
	// ---------- dilemmas: no clean answer ----------
	{
		id: 'dilemma-friend-love',
		where: 'city',
		tags: ['romance', 'loyal'],
		weight: (c) => (c.run.romance && c.run.romance.status !== 'parted' && (c.run.people ?? []).some((p) => p.stage === 'friend' || p.stage === 'confidant') ? 1.2 : 0),
		once: true,
		make: (c) => {
			const friend = (c.run.people ?? []).find((p) => p.stage === 'friend' || p.stage === 'confidant')!;
			const love = c.run.romance!.npc;
			return {
				id: 'dilemma-friend-love',
				npc: friend.npc,
				badge: '⚖ Dilemma',
				text: `**${friend.npc.name}** is in trouble — debts, the kind that come with knives — and needs you in ${CITY[friend.city] ? 'their city' : 'person'} now. The same week, **${love.name}** writes: come, or don’t bother coming back. You cannot be in two places.`,
				left: ch(`Go to ${friend.npc.name.split(' ')[0]}`, {}, { tags: ['loyal', 'mercy'], days: 3, romance: { affection: -25 }, person: { profile: friend, bond: 30, stage: 'confidant' }, text: 'You save your friend. The letter you send your sweetheart is very long, and does not quite say sorry.' }),
				right: ch(`Go to ${love.name.split(' ')[0]}`, {}, { tags: ['romance'], days: 3, romance: { affection: 20 }, person: { profile: friend, bond: -35 }, text: 'Your sweetheart is radiant. Weeks later you learn what happened to your friend. You never quite forgive yourself.' })
			};
		}
	},
	{
		id: 'dilemma-crew-commission',
		where: 'travel',
		tags: ['loyal'],
		weight: (c) => (c.run.crew.some((m) => m.role !== 'ward') && !c.run.delivered && c.run.deadline - c.run.day < 30 ? 1.2 : 0),
		once: true,
		make: (c) => {
			const m = c.run.crew.find((x) => x.role !== 'ward')!;
			const n = npc(c, 'healer', { title: 'Village healer' });
			return {
				id: 'dilemma-crew-commission',
				npc: n,
				badge: '⚖ Dilemma',
				text: `**${m.npc.name}** has a fever that will not break. **${n.name}** says they need ten days of rest, here, or they may not survive the road. Your deadline will not wait ten days.`,
				left: ch(`Stay with ${m.npc.name.split(' ')[0]}`, { vigor: 4 }, { tags: ['loyal', 'mercy'], days: 10, loyalty: 25, text: 'Ten days of broth and cold cloths. They live. The deadline is a problem for later.' }),
				right: ch('Leave them in the healer’s care and ride on', { silver: -6 }, { tags: ['loyal'], crewRemove: m.id, text: `You pay the healer everything you can spare. ${m.npc.name.split(' ')[0]} squeezes your hand and tells you to go. You go.` })
			};
		}
	},
	{
		id: 'dilemma-ideal',
		where: 'city',
		tags: ['official', 'mercy'],
		weight: 0.6,
		once: true,
		make: (c) => {
			const n = npc(c, 'official', { title: 'Magistrate' });
			const thief = npc(c, 'child', { title: 'Accused child' });
			return {
				id: 'dilemma-ideal',
				npc: n,
				badge: '⚖ Dilemma',
				text: `**${n.name}** is about to sentence **${thief.name}**, a starving child, for stealing bread — from you. "The law is clear, traveller. You are the victim. Your testimony decides it."`,
				left: ch('Testify the truth: the child stole from me', { renown: 4 }, { tags: ['official', 'loyal'], standing: 4, karma: -6, text: 'The law is satisfied. The child is taken away. You eat your bread. It tastes of nothing.' }),
				right: ch('Lie: “I gave it to them”', { renown: -4 }, { tags: ['mercy', 'crime'], karma: 8, heat: 6, text: 'The magistrate knows you are lying. He lets it go. The child runs before anyone changes their mind.' })
			};
		}
	}
];
