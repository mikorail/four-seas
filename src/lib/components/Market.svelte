<script lang="ts">
	import Portrait from './Portrait.svelte';
	import { ITEMS } from '#lib/data/items';
	import { CURIO, OUTFITS, RIDDLES } from '#lib/data/market';
	import { CITY, cityName } from '#lib/data/world';
	import { CULTURES } from '#lib/data/cultures';
	import { bagPrice, buy, buyBag, isNightMarket, marketStock, priceOf, sell, sellValue, stockOf, venuesHere } from '#lib/game/market';
	import { EXTRA_BAGS, cellsUsed, maxExtraBags } from '#lib/game/bag';
	import { canStore, guildRank, guildTitle, retrieve, store, warehouseAt, warehouseCapacity, warehouseCities } from '#lib/game/guild';
	import { capacity } from '#lib/game/cards/index';
	import * as sfx from '#lib/audio';
	import { t } from '#lib/i18n.svelte';
	import { themeStyle } from '#lib/data/themes';
	import type { Run } from '#lib/game/types';

	let { run, onclose }: { run: Run; onclose: () => void } = $props();

	let tab = $state<'clothes' | 'curios' | 'maps' | 'supplies' | 'sell' | 'warehouse'>('clothes');
	let msg = $state('');
	let tryOn = $state<string | null>(null);

	const city = $derived(CITY[run.location]);
	const big = $derived(venuesHere(run).some((v) => v.id === 'bazaar'));
	const night = $derived(isNightMarket(run));
	const stock = $derived(marketStock(run));
	const prizedHere = $derived(run.bag.map((id, i) => ({ id, i, v: sellValue(run, id) })).filter((x) => CURIO[x.id]?.prized.includes(CITY[run.location].culture)));
	function sellPrized() {
		let total = 0;
		for (const x of [...prizedHere]) total += sell(run, x.id);
		if (total) {
			sfx.coin(4);
			msg = `Collectors here buy everything: +${total} silver.`;
		}
	}
	const sellable = $derived(run.bag.map((id, i) => ({ id, i, v: sellValue(run, id) })).filter((x) => x.v > 0));
	const wearing = $derived(tryOn ?? run.outfit?.id ?? null);

	const CONTRABAND_ITEMS = new Set(['forged-pass', 'skeleton-key', 'smoke-pellets', 'opium', 'stolen-relic', 'papers']);

	const marketTitle = $derived(
		night
			? (['han', 'japanese', 'korean', 'viet'].includes(city.culture)
				? '👻 鬼市 · Night Market'
				: ['persian', 'ottoman', 'swahili'].includes(city.culture)
				? '🌙 Shab-Bazaar'
				: ['malay', 'siamese'].includes(city.culture)
				? '🏮 Pasar Malam'
				: '🏮 Night Market')
			: (big ? '🛍️ ' + t('Great bazaar') : '🧺 ' + t('Market'))
	);

	function doBuy(id: string) {
		const err = buy(run, id);
		msg = err ?? (OUTFITS[id] ? `You pack the ${OUTFITS[id].name.toLowerCase()} in your luggage and change into it.` : id.startsWith('chart-') ? 'A new route is marked on your map. 🗝' : `Bought: ${ITEMS[id]?.name ?? id}.`);
		if (!err) {
			sfx.coin(3);
			tryOn = null;
		}
	}
	function doSell(id: string) {
		const v = sell(run, id);
		if (v) {
			sfx.coin(3);
			msg = CURIO[id]?.prized.includes(city.culture) ? `A collector snaps it up for ${v} silver, far more than you paid.` : `Sold for ${v} silver.`;
		}
	}
	const outfitName = (id: string) => (id === 'local-dress' ? `${CULTURES[city.culture].adjective} dress` : OUTFITS[id].name);
</script>

