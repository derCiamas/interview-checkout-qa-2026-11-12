# Checkout discount codes

A small checkout application for reviewing discount-code requirements and automated tests.

## Stack

- .NET 10, ASP.NET Core Web API, C# and xUnit
- Angular and TypeScript
- Playwright Test

## Review exercise

Read the [issue](https://github.com/derCiamas/interview-checkout-qa-2026-11-12/issues) and the [pull request](https://github.com/derCiamas/interview-checkout-qa-2026-11-12/pulls). Review the requirements and existing automated tests, identify important gaps, and propose additional test scenarios. The discussion is intended to take approximately 15 minutes; a detailed source-code review is not expected.

The application and tests are on the pull request branch. Check it out locally before using the commands below.

## Run locally

Prerequisites: .NET 10 SDK, Node.js 24 and npm.

```sh
dotnet run --project backend/Checkout.Api --urls http://localhost:5080
```

In another terminal:

```sh
cd frontend
npm ci
npm start
```

Open http://localhost:4200. Use `SUMMER20` to try a discount. Prices are in PLN.

## Tests

```sh
dotnet test backend/Checkout.Api.Tests
cd frontend
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

The Playwright configuration starts the API and frontend automatically.
