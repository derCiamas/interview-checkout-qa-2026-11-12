import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    ...devices['Desktop Chrome']
  },
  webServer: [
    {
      command: 'dotnet run --project ../backend/Checkout.Api --urls http://127.0.0.1:5080',
      url: 'http://127.0.0.1:5080/health',
      reuseExistingServer: false,
      timeout: 120000
    },
    {
      command: 'npm start',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: false,
      timeout: 120000
    }
  ]
});
