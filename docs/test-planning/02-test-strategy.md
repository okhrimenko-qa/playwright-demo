# Test Strategy — Toolshop

| Field | Value |
|-------|-------|
| Document ID | QA-STR-001 |
| Version | 1.1 (approved): test cases as plain-language `.test.md` files; CI workflows added on demand |
| Author | QA Automation Engineer |
| Date | 2026-10-25 |
| Related | [Test Plan](01-test-plan.md), [RTM](03-requirements-traceability-matrix.md), [Risk Register](04-risk-register.md) |

## 1. Purpose

Define the long-lived testing approach for Toolshop: which test levels and types we apply, which
tools and conventions we use, and how test results flow into reporting. The Test Plan applies this
strategy to the concrete first release of automation.

## 2. Context and constraints

- **Black-box access only.** QA has the deployed application and the OpenAPI spec, not the source
  code or the database. Unit and component tests stay with the development team and are out of QA scope.
- **Shared public environment.** Other people use the same instance at the same time. Data can change
  or be locked at any moment, and it is reset periodically.
- **No written requirements.** The baseline requirements were reverse-engineered (see RTM). Every
  requirement has to be confirmed by the PO before its tests count toward exit criteria.

## 3. Approach

**Risk-based testing.** We prioritize each requirement by *likelihood × business impact*
(see [Risk Register](04-risk-register.md)). P1 areas (checkout, payments, authentication,
authorization) are automated first and gate every merge.

**API-first test pyramid (adapted for black-box):**

```
            ┌───────────────┐
            │  E2E  (~5%)   │  3 critical user journeys, long and expensive
            ├───────────────┤
            │  UI feature   │  page behaviour, validation, UI-only logic
            │   (~35%)      │  (data prepared through the API)
            ├───────────────┤
            │  API (~60%)   │  business rules, negative cases, authz,
            │               │  contract/schema
            └───────────────┘
```

Planned distribution from the RTM: 47 API / 30 UI / 3 E2E test cases (80 total).

Rule of thumb: **if a rule can be verified through the API, verify it there.** The UI layer checks
that the UI *exposes* the rule correctly. It doesn't re-check every data permutation.

## 4. Test levels

| Level | Owner | What it covers | In QA scope |
|-------|-------|----------------|-------------|
| Unit / component | Dev | Functions, Angular components, Laravel classes | No |
| API integration | QA | Endpoint behaviour, validation, status codes, authz, contracts | **Yes** |
| System (UI) | QA | Pages and features through the browser, data seeded via API | **Yes** |
| End-to-end | QA | Full user journeys across UI + API (browse → cart → checkout → invoice) | **Yes** |
| Acceptance (UAT) | PO | Business sign-off on requirements | Supported |

### UI tests vs. E2E tests

The two terms answer different questions. **UI** describes the *interface* a test uses (the
browser). **E2E** describes the *scope* (a complete user journey across modules). They overlap,
but they are not the same thing, and this project keeps them separate:

| | UI (feature) test | E2E test |
|---|---|---|
| Scope | One page or feature | A business journey across several modules |
| Setup | Preconditions created through the API (user, cart, login state), then the test opens the target page directly | The user goes through the journey step by step, with minimal shortcuts |
| Example | Sort the catalog by price; registration form validation | Login → search → add to cart → address → payment → confirmation → order shown in "My invoices" |
| Finds | Defects in a single feature's UI | Integration gaps between modules (payment succeeds but no invoice is created) |
| Cost | Fast, stable | Slow, more fragile, expensive to maintain |
| Planned | 30 test cases | 3 test cases |

A browser test is not automatically E2E: checking sorting in the UI is a UI test. And E2E does not
require the UI: the same purchase journey can be run with API calls only. Keeping most browser tests
at feature level, with setup through the API, keeps the suite fast and stable. Full journeys are
reserved for the few flows where an integration failure would cost the most (P-01).

The distinction is a classification for planning and reporting. In the code, both kinds live in
`specs/e2e/` and are told apart by the `@ui` / `@e2e` tag (see §7).

## 5. Test types

