<script lang="ts">
	import VenueIcon from './VenueIcon.svelte';
	import { energyMax, venuesHere, venueUsed } from '#lib/game/market';
	import type { VenueId } from '#lib/data/venues';
	import type { Run } from '#lib/game/types';
	import { citySecurityProfile, DISTRICTS, type DistrictKind } from '#lib/data/districts';
	import { notableOfCity } from '#lib/data/notables';

	let {
		run,
		onvisit,
		onmarket,
		onrest,
		onhangout = () => {},
		onbuilding = () => {}
	}: {
		run: Run;
		onvisit: (id: VenueId) => void;
		onmarket: () => void;
		onrest: () => void;
		onhangout?: () => void;
		onbuilding?: (district: DistrictKind, bldId: string) => void;
	} = $props();

	const max = $derived(energyMax(run));
	const left = $derived(Number.isFinite(max) ? Math.min(max, run.energy ?? max) : Infinity);
	const venues = $derived(venuesHere(run));
	const shop = (id: VenueId) => id === 'market' || id === 'bazaar';
	const sec = $derived(citySecurityProfile(run.location));
	const notable = $derived(notableOfCity(run.location, run.year));
	let showDistricts = $state(false);
</script>

<!-- The places you can walk to in town. -->
<div class="energy-row" aria-label="Energy">
	<div class="energy">
		{#if Number.isFinite(max)}
			<span title="Actions remaining in town today. Rest or a new city restores it.">⚡ {#each { length: max } as _, i}<i class:on={i < left}></i>{/each}</span>
			{#if left === 0}<button class="rest" onclick={onrest}>{'☾'} Rest a day</button>{/if}
		{:else}
			<span title="This mission sets no limit">⚡ ∞</span>
		{/if}
	</div>
	<div class="city-subactions">
		<button class="action-pill hangout-pill" disabled={left <= 0} onclick={onhangout} title="Socialize with {notable.name} ({notable.title})">
			🍵 Hangout: {notable.name}
		</button>
		<button class="action-pill district-pill" onclick={() => (showDistricts = !showDistricts)} title="{sec.desc}">
			{sec.order === 'notorious-crime' ? '🏮' : sec.order === 'lawful' ? '🛡️' : sec.order === 'peaceful' ? '⛩️' : '🏙️'} Districts {showDistricts ? '▲' : '▼'}
		</button>
	</div>
</div>

{#if showDistricts}
	<div class="districts-panel">
		<div class="sec-banner">
			<span class="sec-badge">{sec.order === 'notorious-crime' ? '🏮 Lawless Haven' : sec.order === 'lawful' ? '🛡️ Lawful Bastion' : sec.order === 'peaceful' ? '⛩️ Sacred Peace' : '🏙️ Tiered Metropolis'}</span>
			<small class="sec-desc">{sec.desc}</small>
		</div>
		<div class="districts-grid">
			{#each sec.districts as dId}
				{@const d = DISTRICTS[dId]}
				<div class="district-box">
					<div class="d-title">{d.glyph} {d.name}</div>
					<div class="bld-list">
						{#each d.buildings as bld}
							<button class="bld-item" disabled={left <= 0} onclick={() => { showDistricts = false; onbuilding(d.id, bld.id); }} title="{bld.desc}">
								<span class="bld-g">{bld.glyph}</span>
								<span class="bld-n">{bld.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<nav class="venues" aria-label="Places in town">
	{#each venues as v (v.id)}
		{@const used = venueUsed(run, v.id) && !shop(v.id)}
		{@const tired = left <= 0 && !venueUsed(run, v.id)}
		<button class="v" class:shop={shop(v.id)} class:lm={v.id === 'landmark'} class:hurt={!!v.damaged} disabled={used || tired || v.closed} onclick={() => (shop(v.id) ? onmarket() : onvisit(v.id))} title="{v.name}: {v.damaged ? `Damaged: ${v.damaged}.` : v.blurb}{v.closed ? ' (closed)' : used ? ' (visited)' : tired ? ' (too tired: rest first)' : ''}">
			<VenueIcon id={v.id} shape={v.shape} />
			<span>{v.name}{#if v.damaged}<i class="dmg"> · {v.closed ? 'destroyed' : 'damaged'}</i>{/if}</span>
		</button>
	{/each}
</nav>

<style>
	.energy-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		margin-top: 4px;
		padding: 2px 4px;
	}
	.energy {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.energy i {
		display: inline-block;
		width: 9px;
		height: 9px;
		margin-left: 3px;
		border-radius: 50%;
		border: 1px solid var(--gold);
		vertical-align: middle;
	}
	.energy i.on {
		background: var(--gold);
	}
	.rest {
		font: inherit;
		font-size: 0.78rem;
		padding: 3px 10px;
		border-radius: var(--radius-md, 8px);
		border: 1px solid var(--jade);
		background: transparent;
		color: var(--jade);
		cursor: pointer;
		min-height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.city-subactions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.action-pill {
		font: inherit;
		font-size: 0.75rem;
		padding: 3px 9px;
		border-radius: var(--radius-md, 8px);
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 28px;
	}
	.action-pill:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.hangout-pill {
		border-color: var(--gold);
		color: var(--ink);
		font-weight: 500;
	}
	.district-pill {
		border-color: var(--vermilion);
		font-weight: 600;
	}
	.districts-panel {
		margin: 6px 0;
		padding: 8px 10px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--paper) 95%, var(--ink));
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.sec-banner {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.sec-badge {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--vermilion);
	}
	.sec-desc {
		color: var(--muted);
		font-size: 0.75rem;
	}
	.districts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: 6px;
		margin-top: 4px;
	}
	.district-box {
		padding: 6px;
		border-radius: 6px;
		background: var(--paper);
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.d-title {
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--ink);
		border-bottom: 1px solid var(--line);
		padding-bottom: 2px;
	}
	.bld-list {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.bld-item {
		font: inherit;
		font-size: 0.72rem;
		padding: 3px 6px;
		border-radius: 4px;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--paper) 90%, var(--gold));
		color: var(--ink);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		text-align: left;
	}
	.bld-item:hover:not(:disabled) {
		border-color: var(--jade);
		background: color-mix(in srgb, var(--jade) 10%, var(--paper));
	}
	.bld-item:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.bld-g {
		font-size: 0.85rem;
	}
	.bld-n {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.venues {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		padding: 4px 2px 8px;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.venues::-webkit-scrollbar {
		display: none;
	}
	.v {
		flex: none;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px 4px 4px;
		border-radius: var(--radius-md, 8px);
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		max-width: 15rem;
		min-height: 30px;
	}
	.v span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.v.shop {
		border-color: var(--vermilion);
		font-weight: 600;
	}
	.v.lm {
		border-color: var(--gold);
	}
	.v:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.dmg {
		color: var(--vermilion);
		font-style: italic;
	}
	@media (pointer: coarse) {
		.action-pill,
		.rest {
			min-height: 44px;
			padding: 8px 14px;
			font-size: 0.84rem;
		}
		.v {
			min-height: 44px;
			padding: 6px 14px 6px 6px;
			font-size: 0.88rem;
		}
		.bld-item {
			min-height: 44px;
			padding: 8px 10px;
			font-size: 0.84rem;
		}
	}
</style>
