import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		rollupOptions: {
			input: {
				popup: path.resolve(__dirname, "index.html"),
				background: path.resolve(__dirname, "src/background.ts"),
			},
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].[hash].js",
				assetFileNames: "[name].[hash].[ext]",
			},
		},
	},
});
