export interface KeyActions {
	canSwipe?: () => boolean;
	hasOutcome?: () => boolean;
	hasUp?: () => boolean;
	inMap?: () => boolean;
	hasModal?: () => boolean;
	swipe?: (dir: 'left' | 'right' | 'up') => void;
	dismissOutcome?: () => void;
	selectRoute?: (index: number) => void; // 0-based index for keys 1..9
	toggleTab?: (tab: 'bag' | 'self' | 'people' | 'world' | 'ledger' | 'journal') => void;
	closeModal?: () => void;
	undo?: () => void;
}

export const KEY_HINTS = {
	left: '←',
	right: '→',
	up: '↑',
	journal: 'J',
	bag: 'B',
	close: 'Esc'
} as const;

export function isTypingTarget(target: EventTarget | null): boolean {
	if (!target || typeof target !== 'object') return false;
	if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
			return true;
		}
		const ce = target.getAttribute?.('contenteditable');
		return ce === 'true' || ce === '';
	}
	const el = target as {
		tagName?: unknown;
		isContentEditable?: unknown;
		getAttribute?: (name: string) => string | null;
	};
	const tag = typeof el.tagName === 'string' ? el.tagName.toUpperCase() : '';
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true) {
		return true;
	}
	const ce = typeof el.getAttribute === 'function' ? el.getAttribute('contenteditable') : null;
	return ce === 'true' || ce === '';
}

export function handleGameKey(e: KeyboardEvent, actions: KeyActions): boolean {
	if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) {
		return false;
	}

	const modalOpen = Boolean(actions.hasModal?.());

	if (e.key === 'Escape') {
		if (modalOpen) {
			actions.closeModal?.();
			e.preventDefault();
			return true;
		}
		return false;
	}

	if (!modalOpen && actions.hasOutcome?.()) {
		if (
			e.key === 'Enter' ||
			e.key === ' ' ||
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight' ||
			e.key === 'ArrowUp'
		) {
			actions.dismissOutcome?.();
			e.preventDefault();
			return true;
		}
	}

	if (!modalOpen && actions.canSwipe?.()) {
		if (e.key === 'ArrowLeft') {
			actions.swipe?.('left');
			e.preventDefault();
			return true;
		}
		if (e.key === 'ArrowRight') {
			actions.swipe?.('right');
			e.preventDefault();
			return true;
		}
		if (e.key === 'ArrowUp' && actions.hasUp?.()) {
			actions.swipe?.('up');
			e.preventDefault();
			return true;
		}
	}

	if (!modalOpen && actions.inMap?.()) {
		if (e.key >= '1' && e.key <= '9') {
			actions.selectRoute?.(Number(e.key) - 1);
			e.preventDefault();
			return true;
		}
	}

	if (e.key === 'j' || e.key === 'J') {
		actions.toggleTab?.('journal');
		e.preventDefault();
		return true;
	}

	if (e.key === 'b' || e.key === 'B') {
		actions.toggleTab?.('bag');
		e.preventDefault();
		return true;
	}

	if (e.key === 'z' || e.key === 'Z') {
		actions.undo?.();
		e.preventDefault();
		return true;
	}

	return false;
}
