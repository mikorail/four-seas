// What a journey looks like: vehicle, terrain, weather and time of day — for the animated journey scene.
import { CITY, type Route } from '#lib/data/world';
import { monthOf, seasonFor, seasonName } from './economy';
import type { Run } from './types';

export type Vehicle =
	| 'junk'
	| 'dhow'
	| 'galleon'
	| 'steamer'
	| 'canoe'
	| 'barge'
	| 'balloon'
	| 'train'
	| 'horse'
	| 'camel'
	| 'elephant'
	| 'yak'
	| 'mule'
	| 'cart'
	| 'palanquin'
	| 'coach'
	| 'walk';

export type Biome = 'sea' | 'river' | 'desert' | 'mountain' | 'jungle' | 'steppe' | 'taiga' | 'paddy' | 'fields' | 'sky';
export type Weather = 'clear' | 'rain' | 'storm' | 'snow' | 'blossom' | 'leaves';

export interface JourneyLook {
	vehicle: Vehicle;
	vehicleName: string;
	biome: Biome;
	biomeName: string;
	weather: Weather;
	season: string;
}

const DESERT = new Set(['mecca', 'jeddah', 'aden', 'mocha', 'muscat', 'kashgar', 'turfan', 'dunhuang', 'khiva', 'bukhara', 'samarkand', 'basra', 'baghdad', 'cairo', 'hormuz', 'bandarabbas', 'kandahar', 'isfahan', 'mashhad', 'herat']);
const MOUNTAIN = new Set(['lhasa', 'kathmandu', 'srinagar', 'kabul', 'wudang', 'shambhala', 'chengdu', 'kunming', 'kandy']);
const TAIGA = new Set(['tobolsk', 'yakutsk', 'okhotsk', 'irkutsk', 'nerchinsk', 'petropavlovsk', 'moscow', 'sitka', 'kyakhta']);
const STEPPE = new Set(['urga', 'kyakhta', 'astrakhan']);

export function vehicleFor(run: Pick<Run, 'mount'>, route: Pick<Route, 'mode' | 'vessel'>): { vehicle: Vehicle; name: string } {
	const v = route.vessel.toLowerCase();
	if (v.includes('balloon')) return { vehicle: 'balloon', name: 'hot-air balloon' };
	if (route.mode === 'sea') {
		if (v.includes('steam')) return { vehicle: 'steamer', name: route.vessel };
		if (v.includes('dhow') || v.includes('pinisi')) return { vehicle: 'dhow', name: route.vessel };
		if (v.includes('carrack') || v.includes('indiaman') || v.includes('galleon') || v.includes('galley')) return { vehicle: 'galleon', name: route.vessel };
		if (v.includes('canoe')) return { vehicle: 'canoe', name: route.vessel };
		return { vehicle: 'junk', name: route.vessel };
	}
	if (route.mode === 'river') return v.includes('steam') ? { vehicle: 'steamer', name: route.vessel } : { vehicle: 'barge', name: route.vessel };
	if (v.includes('railway')) return { vehicle: 'train', name: 'railway' };
	if (run.mount) {
		const k = run.mount.kind;
		return { vehicle: k === 'donkey' ? 'mule' : (k as Vehicle), name: k };
	}
	if (v.includes('camel')) return { vehicle: 'camel', name: route.vessel };
	if (v.includes('yak')) return { vehicle: 'yak', name: route.vessel };
	if (v.includes('elephant')) return { vehicle: 'elephant', name: route.vessel };
	if (v.includes('pony')) return { vehicle: 'horse', name: route.vessel };
	if (v.includes('palanquin')) return { vehicle: 'palanquin', name: route.vessel };
	if (v.includes('stagecoach')) return { vehicle: 'coach', name: route.vessel };
	if (v.includes('cart')) return { vehicle: 'cart', name: route.vessel };
	return { vehicle: 'walk', name: 'on foot' };
}

export function journeyLook(run: Run, route: Route): JourneyLook {
	const { vehicle, name } = vehicleFor(run, route);
	const month = monthOf(run);
	const season = seasonName(month);
	const s = seasonFor(route, month);
	const ids = [route.from, route.to];
	const cities = ids.map((id) => CITY[id]);
	let biome: Biome = 'fields';
	if (vehicle === 'balloon') biome = 'sky';
	else if (route.mode === 'sea') biome = 'sea';
	else if (route.mode === 'river') biome = 'river';
	else if (ids.some((i) => MOUNTAIN.has(i)) || cities.some((c) => c.culture === 'tibetan')) biome = 'mountain';
	else if (ids.some((i) => DESERT.has(i))) biome = 'desert';
	else if (ids.some((i) => TAIGA.has(i))) biome = 'taiga';
	else if (ids.some((i) => STEPPE.has(i)) || cities.every((c) => c.culture === 'steppe')) biome = 'steppe';
	else if (cities.some((c) => Math.abs(c.lat) < 18 && ['malay', 'siamese', 'viet', 'indian', 'swahili', 'pacific'].includes(c.culture))) biome = 'jungle';
	else if (cities.some((c) => ['han', 'japanese', 'korean', 'viet'].includes(c.culture))) biome = 'paddy';
	const names: Record<Biome, string> = {
		sea: 'Open sea',
		river: 'Down the river',
		desert: 'Desert crossing',
		mountain: 'High passes',
		jungle: 'Through the jungle',
		steppe: 'Across the steppe',
		taiga: 'Siberian taiga',
		paddy: 'Rice terraces and villages',
		fields: 'Country roads',
		sky: 'Above the clouds'
	};
	let weather: Weather = 'clear';
	if (s.id === 'typhoon') weather = 'storm';
	else if (s.id === 'monsoon') weather = 'rain';
	else if (s.id === 'winter' || ((biome === 'taiga' || biome === 'mountain') && season === 'Winter')) weather = 'snow';
	else if (season === 'Spring' && ['paddy', 'fields', 'river'].includes(biome)) weather = 'blossom';
	else if (season === 'Autumn' && ['paddy', 'fields', 'taiga', 'mountain'].includes(biome)) weather = 'leaves';
	else if (season === 'Summer' && biome === 'jungle') weather = 'rain';
	return { vehicle, vehicleName: name, biome, biomeName: names[biome], weather, season };
}