<div class="scrim" onclick={onclose} role="presentation"></div>
<div class="market themed" class:night-market={night} style={themeStyle(city.culture)} role="dialog" aria-label="Market">
	<header>
		<div>
			<h3>{marketTitle} · {cityName(city, run.year)}</h3>
			<small class="muted">銀 {run.stats.silver} silver · 🎒 {cellsUsed(run)}/{capacity(run)}</small>
		</div>
		<button class="x" onclick={onclose} aria-label="Close">✕</button>
	</header>
	{#if night}
		<div class="night-banner">
			<span>🏮</span>
			<div>
				<b>Under the Cover of Darkness:</b> Oil lamps burn low in the alleyways. Smugglers, grave-robbers, and fences barter forbidden wares beyond the notice of city magistrates.
			</div>
		</div>
	{/if}
	<nav class="tabs">
		{#each [['clothes', '👘 Clothes'], ['curios', '🏺 Curios'], ['maps', '🗺️ Maps'], ['supplies', '🍙 Supplies'], ['sell', '⚖️ Sell'], ['warehouse', '🏪 ' + t('Warehouse')]] as [id, label]}
			<button class:on={tab === id} onclick={() => ((tab = id as typeof tab), (msg = ''))}>{label}</button>
		{/each}
	</nav>
	{#if msg}<p class="msg" aria-live="polite">{msg}</p>{/if}

	{#if tab === 'clothes'}
		<div class="mirror">
			<Portrait culture={run.hero.culture} gender={run.hero.gender} seed={run.hero.seed} year={run.year} size={96} hatOverride={wearing ? OUTFITS[wearing]?.hat : undefined} robeOverride={wearing ? OUTFITS[wearing]?.robe : undefined} />
			<p class="muted small">{tryOn ? `Trying on: ${outfitName(tryOn)}` : run.outfit ? `Wearing: ${outfitName(run.outfit.id)}` : 'Your own travelling clothes.'} Clothes change who lets you in, who trusts you, and who shoots at you.</p>
		</div>
		<ul class="goods">
			{#each stock.outfits as o (o.id)}
				{@const curStock = stockOf(run, o.id)}
				<li class:on={run.outfit?.id === o.id}>
					<button class="g" onclick={() => (tryOn = tryOn === o.id ? null : o.id)} title="Try on">{o.glyph}</button>
					<span class="n">
						<b>{outfitName(o.id)}</b>
						<small>{o.desc}</small>
						<small class="acc">✦ {o.access}</small>
					</span>
					<button
						class="buy"
						onclick={() => doBuy(o.id)}
						disabled={curStock <= 0 || run.stats.silver <= priceOf(run, o.id)}
					>
						{curStock <= 0 ? 'Sold out' : `銀 ${priceOf(run, o.id)}`}
					</button>
				</li>
			{/each}
		</ul>
	{:else if tab === 'curios'}
		{#if !stock.curios.length}<p class="muted">Nothing old or rare here today. Antiques come from where they were made: try their homelands.</p>{/if}
		<ul class="goods">
			{#each stock.curios as id (id)}
				{@const c = CURIO[id]}
				{@const curStock = stockOf(run, id)}
				<li>
					<span class="g">{c.glyph}</span>
					<span class="n">
						<b>{c.name}</b>
						<small class="pitch">The vendor: “{c.pitch}”</small>
					</span>
					<button
						class="buy"
						onclick={() => doBuy(id)}
						disabled={curStock <= 0 || run.stats.silver <= priceOf(run, id)}
					>
						{curStock <= 0 ? 'Sold out' : `銀 ${priceOf(run, id)}`}
					</button>
				</li>
			{/each}
		</ul>
	{:else if tab === 'maps'}
		{#if !big}<p class="muted">Only the great bazaars of big cities sell charts and old maps.</p>{/if}
		{#if big && !stock.charts.length && !stock.riddles.length}<p class="muted">The map-seller shrugs: nothing new this month.</p>{/if}
		<ul class="goods">
			{#each stock.charts as id (id)}
				{@const curStock = stockOf(run, id)}
				<li>
					<span class="g">📜</span>
					<span class="n"><b>{ITEMS[id].name}</b><small>{ITEMS[id].desc}</small></span>
					<button
						class="buy"
						onclick={() => doBuy(id)}
						disabled={curStock <= 0 || run.stats.silver <= priceOf(run, id)}
					>
						{curStock <= 0 ? 'Sold out' : `銀 ${priceOf(run, id)}`}
					</button>
				</li>
			{/each}
			{#each stock.riddles as id (id)}
				{@const curStock = stockOf(run, id)}
				<li>
					<span class="g">🗺️</span>
					<span class="n"><b>Riddle map</b><small class="pitch">“{RIDDLES[Number(id.slice(13))].clue}” (solve it from your bag. Scholars at an academy may help.)</small></span>
					<button
						class="buy"
						onclick={() => doBuy(id)}
						disabled={curStock <= 0 || run.stats.silver <= priceOf(run, id)}
					>
						{curStock <= 0 ? 'Sold out' : `銀 ${priceOf(run, id)}`}
					</button>
				</li>
			{/each}
		</ul>
	{:else if tab === 'supplies'}
		<ul class="goods">
			{#each Object.entries(EXTRA_BAGS) as [k, e] (k)}
				{@const full = (run.extraBags ?? []).length >= maxExtraBags(run)}
				{@const needMount = e.mount && !run.mount}
				{@const cant = full || needMount}
				<li>
					<span class="g">{e.glyph}</span>
					<span class="n"><b>{e.name} <small>({e.w}×{e.h})</small></b><small>{e.desc} You carry {(run.extraBags ?? []).length}/{maxExtraBags(run)} extra bags.</small></span>
					<button
						class="buy"
						onclick={() => { const err = buyBag(run, k); msg = err ?? `Strapped on: ${e.name}.`; if (!err) sfx.coin(2); }}
						disabled={cant || run.stats.silver <= bagPrice(run, k)}
					>
						{full ? 'Limit reached' : needMount ? 'Needs mount' : `銀 ${bagPrice(run, k)}`}
					</button>
				</li>
			{/each}
			{#each stock.supplies as id (id)}
				{@const it = ITEMS[id]}
				{@const curStock = stockOf(run, id)}
				{#if it}
					<li>
						<span class="g">{it.glyph}</span>
						<span class="n">
							<b>
								{it.name}
								{#if curStock > 0}<small class="muted">({curStock} left)</small>{/if}
								{#if CONTRABAND_ITEMS.has(id)}<span class="contraband-tag">Contraband</span>{/if}
							</b>
							<small>{it.desc}</small>
						</span>
						<button
							class="buy"
							onclick={() => doBuy(id)}
							disabled={curStock <= 0 || run.stats.silver <= priceOf(run, id)}
						>
							{curStock <= 0 ? 'Sold out' : `銀 ${priceOf(run, id)}`}
						</button>
					</li>
				{/if}
			{/each}
		</ul>
	{:else if tab === 'warehouse'}
		{@const storedHere = warehouseAt(run, run.location)}
		<p class="muted small"><b>{guildTitle(run)}</b> ({t('Guild rank')} {guildRank(run)}/5) · {storedHere.length}/{warehouseCapacity(run)} stored in {cityName(city, run.year)} · {warehouseCities(run).length}/3 warehouse cities active.</p>
		{#if storedHere.length}
			<ul class="goods">
				{#each storedHere as id, i (id + i)}
					{@const it = ITEMS[id]}
					<li>
						<span class="g">{it?.glyph ?? '📦'}</span>
						<span class="n"><b>{it?.name ?? id}</b><small>Stored in {cityName(city, run.year)}</small></span>
						<button class="buy" onclick={() => {
							if (retrieve(run, id, run.location)) msg = `Retrieved: ${it?.name ?? id}.`;
							else msg = 'No room in your bag.';
						}}>⬆ {t('Retrieve')}</button>
					</li>
				{/each}
			</ul>
		{/if}
		{#if run.bag.length}
			<ul class="goods">
				{#each run.bag as id, i (id + i)}
					{@const it = ITEMS[id]}
					<li>
						<span class="g">{it?.glyph ?? '📦'}</span>
						<span class="n"><b>{it?.name ?? id}</b><small>{it?.desc ?? ''}</small></span>
						<button class="buy" disabled={!canStore(run, id, run.location)} onclick={() => {
							if (store(run, id, run.location)) msg = `Stored: ${it?.name ?? id}.`;
							else msg = 'Warehouse full or city limit (3) reached.';
						}}>⬇ {t('Store')}</button>
					</li>
				{/each}
			</ul>
		{:else if !storedHere.length}
			<p class="muted">Nothing in your bag or stored here.</p>
		{/if}
	{:else}
		{#if prizedHere.length > 1}
			<button class="buy sell all" onclick={sellPrized}>⚖️ Sell all {prizedHere.length} curios prized here (+{prizedHere.reduce((a, x) => a + x.v, 0)})</button>
		{/if}
		{#if !sellable.length}<p class="muted">Nothing the dealers here want. (Trade goods go to merchants you meet; relics are priceless.)</p>{/if}
		<ul class="goods">
			{#each sellable as x (x.id + x.i)}
				{@const c = CURIO[x.id]}
				<li>
					<span class="g">{ITEMS[x.id].glyph}</span>
					<span class="n">
						<b>{ITEMS[x.id].name}</b>
						<small>{c ? (c.prized.includes(city.culture) ? '★ Collectors here are delighted.' : c.from.includes(city.culture) ? 'Common here, they barely want it.' : 'A fair price, nothing special.') : 'Second-hand.'}</small>
					</span>
					<button class="buy sell" onclick={() => doSell(x.id)}>+{x.v}</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	[role='dialog']::before {
		content: '';
		display: block;
		height: 10px;
		margin: -14px 0 12px;
		margin-left: -16px;
		margin-right: -16px;
		background: var(--z-pattern);
		border-radius: 14px 14px 0 0;
		opacity: 0.85;
	}
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 9;
	}
	.market {
		position: fixed;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: min(560px, 100vw);
		max-height: 86vh;
		overflow-y: auto;
		background: var(--paper);
		border: 1px solid var(--line);
		border-bottom: 0;
		border-radius: 14px 14px 0 0;
		z-index: 10;
		padding: 14px 16px calc(16px + env(safe-area-inset-bottom));
		box-shadow: 0 -10px 30px var(--shadow);
		animation: up 0.22s ease-out;
	}
	@keyframes up {
		from {
			transform: translate(-50%, 100%);
		}
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	h3 {
		font-family: var(--display);
		font-size: 1.3rem;
		margin: 0;
	}
	.x {
		background: none;
		border: 0;
		font-size: 1.2rem;
		cursor: pointer;
		color: var(--ink);
	}
	.tabs {
		display: flex;
		gap: 4px;
		margin: 10px 0;
		overflow-x: auto;
	}
	.tabs button {
		flex: 1 0 auto;
		padding: 6px 8px;
		border: 1px solid var(--line);
		background: transparent;
		border-radius: 999px;
		font: inherit;
		font-size: 0.85rem;
		color: var(--ink);
		cursor: pointer;
	}
	.tabs button.on {
		background: var(--vermilion);
		color: var(--paper);
		border-color: var(--vermilion);
	}
	.msg {
		background: color-mix(in srgb, var(--gold) 18%, var(--paper));
		border-left: 3px solid var(--gold);
		padding: 6px 10px;
		margin: 0 0 8px;
		font-size: 0.9rem;
	}
	.mirror {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 8px;
	}
	.goods {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 6px;
	}
	.goods li {
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: color-mix(in srgb, var(--paper) 88%, var(--ink));
	}
	.goods li.on {
		border-color: var(--jade);
		box-shadow: inset 3px 0 0 var(--jade);
	}
	.g {
		font-size: 1.6rem;
		width: 2.2rem;
		text-align: center;
		background: none;
		border: 0;
		padding: 0;
		cursor: default;
	}
	button.g {
		cursor: pointer;
	}
	.n {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.n small {
		color: var(--muted);
		font-size: 0.8rem;
	}
	.n .acc {
		color: var(--jade);
	}
	.n .pitch {
		font-style: italic;
	}
	.buy {
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--vermilion);
		background: var(--vermilion);
		color: var(--paper);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.buy.all {
		width: 100%;
		margin-bottom: 8px;
	}
	.buy.sell {
		background: var(--jade);
		border-color: var(--jade);
	}
	.buy:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: 0.85rem;
	}
	.night-market {
		box-shadow: 0 12px 40px rgba(10, 5, 20, 0.7), inset 0 0 20px rgba(200, 50, 40, 0.08);
		border: 1px solid rgba(220, 80, 50, 0.35);
	}
	.night-banner {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		margin: 8px 16px 12px;
		padding: 10px 12px;
		border-radius: 8px;
		background: color-mix(in srgb, #20121b 85%, var(--paper));
		border: 1px solid rgba(230, 90, 60, 0.4);
		font-size: 0.82rem;
		line-height: 1.4;
		color: color-mix(in srgb, #ffd0b0 90%, var(--ink));
	}
	.night-banner span {
		font-size: 1.25rem;
		flex-shrink: 0;
	}
	.contraband-tag {
		display: inline-block;
		margin-left: 6px;
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: rgba(180, 40, 30, 0.2);
		border: 1px solid rgba(220, 60, 40, 0.45);
		color: #e85545;
	}
</style>
