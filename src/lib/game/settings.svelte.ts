import type { CultureId } from '#lib/data/cultures';

export type IconographyStyle = 'multicultural' | 'heraldic' | 'woodblock';
export type ThemePreference = 'system' | 'light' | 'dark';

class GameSettings {
	iconography = $state<IconographyStyle>('multicultural');
	theme = $state<ThemePreference>('system');

	constructor() {
		if (typeof localStorage !== 'undefined') {
			try {
				const stored = localStorage.getItem('four-seas:iconography') as IconographyStyle;
				if (stored === 'multicultural' || stored === 'heraldic' || stored === 'woodblock') {
					this.iconography = stored;
				}
				const storedTheme = localStorage.getItem('four-seas:theme') as ThemePreference;
				if (storedTheme === 'system' || storedTheme === 'light' || storedTheme === 'dark') {
					this.theme = storedTheme;
					this.applyTheme(storedTheme);
				}
			} catch {}
		}
	}

	setIconography(style: IconographyStyle) {
		this.iconography = style;
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('four-seas:iconography', style);
			} catch {}
		}
	}

	setTheme(theme: ThemePreference) {
		this.theme = theme;
		this.applyTheme(theme);
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('four-seas:theme', theme);
			} catch {}
		}
	}

	private applyTheme(theme: ThemePreference) {
		if (typeof document !== 'undefined') {
			if (theme === 'system') {
				document.documentElement.removeAttribute('data-theme');
			} else {
				document.documentElement.setAttribute('data-theme', theme);
			}
		}
	}
}

export const gameSettings = new GameSettings();

/**
 * Returns the localized/thematic currency symbol based on current culture and iconography setting.
 */
export function currencySymbol(culture: CultureId = 'han', style: IconographyStyle = gameSettings.iconography): string {
	if (style === 'woodblock') return '銀';
	if (style === 'heraldic') return '£';

	// Multicultural adaptive symbols
	switch (culture) {
		case 'han':
		case 'korean':
		case 'viet':
		case 'japanese':
			return '銀';
		case 'persian':
		case 'ottoman':
		case 'swahili':
			return 'د.ع';
		case 'indian':
		case 'tibetan':
			return '₹';
		case 'malay':
		case 'pacific':
			return '🪙';
		case 'european':
			return '£';
		case 'steppe':
			return '🪙';
		default:
			return '銀';
	}
}

/**
 * Returns conveyance/travel mode icon based on iconography style and optional culture.
 */
export function modeGlyph(
	mode: 'sea' | 'river' | 'land' | 'air',
	style: IconographyStyle = gameSettings.iconography,
	culture?: CultureId
): string {
	if (style === 'heraldic') {
		switch (mode) {
			case 'sea':
				return '⛵';
			case 'river':
				return '🚣';
			case 'land':
				return '🐎';
			case 'air':
				return '🎈';
		}
	}
	if (style === 'woodblock') {
		switch (mode) {
			case 'sea':
				return '⛵';
			case 'river':
				return '🛶';
			case 'land':
				return '🐎';
			case 'air':
				return '🪁';
		}
	}
	// Multicultural
	switch (mode) {
		case 'sea':
			return '⛵';
		case 'river':
			return '🛶';
		case 'land':
			// Camels are authentic for arid Central Asian deserts, Persia, and the Levant/Arabia.
			// Everywhere else (Joseon, Japan, China, Siam, India, Europe), travelers ride horses or ponies.
			if (culture === 'steppe' || culture === 'persian' || culture === 'ottoman') {
				return '🐪';
			}
			return '🐎';
		case 'air':
			return '🎈';
	}
}
