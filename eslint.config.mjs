import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jest from "eslint-plugin-jest";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {ignores: ["dist", "build", "node_modules"]},

  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {argsIgnorePattern: "^_", varsIgnorePattern: "^_"},
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/prefer-readonly": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
    },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals["shared-node-browser"],
      },
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },

  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/__mocks__/**",
      "**/test/**",
      "**/tests/**",
    ],
    plugins: {jest},
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    rules: {
      ...jest.configs.recommended.rules,
      "jest/no-conditional-expect": "off",
    },
  },

  {
    files: ["webpack.config.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
  },
);
