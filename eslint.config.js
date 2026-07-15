import globals from "globals";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

const styling = {
  indent: [
    "error",
    2,
    {
      SwitchCase: 1,
    },
  ],

  "linebreak-style": ["error", "unix"],
  quotes: ["error", "double"],
  semi: ["error", "always"],
  "no-console": 0,

  // Prettier integration - this runs Prettier through ESLint
  "prettier/prettier": [
    "error",
    {
      endOfLine: "lf",
      trailingComma: "es5",
      singleQuote: false,
    },
  ],
  "no-warning-comments": [
    "warn",
    {
      terms: ["todo", "fixme"],
      location: "start",
    },
  ],
};
export default defineConfig([
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        tsConfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
      },
    },
    plugins: {
      prettier: prettier,
    },

    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,
      ...styling,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      prettier: prettier,
    },
    rules: {
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme"],
          location: "start",
        },
      ],
      ...styling,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintConfigPrettier,
]);
