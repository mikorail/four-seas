// Tiny Web Audio synth: no asset files. Pentatonic plucks, a gong, coins, sea wash.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let waves: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // C D E G A C D

export function soundEnabled() {
	return enabled;
}

export function setSound(on: boolean) {
	enabled = on;
	try {
		localStorage.setItem('four-seas:sound', on ? '1' : '0');
	} catch {}
	if (!on) stopWaves();
	else ensure();
}

export function initSound() {
	try {
		enabled = localStorage.getItem('four-seas:sound') === '1';
	} catch {}
	return enabled;
}

function ensure(): AudioContext | null {
	if (!enabled) return null;
	if (!ctx) {
		const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
		master = ctx.createGain();
		master.gain.value = 0.35;
		master.connect(ctx.destination);
	}
	if (ctx.state === 'suspended') ctx.resume();
	return ctx;
}

function pluckAt(freq: number, when = 0, dur = 0.9, vol = 0.5) {
	const c = ensure();
	if (!c || !master) return;
	const t = c.currentTime + when;
	const o = c.createOscillator();
	const o2 = c.createOscillator();
	const g = c.createGain();
	const f = c.createBiquadFilter();
	o.type = 'triangle';
	o2.type = 'sine';
	o.frequency.value = freq;
	o2.frequency.value = freq * 2.01;
	f.type = 'lowpass';
	f.frequency.setValueAtTime(freq * 6, t);
	f.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
	g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
	o.connect(f);
	o2.connect(f);
	f.connect(g);
	g.connect(master);
	o.start(t);
	o2.start(t);
	o.stop(t + dur);
	o2.stop(t + dur);
}

export function pluck() {
	pluckAt(PENTA[Math.floor(Math.random() * PENTA.length)] / 2, 0, 1.1, 0.35);
}

export function swipe(side: 'left' | 'right' | 'up') {
	const c = ensure();
	if (!c || !master) return;
	const t = c.currentTime;
	const len = 0.18;
	const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
	const src = c.createBufferSource();
	src.buffer = buf;
	const f = c.createBiquadFilter();
	f.type = 'bandpass';
	f.frequency.setValueAtTime(side === 'left' ? 900 : side === 'right' ? 1800 : 2600, t);
	f.frequency.exponentialRampToValueAtTime(side === 'left' ? 400 : 3200, t + len);
	const g = c.createGain();
	g.gain.value = 0.25;
	src.connect(f);
	f.connect(g);
	g.connect(master);
	src.start(t);
	if (side === 'up') [0, 0.08, 0.16].forEach((w, i) => pluckAt(PENTA[i + 3], w, 0.6, 0.25));
}

export function coin(n = 2) {
	for (let i = 0; i < Math.min(5, n); i++) pluckAt(1568 + Math.random() * 300, i * 0.06, 0.25, 0.18);
}

export function chord(good: boolean) {
	const notes = good ? [0, 2, 4] : [0, 1, 3];
	notes.forEach((n, i) => pluckAt(PENTA[n] / (good ? 1 : 2), i * 0.07, 1.4, 0.3));
}

export function gong() {
	const c = ensure();
	if (!c || !master) return;
	const t = c.currentTime;
	[73, 110, 146.8, 196, 293].forEach((f, i) => {
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = 'sine';
		o.frequency.setValueAtTime(f * 1.02, t);
		o.frequency.exponentialRampToValueAtTime(f, t + 2);
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.3 / (i + 1), t + 0.02);
		g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
		o.connect(g);
		g.connect(master!);
		o.start(t);
		o.stop(t + 5);
	});
}

export function startWaves() {
	const c = ensure();
	if (!c || !master || waves) return;
	const len = 4;
	const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
	const d = buf.getChannelData(0);
	let last = 0;
	for (let i = 0; i < d.length; i++) {
		last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; // brown-ish noise
		const swell = 0.55 + 0.45 * Math.sin((i / d.length) * Math.PI * 2);
		d[i] = last * 6 * swell;
	}
	const src = c.createBufferSource();
	src.buffer = buf;
	src.loop = true;
	const f = c.createBiquadFilter();
	f.type = 'lowpass';
	f.frequency.value = 700;
	const gain = c.createGain();
	gain.gain.setValueAtTime(0.0001, c.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 1.5);
	src.connect(f);
	f.connect(gain);
	gain.connect(master);
	src.start();
	waves = { src, gain };
}

