// vite.config.js
import { defineConfig } from "vite";
import wrapAAPlugin from "./wrapAAPlugin.js";

export default defineConfig(({ command }) => {
	if (command === "serve") {
		// Dev server configuration
		return {
			root: "src",
			server: {
				open: "/index.html",
			},
			plugins: [wrapAAPlugin()],
		};
	} else {
		// Production build configuration
		return {
			build: {
				lib: {
					entry: "./src/art.js",
					name: "ArtSystem",
					fileName: (format) => `art.core.js`,
					formats: ["es"],
				},
				outDir: "dist",
			},
			plugins: [wrapAAPlugin()],
		};
	}
});
