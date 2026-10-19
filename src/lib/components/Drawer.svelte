<script lang="ts" module>
	export type DrawerTab = 'bag' | 'self' | 'people' | 'world' | 'ledger' | 'journal' | 'retinue' | 'fleet';
</script>

<script lang="ts">
	import Portrait from './Portrait.svelte';
	import BagGrid from './BagGrid.svelte';
	import { BAGS, CREW, ITEMS, MOUNTS, isGood, goodOf } from '#lib/data/items';
	import { FACTIONS, PERK, STATUSES } from '#lib/data/traits';
	import { CITY, cityName, type Good } from '#lib/data/world';
	import { capacity } from '#lib/game/cards/index';
	import { sellPrice } from '#lib/game/economy';
	import { karmaLabel, standingLabel, wages } from '#lib/game/engine';
	import { CULTURES } from '#lib/data/cultures';
	import { VENTURES, tradeRuns, type TradeRun } from '#lib/game/ventures';
	import type { Run } from '#lib/game/types';
	import { FAITHS, IDEALS } from '#lib/data/faiths';
	import RichText from './RichText.svelte';
	import { t } from '#lib/i18n.svelte';
	import { dateOf, localDate, upcoming, westernDate } from '#lib/game/calendar';
	import { faithOfCity } from '#lib/data/faiths';
	import { OUTFITS } from '#lib/data/market';
	import { UPRISINGS } from '#lib/game/cards/rebellion';
	import { VOICES } from '#lib/data/voices';
	import { mindState, voicesOf } from '#lib/game/thoughts';
	import { CABINET_SLOTS, THOUGHT } from '#lib/data/cabinet';
	import { LANG, LEVEL_NAME, langLevel } from '#lib/game/langs';
	import { GENRE_LABEL } from '#lib/game/tales';
	import { SKILLS, levelOf, xpFor } from '#lib/data/skills';
	import { GOAL } from '#lib/data/goals';
	import { COLLECTIONS, STAGE_LABEL, ageOf, lettersInFlight, lifeStage, sendLetter, stash } from '#lib/game/life';
	import { forgetThought, internalize, restorePointsOf, retireIntoGoal } from '#lib/game/engine';
	import { downloadJournalBook } from '#lib/journal-book';
	import { INVENTIONS } from '#lib/data/inventions';
	import { culturalStanding } from '#lib/game/mods';
	import { defaultTraitsForRole, TASK_INFO, type CompanionTask } from '#lib/game/companions';
	import { assignCompanionTask } from '#lib/game/engine';
	import { canStore, guildDiscount, guildRank, guildTitle, guildVolume, retrieve, shipTo, store, warehouseAt, warehouseCapacity, warehouseCities } from '#lib/game/guild';

	let {
		run,
		tab = $bindable('bag'),
		onuse,
		ondrop,
		ondismiss,
		onabandon,
		onclose,
		ondispatch,
		onbank,
		onretire,
		onsettle = onretire,
		onriddle = () => {},
		onrewind = () => {},
		onwear = () => {}
	}: {
		onriddle?: (id: string) => void;
		onrewind?: (i: number) => void;
		onwear?: (id: string | 'none') => void;
		run: Run;
		tab?: DrawerTab;
		ondispatch: (id: string, t: TradeRun) => void;
		onbank: (amount: number) => void;
		onretire: () => void;
		onsettle?: () => void;
		onuse: (id: string) => void;
		ondrop: (id: string) => void;
		ondismiss: (id: string) => void;
		onabandon: () => void;
		onclose: () => void;
	} = $props();

	const cap = $derived(capacity(run));
	const goods = $derived([...new Set(run.bag.filter(isGood).map(goodOf))] as Good[]);
	const markets = $derived(run.visited.slice(-8).reverse());
	const locked = $derived(run.phase === 'end');
	let jq = $state('');
	let letterMsg = $state('');
	let warehouseMsg = $state('');
	// the best price you have seen for each good, from your trader's memory
	const memBest = $derived.by(() => {
		const best: Record<string, { good: string; city: string; price: number; day: number }> = {};
		for (const [k, v] of Object.entries(run.priceMemory ?? {})) {
			const [city, good] = [k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1)];
			if (!best[good] || v.price > best[good].price) best[good] = { good, city, price: v.price, day: v.day };
		}
		return Object.values(best).sort((a, b) => b.price - a.price).slice(0, 10);
	});
	function write(to: { name: string; id?: string; city: string; kind: 'friend' | 'sweetheart' | 'patron' | 'family' | 'rival' }) {
		const l = sendLetter(run, to, '');
		letterMsg = l ? `Letter sent to ${to.name}. A reply may reach you around day ${l.arrives}.` : 'You cannot afford the post.';
	}
	// old names still open the right place
	$effect(() => {
		if (tab === 'retinue') tab = 'people';
		else if (tab === 'fleet') tab = 'world';
	});
	const loc = $derived(CITY[run.location]);
	const fests = $derived(upcoming(run, loc.culture, faithOfCity(loc.id, loc.culture) === 'muslim', 60));
	const cultAff = $derived(culturalStanding(run, loc.culture));
	const activeInventions = $derived(run.inventions ?? []);
	const completedInventions = $derived(run.completedInventions ?? []);
	let companionMsg = $state('');

	function doCompanionTask(cid: string, task: CompanionTask) {
		const res = assignCompanionTask(run, cid, task);
		if (res) {
			companionMsg = res.text;
			setTimeout(() => (companionMsg = ''), 4000);
		}
	}
</script>