export function stopWaves() {
	if (!waves || !ctx) return;
	const w = waves;
	waves = null;
	w.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
	w.src.stop(ctx.currentTime + 1.1);
}

/** A shimmering rising arpeggio: something rare, a thought settling, a secret found. */
export function shimmer() {
	[0, 2, 4, 5, 7].forEach((n, i) => pluckAt((PENTA[n % PENTA.length] ?? 440) * (n >= PENTA.length ? 2 : 1), i * 0.09, 1.6, 0.22));
}
/** A low, slow rumble: disaster, death, the world shaking. */
export function rumble() {
	const c = ensure();
	if (!c || !master) return;
	const t = c.currentTime;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = 'triangle';
	o.frequency.setValueAtTime(55, t);
	o.frequency.exponentialRampToValueAtTime(38, t + 1.8);
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(0.35, t + 0.15);
	g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
	o.connect(g).connect(master);
	o.start(t);
	o.stop(t + 2.3);
}

/** Pick a sound for the notes of an outcome (rare finds, disasters, deaths, thoughts, love, secrets). */
export function forNotes(notes: string[]) {
	const all = notes.join(' ');
	if (/🌋|🌊|🔥|🌪|⛰|🕯|⚡ On the brink/.test(all)) rumble();
	else if (/✦ Rare|💡 Thought|🗝|🏅 Seasoned|💭/.test(all)) shimmer();
	else if (/💗|💒|💍|🤝/.test(all)) chord(true);
}

export function buzz(ms = 12) {
	try {
		navigator.vibrate?.(ms);
	} catch {}
}

// ===================== Generative music per culture =====================
import type { CultureId } from '#lib/data/cultures';

type Voice = 'pluck' | 'koto' | 'bell' | 'wood' | 'sitar' | 'oud' | 'bowed' | 'bowl' | 'harpsichord' | 'slack';
interface Style {
	scale: number[]; // semitone offsets (may be fractional for non-12-TET tunings)
	root: number; // Hz
	voice: Voice;
	tempo: number; // seconds per beat
	drone?: boolean;
	drum?: 'frame' | 'gong' | 'ipu' | 'none';
	density: number; // chance of a note per beat
}

const TET7 = [0, 1.71, 3.43, 5.14, 6.86, 8.57, 10.29]; // Thai seven-tone equal temperament
const SLENDRO = [0, 2.4, 4.8, 7.2, 9.6]; // ~5-tone equal

const STYLES: Record<CultureId, Style> = {
	han: { scale: [0, 2, 4, 7, 9], root: 220, voice: 'pluck', tempo: 0.55, density: 0.55, drum: 'none' }, // guzheng, gong-shang-jue-zhi-yu
	korean: { scale: [0, 2, 5, 7, 9], root: 196, voice: 'pluck', tempo: 0.7, density: 0.5, drum: 'none' }, // gayageum
	viet: { scale: [0, 2, 5, 7, 10], root: 233, voice: 'pluck', tempo: 0.6, density: 0.5 }, // đàn tranh
	japanese: { scale: [0, 2, 3, 7, 8], root: 220, voice: 'koto', tempo: 0.75, density: 0.45 }, // hirajoshi
	siamese: { scale: TET7, root: 262, voice: 'wood', tempo: 0.32, density: 0.7, drum: 'gong' }, // ranat ek
	malay: { scale: SLENDRO, root: 196, voice: 'bell', tempo: 0.42, density: 0.65, drum: 'gong' }, // gamelan
	indian: { scale: [0, 2, 4, 6, 7, 9, 11], root: 196, voice: 'sitar', tempo: 0.45, density: 0.6, drone: true }, // Yaman over tanpura
	tibetan: { scale: [0, 3, 5, 7, 10], root: 147, voice: 'bowl', tempo: 1.6, density: 0.4, drone: true },
	steppe: { scale: [0, 2, 5, 7, 9], root: 165, voice: 'bowed', tempo: 0.9, density: 0.5, drone: true }, // morin khuur
	persian: { scale: [0, 1, 4, 5, 7, 8, 10], root: 196, voice: 'oud', tempo: 0.38, density: 0.6, drum: 'frame' }, // Hijaz
	ottoman: { scale: [0, 1, 4, 5, 7, 8, 11], root: 220, voice: 'oud', tempo: 0.36, density: 0.6, drum: 'frame' },
	swahili: { scale: [0, 2, 4, 5, 7, 9, 10], root: 220, voice: 'oud', tempo: 0.34, density: 0.55, drum: 'frame' }, // taarab
	european: { scale: [0, 2, 3, 5, 7, 8, 10], root: 220, voice: 'harpsichord', tempo: 0.3, density: 0.8 }, // minor, Baroque-ish
	pacific: { scale: [0, 2, 4, 7, 9], root: 247, voice: 'slack', tempo: 0.4, density: 0.55, drum: 'ipu' }
};

