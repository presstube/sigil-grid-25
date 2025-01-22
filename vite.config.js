import { defineConfig } from "vite";
import wrapAAPlugin from "./wrapAAPlugin";

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [wrapAAPlugin()],
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				main: 'index.html',
				integration: 'integration.html',
				lib: 'src/art.js'
			},
			output: {
				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name === 'lib') {
						return 'art-core-sigil-grid-25.js'
					}
					return 'assets/[name]-[hash].js'
				}
			}
		}
	}
});
