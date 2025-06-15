import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, import: eslintPluginImport },
    extends: ["js/recommended"],
    rules: {
      allowimportingtsextensions: "on",
      "import/extensions": ["error", "ignorePackages", { "ts": "always", "js": "never" }]
    }
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
]);
