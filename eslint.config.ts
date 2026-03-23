import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint"

export default defineConfig([
	{
		files: ["./app/**/*.{ts,tsx}"],
		ignores: ["./app/**/*.{test,spec}.{ts,tsx}", "./app/test/*", "./app/domain/test/*"],
		plugins: {
			js,
			tseslint,
		},
		extends: ["js/recommended", "tseslint/recommended"],
		rules: {
			"no-unused-vars": "off",
    	"@typescript-eslint/no-unused-vars": ["warn", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }]
		},
	},
]);