| Type | Applied | How | Tooling |
|------|---------|-----|---------|
| Functional (positive/negative) | Yes | Equivalence partitioning, boundary values, decision tables (payment methods) | Playwright |
| Contract / schema | Yes | Response bodies validated against the published OpenAPI schemas | Playwright `request` + JSON schema validator |
| Security (basic) | Yes, limited | Authentication, authorization (role and object level, i.e. IDOR), no sensitive data leaks | Playwright `request` |
| Smoke | Yes | ≤ 5 min subset for quick local checks and the nightly cross-browser run | Tag `@smoke` |
| Regression | Yes | Full suite, nightly + on PR to `main` | Tag `@regression` |
| Cross-browser | Yes, limited | Smoke on Chromium, Firefox, WebKit; full suite on Chromium | Playwright projects |
| Responsive | Yes, limited | Smoke on one mobile viewport (Pixel 7) | Playwright device emulation |
| Accessibility | Yes, limited | No *critical/serious* WCAG 2.1 AA violations on key pages | `@axe-core/playwright` |
| Performance | Response-time budget only | Assert p95 latency for catalog endpoints in API tests | Playwright |
| Load / stress | **No** | Shared public environment, so load tests would affect other users | — |
| Penetration testing | **No** | Requires an authorized engagement | — |
| Visual regression | **No (phase 1)** | Seed data changes, so visual tests would be flaky. Revisit with a self-hosted env | — |
| Exploratory | Yes | Time-boxed charters per module, findings feed the RTM | Session notes |

## 6. Test design techniques

- **Equivalence partitioning / boundary values:** registration fields (max lengths from the spec,
  password length 7/8), cart quantity (0, 1, negative, non-numeric), price range filter.
- **Decision table:** payment method × details validity (5 methods × valid/invalid).
- **State transition:** invoice status lifecycle (admin changes status → customer sees it), account
  lockout (n failed logins → locked).
- **Pairwise:** catalog filters (category × brand × sort × price) to keep combinations manageable.
- **Error guessing:** IDOR on invoices/users, expired token, double submit on checkout.

## 7. Automation framework

| Concern | Decision |
|---------|----------|
| Language / runner | TypeScript + `@playwright/test` (one runner for UI and API) |
| Structure | `specs/api/<module>` for API tests; `specs/e2e/<module>` for **all browser tests**, UI feature tests and full journeys alike. The level is set by a tag (`@ui` or `@e2e`), not by the folder, so a separate folder for 3 journeys isn't needed and `--grep @e2e` still runs them on their own. Page Object Model in `pages`, API helper and test data generators in `helpers`, expected values in `test-data`, fixtures in `fixtures/fixtures.ts`. Playwright projects: `api` (no browser, `specs/api`) and `chromium` (`specs/e2e`) |
| Test data | **Each test creates its own data** through the API (fresh user per worker, own cart). Shared demo accounts are used only for read-only checks |
| Auth | Login once per worker through the API, reuse `storageState` for UI, bearer token for API |
| Selectors | `data-test` attributes first, then role/label locators. CSS/XPath only as a last resort |
| Waiting | Web-first assertions only, no `waitForTimeout` |
| Configuration | `baseURL` / `API_URL` via `.env`, which lets the same suite target prod, the *with-bugs* variant or a self-hosted Docker env |
| Flakiness policy | `retries: 2` on CI. A test that passes only on retry is reported as *flaky* and gets fixed or quarantined (`@quarantine`) within 2 days |
| Code quality | Static analysis on every PR: type check (`npm run typecheck`: `tsc --noEmit`, `strict`) and ESLint (`npm run lint`) with `typescript-eslint` (type-checked rules) and `eslint-plugin-playwright` (catches a missing `await`, `test.only`, `waitForTimeout`). Warnings fail the check (`--max-warnings=0`). `forbidOnly` on CI, PR review for test code |

## 8. Test management: Testomat.io

### Test cases are written first, in plain language

- A test case describes **what to do, not how to code it**: preconditions, numbered steps and the
  expected result. The same case can be run manually or automated.
- Test cases live in the repository, one file per test case, grouped in a folder per product
  module and named after the case title: `test-cases/<module>/<test-case-title>.test.md` (e.g.
  `auth/Customer logs in with valid credentials via the login form.test.md`). The
  repository is the source of truth. Testomat.io is kept in sync with `check-tests`:
  `npm run tms:push` sends cases to Testomat.io, `npm run tms:pull` brings back edits made in its
  UI. Testomat IDs (`@T…` for cases, `@S…` for suites) are written into the `.md` files. The
  format and writing rules are in [`test-cases/README.md`](../../test-cases/README.md).
- **Grouping by tags only.** Each file has a technical suite named like the case, because
  Testomat.io does not import a case without a suite. Suites carry no meaning: cases are grouped
  and selected only by tags (the smoke set is every case tagged `smoke`, the UI set every case
  tagged `ui`, and so on).