let music: { culture: CultureId; timer: ReturnType<typeof setInterval>; gain: GainNode; drone?: OscillatorNode[]; step: number; deg: number } | null = null;
let musicOn = false;

export function musicEnabled() {
	return musicOn;
}
export function initMusic() {
	try {
		musicOn = localStorage.getItem('four-seas:music') === '1';
	} catch {}
	return musicOn;
}
export function setMusic(on: boolean, culture?: CultureId) {
	musicOn = on;
	try {
		localStorage.setItem('four-seas:music', on ? '1' : '0');
	} catch {}
	if (!on) stopMusic();
	else if (culture) playMusic(culture);
}

function note(c: AudioContext, out: GainNode, voice: Voice, f: number, t: number, len: number) {
	const g = c.createGain();
	g.connect(out);
	const osc = (type: OscillatorType, freq: number, vol: number, dec: number, detune = 0) => {
		const o = c.createOscillator();
		const og = c.createGain();
		o.type = type;
		o.frequency.value = freq;
		o.detune.value = detune;
		og.gain.setValueAtTime(0.0001, t);
		og.gain.exponentialRampToValueAtTime(vol, t + (voice === 'bowed' ? 0.25 : 0.006));
		og.gain.exponentialRampToValueAtTime(0.0001, t + dec);
		o.connect(og);
		og.connect(g);
		o.start(t);
		o.stop(t + dec + 0.05);
		return o;
	};
	switch (voice) {
		case 'pluck': {
			const o = osc('triangle', f, 0.3, len * 2.4);
			o.frequency.setValueAtTime(f * 1.03, t); // the guzheng's little bend into the note
			o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
			osc('sine', f * 2, 0.08, len);
			break;
		}
		case 'koto':
			osc('sawtooth', f, 0.12, len * 1.6);
			osc('sine', f * 3, 0.05, len * 0.6);
			break;
		case 'bell':
			osc('sine', f, 0.28, len * 3);
			osc('sine', f * 2.76, 0.12, len * 1.6); // inharmonic gamelan partials
			osc('sine', f * 5.4, 0.05, len * 0.8);
			break;
		case 'wood':
			osc('sine', f, 0.3, 0.25);
			osc('sine', f * 4, 0.08, 0.06);
			break;
		case 'sitar': {
			const o = osc('sawtooth', f, 0.12, len * 2);
			o.frequency.setValueAtTime(f * 0.97, t); // meend
			o.frequency.linearRampToValueAtTime(f, t + 0.12);
			osc('square', f * 2, 0.02, len); // buzz
			break;
		}
		case 'oud':
			osc('triangle', f, 0.28, len * 1.2);
			osc('sawtooth', f, 0.04, len * 0.5, 6);
			break;
		case 'bowed':
			osc('sawtooth', f, 0.08, len * 2.2, -4);
			osc('sawtooth', f, 0.06, len * 2.2, 5);
			break;
		case 'bowl':
			osc('sine', f, 0.22, 6);
			osc('sine', f * 2.71, 0.08, 4);
			osc('sine', f * 1.003, 0.1, 6); // slow beating
			break;
		case 'harpsichord':
			osc('square', f, 0.07, len * 1.2);
			osc('sawtooth', f * 2, 0.03, len * 0.5);
			break;
		case 'slack':
			osc('triangle', f, 0.26, len * 1.8);
			osc('sine', f * 2.01, 0.07, len);
			break;
	}
}

