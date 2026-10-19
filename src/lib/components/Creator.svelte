<script lang="ts">
	import { GOAL, GOALS } from '#lib/data/goals';
	import { SKILL, START_SKILLS, type SkillId } from '#lib/data/skills';
	import { VOICES, VOICE_POINTS, baseVoices, type VoiceId } from '#lib/data/voices';
	import Portrait from './Portrait.svelte';
	import Swipeable from './Swipeable.svelte';
	import { Rng, randomSeed } from '#lib/rng';
	import { CULTURES, CULTURE_IDS, makeName, type CultureId } from '#lib/data/cultures';
	import { PERK, PROFESSIONS, TRAITS, type Perk } from '#lib/data/traits';
	import { cityName } from '#lib/data/world';
	import { homesFor, randomHero } from '#lib/game/engine';
	import { isUnlocked, loadChronicle } from '#lib/game/chronicle';
	import { CULTURE_FAITH, FAITHS, FAITH_IDS, IDEALS, IDEAL_IDS } from '#lib/data/faiths';
	import { THEMES, themeStyle } from '#lib/data/themes';
	import { t } from '#lib/i18n.svelte';
	import type { Hero } from '#lib/game/types';

	import { DIFFICULTIES, HARDSHIPS, DIFFICULTY, HARDSHIP, PERK_TILT, runStars, scoreMult } from '#lib/data/difficulty';

	import { CAMPAIGNS } from '#lib/content/index';

	let { onstart }: { onstart: (hero: Hero, seed: string, year: number, difficulty: string, hardship: string, campaign?: string) => void } = $props();
	let campaign = $state<string>('');
	function pickCampaign(id: string) {
		campaign = id;
		const c = CAMPAIGNS.find((x) => x.id === id);
		if (c && (year < c.years[0] || year > c.years[1])) year = c.years[0];
	}
	let difficulty = $state('courier');
	let hardship = $state('none');

	const dice = new Rng(Date.now());
	const chronicle = loadChronicle();
	const open = (id: string) => isUnlocked(id, chronicle);
	let seed = $state(randomSeed());
	let year = $state(dice.int(1500, 1900));
	let hero = $state<Hero>(randomHero(dice, 1700, {}, open));
	let step = $state<'profile' | 'traits' | 'review'>('profile');
	const stars = $derived(runStars(difficulty, hardship, [hero.profession, ...hero.traits]));
	const mult = $derived(scoreMult(difficulty, hardship, [hero.profession, ...hero.traits]));

	const homes = $derived(homesFor(hero.culture, year));
	$effect(() => {
		if (!homes.some((h) => h.id === hero.home) && homes.length) hero.home = homes[0].id;
	});

	function rollAll() {
		year = dice.int(1500, 1900);
		hero = randomHero(dice, year, {}, open);
		seed = randomSeed();
	}
	function rollName() {
		hero.name = makeName(dice, CULTURES[hero.culture], hero.gender);
	}
	function setCulture(c: CultureId) {
		hero.culture = c;
		hero.faith = CULTURE_FAITH[c];
		rollName();
	}

	// ---- trait deck (tinder) ----
	let deck = $state<Perk[]>([]);
	let picked = $state<string[]>([]);
	function startTraits() {
		const pool = TRAITS.filter((t) => open(t.id) && !t.flaw);
		// freshly unlocked traits always show up in the deck; a few flaws are mixed in
		const special = pool.filter((t) => t.unlock);
		const flaws = dice.sample(TRAITS.filter((t) => t.flaw), 4);
		deck = dice.shuffle([...[...special, ...dice.shuffle(pool.filter((t) => !t.unlock))].slice(0, 9), ...flaws]);
		picked = [];
		step = 'traits';
	}
	const virtues = $derived(picked.filter((id) => !PERK[id].flaw).length);
	const flawCount = $derived(picked.filter((id) => PERK[id].flaw).length);
	function swipe(s: 'left' | 'right') {
		const t = deck[0];
		if (s === 'right' && (t.flaw ? flawCount < 2 : virtues < 3)) {
			picked = [...picked, t.id];
			// a trait and its opposite cannot both be yours
			if (t.opposite) deck = deck.filter((x) => x.id !== t.opposite);
		}
		deck = deck.slice(1);
		if ((virtues >= 3 && !deck.some((x) => x.flaw && flawCount < 2)) || deck.length === 0) finishTraits();
	}
	function finishTraits() {
		if (picked.length === 0) picked = dice.sample(TRAITS.filter((t) => open(t.id) && !t.flaw), 2).map((t) => t.id);
		hero.traits = picked;
		step = 'review';
	}
	function quickRandomTraits() {
		const good = dice.sample(TRAITS.filter((t) => open(t.id) && !t.flaw), 3).map((t) => t.id);
		const flaw = dice.chance(0.6) ? dice.pick(TRAITS.filter((t) => t.flaw && !good.includes(t.opposite ?? ''))).id : null;
		hero.traits = flaw ? [...good, flaw] : good;
		step = 'review';
	}

	function era(y: number) {
		if (y < 1600) return 'Age of Sails & Swords: Ming, Sengoku, Portuguese carracks';
		if (y < 1700) return 'Age of Companies: Dutch VOC, Mughal splendor, Ming falls';
		if (y < 1800) return 'High Qing: Edo peace, Ayutthaya falls, tea empires';
		if (y < 1860) return 'Age of Opium & Gunboats: steamships arrive';
		return 'Age of Steam & Upheaval: railways, Meiji, Raj';
	}

	let swiper: Swipeable | undefined = $state();

	// inner voices: base from calling + traits, plus a few points to spend
	let bonus = $state<Partial<Record<VoiceId, number>>>({});
	const base = $derived(baseVoices(hero.profession, hero.traits));
	const voices = $derived(Object.fromEntries(VOICES.map((v) => [v.id, Math.min(6, base[v.id] + (bonus[v.id] ?? 0))])) as Record<VoiceId, number>);
	const spent = $derived(Object.values(bonus).reduce((a, b) => a + (b ?? 0), 0));