<div class="scrim" onclick={onclose} role="presentation"></div>
<aside class="drawer" aria-label="Travel kit">
	<header>
		<h3>{run.hero.name}</h3>
		<button class="x" onclick={onclose} aria-label="Close">✕</button>
	</header>
	<nav class="tabs">
		{#each [['bag', t('Bag')], ['self', t('Self')], ['people', t('People')], ['world', t('World')], ['ledger', t('Tasks')], ['journal', t('Journal')]] as [id, label]}
			<button class:on={tab === id} onclick={() => (tab = id as typeof tab)}>{label}</button>
		{/each}
	</nav>

	{#if tab === 'bag'}
		<section>
			<BagGrid {run} {locked} {onuse} {ondrop} {onriddle} {onwear} />
		</section>
		<section>
			<h4>{t('Outfit')}</h4>
			{#if run.outfit && OUTFITS[run.outfit.id]}
				{@const o = OUTFITS[run.outfit.id]}
				<div class="mount">
					<span class="big">{o.glyph}</span>
					<span class="n">
						<b>{o.id === 'local-dress' ? `${CULTURES[run.outfit.culture].adjective} dress` : o.name}</b>
						<small>{o.desc} <i>{o.access}.</i></small>
					</span>
					{#if !locked}<button class="ghosty" onclick={() => onwear('none')}>Take off</button>{/if}
				</div>
			{:else}
				<p class="muted">Your own travelling clothes. Outfits carried in your luggage can be worn, swapped, or taken off at any time.</p>
			{/if}
		</section>
		<section>
			<h4>{t('Mount')}</h4>
			{#if run.mount}
				{@const m = MOUNTS[run.mount.kind]}
				<div class="mount">
					<span class="big">{m.glyph}</span>
					<span class="n">
						<b>{run.mount.name} the {m.name.toLowerCase()}</b>
						<small>{m.desc} Land travel ×{m.land}, carries its own packs, eats {m.feed} silver per journey.</small>
						<span class="meter"><i style:width="{run.mount.health}%" class:low={run.mount.health < 40}></i></span>
					</span>
				</div>
			{:else}
				<p class="muted">On foot. Beast traders in most cities sell horses, camels, mules, yaks, even elephants.</p>
			{/if}
		</section>
	{:else if tab === 'self'}
		<section>
			<h4>{t('Character')}</h4>
			<div class="traits">
				{#each [run.hero.profession, ...run.hero.traits] as id}<span title={PERK[id].pro}><b>{PERK[id].glyph}</b>{PERK[id].name}</span>{/each}
			</div>
			<p class="small">{FAITHS[run.hero.faith as keyof typeof FAITHS]?.glyph} {FAITHS[run.hero.faith as keyof typeof FAITHS]?.name} · <b class="cjk">{IDEALS[run.hero.ideal as keyof typeof IDEALS]?.glyph}</b> Ideal of {IDEALS[run.hero.ideal as keyof typeof IDEALS]?.name}</p>
			{#if FAITHS[run.hero.faith as keyof typeof FAITHS]?.holy.length}
				<p class="muted small">Holy places: {FAITHS[run.hero.faith as keyof typeof FAITHS].holy.filter((id) => CITY[id]).map((id) => (run.pilgrimages.includes(id) ? '✓ ' : '') + cityName(CITY[id], run.year)).join(' · ')}</p>
			{/if}
			<p class="muted small">“{run.hero.motto}”</p>
		</section>
		{#if (run.statuses ?? []).length}
			<section>
				<h4>⚕️ {t('Conditions & Boons')}</h4>
				<ul class="items">
					{#each run.statuses ?? [] as sid}
						{@const st = STATUSES[sid]}
						{#if st}
							<li>
								<span class="g">{st.glyph}</span>
								<span class="n"><b>{st.name}</b> <small class="muted">({st.type === 'ailment' ? 'Ailment' : 'Boon'})</small><small>{st.desc} · {st.pro ?? ''}</small></span>
							</li>
						{/if}
					{/each}
				</ul>
			</section>
		{/if}
		<section>
			<h4>🌟 {t('Life goal')}</h4>
			{#if run.goal && GOAL[run.goal.id]}
				{@const gl = GOAL[run.goal.id]}
				{@const pr = gl.progress(run)}
				<div class="goal" class:done={run.goal.done !== undefined}>
					<b><span class="cjk">{gl.glyph}</span> {gl.name}</b>
					<small>{gl.desc}</small>
					<span class="meter"><i style:width="{Math.min(100, (pr[0] / pr[1]) * 100)}%"></i></span>
					<small>{run.goal.done !== undefined ? `Fulfilled on day ${run.goal.done}.` : `${Math.min(pr[0], pr[1])} / ${pr[1]}`}</small>
					{#if run.goal.done !== undefined && !locked && (run.phase === 'map' || run.phase === 'city')}
						<button class="mini" style="margin-top:6px;align-self:flex-start" onclick={() => { if (retireIntoGoal(run)) onclose(); }}>🌟 Fulfill life goal & retire</button>
					{/if}
				</div>
			{/if}
		</section>
		<section>
			<h4>⏳ {t('Age')} {ageOf(run)} · <small class="muted">{STAGE_LABEL[lifeStage(run)]}</small></h4>
			{#if run.titles?.length}<p class="small">🏵 Known as: {run.titles.map((x) => `“${x}”`).join(', ')}</p>{/if}
			<ul class="items">
				{#each COLLECTIONS as col}
					{@const n = run.collected?.[col.id]?.length ?? 0}
					<li class:relic={n >= col.need}><span class="g">{col.glyph}</span><span class="n"><b>{col.name} <small class="muted">{Math.min(n, col.need)}/{col.need}</small></b><small>{col.desc} Reward: {col.reward}.</small></span></li>
				{/each}
			</ul>
		</section>
		{#if run.home}
			<section>
				<h4>🏡 {t('Home')} · {cityName(CITY[run.home.city], run.year)}</h4>
				{#if run.home.city === run.location}
					<p class="muted small">Store things here (12 spaces). Resting at home heals more and calms the mind.</p>
					<div class="row" style="gap:6px;flex-wrap:wrap">
						{#each run.bag.filter((id) => ITEMS[id]?.kind !== 'good') as id, i (id + i)}<button class="mini" disabled={locked} onclick={() => stash(run, id, true)}>⬇ {ITEMS[id]?.glyph} {ITEMS[id]?.name}</button>{/each}
					</div>
				{:else}
					<p class="muted small">Your stash waits at home{run.home.stash.length ? `: ${run.home.stash.map((x) => ITEMS[x]?.name).join(', ')}` : ' (empty)'}.</p>
				{/if}
				{#if run.home.city === run.location && run.home.stash.length}
					<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
						{#each run.home.stash as id, i (id + i)}<button class="mini" disabled={locked} onclick={() => stash(run, id, false)}>⬆ {ITEMS[id]?.glyph} {ITEMS[id]?.name}</button>{/each}
					</div>
				{/if}
			</section>
		{/if}
		<section>
			<h4>🛠 {t('Life skills')}</h4>
			<ul class="voicegrid skills">
				{#each SKILLS as sk}
					{@const xp = run.skills?.[sk.id] ?? 0}
					{@const lv = levelOf(xp)}
					<li title="{sk.name}: {sk.desc} Trained by {sk.trains.join(', ')} choices.{lv >= 6 ? ' Mastery: ' + sk.mastery : ''}" class:zero={lv === 0}>
						<span class="vg">{sk.glyph}</span>
						<span class="vn">{sk.name}</span>
						<span class="lvl">{lv}<small class="nx"><i style:width="{lv >= 10 ? 100 : Math.round(((xp - xpFor(lv)) / (xpFor(lv + 1) - xpFor(lv))) * 100)}%"></i></small></span>
					</li>
				{/each}
			</ul>
			<p class="muted small">Skills grow by doing: every choice that uses one trains it. Higher levels make those choices succeed more often and open skill-check options.</p>
		</section>
		<section>
			<h4>📖 {t('Repertoire')} <small class="muted">{(run.repertoire ?? []).length}</small></h4>
			{#if !(run.repertoire ?? []).length}
				<p class="muted small">No tales yet. Live something worth telling: a legend, a narrow escape, a disaster, a love affair, and you can tell it in tea houses for silver.</p>
			{:else}
				<ul class="items">
					{#each run.repertoire ?? [] as tl (tl.id)}
						<li><span class="g">📖</span><span class="n"><b>{tl.title}</b><small>{GENRE_LABEL[tl.genre]} · told {tl.told}×</small></span></li>
					{/each}
				</ul>
			{/if}
		</section>
		<section>
			<h4>🗣 {t('Languages')}</h4>
			<ul class="voicegrid">
				{#each Object.entries(LANG) as [cul, l]}
					{@const lv = langLevel(run, cul as keyof typeof LANG)}
					{#if lv > 0 || (run.langs?.[cul] ?? 0) > 0}
						<li title="{l.name}: {LEVEL_NAME[lv]}"><span class="vg">{l.script}</span><span class="vn">{l.name}</span><span class="vp">{#each { length: 3 } as _, i}<i class:on={i < lv}></i>{/each}</span></li>
					{/if}
				{/each}
			</ul>
			<p class="muted small">Picked up by spending time among speakers. Conversational or better: locals stop treating you as a foreigner; every level makes talk, trade and prices a little kinder.</p>
		</section>
		<section>
			<h4>{t('Inner voices')}</h4>
			<p class="muted small">Mind {run.mind ?? 70}/100: {mindState(run).label}{run.apathy ? ` · Apathy ${run.apathy}` : ''}. Losses, failed gambles and cruelty wear it down; rest, festivals, faith, art, food and love restore it.</p>
			<ul class="voicegrid">
				{#each VOICES as v}
					{@const lv = voicesOf(run)[v.id] ?? 2}
					<li title="{v.name} ({v.echo}): {v.desc}">
						<span class="vg">{v.glyph}</span>
						<span class="vn">{v.name}</span>
						<span class="vp">{#each { length: Math.max(6, lv) } as _, i}<i class:on={i < lv}></i>{/each}</span>
					</li>
				{/each}
			</ul>
		</section>
		<section>
			<h4>💭 {t('Thought Cabinet')} <small class="muted">{run.cabinet?.slots.length ?? 0}/{CABINET_SLOTS}</small></h4>
			{#if !run.cabinet || (!run.cabinet.found.length && !run.cabinet.slots.length && !run.cabinet.done.length)}
				<p class="muted small">Empty. Thoughts take hold of you through what you live through: despair, fame, cruelty, kindness, a thousand miles of road. Some are very rare.</p>
			{:else}
				<ul class="items cabinet">
					{#each run.cabinet.slots as sl (sl.id)}
						{@const th = THOUGHT[sl.id]}
						<li>
							<span class="g">{th.glyph}</span>
							<span class="n">
								<b>{th.name}{#if th.rare} <i class="rare">✦</i>{/if}</b>
								<small><i>“{th.problem}”</i> (internalizing, {Math.max(0, sl.left)} more days on the road.)</small>
								<span class="meter"><i style:width="{100 - (Math.max(0, sl.left) / th.days) * 100}%"></i></span>
							</span>
							{#if !locked}<button class="ghosty" onclick={() => forgetThought(run, sl.id)}>Set aside</button>{/if}
						</li>
					{/each}
					{#each run.cabinet.found as id (id)}
						{@const th = THOUGHT[id]}
						<li>
							<span class="g">{th.glyph}</span>
							<span class="n"><b>{th.name}{#if th.rare} <i class="rare">✦</i>{/if}</b><small>{th.found} Takes {th.days} days. Result: {th.doneText}.</small></span>
							{#if !locked}<button class="ghosty" disabled={(run.cabinet?.slots.length ?? 0) >= CABINET_SLOTS} onclick={() => internalize(run, id)}>Think it</button>{/if}
						</li>
					{/each}
					{#each run.cabinet.done as id (id)}
						{@const th = THOUGHT[id]}
						<li class="done">
							<span class="g">{th.glyph}</span>
							<span class="n"><b>{th.name}{#if th.rare} <i class="rare">✦</i>{/if}</b><small>{th.solution} <b>{th.doneText}</b></small></span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
		<section>
			<h4>{t('Merit')} · {karmaLabel(run.karma)} ({run.karma > 0 ? '+' : ''}{run.karma})</h4>
			<div class="merit"><i style:left="{50 + run.karma / 2}%"></i></div>
			<p class="muted small">Luck is luck. Merit is how people remember you: kindness comes back as gifts, news, rescue and friends; cruelty comes back as ambushes, informers and theft.</p>
			{#if run.ties.length}
				<ul class="ties">
					{#each [...run.ties].reverse() as t (t.id)}
						<li class:done={t.resolved} class:grudge={t.kind === 'grudge'}>
							<span class="tk">{t.kind === 'favor' ? '🤝' : '⚔'}</span>
							<span class="n">
								<b>{t.npc.name}</b>
								<small>{t.npc.title} · you {t.deed} in {cityName(CITY[t.city], run.year)}, day {t.day}{t.resolved ? ' · settled' : t.kind === 'favor' ? ' · owes you' : ' · holds a grudge'}</small>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
		<section>
			<h4>{t('Wanted level')}</h4>
			<div class="heat"><i style:width="{run.heat}%"></i></div>
			<p class="muted small">{run.heat < 15 ? 'Nobody is looking for you.' : run.heat < 40 ? 'Some constables know your face.' : run.heat < 60 ? 'Bounty hunters are asking questions.' : run.heat < 90 ? 'Arrest is likely in any city.' : 'The next arrest will be the last.'} Heat cools with distance and border crossings.</p>
			{#if run.flags.society}<p class="small">🔴 Sworn to {run.flags.society}.</p>{/if}
		</section>
	{:else if tab === 'people'}
		<section>
			<div class="row between">
				<b>Retinue ({run.crew.length}/3)</b>
				<span class="muted">Wages: {wages(run)} silver per journey</span>
			</div>
			{#if run.crew.length === 0}<p class="muted">Travelling alone. Hiring halls in cities offer bodyguards, navigators, guides, interpreters, physicians, cooks, and less reputable talents.</p>{/if}
			{#if companionMsg}
				<div class="companion-toast">✦ {companionMsg}</div>
			{/if}
			<ul class="crew">
				{#each run.crew as c (c.id)}
					{@const trs = c.traits ?? defaultTraitsForRole(c.role)}
					<li class="crew-card">
						<div class="crew-top">
							<Portrait culture={c.npc.culture} gender={c.npc.gender} seed={c.npc.seed} role={c.npc.role} year={run.year} size={52} />
							<span class="n">
								<b>{CREW[c.role].glyph} {c.npc.name}</b>
								<small>{CREW[c.role].title} · {CREW[c.role].desc}</small>
								<span class="meter loy" title="Loyalty {c.loyalty}"><i style:width="{c.loyalty}%" class:low={c.loyalty < 35}></i></span>
							</span>
							{#if !locked}<button class="ghosty" onclick={() => ondismiss(c.id)}>Dismiss</button>{/if}
						</div>
						<div class="companion-traits">
							{#each trs as tr}
								<span class="tr-badge">✦ {tr}</span>
							{/each}
							{#if c.role === 'thief' || trs.includes('outlaw')}
								<span class="tr-warn" title="Past crimes attract bounty hunters on the road">⚠️ Outlaw (draws bounty hunters)</span>
							{/if}
							{#if c.role === 'ward' || c.role === 'heir' || trs.includes('noble')}
								<span class="tr-warn" title="Noble blood draws royal court intrigue">👑 Noble (draws high intrigue)</span>
							{/if}
							{#if c.role === 'bodyguard' || trs.includes('hero')}
								<span class="tr-warn" title="Famous warrior challenged by wanderers">⚔️ Master (challenged to duels)</span>
							{/if}
						</div>
						<div class="companion-task-row">
							<span class="task-current"><b>Assignment:</b> {TASK_INFO[c.task ?? 'idle'].glyph} {TASK_INFO[c.task ?? 'idle'].name}</span>
							{#if !locked && (run.phase === 'city' || run.phase === 'map')}
								<div class="task-buttons">
									<button class="task-btn" title="Barter for rations & fodder" onclick={() => doCompanionTask(c.id, 'provision')}>🌾 Provisions</button>
									<button class="task-btn" title="Scour tea houses for route secrets" onclick={() => doCompanionTask(c.id, 'intel')}>👂 Intel</button>
									<button class="task-btn" title="Scout departure path (-1 day)" onclick={() => doCompanionTask(c.id, 'scout')}>🧭 Scout</button>
									<button class="task-btn" title="Guard luggage and cool heat" onclick={() => doCompanionTask(c.id, 'guard')}>🛡️ Guard</button>
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<p class="muted small">Unpaid wages and bad decisions drain loyalty. At zero, they leave: sometimes with your things.</p>
		</section>
		<section>
			<h4>✉️ {t('Letters')}</h4>
			{#if letterMsg}<p class="small">{letterMsg}</p>{/if}
			<div class="row" style="gap:6px;flex-wrap:wrap">
				{#if !locked}<button class="mini" onclick={() => write({ name: run.patron, city: run.hero.home, kind: 'patron' })}>Report to {run.patron.split(',')[0]}</button>{/if}
				{#if !locked && run.romance && run.romance.status !== 'parted'}<button class="mini" onclick={() => write({ name: run.romance!.npc.name, city: run.romance!.city, kind: 'sweetheart' })}>Write to {run.romance.npc.name.split(' ')[0]}</button>{/if}
				{#if !locked && run.hero.home !== run.location}<button class="mini" onclick={() => write({ name: 'your family', city: run.hero.home, kind: 'family' })}>Write home</button>{/if}
			</div>
			{#if lettersInFlight(run).length}<p class="muted small">In flight: {lettersInFlight(run).map((l) => `to ${l.to} (reply ~day ${l.arrives})`).join(' · ')}</p>{/if}
		</section>
		{#if run.romance}
			{@const r = run.romance}
			<section>
				<h4>💗 {t('Heart')}</h4>
				<ul class="crew">
					<li>
						<Portrait culture={r.npc.culture} gender={r.npc.gender} seed={r.npc.seed} role="lover" year={run.year} size={52} mood={r.status === 'parted' ? 'sad' : r.affection >= 60 ? 'happy' : 'neutral'} />
						<span class="n">
							<b>{r.npc.name}</b>
							<small>{r.status === 'courting' ? 'Courting' : r.status === 'betrothed' ? 'Betrothed' : r.status === 'married' ? 'Married' : 'Parted'} · {cityName(CITY[r.city], run.year)}{r.status !== 'parted' ? ` · ${r.affection >= 75 ? 'devoted' : r.affection >= 50 ? 'fond' : r.affection >= 25 ? 'waiting' : 'losing patience'}` : ''}</small>
							{#if r.status !== 'parted'}<span class="meter loy" title="Affection {Math.round(r.affection)}"><i style:width="{r.affection}%" class:low={r.affection < 25}></i></span>{/if}
						</span>
					</li>
				</ul>
				<p class="muted small">Long absences cool any heart. Letters, gifts and visits warm it. Travel together and nobody has to wait.</p>
			</section>
		{/if}
		<section>
			<h4>🤝 {t('People you know')} <small class="muted">{(run.people ?? []).length}</small></h4>
			{#if !(run.people ?? []).length}
				<p class="muted small">Nobody yet. Tap a place in town to see who is there: swipe right to spend time with someone.</p>
			{:else}
				<ul class="crew">
					{#each [...(run.people ?? [])].sort((a, b) => b.bond - a.bond) as pp (pp.id)}
						<li>
							<Portrait culture={pp.npc.culture} gender={pp.npc.gender} seed={pp.npc.seed} role={pp.npc.role} year={run.year} size={44} mood={pp.stage === 'rival' ? 'angry' : pp.bond > 40 ? 'happy' : 'neutral'} />
							<span class="n">
								<b>{pp.npc.name} <small class="muted">· {pp.stage}</small></b>
								<small>{pp.npc.title} in {cityName(CITY[pp.city], run.year)} · {pp.traits.map((x) => PERK[x]?.name).filter(Boolean).join(', ')}</small>
								<span class="meter loy" title="Bond {pp.bond}"><i style:width="{Math.max(0, pp.bond)}%" class:low={pp.bond < 0}></i></span>
							</span>
							{#if !locked}<button class="ghosty" title="Write to {pp.npc.name} (1 silver)" onclick={() => write({ name: pp.npc.name, id: pp.id, city: pp.city, kind: pp.stage === 'sweetheart' ? 'sweetheart' : pp.stage === 'rival' ? 'rival' : 'friend' })}>✉</button>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else if tab === 'world'}
		<section>
			<h4>{t('Standing')}</h4>
			<ul class="standing">
				{#each Object.entries(run.standing).sort((a, b) => b[1] - a[1]) as [cul, v]}
					<li>
						<span class="sl">{CULTURES[cul as keyof typeof CULTURES]?.label}</span>
						<span class="sbar"><i class:neg={v < 0} style:width="{Math.abs(v) / 2}%" style:left={v < 0 ? `${50 - Math.abs(v) / 2}%` : '50%'}></i></span>
						<small>{standingLabel(v)}</small>
					</li>
				{/each}
			</ul>
			<p class="muted small">Each region remembers you separately: friends sell cheaper, pay more and invite you to court; enemies send constables.</p>
		</section>
		<section>
			<h4>🏛️ Cultural Standing · {loc.name}</h4>
			<div class="cultural-card">
				<p><b>Regional Title:</b> <span class="cult-title">{cultAff.title}</span> <small class="cult-score">(Affinity {cultAff.score > 0 ? '+' : ''}{cultAff.score})</small></p>
				<p class="small muted"><b>Realm Order:</b> {cultAff.system}</p>
				<p class="small muted"><b>Cultural Virtues:</b> {cultAff.values}</p>
			</div>
		</section>
		<section>
			<h4>⚖️ {t('Faction Reputations')}</h4>
			<ul class="standing">
				{#each Object.entries(run.factions ?? { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 }) as [fac, v]}
					{@const fdef = FACTIONS[fac as keyof typeof FACTIONS]}
					{#if fdef}
						<li>
							<span class="sl">{fdef.glyph} {fdef.label}</span>
							<span class="sbar"><i class:neg={v < 0} style:width="{Math.abs(v) / 2}%" style:left={v < 0 ? `${50 - Math.abs(v) / 2}%` : '50%'}></i></span>
							<small>{v >= 50 ? 'Sworn Ally' : v >= 20 ? 'Respected' : v <= -50 ? 'Hunted' : v <= -20 ? 'Mistrusted' : 'Neutral'} ({v > 0 ? '+' : ''}{v})</small>
						</li>
					{/if}
				{/each}
			</ul>
			<p class="muted small">Factions remember your deeds: guilds grant discounts, outlaws share black-market wares, and holy orders grant remedies and sanctuary.</p>
		</section>
		{#if UPRISINGS.some((u) => run.flags['rev:' + u.id])}
			<section>
				<h4>⚑ {t('Causes')}</h4>
				<ul class="items">
					{#each UPRISINGS.filter((u) => run.flags['rev:' + u.id]) as u}
						{@const s = String(run.flags['rev:' + u.id])}
						<li>
							<span class="g">{s === 'rebel' ? '🔥' : s === 'crown' ? '👑' : '🎭'}</span>
							<span class="n"><b>{u.name}</b><small>{s === 'rebel' ? `Sworn to ${u.rebels}` : s === 'crown' ? `Serving ${u.crown}` : 'Double agent'} · {run.flags['revdone:' + u.id] ? 'over' : `${Math.min(3, Number(run.flags['revp:' + u.id] ?? 0))}/3 deeds`}</small></span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		<section>
			<h4>{t('Almanac')}</h4>
			<p class="small">{westernDate(dateOf(run, run.day))} · <i>{localDate(dateOf(run, run.day), loc.culture)}</i></p>
			{#if fests.length}
				<ul class="almanac">
					{#each fests as f}<li><b>{f.name}</b> <small>{f.inDays === 0 ? 'now' : `in ${f.inDays} days`} · {cityName(loc, run.year)}</small></li>{/each}
				</ul>
			{:else}
				<p class="muted small">No festivals here in the next two months.</p>
			{/if}
		</section>
		{#if (run.world ?? []).length}
			<section>
				<h4>{t('World news')}</h4>
				<ul class="almanac">
					{#each run.world as w (w.id)}
						<li><b>{w.kind === 'plague' ? '☣' : w.kind === 'typhoon' ? '🌀' : '⚔'} {w.label}</b> <small>{w.kind === 'plague' ? w.cities.map((c) => cityName(CITY[c], run.year)).join(', ') : w.kind === 'typhoon' ? w.cities.map((c) => cityName(CITY[c], run.year)).join(' → ') : 'border roads closed'} · until about day {w.end}</small></li>
					{/each}
				</ul>
			</section>
		{/if}
		<section>
			<h4>{t('Treasury')} · {run.treasury} taels</h4>
			<p class="muted small">Silver banked with your factors is safe from thieves, and from the "too rich to live" ending. Draw on it in any city.</p>
			{#if !locked && (run.phase === 'map' || run.phase === 'city')}
				<div class="row">
					<button class="mini" onclick={() => onbank(10)} disabled={run.stats.silver <= 11}>Deposit 10 silver</button>
					<button class="mini" onclick={() => onbank(-10)} disabled={run.treasury < 1 || run.stats.silver >= 90}>Withdraw 10</button>
				</div>
			{:else}<p class="muted small">Banking is possible in cities only.</p>{/if}
		</section>
		<section>
			<h4>🏪 {t('Warehouse')} · {t('Guild rank')} {guildRank(run)}/5</h4>
			<p class="small"><b>{guildTitle(run)}</b> · {guildVolume(run)} silver traded{guildDiscount(run) > 0 ? ` · ${Math.round(guildDiscount(run) * 100)}% guild discount` : ''}</p>
			{#if warehouseMsg}<p class="small">{warehouseMsg}</p>{/if}
			<p class="muted small">Store cargo and supplies in up to 3 cities ({warehouseCapacity(run)} slots per city), retrieve them when here, or pay factors to ship them ahead.</p>
			{#if !locked && (run.phase === 'map' || run.phase === 'city') && run.bag.length}
				<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">
					{#each run.bag as id, i (id + i)}
						<button class="mini" disabled={!canStore(run, id, run.location)} onclick={() => { if (store(run, id, run.location)) warehouseMsg = `Stored ${ITEMS[id]?.name ?? id} in ${cityName(loc, run.year)}.`; }}>
							⬇ {t('Store')} {ITEMS[id]?.glyph ?? ''} {ITEMS[id]?.name ?? id}
						</button>
					{/each}
				</div>
			{/if}
			{#if warehouseCities(run).length === 0}
				<p class="muted small">No goods stored in any city warehouse yet.</p>
			{:else}
				<ul class="fleet">
					{#each warehouseCities(run) as wCity (wCity)}
						{@const items = warehouseAt(run, wCity)}
						<li>
							<div class="row between">
								<b>{cityName(CITY[wCity], run.year)}{wCity === run.location ? ' (here)' : ''}</b>
								<small class="muted">{items.length}/{warehouseCapacity(run)} stored</small>
							</div>
							<div class="runs">
								{#each items as id, i (id + i)}
									{#if wCity === run.location}
										<button class="mini run" disabled={locked} onclick={() => { if (retrieve(run, id, wCity)) warehouseMsg = `Retrieved ${ITEMS[id]?.name ?? id}.`; else warehouseMsg = 'No room in your bag.'; }}>
											⬆ {t('Retrieve')} {ITEMS[id]?.glyph ?? ''} {ITEMS[id]?.name ?? id}
										</button>
									{:else if !locked}
										<button class="mini run" onclick={() => {
											const res = shipTo(run, id, wCity, run.location);
											warehouseMsg = !res.ok ? (res.reason ?? 'Cannot ship right now.') : res.lost ? `Lost at sea while shipping from ${cityName(CITY[wCity], run.year)} (-${res.cost} silver).` : `Shipped ${ITEMS[id]?.name ?? id} to ${cityName(loc, run.year)} (${res.cost} silver, ${res.days}d).`;
										}}>
											🚢 {t('Ship to')} {cityName(loc, run.year)}: {ITEMS[id]?.glyph ?? ''} {ITEMS[id]?.name ?? id}
										</button>
									{/if}
								{/each}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
		<section>
			<h4>{t('Ships & caravans')} ({run.ventures.length}/4)</h4>
			{#if !run.ventures.length}<p class="muted small">Shipwrights in ports and caravan masters inland sell vessels. Each one trades on its own while you travel, and profits arrive in your treasury.</p>{/if}
			<ul class="fleet">
				{#each run.ventures as v (v.id)}
					{@const def = VENTURES[v.kind]}
					<li>
						<div class="row between">
							<b>{def.glyph} {v.name}</b>
							<small class="muted">{def.name} · {cityName(CITY[v.home], run.year)} · {v.condition}% sound</small>
						</div>
						{#if v.state === 'away'}
							<small>Trading at {cityName(CITY[v.dest!], run.year)}, expected back around day {v.back} (in {Math.max(0, (v.back ?? 0) - run.day)} days). Reports reach you in the next city after that.</small>
						{:else if !locked}
							<small>Idle. Send her on a trade run:</small>
							<div class="runs">
								{#each tradeRuns(run, v) as t}
									<button class="mini run" onclick={() => ondispatch(v.id, t)}>
										→ {cityName(CITY[t.dest], run.year)} · {t.days}d · ~{t.profit} taels · {Math.round(t.risk * 100)}% risk
									</button>
								{/each}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
		{#if run.lineage.length}
			<section>
				<h4>{t('Your line')}</h4>
				<ol class="line">
					{#each run.lineage as a}<li><b>{a.name}</b> <small>{a.years} · {a.ending} · then their {a.relation}</small></li>{/each}
					<li><b>{run.hero.name}</b> <small>generation {run.generation} · now</small></li>
				</ol>
			</section>
		{/if}
		{#if Object.keys(run.priceMemory ?? {}).length}
			<section>
				<h4>📈 {t('Prices you remember')}</h4>
				<ul class="items">
					{#each memBest as m}
						<li><span class="g">{ITEMS['good:' + m.good]?.glyph ?? '•'}</span><span class="n"><b>{m.good} <small class="muted">best seen {m.price} in {cityName(CITY[m.city], run.year)}</small></b><small>{run.day - m.day} days ago{m.city === run.location ? ' · here' : ''}</small></span></li>
					{/each}
				</ul>
			</section>
		{/if}
	{:else if tab === 'ledger'}
		<section>
			<h4>Tasks</h4>
			<ul class="quests">
				<li class="main">
					<b>◎ Deliver {run.item} to {cityName(CITY[run.destination], run.year)}</b>
					<small>{run.delivered ? 'Done.' : `By day ${isFinite(run.deadline) ? run.deadline : '-'} · for ${run.patron}`}</small>
				</li>
				{#each run.quests as q (q.id)}
					<li>
						<b>◆ {q.title}</b>
						<small>
							{#if q.visit}Still to visit: {q.visit.map((id) => cityName(CITY[id], run.year)).join(', ')}.{:else}Go to {cityName(CITY[q.to], run.year)}{q.needs ? ` with ${ITEMS[q.needs]?.name.toLowerCase()}` : ''}.{/if}
							Due day {q.due} ({q.due - run.day} left) · from {q.giver}
						</small>
					</li>
				{/each}
			</ul>
			{#if !run.quests.length}<p class="muted small">Merchants, abbots, courts and physicians in cities offer contracts and stories. They give you reasons to go everywhere.</p>{/if}
		</section>
		<section>
			<h4>🔬 Inventions & Patronage</h4>
			{#if activeInventions.length === 0 && completedInventions.length === 0}
				<p class="muted small">No active breakthroughs. Visit academies, palaces, or shipyards in major cities to sponsor astronomers, medical botanists, typographers, and reformist jurists.</p>
			{:else}
				<ul class="inventions-list">
					{#each activeInventions as inv (inv.id)}
						{@const def = INVENTIONS[inv.id]}
						<li class="invention-item active">
							<span class="inv-glyph">{def?.glyph ?? '🔬'}</span>
							<div class="inv-info">
								<b>{def?.name ?? inv.id} <small class="inv-field">({def?.fieldLabel})</small></b>
								<small class="muted">Under {inv.scholarName} in {cityName(CITY[inv.city] ?? CITY['beijing'], run.year)} · {inv.daysLeft} days remaining</small>
								<div class="inv-bar"><div class="inv-fill" style="width: {Math.max(5, Math.min(100, Math.round(((def?.daysNeeded ?? 20) - inv.daysLeft) / (def?.daysNeeded ?? 20) * 100)))}%"></div></div>
							</div>
						</li>
					{/each}
					{#each completedInventions as id (id)}
						{@const def = INVENTIONS[id]}
						<li class="invention-item completed">
							<span class="inv-glyph">{def?.glyph ?? '📜'}</span>
							<div class="inv-info">
								<b>{def?.name ?? id} <small class="completed-badge">✓ Patented</small></b>
								<small>{def?.desc ?? 'Prototype perfected and active.'}</small>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
		<section>
			<h4>{t('What your cargo fetches')}</h4>
			{#if goods.length === 0}
				<p class="muted">No trade goods in your bag. Buy a city's local good cheaply, sell it far away.</p>
			{:else}
				<div class="table">
					<table>
						<thead><tr><th>City</th>{#each goods as g}<th>{ITEMS['good:' + g].glyph}</th>{/each}</tr></thead>
						<tbody>
							{#each markets as id}
								<tr class:here={id === run.location}>
									<td>{cityName(CITY[id], run.year)}</td>
									{#each goods as g}<td>{CITY[id].exports === g ? '-' : sellPrice(run, g, id)}</td>{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="muted small">Prices drift every month. Rumors of shortages can send them soaring.</p>
			{/if}
		</section>
		<section>
			<h4>{t('Commission')}</h4>
			<p class="small">Deliver {run.item} to <b>{cityName(CITY[run.destination], run.year)}</b> by day {isFinite(run.deadline) ? run.deadline : '-'}.</p>
			{#if run.rival}<p class="small muted">Rival: {run.rival.npc.name}, {run.rival.npc.title}. {run.rival.arrived ? 'Already arrived.' : `Expected around day ${run.rival.arrive}.`}</p>{/if}
			{#if run.legends.length}<p class="small">★ Legends met: {run.legends.length}</p>{/if}
		</section>
		{:else}
		{#if restorePointsOf(run).length}
			<div class="rewind">
				<b class="small">↺ Rewind to</b>
				{#each restorePointsOf(run) as rp}<button class="mini" onclick={() => onrewind(rp.i)}>day {rp.day} · {rp.city}</button>{/each}
			</div>
		{/if}
		<input class="jsearch" type="search" placeholder="Search the journal: a name, a city, a legend…" bind:value={jq} aria-label="Search the journal" />
		<div class="row" style="margin-bottom: 12px; justify-content: space-between; align-items: center;">
			<p class="muted small" style="margin: 0;">Seed <code>{run.seed}</code>{run.daily ? ' · Daily journey' : ''}</p>
			<button class="mini" onclick={() => downloadJournalBook(run)} title="Download the full travel journal as a formatted, printable book">📖 {t('Download as book') || 'Download as book'}</button>
		</div>
		<ol class="log">
			{#each jq ? run.log.filter((l) => (l.text + ' ' + (l.who ?? '') + ' ' + l.place + ' ' + (l.outcome ?? '')).toLowerCase().includes(jq.toLowerCase())) : run.log as l}
				<li>
					<small>Day {l.day} · {l.place}</small>
					{#if l.situation}
						{#if l.scene}<em class="scene"><RichText text={l.scene} /></em>{/if}
						<span class="who">{l.who}</span>
						<span><RichText text={l.situation} /></span>
						<span class="pick">→ {l.choice}</span>
						{#if l.outcome}<span class="out"><RichText text={l.outcome} /></span>{/if}
					{:else}
						<span>{l.text}</span>
					{/if}
				</li>
			{/each}
		</ol>
		<div class="row end-row">
			<button class="ghost" onclick={() => downloadJournalBook(run)} title="Download the full travel journal as a formatted, printable book">📖 {t('Download book') || 'Download book'}</button>
			{#if !locked}
				{#if run.phase === 'map' || run.phase === 'city'}<button class="ghost" onclick={onsettle} title="End this journey peacefully and settle down in this city on your own terms">🏡 {t('Settle in {city}', { city: cityName(CITY[run.location], run.year) })}</button>{/if}
				<button class="ghost danger" onclick={onabandon}>{t('Abandon journey')}</button>
			{/if}
		</div>
	{/if}
</aside>

<style>
	.goal {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.goal.done b {
		color: var(--jade);
	}
	.goal .cjk {
		font-family: var(--cjk);
		color: var(--gold-text);
	}
	.skills li.zero {
		opacity: 0.55;
	}
	.skills .lvl {
		font-weight: 700;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.skills .nx {
		display: inline-block;
		width: 22px;
		height: 3px;
		background: var(--line);
		border-radius: 2px;
		overflow: hidden;
	}
	.skills .nx i {
		display: block;
		height: 100%;
		background: var(--jade);
	}
	.rewind {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
		margin-bottom: 8px;
	}
	.jsearch {
		width: 100%;
		box-sizing: border-box;
		padding: 6px 10px;
		margin-bottom: 8px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
	}
	.voicegrid {
		list-style: none;
		padding: 0;
		margin: 6px 0 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px 12px;
	}
	.voicegrid li {
		display: grid;
		grid-template-columns: 1.3rem 1fr auto;
		align-items: center;
		gap: 6px;
		font-size: 0.82rem;
	}
	.voicegrid .vg {
		font-family: var(--cjk);
		color: var(--gold-text);
		font-weight: 700;
	}
	.voicegrid .vn {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.voicegrid .vp i {
		display: inline-block;
		width: 5px;
		height: 5px;
		margin-left: 2px;
		border-radius: 50%;
		border: 1px solid var(--ink);
		opacity: 0.35;
	}
	.voicegrid .vp i.on {
		background: var(--ink);
		opacity: 1;
	}
	.cabinet .rare {
		color: var(--gold-text);
		font-style: normal;
	}
	.cabinet li.done {
		opacity: 0.85;
	}
	.cabinet .done .g {
		color: var(--gold-text);
	}
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 9;
	}
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(440px, 94vw);
		background: var(--paper);
		border-left: 1px solid var(--line);
		z-index: 10;
		padding: 16px;
		overflow-y: auto;
		box-shadow: -10px 0 30px var(--shadow);
		animation: slide 0.25s ease-out;
	}
	@keyframes slide {
		from {
			transform: translateX(100%);
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	h3 {
		font-family: var(--display);
		font-size: 1.4rem;
		margin: 0;
	}
	h4 {
		font-family: var(--display);
		font-size: 1.1rem;
		margin: 0 0 6px;
	}
	.x {
		background: none;
		border: 0;
		font-size: 1.2rem;
		color: var(--ink);
		cursor: pointer;
	}
	.tabs {
		display: flex;
		gap: 4px;
		margin: 10px 0 14px;
		border-bottom: 1px solid var(--line);
	}
	.tabs button {
		flex: 1;
		font: inherit;
		font-size: 0.85rem;
		background: none;
		border: 0;
		border-bottom: 2px solid transparent;
		padding: 6px 2px;
		color: var(--muted);
		cursor: pointer;
	}
	.tabs button.on {
		color: var(--ink);
		border-bottom-color: var(--vermilion);
	}
	section {
		margin-bottom: 18px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.between {
		justify-content: space-between;
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: 0.86rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.items li,
	.crew li,
	.mount {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 8px 10px;
	}
	.g,
	.big {
		font-size: 1.5rem;
		width: 30px;
		text-align: center;
	}
	.big {
		font-size: 2rem;
		width: 40px;
	}
	.n {
		flex: 1;
		display: flex;
		flex-direction: column;
		line-height: 1.2;
		min-width: 0;
	}
	.n small {
		color: var(--muted);
		font-size: 0.78rem;
	}
	.ghosty {
		font: inherit;
		font-size: 0.8rem;
		padding: 4px 9px;
		border-radius: 6px;
		border: 1px solid var(--ink);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.ghosty {
		border-color: var(--line);
		color: var(--muted);
	}
	.meter,
	.heat {
		display: block;
		height: 5px;
		background: var(--paper-2);
		border-radius: 3px;
		margin-top: 5px;
		overflow: hidden;
	}
	.meter i,
	.heat i {
		display: block;
		height: 100%;
		background: var(--jade);
	}
	.meter i.low {
		background: var(--vermilion);
	}
	.heat {
		height: 8px;
	}
	.merit {
		position: relative;
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(90deg, var(--vermilion), var(--paper-2) 50%, var(--jade));
		margin: 4px 0 6px;
	}
	.merit i {
		position: absolute;
		top: -3px;
		width: 4px;
		height: 14px;
		margin-left: -2px;
		background: var(--ink);
		border-radius: 2px;
	}
	.ties li {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 6px 10px;
		border: 1px solid var(--line);
		border-left: 3px solid var(--jade);
		border-radius: 8px;
		background: var(--card);
	}
	.ties li.grudge {
		border-left-color: var(--vermilion);
	}
	.ties li.done {
		opacity: 0.55;
	}
	.ties .n {
		display: flex;
		flex-direction: column;
	}
	.ties small {
		color: var(--muted);
		font-size: 0.78rem;
	}
	.heat i {
		background: linear-gradient(90deg, var(--gold), var(--vermilion));
	}
	.traits {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.traits span {
		font-size: 0.82rem;
		padding: 2px 9px;
		border-radius: var(--radius-sm, 4px);
		background: var(--ink);
		color: var(--paper);
	}
	.traits b {
		font-family: var(--cjk);
		color: var(--gold-text);
		margin-right: 4px;
	}
	.table {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.86rem;
	}
	th,
	td {
		padding: 4px 6px;
		border-bottom: 1px solid var(--line);
		text-align: right;
	}
	th:first-child,
	td:first-child {
		text-align: left;
	}
	tr.here td {
		font-weight: 700;
		color: var(--vermilion);
	}
	.mini {
		font: inherit;
		font-size: 0.8rem;
		padding: 4px 9px;
		border-radius: 6px;
		border: 1px solid var(--ink);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.mini:disabled {
		opacity: 0.4;
	}
	.fleet li {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 10px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--card);
	}
	.runs {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.mini.run {
		text-align: left;
		border-color: var(--line);
	}
	.line li,
	.standing li {
		padding: 3px 0;
	}
	.standing li {
		display: grid;
		grid-template-columns: 110px 1fr auto;
		gap: 8px;
		align-items: center;
		font-size: 0.85rem;
	}
	.sbar {
		position: relative;
		height: 6px;
		background: var(--paper-2);
		border-radius: 3px;
	}
	.sbar::after {
		content: '';
		position: absolute;
		left: 50%;
		top: -2px;
		bottom: -2px;
		width: 1px;
		background: var(--line);
	}
	.sbar i {
		position: absolute;
		top: 0;
		bottom: 0;
		background: var(--jade);
		border-radius: 3px;
	}
	.sbar i.neg {
		background: var(--vermilion);
	}
	.end-row {
		justify-content: space-between;
		margin-top: 10px;
	}
	.almanac li {
		padding: 3px 0;
		border-bottom: 1px dashed var(--line);
	}
	.almanac small {
		color: var(--muted);
	}
	.quests li {
		display: flex;
		flex-direction: column;
		padding: 8px 10px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--card);
	}
	.quests li.main {
		border-color: var(--gold);
	}
	.quests small {
		color: var(--muted);
		font-size: 0.8rem;
	}
	.cjk {
		font-family: var(--cjk);
	}
	.log {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.log li {
		display: flex;
		flex-direction: column;
		font-size: 0.95rem;
		border-left: 2px solid var(--line);
		padding-left: 10px;
	}
	.log .scene {
		color: var(--muted);
		font-size: 0.85rem;
	}
	.log .who {
		font-family: var(--display);
		font-weight: 600;
	}
	.log .pick {
		font-weight: 700;
		color: var(--vermilion);
	}
	.log .out {
		font-style: italic;
	}
	.log li span {
		line-height: 1.4;
	}
	.log small {
		color: var(--muted);
		font-size: 0.75rem;
	}
	.danger {
		color: var(--vermilion);
		border-color: var(--vermilion);
	}
	.inventions-list {
		list-style: none;
		margin: 8px 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.invention-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--paper) 85%, var(--ink));
		border: 1px solid var(--line);
	}
	.invention-item.completed {
		border-color: var(--jade);
		background: color-mix(in srgb, var(--jade) 8%, var(--paper));
	}
	.inv-glyph {
		font-size: 1.4rem;
		flex-shrink: 0;
	}
	.inv-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.inv-field {
		font-weight: 500;
		color: var(--muted);
	}
	.inv-bar {
		margin-top: 4px;
		height: 5px;
		width: 100%;
		border-radius: 3px;
		background: color-mix(in srgb, var(--line) 70%, transparent);
		overflow: hidden;
	}
	.inv-fill {
		height: 100%;
		background: var(--vermilion);
		border-radius: 3px;
		transition: width 0.3s ease;
	}
	.completed-badge {
		display: inline-block;
		margin-left: 6px;
		padding: 1px 5px;
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: 700;
		background: color-mix(in srgb, var(--jade) 20%, transparent);
		color: var(--jade);
	}
	.cultural-card {
		padding: 10px 12px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--paper) 90%, var(--ink));
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.cult-title {
		font-family: var(--display);
		font-weight: 700;
		color: var(--vermilion);
	}
	.cult-score {
		color: var(--jade);
		font-weight: 600;
	}
	.companion-toast {
		padding: 6px 10px;
		background: color-mix(in srgb, var(--jade) 15%, var(--paper));
		border: 1px solid var(--jade);
		border-radius: 6px;
		font-size: 0.8rem;
		color: var(--jade);
		font-weight: 600;
		margin-bottom: 8px;
	}
	.crew-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px 10px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--paper) 95%, var(--ink));
		border: 1px solid var(--line);
		margin-bottom: 8px;
	}
	.crew-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.companion-traits {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 2px;
	}
	.tr-badge {
		font-size: 0.72rem;
		padding: 1px 6px;
		border-radius: 4px;
		background: color-mix(in srgb, var(--gold) 15%, transparent);
		color: var(--ink);
		border: 1px solid color-mix(in srgb, var(--gold) 40%, transparent);
	}
	.tr-warn {
		font-size: 0.72rem;
		padding: 1px 6px;
		border-radius: 4px;
		background: color-mix(in srgb, var(--vermilion) 12%, transparent);
		color: var(--vermilion);
		font-weight: 600;
	}
	.companion-task-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		padding-top: 4px;
		border-top: 1px dashed var(--line);
		font-size: 0.78rem;
	}
	.task-current {
		color: var(--muted);
	}
	.task-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.task-btn {
		font: inherit;
		font-size: 0.72rem;
		padding: 2px 7px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.task-btn:hover {
		border-color: var(--jade);
		color: var(--jade);
	}
</style>
