# Toolshop Test Automation

UI and API test automation for **Toolshop** (<https://practicesoftwaretesting.com>), an online
store for hand and power tools, built with Playwright, run in GitHub Actions and reported to
Testomat.io.

The project is run as if automation were being introduced to a real product that has **no
automated tests, no written requirements and no test documentation**. It starts with planning:
the product was explored, requirements were reverse-engineered, risks assessed and effort
estimated before any test code was written.

## Status

| Epic | Scope | When | Status |
|------|-------|------|--------|
| E0. Test Planning | Test plan, strategy, RTM, risk register, estimation | Oct 19 – 24 | ✅ Done ([docs](docs/test-planning/README.md)) |
| E1. Test Management Setup | Testomat.io project, test case template, first 2 real test cases | W1 | ✅ Done ([test cases](test-cases/README.md)) |
| E2. Test Case Design | All 80 test cases written and synced to Testomat.io | W1 | ✅ Done ([test cases](test-cases/README.md)) |
| E3. Automation Framework & Release 1 | First UI + API test, CI regression, Testomat.io reporting; 24 P1 cases gating PRs | W2 – W3 | In progress |
| E4. Regression Automation | 50 P2/P3 functional cases | W3 – W4 | Planned |
| E5. Non-functional & Stabilization | NFR cases, nightly cross-browser run, flaky tests, `with-bugs` run | W5 | Planned |
| E6. Reporting & Sign-off | Test Summary Report, demo | W5 | Planned |

The schedule and milestones are in the [Test Plan](docs/test-planning/01-test-plan.md#9-schedule-and-milestones).

## Test documentation

| Artifact | What it answers |
|----------|-----------------|
| [Test Plan](docs/test-planning/01-test-plan.md) | What is tested and what is not, when, by whom, entry/exit criteria |
| [Test Strategy](docs/test-planning/02-test-strategy.md) | How we test: levels, types, techniques, framework conventions, CI, test management |
| [Requirements Traceability Matrix](docs/test-planning/03-requirements-traceability-matrix.md) | 57 requirements → 80 test cases (47 API, 30 UI, 3 E2E) |
| [Risk Register](docs/test-planning/04-risk-register.md) | Project and product risks, scoring, mitigation; product risk drives test priority |
| [Test Estimation](docs/test-planning/05-test-estimation.md) | Bottom-up estimate per task: 1 engineer, 5 weeks, 137 h of work + 26 h planning, 14% buffer |

## Project structure

```
docs/test-planning/    test plan, strategy, RTM, risk register, estimation
test-cases/            test cases in plain language, one .test.md file per test case
specs/api/<module>/    API tests
specs/e2e/<module>/    browser tests: UI feature tests (@ui) and full journeys (@e2e)
helpers/               API helper and test data generators
pages/                 Page Objects, fragments/ for parts shared by several pages
test-data/             expected values, one file per spec
interfaces/            shared types
constants/             default Toolshop URLs
fixtures/fixtures.ts   Playwright fixtures (API helper, a new customer per test)
docker/                self-hosted Toolshop for CI
.github/workflows/     CI: regression and static analysis
playwright.config.ts   Playwright configuration
tsconfig.json          TypeScript settings for the type check
eslint.config.mjs      ESLint configuration
```

## Getting started

Requirements: Node.js LTS.

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env   # then set the values, see below
```

### Environment variables

| Variable | Purpose | Where it is set |
|----------|---------|-----------------|
| `BASE_URL` | Toolshop UI host, default `https://practicesoftwaretesting.com` | Local `.env` (optional) |
| `API_URL` | Toolshop API host, default `https://api.practicesoftwaretesting.com` | Local `.env` (optional) |
| `TESTOMATIO` | Testomat.io project API key, used to sync test cases and report test runs. When empty, tests run without reporting | Local `.env` (not committed); `TESTOMATIO` repository secret for GitHub Actions |

Variables already set in the environment take precedence over `.env`. To run tests locally
without reporting to Testomat.io, clear the key for that run: `TESTOMATIO= npx playwright test`.

Run tests:

```bash
npm test                              # all tests
npx playwright test --grep @smoke     # smoke suite
npx playwright test --grep @api       # API tests only
npx playwright test --grep @e2e       # full user journeys only
npx playwright show-report            # open the HTML report
npm run typecheck                     # TypeScript type check
npm run lint                          # ESLint, warnings fail too
```

## Test management with Testomat.io

Test cases come first, and automation follows.

1. **Test case.** A case is written in plain language (preconditions, steps, expected result) in
   `test-cases/<module>/<test-case-title>.test.md`, and can be run manually or automated. Cases
   are tagged with the RTM test case ID, level, module, requirement (`REQ-*`, as in the
   [RTM](docs/test-planning/03-requirements-traceability-matrix.md)), `regression` and optionally
   `smoke`, and have a priority (`critical` / `normal` / `low` for P1 / P2 / P3). Format and
   rules:
   [test-cases/README.md](test-cases/README.md).
2. **Sync.** Cases are synced with Testomat.io, which writes their Testomat IDs (`@T…`) back into
   the `.md` files:

   ```bash
   npm run tms:push   # send cases to Testomat.io and write IDs back
   npm run tms:pull   # bring back edits made in the Testomat.io UI
   ```
3. **Automation.** The Playwright test carries the same ID in its title, so CI results land on the
   same case:

```ts
test('Changing quantity recalculates line and cart totals @T1a2b3c4d @ui @cart @regression @P1', async ({ page }) => { … });
```

4. **Reporting.** When `TESTOMATIO` is set, `@testomatio/reporter` sends each run to
   Testomat.io. On push to `main`, CI first imports the automated tests (`npm run tms:import`).
   The import uses `--no-detached`, so the manual cases that are not automated yet stay attached.

Testomat.io shows how many cases exist and how many are automated. Filtering by a `REQ-*` tag
shows the coverage of that requirement.

## CI

| Workflow | Trigger | What it runs |
|----------|---------|--------------|
| [Static analysis](.github/workflows/static-analysis.yml) | Pull request to `main` | `npm run typecheck`, `npm run lint` (no browsers installed) |
| [Regression](.github/workflows/regression.yml) | Push and pull request to `main` | All tests on Chromium, results to Testomat.io, HTML report as an artifact (30 days) |

Both checks are required to merge into `main` (branch protection). The nightly cross-browser run
is added in E5. The pipeline is described in the
[Test Strategy](docs/test-planning/02-test-strategy.md#9-cicd-github-actions).
