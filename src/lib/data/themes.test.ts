import { describe, expect, it, vi } from 'vitest';
import { THEMES, contrastRatio, luminance, themeStyle } from './themes';
import { KEY_HINTS, handleGameKey, isTypingTarget } from '../keys.svelte';
import type { CultureId } from './cultures';

const PAPER = '#f2e8d2';
const PAPER_2 = '#e9dcbf';

const CULTURES: CultureId[] = [
	'han',
	'japanese',
	'korean',
	'viet',
	'siamese',
	'malay',
	'indian',
	'tibetan',
	'steppe',
	'persian',
	'ottoman',
	'swahili',
	'pacific',
	'european'
];

function makeKeyEvent(
	key: string,
	opts: {
		target?: EventTarget | null;
		defaultPrevented?: boolean;
		metaKey?: boolean;
		ctrlKey?: boolean;
		altKey?: boolean;
	} = {}
): KeyboardEvent & { prevented: boolean } {
	let prevented = Boolean(opts.defaultPrevented);
	const ev = {
		key,
		target: opts.target ?? null,
		metaKey: Boolean(opts.metaKey),
		ctrlKey: Boolean(opts.ctrlKey),
		altKey: Boolean(opts.altKey),
		get defaultPrevented() {
			return prevented;
		},
		preventDefault() {
			prevented = true;
		},
		get prevented() {
			return prevented;
		}
	};
	return ev as unknown as KeyboardEvent & { prevented: boolean };
}

describe('themes contrast and WCAG AA audit', () => {
	it('computes luminance and contrastRatio accurately', () => {
		expect(luminance('#000000')).toBeCloseTo(0, 5);
		expect(luminance('#ffffff')).toBeCloseTo(1, 5);
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
		expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 2);
		expect(contrastRatio('#f2e8d2', '#f2e8d2')).toBeCloseTo(1, 5);
	});

	it('ensures all 14 cultures meet >= 4.5:1 contrast for accent, jade, and gold on --paper and --paper-2', () => {
		expect(Object.keys(THEMES)).toHaveLength(14);
		for (const c of CULTURES) {
			const theme = THEMES[c];
			expect(theme, `missing theme for ${c}`).toBeDefined();

			const accentPaper = contrastRatio(theme.accent, PAPER);
			const accentPaper2 = contrastRatio(theme.accent, PAPER_2);
			expect(accentPaper, `${c} accent (${theme.accent}) vs --paper`).toBeGreaterThanOrEqual(4.5);
			expect(accentPaper2, `${c} accent (${theme.accent}) vs --paper-2`).toBeGreaterThanOrEqual(4.5);

			const jadePaper = contrastRatio(theme.jade, PAPER);
			const jadePaper2 = contrastRatio(theme.jade, PAPER_2);
			expect(jadePaper, `${c} jade (${theme.jade}) vs --paper`).toBeGreaterThanOrEqual(4.5);
			expect(jadePaper2, `${c} jade (${theme.jade}) vs --paper-2`).toBeGreaterThanOrEqual(4.5);

			const goldPaper = contrastRatio(theme.gold, PAPER);
			const goldPaper2 = contrastRatio(theme.gold, PAPER_2);
			expect(goldPaper, `${c} gold (${theme.gold}) vs --paper`).toBeGreaterThanOrEqual(4.5);
			expect(goldPaper2, `${c} gold (${theme.gold}) vs --paper-2`).toBeGreaterThanOrEqual(4.5);

			const style = themeStyle(c);
			expect(style).toContain(`--z-accent:${theme.accent}`);
			expect(style).toContain(`--z-jade:${theme.jade}`);
			expect(style).toContain(`--z-gold:${theme.gold}`);
		}
	});
});