```markdown
<!-- test
priority: critical
tags: TC-CART-003, ui, cart, REQ-CART-02, regression
-->
## Changing quantity recalculates line and cart totals

## Preconditions

- Customer is logged in.
- Cart contains 1 × "Combination Pliers".

## Steps

1. Open the cart page.
*Expected*: The cart shows 1 × "Combination Pliers".
2. Change the quantity of "Combination Pliers" from 1 to 3.
*Expected*: The line total equals unit price × 3, and the cart total is updated to the new line total.
```

- **Steps** use the Testomat.io steps format: `## Steps` with a numbered list, and an
  `*Expected*:` line under each step that has a checkable result.
- **Case tags:** test case ID (`TC-…`, the RTM row), level (`api`, `ui`, `e2e`), module
  (`auth`, `cart`, … as the folder name), requirement (`REQ-…`, links the case to the
  [RTM](03-requirements-traceability-matrix.md)), `regression` (every case), optionally `smoke`.
- **Priority** is the Testomat.io `priority` field, mapped from the RTM priority: P1 →
  `critical`, P2 → `normal`, P3 → `low`.

### Automated tests reference the case by ID

- A case is automated only when it is ready: it is in a `.test.md` file, has a Testomat ID and
  has been reviewed.
- The automated test carries the **same Testomat ID** in its title, so Testomat.io treats it as
  the same case and attaches run results to it:
  `test('Changing quantity recalculates line and cart totals @T1a2b3c4d @ui @P1', …)`.
- Run tags in automated test titles (`@api` / `@ui` / `@e2e`, module such as `@auth`,
  `@regression`, `@smoke`, `@P1`–`@P3`) repeat the case tags and its priority (`critical` →
  `@P1`, `normal` → `@P2`, `low` → `@P3`). CI selects what to run only by these tags with
  `--grep` (e.g. the smoke run is `--grep @smoke`: every test tagged `smoke`). The requirement
  link lives on the case (`REQ-*` tag).
- **Runs:** CI reports every run to Testomat.io via `@testomatio/reporter` (`TESTOMATIO_TITLE`
  holds the CI run number and branch). The reporter is enabled only when `TESTOMATIO` is set. On
  push to `main`, CI first imports the automated tests (`npm run tms:import`, `check-tests` with
  `--no-detached`, so that manual cases not automated yet are not marked as detached). Manual runs
  of not-yet-automated cases are logged in the same project.
- **Coverage:** Testomat.io shows how many cases exist and how many of them are automated. The
  `REQ-*` tag shows coverage per requirement.

## 9. CI/CD (GitHub Actions)

| Trigger | Suite | Browsers | Blocking |
|---------|-------|----------|----------|
| Pull request to `main` | Static analysis: type check + ESLint | — | Yes |
| Push and pull request to `main` | Regression (full functional suite) | Chromium | Yes, for P1 failures |
| Nightly (cron), from week 5 | Full suite + cross-browser smoke + a11y | Chromium, Firefox, WebKit | Report only |

Workflows are added when they are needed: static analysis
([`static-analysis.yml`](../../.github/workflows/static-analysis.yml)) and regression
([`regression.yml`](../../.github/workflows/regression.yml)) came with the first tests (E3-1),
nightly comes with the non-functional work (E5). Both PR checks are required by branch protection
on `main`. While every automated test is P1, the whole regression job is the P1 gate. When P2/P3
tests are added (E4), P1 tests move to a separate required job. The `@smoke` tag selects a quick
subset for local runs.

Artifacts: HTML report and traces on failure (30 days), Testomat.io run link in the job summary.
Secrets (`TESTOMATIO`, test credentials) live in GitHub Secrets only.

## 10. Defect management

- Severity: **S1 Blocker** (checkout/login impossible), **S2 Critical** (wrong totals, authz bypass),
  **S3 Major** (feature broken with a workaround), **S4 Minor** (cosmetic, text).
- Defect report: steps, expected vs actual, environment, Playwright trace/screenshot, linked TC.
- A test that fails because of a known defect is marked `test.fail()` with a link to the defect, so
  the suite stays green and the test starts failing once the bug is fixed.

## 11. Metrics

- Requirement coverage: % of P1/P2 requirements with ≥ 1 passing automated test.
- Pass rate per run, flaky rate (target < 2%), suite duration (smoke < 5 min, regression < 20 min).
- Defect detection on the *with-bugs* variant: % of seeded defects caught by the suite.
- Defects found by automation vs. by exploratory testing.
