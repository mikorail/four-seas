import { CITY, cityName } from '#lib/data/world';
import { CULTURES } from '#lib/data/cultures';
import { FAITHS, IDEALS } from '#lib/data/faiths';
import { PERK } from '#lib/data/traits';
import { ITEMS } from '#lib/data/items';
import type { Run } from '#lib/game/types';

/** Escapes HTML special characters. */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Formats simple markdown bold/italic tags into safe HTML. */
function formatRich(text: string): string {
	const escaped = escapeHtml(text);
	return escaped
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Generates a complete, beautiful, standalone HTML book document representing the hero's journey journal. */
export function generateJournalBookHtml(run: Run): string {
	const hero = run.hero;
	const culture = CULTURES[hero.culture];
	const destName = cityName(CITY[run.destination], run.year);
	const faith = FAITHS[hero.faith as keyof typeof FAITHS];
	const ideal = IDEALS[hero.ideal as keyof typeof IDEALS];
	const prof = PERK[hero.profession];

	// Group log entries into chapters by place
	interface Chapter {
		place: string;
		startDay: number;
		endDay: number;
		entries: typeof run.log;
	}

	const chapters: Chapter[] = [];
	let current: Chapter | null = null;

	for (const l of run.log) {
		const place = l.place || 'The Open Road';
		if (!current || current.place !== place) {
			current = { place, startDay: l.day, endDay: l.day, entries: [l] };
			chapters.push(current);
		} else {
			current.endDay = l.day;
			current.entries.push(l);
		}
	}

	const chaptersHtml = chapters
		.map((ch, idx) => {
			const entriesHtml = ch.entries
				.map((e) => {
					if (e.situation) {
						return `
				<article class="entry">
					<div class="entry-meta">
						<span class="day-stamp">Day ${e.day}</span>
						${e.who ? `<span class="speaker">${escapeHtml(e.who)}</span>` : ''}
					</div>
					${e.scene ? `<p class="scene">${formatRich(e.scene)}</p>` : ''}
					<p class="situation">${formatRich(e.situation)}</p>
					${e.choice ? `<div class="choice-record">
						<span class="choice-glyph">❧</span>
						<span class="choice-text">${formatRich(e.choice)}</span>
					</div>` : ''}
					${e.outcome ? `<p class="outcome">${formatRich(e.outcome)}</p>` : ''}
				</article>`;
					} else {
						return `
				<article class="entry chronicle-note">
					<span class="day-stamp">Day ${e.day}</span>
					<p class="narrative">${formatRich(e.text)}</p>
				</article>`;
					}
				})
				.join('\n');

			return `
		<section class="chapter" id="chapter-${idx + 1}">
			<header class="chapter-header">
				<span class="chapter-number">Chapter ${idx + 1}</span>
				<h2 class="chapter-title">${escapeHtml(ch.place)}</h2>
				<span class="chapter-dates">Days ${ch.startDay}–${ch.endDay}</span>
			</header>
			<div class="chapter-body">
				${entriesHtml}
			</div>
		</section>`;
		})
		.join('\n');

	// Final ending / epilogue
	const endingHtml = run.ending
		? `
		<section class="epilogue">
			<div class="ornament">❖ ❖ ❖</div>
			<h2>${escapeHtml(run.ending.title)}</h2>
			<span class="epilogue-status">${run.ending.won ? 'Journey Fulfilled' : 'Journey’s End'}</span>
			<p class="epilogue-text">${formatRich(run.ending.text)}</p>
		</section>`
		: `
		<section class="epilogue ongoing">
			<div class="ornament">❖ ❖ ❖</div>
			<h2>The Road Continues</h2>
			<p class="epilogue-text">At Day ${run.day}, ${escapeHtml(hero.name)} rests in ${escapeHtml(cityName(CITY[run.location], run.year))}, still pressing toward ${escapeHtml(destName)}.</p>
		</section>`;

	// Relics & Companions list
	const relics = run.bag.filter((id) => ITEMS[id]?.kind === 'relic');
	const relicsHtml = relics.length
		? `<div class="appendix-section">
				<h3>Sacred Relics Carried</h3>
				<ul>${relics.map((id) => `<li><strong>${escapeHtml(ITEMS[id]?.name ?? id)}</strong>: ${escapeHtml(ITEMS[id]?.desc ?? '')}</li>`).join('')}</ul>
		   </div>`
		: '';

	const crewHtml = run.crew.length
		? `<div class="appendix-section">
				<h3>Companions of the Road</h3>
				<ul>${run.crew.map((c) => `<li><strong>${escapeHtml(c.npc.name)}</strong> (${escapeHtml(c.npc.title)})</li>`).join('')}</ul>
		   </div>`
		: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>The Travels of ${escapeHtml(hero.name)} (${run.year})</title>
	<style>
		@page {
			size: 6in 9in;
			margin: 0.8in;
		}
		:root {
			--paper: #fbf8f1;
			--ink: #26211a;
			--accent: #8b261e;
			--line: #ded3bf;
			--muted: #746b5e;
			--font-serif: 'Cormorant Garamond', 'EB Garamond', Garamond, Georgia, serif;
		}
		* { box-sizing: border-box; }
		body {
			margin: 0;
			padding: 40px 20px;
			background: var(--paper);
			color: var(--ink);
			font-family: var(--font-serif);
			font-size: 17px;
			line-height: 1.6;
		}
		.book-container {
			max-width: 680px;
			margin: 0 auto;
		}
		.print-action {
			display: flex;
			justify-content: flex-end;
			margin-bottom: 24px;
		}
		.print-btn {
			background: var(--accent);
			color: #fff;
			border: none;
			padding: 8px 18px;
			font-family: inherit;
			font-size: 15px;
			letter-spacing: 0.05em;
			border-radius: 4px;
			cursor: pointer;
			box-shadow: 0 2px 6px rgba(0,0,0,0.15);
		}
		.print-btn:hover {
			opacity: 0.9;
		}
		@media print {
			.print-action { display: none; }
			body { padding: 0; background: #fff; }
			.chapter { page-break-before: always; }
			.epilogue { page-break-before: always; }
		}

		/* Title Page */
		.title-page {
			text-align: center;
			padding: 80px 20px 60px;
			border-bottom: 2px double var(--line);
			margin-bottom: 50px;
		}
		.book-subtitle {
			font-size: 14px;
			letter-spacing: 0.25em;
			text-transform: uppercase;
			color: var(--muted);
			margin-bottom: 16px;
		}
		.book-title {
			font-size: 42px;
			font-weight: 600;
			color: var(--accent);
			margin: 0 0 16px;
			line-height: 1.15;
		}
		.motto {
			font-style: italic;
			font-size: 19px;
			color: var(--muted);
			margin: 0 0 32px;
		}
		.hero-meta {
			display: inline-block;
			text-align: left;
			font-size: 14px;
			line-height: 1.8;
			border-top: 1px solid var(--line);
			border-bottom: 1px solid var(--line);
			padding: 16px 24px;
			color: var(--ink);
		}
		.hero-meta div {
			margin: 4px 0;
		}
		.commission-card {
			margin-top: 36px;
			font-size: 15px;
			color: var(--muted);
		}

		/* Chapters */
		.chapter {
			margin-bottom: 60px;
		}
		.chapter-header {
			text-align: center;
			margin-bottom: 30px;
			padding-bottom: 15px;
			border-bottom: 1px solid var(--line);
		}
		.chapter-number {
			display: block;
			font-size: 13px;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: var(--muted);
			margin-bottom: 4px;
		}
		.chapter-title {
			font-size: 28px;
			font-weight: 600;
			color: var(--ink);
			margin: 0 0 4px;
		}
		.chapter-dates {
			font-size: 13px;
			font-style: italic;
			color: var(--muted);
		}

		/* Entries */
		.entry {
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 1px dotted var(--line);
		}
		.entry:last-child {
			border-bottom: none;
		}
		.entry-meta {
			display: flex;
			justify-content: space-between;
			font-size: 12px;
			letter-spacing: 0.1em;
			text-transform: uppercase;
			color: var(--muted);
			margin-bottom: 8px;
		}
		.speaker {
			color: var(--accent);
			font-weight: 600;
		}
		.scene {
			font-style: italic;
			color: var(--muted);
			margin: 0 0 8px;
			padding-left: 12px;
			border-left: 2px solid var(--line);
		}
		.situation {
			margin: 0 0 10px;
			font-size: 18px;
		}
		.choice-record {
			display: flex;
			align-items: baseline;
			gap: 8px;
			font-size: 15px;
			color: var(--ink);
			margin: 8px 0;
			padding: 4px 10px;
			background: rgba(139, 38, 30, 0.05);
			border-radius: 3px;
		}
		.choice-glyph {
			color: var(--accent);
			font-size: 16px;
		}
		.choice-text {
			font-weight: 600;
		}
		.outcome {
			margin: 8px 0 0;
			font-size: 16px;
			color: var(--ink);
		}
		.chronicle-note {
			font-style: italic;
			color: var(--muted);
		}

		/* Epilogue */
		.epilogue {
			text-align: center;
			padding: 40px 20px;
			margin-top: 50px;
			border-top: 2px double var(--line);
		}
		.ornament {
			font-size: 20px;
			color: var(--accent);
			margin-bottom: 16px;
		}
		.epilogue h2 {
			font-size: 32px;
			color: var(--accent);
			margin: 0 0 8px;
		}
		.epilogue-status {
			display: block;
			font-size: 13px;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: var(--muted);
			margin-bottom: 24px;
		}
		.epilogue-text {
			font-size: 19px;
			line-height: 1.7;
			max-width: 580px;
			margin: 0 auto;
		}

		/* Appendix */
		.appendix {
			margin-top: 60px;
			padding-top: 30px;
			border-top: 1px solid var(--line);
			font-size: 14px;
		}
		.appendix-section {
			margin-bottom: 24px;
		}
		.appendix-section h3 {
			font-size: 16px;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 0.1em;
			margin: 0 0 10px;
		}
		.appendix-section ul {
			padding-left: 20px;
			margin: 0;
		}
		.appendix-section li {
			margin-bottom: 6px;
		}
		.colophon {
			text-align: center;
			margin-top: 50px;
			font-size: 12px;
			color: var(--muted);
			letter-spacing: 0.1em;
		}
	</style>
</head>
<body>
	<div class="book-container">
		<div class="print-action">
			<button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
		</div>

		<header class="title-page">
			<span class="book-subtitle">A Four Seas Journal · Anno Domini ${run.year}</span>
			<h1 class="book-title">The Travels of ${escapeHtml(hero.name)}</h1>
			<p class="motto">“${escapeHtml(hero.motto)}”</p>
			
			<div class="hero-meta">
				<div><strong>Culture:</strong> ${escapeHtml(culture.label)} · <strong>Calling:</strong> ${escapeHtml(prof?.name ?? hero.profession)}</div>
				<div><strong>Faith:</strong> ${escapeHtml(faith?.name ?? hero.faith)} · <strong>Ideal:</strong> ${escapeHtml(ideal?.name ?? hero.ideal)}</div>
				<div><strong>Departure:</strong> ${escapeHtml(cityName(CITY[run.visited[0] ?? run.location], run.year))} · <strong>Destination:</strong> ${escapeHtml(destName)}</div>
			</div>

			<div class="commission-card">
				<em>Entrusted by ${escapeHtml(run.patron)} to carry ${escapeHtml(run.item)}.</em>
			</div>
		</header>

		<main class="chapters">
			${chaptersHtml}
		</main>

		${endingHtml}

		<footer class="appendix">
			${relicsHtml}
			${crewHtml}
			<div class="colophon">
				Record transcribed from the Four Seas chronicle · Seed: <code>${escapeHtml(run.seed)}</code>
			</div>
		</footer>
	</div>
</body>
</html>`;
}

/** Triggers a browser download of the journal book. */
export function downloadJournalBook(run: Run): void {
	const html = generateJournalBookHtml(run);
	const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	const safeName = run.hero.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	a.href = url;
	a.download = `journal-${safeName}-${run.year}.html`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