</script>

<div class="creator themed" style={themeStyle(hero.culture)}>
	{#if step === 'profile'}
		<header>
			<h2>{t('Who sets out?')}</h2>
			<p class="muted">{t('Craft your traveller, or let the dice decide.')}</p>
		</header>

		<div class="profile">
			<div class="pic">
				<Portrait culture={hero.culture} gender={hero.gender} seed={hero.seed} {year} size={170} />
				<button class="mini" onclick={() => (hero.seed = dice.int(1, 1e9))}>↻ {t('new face')}</button>
			</div>

			<div class="fields">
				<label>
					<span>{t('Name')}</span>
					<div class="row">
						<input bind:value={hero.name} maxlength="32" />
						<button class="mini" onclick={rollName} title="Random name">⚄</button>
					</div>
				</label>
				<div class="row two">
					<label>
						<span>{t('Age')}</span>
						<input type="number" min="14" max="80" bind:value={hero.age} />
					</label>
					<div class="label">
						<span>{t('Gender')}</span>
						<div class="seg">
							<button class:on={hero.gender === 'f'} onclick={() => ((hero.gender = 'f'), rollName())}>{t('Woman')}</button>
							<button class:on={hero.gender === 'm'} onclick={() => ((hero.gender = 'm'), rollName())}>{t('Man')}</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="label">
			<span>{t('Year')}: <b>{year}</b></span>
			<input type="range" min="1500" max="1900" bind:value={year} />
			<small class="muted">{era(year)}</small>
		</div>

		<div class="label">
			<span>{t('Origin')}</span>
			<div class="chips">
				{#each CULTURE_IDS as c}
					<button class="chip" class:on={hero.culture === c} onclick={() => setCulture(c)}>{CULTURES[c].label}</button>
				{/each}
			</div>
		</div>

		<p class="artstyle">{t('Art style:')} <b>{THEMES[hero.culture].name}</b></p>
		<label>
			<span>{t('Home city')}</span>
			<select bind:value={hero.home}>
				{#each homes as h}<option value={h.id}>{cityName(h, year)}</option>{/each}
			</select>
		</label>

		<div class="label">
			<span>{t('Calling')}</span>
			<div class="profs">
				{#each PROFESSIONS as p}
					{@const ok = open(p.id)}
					<button class="prof" class:on={hero.profession === p.id} class:locked={!ok} disabled={!ok} title={ok ? p.pro : 'Locked: ' + p.unlock} onclick={() => (hero.profession = p.id)}>
						<b class="g">{ok ? p.glyph : '？'}</b>
						<span>{ok ? p.name : 'Locked'}{#if !ok}<small>{p.unlock}</small>{/if}</span>
					</button>
				{/each}
			</div>
			<small class="muted">{PERK[hero.profession].pro}{PERK[hero.profession].con ? ' · ' + PERK[hero.profession].con : ''}</small>
			<small class="muted skillline">Starts with: {Object.entries(START_SKILLS[hero.profession] ?? {}).map(([k, v]) => `${SKILL[k as SkillId].name} ${v}`).join(' · ')}</small>
		</div>

		<div class="label">
			<span>{t('Life goal')}</span>
			<div class="chips">
				{#each GOALS as gl}
					<button class="chip" class:on={hero.goal === gl.id} onclick={() => (hero.goal = gl.id)} title={gl.desc}><b class="cjk">{gl.glyph}</b> {gl.name}</button>
				{/each}
			</div>
			<small class="muted">{GOAL[hero.goal ?? '']?.desc ?? 'What do you want from life, beyond the commission? Fulfil it for a great reward, and a better ending.'}</small>
		</div>

		<div class="label">
			<span>{t('Faith')}</span>
			<div class="chips">
				{#each FAITH_IDS.filter((f) => !FAITHS[f].from || year >= FAITHS[f].from!) as f}
					<button class="chip" class:on={hero.faith === f} onclick={() => (hero.faith = f)}>{FAITHS[f].glyph} {FAITHS[f].name}</button>
				{/each}
			</div>
			<small class="muted">{FAITHS[hero.faith as keyof typeof FAITHS]?.blurb} Holy places: {FAITHS[hero.faith as keyof typeof FAITHS]?.holy.length ? 'pilgrimage pays off' : 'none, and no one to pray for you'}.</small>
		</div>

		<div class="label">
			<span>{t('Guiding ideal')}</span>
			<div class="chips">
				{#each IDEAL_IDS as i}
					<button class="chip" class:on={hero.ideal === i} onclick={() => (hero.ideal = i)}><b class="cjk">{IDEALS[i].glyph}</b> {IDEALS[i].name}</button>
				{/each}
			</div>
			<small class="muted">{IDEALS[hero.ideal as keyof typeof IDEALS]?.blurb} Living by it keeps your conscience (and vigor) steady; betraying it costs sleep.</small>
		</div>

		<div class="actions">
			<button class="ghost" onclick={rollAll}>⚄ {t('Randomize all')}</button>
			<button class="primary" onclick={startTraits}>{t('Choose traits')}</button>
		</div>
	{:else if step === 'traits'}
		<header>
			<h2>{t('Swipe for your nature')}</h2>
			<p class="muted">{t('Right to embrace a trait, left to pass. Pick up to 3.')} ({virtues}/3) · flaws {flawCount}/2: they make the road harder and the score bigger.</p>
		</header>
		<div class="tdeck">
			{#if deck[1]}
				<div class="tcard under"></div>
			{/if}
			{#key deck[0]?.id}
				{#if deck[0]}
					{@const t = deck[0]}
					<Swipeable bind:this={swiper} onswipe={swipe} leftLabel="Pass" rightLabel="Embrace">
						<div class="tcard">
							{#if t.unlock}<span class="new">Unlocked</span>{/if}
							{#if t.flaw}<span class="new flaw">Flaw</span>{/if}
							<div class="tglyph">{t.glyph}</div>
							<h3>{t.name}</h3>
							<p class="bio">“{t.bio}”</p>
							{#if PERK_TILT[t.id]}<em class="tilt" class:hard={PERK_TILT[t.id] > 0}>{PERK_TILT[t.id] > 0 ? 'makes the run harder' : 'makes the run easier'}</em>{/if}
							<p class="pro">✦ {t.pro}</p>
							{#if t.con}<p class="con">✕ {t.con}</p>{/if}
							{#if t.likedBy?.length || t.dislikedBy?.length}
								<p class="rap">{#if t.likedBy?.length}♥ {t.likedBy.join(', ')}{/if}{#if t.likedBy?.length && t.dislikedBy?.length} · {/if}{#if t.dislikedBy?.length}<span class="neg">✕ {t.dislikedBy.join(', ')}</span>{/if}</p>
							{/if}
						</div>
					</Swipeable>
				{/if}
			{/key}
		</div>
		<div class="picked">
			{#each picked as id}<span class="badge" class:flaw={PERK[id].flaw}><b>{PERK[id].glyph}</b>{PERK[id].name}</span>{/each}
		</div>
		<div class="actions">
			<button class="round no" onclick={() => swiper?.fling('left')} aria-label="Pass">✕</button>
			<button class="ghost" onclick={quickRandomTraits}>⚄ {t('Random traits')}</button>
			<button class="round yes" onclick={() => swiper?.fling('right')} aria-label="Embrace">♥</button>
		</div>
		{#if picked.length}
			<button class="link" onclick={finishTraits}>Done with {picked.length}</button>
		{/if}
	{:else}
		<header>
			<h2>{t('Your profile')}</h2>
			<p class="muted">{t('The world will soon swipe on you.')}</p>
		</header>
		<article class="bumble">
			<div class="top">
				<Portrait culture={hero.culture} gender={hero.gender} seed={hero.seed} {year} size={200} />
			</div>
			<div class="body">
				<h3>{hero.name}, {hero.age}</h3>
				<p class="muted">{FAITHS[hero.faith as keyof typeof FAITHS]?.glyph} {FAITHS[hero.faith as keyof typeof FAITHS]?.name} · {IDEALS[hero.ideal as keyof typeof IDEALS]?.glyph} {IDEALS[hero.ideal as keyof typeof IDEALS]?.name}</p>
				<p class="muted">{PERK[hero.profession].name} · from {cityName(homes.find((h) => h.id === hero.home) ?? homes[0], year)}, {CULTURES[hero.culture].label} · {year}</p>
				<div class="prompt">
					<small>{t('My motto')}</small>
					<input class="motto" bind:value={hero.motto} maxlength="80" />
				</div>
				<div class="prompt">
					<small>{t('About me')}</small>
					<ul>
						{#each [hero.profession, ...hero.traits] as id}
							<li><b class="g">{PERK[id].glyph}</b> <span><strong>{PERK[id].name}</strong>{#if PERK_TILT[id]}<em class="tilt" class:hard={PERK_TILT[id] > 0}>{PERK_TILT[id] > 0 ? 'harder' : 'easier'}</em>{/if} · {PERK[id].bio}</span></li>
						{/each}
					</ul>
				</div>
				<div class="prompt">
					<small>{t('Story')}</small>
					<div class="stories">
						<button class="story" class:on={!campaign} onclick={() => (campaign = '')}><b>🎲 {t('Random commission')}</b><span>A procedurally chosen errand across the world.</span></button>
						{#each CAMPAIGNS as c}
							<button class="story" class:on={campaign === c.id} onclick={() => pickCampaign(c.id)}>
								<b>📜 {t(c.title)}</b>
								<span>{c.years[0]}{c.years[1] !== c.years[0] ? `–${c.years[1]}` : ''} · {t(c.blurb)}</span>
							</button>
						{/each}
					</div>
					{#if campaign}<p class="hint-text">The year is set to fit the story. You start where the story starts.</p>{/if}
				</div>
				<div class="prompt">
					<small>{t('Difficulty')}</small>
					<div class="diffs">
						{#each DIFFICULTIES as d}
							<button class="diff" class:on={difficulty === d.id} onclick={() => (difficulty = d.id)}>
								<b class="g">{d.glyph}</b><span>{d.name}</span>
							</button>
						{/each}
					</div>
					<p class="hint-text">{DIFFICULTY[difficulty].blurb}</p>
				</div>
				<div class="prompt">
					<small>{t('Starting hardship')}</small>
					<div class="chips">
						{#each HARDSHIPS as h}
							<button class="chip" class:on={hardship === h.id} onclick={() => (hardship = h.id)}>{h.glyph} {h.name}</button>
						{/each}
					</div>
					<p class="hint-text">{HARDSHIP[hardship].blurb}</p>
				</div>
				<div class="voices">
					<span class="vh">Inner voices <small>· {VOICE_POINTS - spent} points left</small></span>
					{#each VOICES as v}
						{@const lv = voices[v.id]}
						<div class="vrow" title="{v.desc} (like {v.echo})">
							<span class="vg">{v.glyph}</span>
							<span class="vn">{v.name}</span>
							<span class="vpips">{#each { length: 6 } as _, i}<i class:on={i < lv} class:bought={i >= base[v.id] && i < lv}></i>{/each}</span>
							<button class="vb" aria-label="Lower {v.name}" disabled={(bonus[v.id] ?? 0) <= 0} onclick={() => (bonus = { ...bonus, [v.id]: (bonus[v.id] ?? 0) - 1 })}>−</button>
							<button class="vb" aria-label="Raise {v.name}" disabled={spent >= VOICE_POINTS || lv >= 6} onclick={() => (bonus = { ...bonus, [v.id]: (bonus[v.id] ?? 0) + 1 })}>+</button>
						</div>
					{/each}
				</div>
				<div class="verdict">
					<span class="stars" title="Run difficulty">{'★'.repeat(stars)}<i>{'★'.repeat(Math.max(0, 8 - stars))}</i></span>
					<span>Score ×{mult}</span>
				</div>
				<div class="row two">
					<label><span>{t('World seed')}</span><input bind:value={seed} /></label>
				</div>
			</div>
		</article>
		<div class="actions">
			<button class="ghost" onclick={() => (step = 'profile')}>← {t('Edit')}</button>
			<button class="ghost" onclick={startTraits}>{t('Re-swipe traits')}</button>
			<button class="primary" onclick={() => onstart({ ...$state.snapshot(hero), voices }, seed, year, difficulty, hardship, campaign || undefined)}>{t('Set out')} ⛵</button>
		</div>
	{/if}
</div>

<style>
	.skillline {
		display: block;
		margin-top: 2px;
		color: var(--jade);
	}
	.voices {
		display: grid;
		gap: 3px;
		margin: 12px 0;
	}
	.vh {
		font-family: var(--display);
		font-size: 1rem;
	}
	.vh small {
		color: var(--muted);
		font-family: inherit;
		font-size: 0.8rem;
	}
	.vrow {
		display: grid;
		grid-template-columns: 1.4rem 1fr auto 1.6rem 1.6rem;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
	}
	.vg {
		font-family: var(--cjk);
		color: var(--gold-text);
		font-weight: 700;
	}
	.vpips i {
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-left: 2px;
		border-radius: 50%;
		border: 1px solid var(--ink);
		opacity: 0.4;
	}
	.vpips i.on {
		background: var(--ink);
		opacity: 1;
	}
	.vpips i.bought {
		background: var(--vermilion);
		border-color: var(--vermilion);
	}
	.vb {
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	.vb:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.new.flaw {
		background: var(--ink);
		color: var(--paper);
	}
	.badge.flaw {
		border-style: dashed;
	}
	.rap {
		font-size: 0.78rem;
		color: var(--jade);
		margin: 4px 0 0;
	}
	.rap .neg {
		color: var(--vermilion);
	}
	.creator {
		max-width: 560px;
		margin: 0 auto;
		padding: 8px 16px 40px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	header h2 {
		margin: 0;
		font-family: var(--display);
		font-size: 1.8rem;
	}
	header p {
		margin: 2px 0 0;
	}
	.muted {
		color: var(--muted);
	}
	.profile {
		display: flex;
		gap: 18px;
		align-items: center;
		flex-wrap: wrap;
	}
	.pic {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.fields {
		flex: 1;
		min-width: 220px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	label,
	.label {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	label > span,
	.label > span {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.row.two > * {
		flex: 1;
	}
	input,
	select {
		font: inherit;
		font-size: 1rem;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--paper-2);
		color: var(--ink);
		width: 100%;
		min-width: 0;
	}
	input[type='range'] {
		padding: 0;
		accent-color: var(--vermilion);
	}
	.seg {
		display: flex;
		border: 1px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
	}
	.seg button {
		flex: 1;
		font: inherit;
		padding: 8px;
		border: 0;
		background: var(--paper-2);
		color: var(--ink);
		cursor: pointer;
	}
	.seg button.on {
		background: var(--ink);
		color: var(--paper);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		font: inherit;
		font-size: 0.88rem;
		padding: 5px 11px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--paper-2);
		color: var(--ink);
		cursor: pointer;
	}
	.chip.on {
		background: var(--vermilion);
		color: #fff;
		border-color: var(--vermilion);
	}
	.profs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 6px;
	}
	.prof {
		display: flex;
		align-items: center;
		gap: 8px;
		font: inherit;
		font-size: 0.9rem;
		padding: 6px 10px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--paper-2);
		color: var(--ink);
		cursor: pointer;
		text-align: left;
	}
	.prof.locked {
		opacity: 0.55;
		cursor: not-allowed;
		border-style: dashed;
	}
	.prof span {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.prof small {
		font-size: 0.7rem;
		color: var(--muted);
	}
	.new {
		align-self: flex-end;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold-text);
		border: 1px solid var(--gold);
		border-radius: var(--radius-sm, 4px);
		padding: 1px 8px;
		margin-bottom: -18px;
	}
	.prof.on {
		border-color: var(--ink);
		box-shadow: inset 0 0 0 1px var(--ink);
		background: var(--card);
	}
	.g {
		font-family: var(--cjk);
		font-size: 1.2rem;
		color: var(--vermilion);
	}
	.actions {
		display: flex;
		gap: 10px;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}
	.mini {
		font: inherit;
		font-size: 0.8rem;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--paper-2);
		color: var(--ink);
		cursor: pointer;
		white-space: nowrap;
	}
	.tdeck {
		position: relative;
		width: min(320px, 86vw);
		height: 380px;
		margin: 0 auto;
	}
	.tdeck > :global(.sw),
	.tcard.under {
		position: absolute;
		inset: 0;
	}
	.tcard {
		height: 100%;
		box-sizing: border-box;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 16px;
		box-shadow: 0 12px 30px var(--shadow);
		padding: 28px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 6px;
		background-image: radial-gradient(circle at 50% 25%, var(--card-glow), transparent 70%);
	}
	.tcard.under {
		transform: rotate(3deg) translateY(6px);
		background: var(--card-back);
	}
	.tglyph {
		font-family: var(--cjk);
		font-size: 4.6rem;
		font-weight: 700;
		line-height: 1.1;
		color: var(--vermilion);
	}
	.tcard h3 {
		margin: 4px 0 0;
		font-family: var(--display);
		font-size: 1.6rem;
	}
	.bio {
		font-style: italic;
		font-size: 1.05rem;
		margin: 6px 0 10px;
	}
	.pro {
		color: var(--jade);
		margin: 0;
		font-size: 0.92rem;
	}
	.con {
		color: var(--vermilion);
		margin: 0;
		font-size: 0.92rem;
	}
	.picked {
		display: flex;
		justify-content: center;
		gap: 6px;
		flex-wrap: wrap;
		min-height: 30px;
	}
	.badge {
		display: inline-flex;
		gap: 5px;
		align-items: center;
		padding: 3px 10px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-size: 0.85rem;
	}
	.badge b {
		font-family: var(--cjk);
		color: var(--gold-text);
	}
	.round {
		width: 58px;
		height: 58px;
		border-radius: 50%;
		font-size: 1.5rem;
		cursor: pointer;
		border: 2px solid;
		background: var(--card);
		box-shadow: 0 4px 12px var(--shadow);
	}
	.round.no {
		color: var(--muted);
		border-color: var(--muted);
	}
	.round.yes {
		color: var(--vermilion);
		border-color: var(--vermilion);
	}
	.link {
		align-self: center;
		font: inherit;
		background: none;
		border: 0;
		color: var(--vermilion);
		text-decoration: underline;
		cursor: pointer;
	}
	.bumble {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 18px;
		overflow: hidden;
		box-shadow: 0 12px 30px var(--shadow);
	}
	.bumble .top {
		display: grid;
		place-items: center;
		padding: 20px;
		background: linear-gradient(160deg, var(--seal-2), var(--seal-4));
	}
	.bumble .body {
		padding: 16px 20px 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.bumble h3 {
		margin: 0;
		font-family: var(--display);
		font-size: 1.8rem;
	}
	.bumble p {
		margin: 0;
	}
	.prompt {
		background: var(--paper-2);
		border-radius: 10px;
		padding: 10px 12px;
	}
	.prompt small {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.7rem;
		color: var(--muted);
	}
	.prompt ul {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.prompt li {
		display: flex;
		gap: 8px;
		align-items: baseline;
		font-size: 0.93rem;
	}
	.stories {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 6px;
	}
	.story {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font: inherit;
		text-align: left;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--card);
		color: var(--ink);
		cursor: pointer;
	}
	.story span {
		font-size: 0.8rem;
		color: var(--muted);
	}
	.story.on {
		border-color: var(--vermilion);
		box-shadow: inset 3px 0 0 var(--vermilion);
	}
	.diffs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
		margin-top: 6px;
	}
	.diff {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		font: inherit;
		font-size: 0.82rem;
		padding: 6px 4px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--card);
		color: var(--ink);
		cursor: pointer;
	}
	.diff.on {
		border-color: var(--vermilion);
		box-shadow: inset 0 0 0 1px var(--vermilion);
	}
	.prompt .chips {
		margin-top: 6px;
	}
	.hint-text {
		margin: 6px 0 0;
		font-size: 0.85rem;
		font-style: italic;
		color: var(--muted);
	}
	.verdict {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.95rem;
	}
	.stars {
		color: var(--vermilion);
		letter-spacing: 2px;
	}
	.stars i {
		color: var(--line);
		font-style: normal;
	}
	.tilt {
		font-style: normal;
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--jade);
		border: 1px solid currentColor;
		border-radius: 999px;
		padding: 0 6px;
		margin-left: 6px;
	}
	.tilt.hard {
		color: var(--vermilion);
	}
	.artstyle {
		margin: -6px 0 0;
		font-size: 0.8rem;
		color: var(--vermilion);
		letter-spacing: 0.05em;
	}
	.cjk {
		font-family: var(--cjk);
	}
	.motto {
		border: 0;
		background: transparent;
		padding: 2px 0;
		font-style: italic;
		font-size: 1.05rem;
	}
</style>
