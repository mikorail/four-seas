import { defineConfig } from 'vitest/config';

// Engine tests only — no Svelte plugin needed. `#lib/*` resolves via package.json "imports".
export default defineConfig({
	test: { include: ['src/**/*.test.ts'], environment: 'node' }
});