describe('keys.svelte keyboard navigation', () => {
	it('exports KEY_HINTS', () => {
		expect(KEY_HINTS).toEqual({
			left: '←',
			right: '→',
			up: '↑',
			journal: 'J',
			bag: 'B',
			close: 'Esc'
		});
	});

	it('handles ArrowLeft, ArrowRight, and ArrowUp card swipes', () => {
		const swipe = vi.fn();
		const actions = {
			canSwipe: () => true,
			hasUp: () => false,
			swipe
		};

		const leftEv = makeKeyEvent('ArrowLeft');
		expect(handleGameKey(leftEv, actions)).toBe(true);
		expect(leftEv.prevented).toBe(true);
		expect(swipe).toHaveBeenLastCalledWith('left');

		const rightEv = makeKeyEvent('ArrowRight');
		expect(handleGameKey(rightEv, actions)).toBe(true);
		expect(rightEv.prevented).toBe(true);
		expect(swipe).toHaveBeenLastCalledWith('right');

		// ArrowUp ignored when hasUp() is false
		const upIgnored = makeKeyEvent('ArrowUp');
		expect(handleGameKey(upIgnored, actions)).toBe(false);
		expect(upIgnored.prevented).toBe(false);
		expect(swipe).toHaveBeenCalledTimes(2);

		// ArrowUp triggers swipe('up') when hasUp() is true
		const upEv = makeKeyEvent('ArrowUp');
		expect(handleGameKey(upEv, { ...actions, hasUp: () => true })).toBe(true);
		expect(upEv.prevented).toBe(true);
		expect(swipe).toHaveBeenLastCalledWith('up');
	});

	it('dismisses outcome on Enter, Space, and Arrow keys when hasOutcome is true', () => {
		const dismissOutcome = vi.fn();
		const swipe = vi.fn();
		const actions = {
			hasOutcome: () => true,
			canSwipe: () => true,
			dismissOutcome,
			swipe
		};

		for (const key of ['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp']) {
			const ev = makeKeyEvent(key);
			expect(handleGameKey(ev, actions)).toBe(true);
			expect(ev.prevented).toBe(true);
		}
		expect(dismissOutcome).toHaveBeenCalledTimes(5);
		expect(swipe).not.toHaveBeenCalled();
	});

	it('selects routes 1..9 when inMap is true', () => {
		const selectRoute = vi.fn();
		const actions = {
			inMap: () => true,
			selectRoute
		};

		for (let i = 1; i <= 9; i++) {
			const ev = makeKeyEvent(String(i));
			expect(handleGameKey(ev, actions)).toBe(true);
			expect(ev.prevented).toBe(true);
			expect(selectRoute).toHaveBeenLastCalledWith(i - 1);
		}

		const zeroEv = makeKeyEvent('0');
		expect(handleGameKey(zeroEv, actions)).toBe(false);
	});

	it('toggles journal on J, bag on B, and triggers undo on Z', () => {
		const toggleTab = vi.fn();
		const undo = vi.fn();
		const actions = { toggleTab, undo };

		expect(handleGameKey(makeKeyEvent('j'), actions)).toBe(true);
		expect(toggleTab).toHaveBeenLastCalledWith('journal');

		expect(handleGameKey(makeKeyEvent('J'), actions)).toBe(true);
		expect(toggleTab).toHaveBeenLastCalledWith('journal');

		expect(handleGameKey(makeKeyEvent('b'), actions)).toBe(true);
		expect(toggleTab).toHaveBeenLastCalledWith('bag');

		expect(handleGameKey(makeKeyEvent('z'), actions)).toBe(true);
		expect(undo).toHaveBeenCalledTimes(1);
	});

	it('closes modal on Escape when hasModal is true', () => {
		const closeModal = vi.fn();
		const swipe = vi.fn();

		const escOpen = makeKeyEvent('Escape');
		expect(
			handleGameKey(escOpen, {
				hasModal: () => true,
				canSwipe: () => true,
				closeModal,
				swipe
			})
		).toBe(true);
		expect(escOpen.prevented).toBe(true);
		expect(closeModal).toHaveBeenCalledTimes(1);

		// Does not swipe while modal is open
		const leftWhileModal = makeKeyEvent('ArrowLeft');
		expect(
			handleGameKey(leftWhileModal, {
				hasModal: () => true,
				canSwipe: () => true,
				closeModal,
				swipe
			})
		).toBe(false);
		expect(swipe).not.toHaveBeenCalled();

		// Escape returns false when no modal is open
		const escClosed = makeKeyEvent('Escape');
		expect(handleGameKey(escClosed, { hasModal: () => false, closeModal })).toBe(false);
		expect(escClosed.prevented).toBe(false);
	});

	it('ignores keys when focused inside an input, textarea, select, or contenteditable', () => {
		const swipe = vi.fn();
		const toggleTab = vi.fn();
		const actions = {
			canSwipe: () => true,
			swipe,
			toggleTab
		};

		const inputTarget = { tagName: 'INPUT', isContentEditable: false } as unknown as EventTarget;
		const textareaTarget = { tagName: 'TEXTAREA', isContentEditable: false } as unknown as EventTarget;
		const editableTarget = { tagName: 'DIV', isContentEditable: true } as unknown as EventTarget;

		expect(isTypingTarget(inputTarget)).toBe(true);
		expect(isTypingTarget(textareaTarget)).toBe(true);
		expect(isTypingTarget(editableTarget)).toBe(true);
		expect(isTypingTarget({ tagName: 'BUTTON', isContentEditable: false } as unknown as EventTarget)).toBe(
			false
		);

		expect(handleGameKey(makeKeyEvent('ArrowLeft', { target: inputTarget }), actions)).toBe(false);
		expect(handleGameKey(makeKeyEvent('j', { target: textareaTarget }), actions)).toBe(false);
		expect(handleGameKey(makeKeyEvent('b', { target: editableTarget }), actions)).toBe(false);
		expect(swipe).not.toHaveBeenCalled();
		expect(toggleTab).not.toHaveBeenCalled();
	});
});
