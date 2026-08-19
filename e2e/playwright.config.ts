import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./spec",
  testIgnore: /\.student\./,
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: "http://localhost:5174",
    actionTimeout: 10000,
  },
  webServer: [
    {
      command: "cd ../backend && rm -f seedswap-test.db && DB_PATH=seedswap-test.db node seed.ts && PORT=3002 DB_PATH=seedswap-test.db node server.ts",
      port: 3002,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: "cd ../frontend && BACKEND_PORT=3002 npx vite --port 5174",
      port: 5174,
      reuseExistingServer: false,
    },
  ],
});
