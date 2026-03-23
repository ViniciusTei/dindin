import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint"

export default defineConfig([
	{
		files: ["./app/**/*.{ts,tsx}"],
		ignores: ["./app/**/*.{test,spec}.{ts,tsx}", "./app/test/*"],
		plugins: {
			js,
			tseslint,
		},
		extends: ["js/recommended", "tseslint/recommended"],
		rules: {
			"no-unused-vars": "warn",
		},
	},
]);