function drum(c: AudioContext, out: GainNode, kind: Style['drum'], t: number, accent: boolean) {
	if (!kind || kind === 'none') return;
	if (kind === 'gong') {
		if (!accent) return;
		const o = c.createOscillator();
		const g = c.createGain();
		o.frequency.value = 82;
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
		g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
		o.connect(g);
		g.connect(out);
		o.start(t);
		o.stop(t + 3);
		return;
	}
	const len = 0.12;
	const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
	const src = c.createBufferSource();
	src.buffer = buf;
	const f = c.createBiquadFilter();
	f.type = kind === 'ipu' ? 'lowpass' : 'bandpass';
	f.frequency.value = accent ? 180 : 900;
	const g = c.createGain();
	g.gain.value = accent ? 0.5 : 0.18;
	src.connect(f);
	f.connect(g);
	g.connect(out);
	src.start(t);
}

export function playMusic(culture: CultureId) {
	if (!musicOn) return;
	const c = ensureMusicCtx();
	if (!c || !master) return;
	if (music?.culture === culture) return;
	stopMusic();
	const st = STYLES[culture];
	const out = c.createGain();
	out.gain.setValueAtTime(0.0001, c.currentTime);
	out.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 2);
	out.connect(master);
	const drone: OscillatorNode[] = [];
	if (st.drone) {
		for (const [mul, vol] of [[0.5, 0.05], [0.75, 0.03], [1, 0.025]] as const) {
			const o = c.createOscillator();
			const g = c.createGain();
			const lp = c.createBiquadFilter();
			o.type = 'sawtooth';
			o.frequency.value = st.root * mul;
			lp.type = 'lowpass';
			lp.frequency.value = 600;
			g.gain.value = vol;
			o.connect(lp);
			lp.connect(g);
			g.connect(out);
			o.start();
			drone.push(o);
		}
	}
	const m = { culture, gain: out, drone, step: 0, deg: 0, timer: 0 as unknown as ReturnType<typeof setInterval> };
	m.timer = setInterval(() => {
		const now = c.currentTime + 0.05;
		m.step++;
		const accent = m.step % 8 === 0;
		drum(c, out, st.drum, now, accent);
		if (Math.random() > st.density) return;
		// melodic random walk across two octaves, phrases resolve to the root
		m.deg += Math.random() < 0.5 ? -1 : 1;
		if (Math.random() < 0.15) m.deg += Math.random() < 0.5 ? -2 : 2;
		m.deg = Math.max(-2, Math.min(st.scale.length * 2 - 1, m.deg));
		if (m.step % 16 === 15) m.deg = 0;
		const oct = Math.floor(m.deg / st.scale.length);
		const idx = ((m.deg % st.scale.length) + st.scale.length) % st.scale.length;
		const f = st.root * Math.pow(2, oct + st.scale[idx] / 12);
		note(c, out, st.voice, f, now, st.tempo * 1.8);
	}, st.tempo * 1000);
	music = m;
}

export function stopMusic() {
	if (!music || !ctx) return;
	const m = music;
	music = null;
	clearInterval(m.timer);
	m.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
	setTimeout(() => {
		for (const o of m.drone ?? []) o.stop();
		m.gain.disconnect();
	}, 1700);
}

function ensureMusicCtx() {
	const was = enabled;
	enabled = true; // music has its own switch; borrow the shared audio context
	const c = ensure();
	enabled = was;
	return c;
}
