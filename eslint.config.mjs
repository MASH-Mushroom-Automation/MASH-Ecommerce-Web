// ESLint configuration for Next.js 16 with Turbopack

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/coverage/**",
      "**/public/**",
      "**/.github/**",
      "**/scripts/**",
      "**/studio/**",
      "**/*.test.{ts,tsx,js}",
      "**/__tests__/**",
      "**/__mocks__/**",
      "jest.setup.js",
      "jest.config.js",
      "jest.calendly.config.js",
      "next-env.d.ts",
    ],
  },
  // Use simplified config to avoid circular dependency issues
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];

export default eslintConfig;
