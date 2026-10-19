import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { generateContent } from './scripts/content.mjs';

/** Re-bundle Markdown cards/campaigns whenever they change. */
function content(): Plugin {
	return {
		name: 'four-seas-content',
		buildStart() {
			generateContent();
		},
		configureServer(server) {
			server.watcher.add('src/content');
			server.watcher.on('all', (_e, file) => {
				if (file.includes('/src/content/') && file.endsWith('.md')) generateContent();
			});
		}
	};
}

export default defineConfig({
	// don't reload the dev page when tests rebuild the production bundle or write reports
	// one dev port, always: 5173 (fails loudly instead of silently picking another)
	server: { port: 5173, strictPort: true, watch: { ignored: ['**/build/**', '**/test-results/**', '**/playwright-report/**'] } },
	plugins: [
		content(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '200.html' }),
			// registered by PwaBar in production only — the dev server cannot serve a module service worker
			serviceWorker: { register: false }
		})
	]
});
