// The great seasonal fairs — worth planning a whole route around.
export interface Fair {
	id: string;
	city: string;
	name: string;
	months: number[]; // 0 = January
	from?: number;
	until?: number;
	blurb: string;
}

export const FAIRS: Fair[] = [
	{ id: 'canton', city: 'guangzhou', name: 'The Canton Trading Season', months: [9, 10, 11, 0], from: 1700, blurb: 'The foreign ships are in. Hong merchants, supercargoes and smugglers crowd the Thirteen Factories.' },
	{ id: 'kyakhta', city: 'kyakhta', name: 'The Kyakhta Tea Fair', months: [11, 0, 1], from: 1728, blurb: 'Russian furs for Chinese tea, traded in the snow on the border.' },
	{ id: 'dutch-ship', city: 'nagasaki', name: 'The Arrival of the Dutch Ship', months: [6, 7, 8], from: 1641, until: 1859, blurb: 'Once a year, the only window to Europe opens. Every curious samurai in Japan is here.' },
	{ id: 'acapulco', city: 'acapulco', name: 'The Galleon Fair', months: [0, 1, 2], from: 1573, until: 1815, blurb: 'The Manila galleon is in: silk and porcelain from Asia, silver from Potosí, merchants from all of New Spain.' },
	{ id: 'registan', city: 'samarkand', name: 'The Autumn Fair of the Registan', months: [8, 9], blurb: 'Caravans from four directions meet under the blue domes before the passes close.' },
	{ id: 'monsoon-market', city: 'malacca', name: 'The Monsoon Market', months: [11, 0, 1], blurb: 'The winds bring every ship of the Indian Ocean and the China Sea to the strait at once.' },
	{ id: 'surat', city: 'surat', name: 'The Surat Ship Season', months: [9, 10], until: 1760, blurb: 'Pilgrim ships back from Mecca, Gujarati bankers, and cloth enough to dress the world.' },
	{ id: 'hajj-fair', city: 'jeddah', name: 'The Hajj Market', months: [5, 6], blurb: 'Pilgrims from every Muslim land sell what they carried to pay for the journey home.' },
	{ id: 'ningbo', city: 'ningbo', name: 'The Ningbo Spring Fair', months: [2, 3], blurb: 'Junks from Japan and Korea, and every kind of silk the empire makes.' },
	{ id: 'mocha', city: 'mocha', name: 'The Coffee Harvest Market', months: [10, 11], blurb: 'The new beans are in. Every coffee merchant from Cairo to Amsterdam has a buyer here.' }
];

/** The fair (if any) on in a city this month. */
export const fairIn = (city: string, month: number, year: number) => FAIRS.find((f) => f.city === city && f.months.includes(month) && year >= (f.from ?? 0) && year <= (f.until ?? 9999));
