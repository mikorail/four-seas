// The great fairs: auctions of rare things, and buyers who pay over the odds.
import { ITEMS } from '#lib/data/items';
import { CURIO } from '#lib/data/market';
import { fairHere } from '../market';
import { ch, has, npc, odds, up, type Template } from './helpers';

const LOTS = ['kalachakra', 'gold-idol', 'singing-seed', 'immortal-peach', 'tortoise-shell', 'garuda-feather', 'dokkaebi-token', 'emerald-sash'];

export const FAIR_T: Template[] = [
	{
		id: 'fair-auction',
		where: 'city',
		tags: ['trade', 'gamble'],
		weight: (c) => {
			const f = fairHere(c.run);
			return f && !c.run.flags['auction:' + f.id + ':' + c.year] ? 7 : 0;
		},
		make: (c) => {
			const f = fairHere(c.run)!;
			const lots = LOTS.filter((id) => ITEMS[id] && !c.run.bag.includes(id));
			const lot = lots.length ? c.rng.pick(lots) : 'charm';
			const item = ITEMS[lot];
			const n = npc(c, 'merchant', { title: 'Auctioneer of the fair' });
			const done = { ['auction:' + f.id + ':' + c.year]: true };
			const curio = c.run.bag.find((id) => CURIO[id]);
			return {
				id: 'fair-auction',
				npc: n,
				badge: `🎪 ${f.name}`,
				text: `${f.blurb} At the centre of it all, **${n.name}** holds up the prize of the season: **${item.name}** — ${item.desc.toLowerCase()} The bidding opens at twenty taels.`,
				left: ch('Bid for it', { silver: -18 }, { tags: ['trade', 'gamble'], setFlag: done, gamble: { p: odds(c, 0.5, ['trade']), win: { fx: { renown: 6 }, itemAdd: [lot], text: `Going, going — gone, to the traveller in the back. The ${item.name.toLowerCase()} is yours.` }, lose: { fx: { silver: 12 }, text: 'A Hong merchant outbids you with a lazy flick of a fan. Most of your deposit comes back.' } } }),
				right: curio ? ch(`Put your ${CURIO[curio].name.toLowerCase()} up for auction instead`, {}, { tags: ['trade'], setFlag: done, itemRemove: [curio], gamble: { p: 0.6, win: { fx: { silver: Math.round(CURIO[curio].price * 3) }, text: 'Two collectors fall into a bidding war. You try not to smile.' }, lose: { fx: { silver: CURIO[curio].price }, text: 'One serious bidder. A fair price, no more.' } } }) : ch('Just watch the bidding', { fortune: 2 }, { setFlag: done, text: 'The best theatre in town, and free.' }),
				up: has(c, 'merchant') || has(c, 'gambler') ? up(has(c, 'merchant') ? 'Merchant' : 'Gambler', 'Bid like you have done this all your life', { silver: -12 }, { tags: ['trade'], setFlag: done, itemAdd: [lot], text: 'You know exactly when to stop pretending not to care. The room never sees you coming.' }) : undefined
			};
		}
	}
];
