// Every system in one place: shown once as a tip the first time it matters, and always in the Codex.
import type { Run } from '#lib/game/types';

export interface CodexEntry {
	id: string;
	glyph: string;
	title: string;
	text: string;
	/** when the tip should first appear */
	when: (run: Run) => boolean;
}

export const CODEX: CodexEntry[] = [
	{ id: 'swipe', glyph: '⇆', title: 'Swipe to choose', text: 'Drag a card left or right (or tap the choices). Some cards hide a third option (swipe up) unlocked by a trait, item or companion. ⚂ marks a gamble.', when: () => true },
	{ id: 'stats', glyph: '銀', title: 'Five things keep you alive', text: 'Silver, Vigor, Renown, Fortune and Mind. Run out of any, or let one overflow its limit, and the journey ends. Watch the dots above each when you hover a choice.', when: (r) => r.cardsSeen >= 1 },
	{ id: 'map', glyph: '🌐', title: 'The world is the map', text: 'Pick a road from the list (or tap a city on the globe). Days, cost and dangers are shown. Your commission’s destination is marked ◎: mind the deadline.', when: (r) => r.phase === 'map' },
	{ id: 'venues', glyph: '🏮', title: 'Places in town', text: 'Each city has its own places: big cities have palaces, bazaars and academies; villages, only an inn. Tap one to see who is there: swipe right to spend time with someone, or just look around.', when: (r) => r.visited.length >= 2 || r.phase === 'city' },
	{ id: 'energy', glyph: '⚡', title: 'Energy', text: 'You can only do a few things per stay. Rest a day, or take a room at the inn, to recover.', when: (r) => (r.energy ?? 99) <= 1 },
	{ id: 'voices', glyph: '本', title: 'Inner voices', text: 'Twenty parts of you comment on what is happening, and Instinct and Reason give real hints. Higher levels speak more often. When your Mind frays, they start to lie.', when: (r) => r.cardsSeen >= 3 },
	{ id: 'mind', glyph: '心', title: 'Mind', text: 'Failed gambles, heavy losses and cruelty wear it down. Rest, faith, art, food and love restore it. Below 35 you fumble; below 15 some choices simply fail. At 0 you are lost.', when: (r) => (r.mind ?? 70) < 60 },
	{ id: 'people', glyph: '🤝', title: 'People you know', text: 'Everyone you swipe right on is remembered. Visit them again to become friends, confidants or sweethearts, or recruit those looking for work.', when: (r) => (r.people ?? []).length > 0 },
	{ id: 'bag', glyph: '🎒', title: 'Your luggage', text: 'Items have shapes. Open the bag to move and rotate them; a mount and extra bags carry more. A Meticulous traveller wants everything packed into the top-left corner.', when: (r) => r.bag.length >= 3 },
	{ id: 'market', glyph: '🛍️', title: 'Markets', text: 'Outfits change who lets you in and how locals treat you. Curios fetch 2–3× where they are prized. Charts reveal hidden roads; riddle maps lead to treasure.', when: (r) => r.visited.length >= 2 },
	{ id: 'cabinet', glyph: '💭', title: 'The Thought Cabinet', text: 'Some experiences plant a thought. Carry up to three; after enough days on the road they become part of you. Open Self in your journal to think them.', when: (r) => (r.cabinet?.found.length ?? 0) > 0 },
	{ id: 'caps', glyph: '🏅', title: 'Seasoned', text: 'Everything you live through teaches you. As a stat moves, its limit grows (up to +30), and some traits start you higher. More room to survive.', when: (r) => Object.values(r.xp ?? {}).some((x) => (x ?? 0) >= 150) },
	{ id: 'disaster', glyph: '🌋', title: 'Catastrophes', text: 'Earthquakes, floods, fires and storms hit a city and its neighbours: roads slow or close, inns and bridges are wrecked, and ruins sometimes reveal hidden paths.', when: (r) => (r.world ?? []).some((w) => w.kind === 'disaster') },
	{ id: 'secrets', glyph: '🗝', title: 'Hidden roads', text: 'Locals talk. Two rumours about the same hidden road reveal it on your map. Listen in inns, harbours, and to strangers on the road.', when: (r) => Object.keys(r.flags).some((k) => k.startsWith('hint:')) },
	{ id: 'turmoil', glyph: '⚑', title: 'Turmoil', text: 'Uprisings, successions and riots slow and block roads, but bring work: messages to carry, bounties to hunt, treasure to find.', when: (r) => Object.keys(r.flags).some((k) => k.startsWith('rev:')) || (r.world ?? []).some((w) => w.kind === 'death') },
	{ id: 'brink', glyph: '⚡', title: 'The brink of fate', text: 'On Pilgrimage and Courier, fate gives you one last stand for each stat. Rōnin get one per journey; Legends get none.', when: (r) => Object.keys(r.flags).some((k) => k.startsWith('brink_used:')) },
	{ id: 'skills', glyph: '🛠', title: 'Life skills', text: 'Seventeen skills (art, thievery, athletics, martial arts, strength, knowledge, luck, cooking, handcraft, machinery, puzzles, creativity, medicine, devotion, the third eye, presence, composure) grow every time a choice uses them. Higher levels win more often and open skill-check options.', when: (r) => r.cardsSeen >= 4 },
	{ id: 'goal', glyph: '🌟', title: 'Your life goal', text: 'Beyond the commission, your traveller wants something. Fulfil it for a great reward, a calmer mind and a better score. See Self in your journal.', when: (r) => r.cardsSeen >= 6 },
	{ id: 'undo', glyph: '↶', title: 'Undo and rewind', text: 'Take back your last choice once per city (any number of times on Pilgrimage). Your journal keeps your last three city arrivals to rewind to.', when: (r) => r.cardsSeen >= 2 },
	{ id: 'planner', glyph: '🧭', title: 'Plan a course', text: 'Tap any far city on the globe to see the best path, each leg’s days and dangers, then set it as your course.', when: (r) => r.visited.length >= 2 },
	{ id: 'contraband', glyph: '🛂', title: 'Contraband and intel', text: 'Stolen seals, banned books, gunpowder, war plans: worth a fortune to fences and spymasters, and a cell if customs finds them.', when: (r) => r.bag.some((id) => /seal|books|gunpowder|pamphlets|counterfeit|pelt|plans|letters|ledger|charts|opium/.test(id)) },
	{ id: 'letters', glyph: '✉️', title: 'Letters and home', text: 'Write to friends, your sweetheart, your patron or your family from your journal; replies catch up with you on the road. Buy a home to rest better, keep a stash and earn from your garden.', when: (r) => (r.people ?? []).length > 0 || !!r.romance },
	{ id: 'titles', glyph: '🏵', title: 'Titles and collections', text: 'Do enough of something and the world gives you a name for it; each title makes certain people warmer. Taste every cuisine, cross famous bridges, see the wonders: completed collections give lasting perks.', when: (r) => (r.titles?.length ?? 0) > 0 || Object.values(r.collected ?? {}).some((x) => x.length >= 3) },
	{ id: 'photo', glyph: '📷', title: 'Photo mode', text: 'The camera button over the globe hides everything but the world and a caption. Esc to return.', when: (r) => r.visited.length >= 4 },
	{ id: 'guild', glyph: '⚖', title: 'Guild rank and warehouses', text: 'Trading at markets and fulfilling contracts raises your Merchant Guild rank (0 to 5), unlocking discounts and guild charters. Store curios in warehouses across up to three cities and ship them where they fetch the highest price.', when: (r) => Number(r.flags['guild:vol'] ?? 0) > 0 || Object.keys(r.warehouse ?? {}).length > 0 },
	{ id: 'dynasty', glyph: '家', title: 'Your line goes on', text: 'When a journey ends, a child, apprentice or cousin can carry on with your relics, half your standing, and all your enemies.', when: (r) => r.phase === 'end' }
];

const KEY = 'four-seas:tips';
export function seenTips(): string[] {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '[]');
	} catch {
		return [];
	}
}
export function markTip(id: string) {
	try {
		localStorage.setItem(KEY, JSON.stringify([...new Set([...seenTips(), id])]));
	} catch {}
}
/** The next tip worth showing right now, if any. */
export const nextTip = (run: Run, seen: string[]) => CODEX.find((e) => !seen.includes(e.id) && e.when(run)) ?? null;
