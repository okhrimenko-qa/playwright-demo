# Test Plan — Toolshop Test Automation, Release 1.0

| Field | Value |
|-------|-------|
| Document ID | QA-TP-001 |
| Version | 1.1 (approved): re-planned to 5 weeks, 1 engineer |
| Author | QA Automation Engineer |
| Date | 2026-10-25 |
| Product | Toolshop web store: UI <https://practicesoftwaretesting.com>, API <https://api.practicesoftwaretesting.com> (OpenAPI v5.0.0) |
| Related | [Test Strategy](02-test-strategy.md) · [RTM](03-requirements-traceability-matrix.md) · [Risk Register](04-risk-register.md) · [Estimation](05-test-estimation.md) |

## 1. Introduction

Toolshop is an online store for hand and power tools. Customers browse and search the catalog,
manage a cart, check out with one of five payment methods and track their invoices. Admins manage
the catalog, orders, users and messages. The product has **no automated tests and no written
requirements**. This plan describes how QA introduces a maintainable automated regression suite
(UI + API) that runs in GitHub Actions and reports to Testomat.io.

**Objectives**

1. Write all test cases as readable steps, stored in the repository and synced to Testomat.io, so
   each case can be run manually or automated. Target: **week 1**.
2. Protect the revenue-critical flows (checkout, payment, authentication, authorization) with an
   automated P1 suite that gates every pull request. Target: **week 3**.
3. Build a full regression suite covering ≥ 95% of in-scope requirements. Target: **week 4**.
4. Make quality visible: every CI run is reported to Testomat.io and traced to requirements.

## 2. Test items

| Item | Version / location |
|------|--------------------|
| Toolshop UI (Angular SPA) | practicesoftwaretesting.com, current public version |
| Toolshop REST API (Laravel) | api.practicesoftwaretesting.com, OpenAPI 5.0.0 |
| Fault-seeded variant (for suite effectiveness checks) | api-with-bugs.practicesoftwaretesting.com, with-bugs.practicesoftwaretesting.com |

## 3. Scope

### 3.1 In scope

| Module | Features | Priority |
|--------|----------|----------|
| Authentication | Registration, password policy, login, lockout, logout, token refresh, forgot password | P1/P2 |
| Customer account | Profile, change password, **object- and role-level authorization** | P1/P2 |
| Catalog | List, pagination, search, filters (category, brand, price), sorting, product details, stock, rentals | P1/P2 |
| Cart | Add, update quantity, remove, persistence, quantity validation | P1/P2 |
| Checkout & payment | Registered and guest checkout, address validation, 5 payment methods, invalid payment data, invoice totals | **P1** |
| Invoices | Order history, invoice details, PDF download | P2/P3 |
| Favorites, Contact | Add/remove favorites; contact form with validation and attachment | P2/P3 |
| Administration | Brands, categories, products CRUD; order status; messages; user search; reports; write-access protection | P1–P3 |
| i18n | Language switcher | P3 |
| Non-functional | API contract, response-time budget, accessibility (axe), cross-browser smoke, mobile smoke, sensitive data exposure | P2/P3 |

Full list: 57 requirements, 80 test cases in the [RTM](03-requirements-traceability-matrix.md).

### 3.2 Out of scope

| Item | Reason |
|------|--------|
| Unit / component tests | Owned by development; no source access |
| Load, stress, soak testing | Shared public environment, would affect other users |
| Penetration testing | Needs an authorized engagement; only basic authz checks are in scope |
| TOTP 2FA | Deferred to release 2 (needs TOTP tooling and secret handling) |
| Social login, live sales stream (SSE), visual regression | See RTM "Out of scope" |
| Fixing defects in the application | Third-party product; QA reports defects only |

## 4. Approach (summary)

Detailed in the [Test Strategy](02-test-strategy.md):

- **Risk-based prioritization:** P1 first (product risks P-01…P-05).
- **API-first:** business rules verified via API, UI tests verify presentation and interaction,
  3 E2E journeys cover the critical paths end to end.
- **Own test data:** tests create users, carts and orders through the API. Shared accounts are
  read-only (R-01).
- **Test cases first, then automation:** each test case is written in plain language
  (preconditions, steps, expected result) in `test-cases/<module>/<test-case-title>.test.md` and
  synced to Testomat.io. A case is automated only after it has a Testomat ID and has been
  reviewed. The automated test carries the same ID, so results land on the same case.
- **Build on demand:** framework code (clients, fixtures, Page Objects) is added only when a test
  needs it.
- **CI:** regression on push and PRs to `main` (P1 required for merge); nightly full run with
  cross-browser smoke from week 5.

## 5. Test environment

| Component | Details |
|-----------|---------|
| Primary environment | Public Toolshop (UI + API), shared with other users, DB reset periodically |
| Defect-detection environment | `with-bugs` variant, nightly only, results used for the effectiveness metric |
| Fallback environment | Self-hosted Docker Compose of the application (if R-01/R-02 trigger) |
| Browsers | Chromium (all suites); Firefox, WebKit (nightly smoke); Pixel 7 emulation (mobile smoke) |
| Runtime | Node.js LTS, `@playwright/test`, GitHub-hosted `ubuntu-latest` runners |
| Test management | Testomat.io project, API key in GitHub Secret `TESTOMATIO` |
| Test accounts | Generated per run (`qa+<run>-<worker>@example.com`). Seed admin account for admin tests only |

## 6. Entry criteria

Testing (automation implementation) starts when:

- [x] This Test Plan and the RTM baseline are reviewed and approved by the PO (all P1 requirements confirmed).
- [ ] The Testomat.io project is created and the API key is stored in GitHub Secrets.
- [ ] The OpenAPI spec is available at a stable URL.
- [ ] The repository has the CI workflow enabled and branch protection on `main`.

Automating a single test case starts when (Definition of Ready):

- [ ] The case exists in `test-cases/<module>/<test-case-title>.test.md` with preconditions,
  steps and expected result.
- [ ] The case has a Testomat ID and has been reviewed.

The environment's reachability from GitHub Actions (R-02) is checked by the first CI run in E3-1.
If Cloudflare blocks the runners, the fallback environment is used.

## 7. Exit criteria

Release 1.0 of the suite is complete when:

- [ ] **100% of P1 test cases** are automated and passing, or failing only on a PO-accepted known defect (`test.fail()` + defect link).
- [ ] **≥ 90% of P2** and **≥ 60% of P3** test cases are automated.
- [ ] **≥ 95% of in-scope requirements** have at least one automated test (Testomat coverage by `@REQ-*` tag).
- [ ] Pass rate **≥ 95%** (excluding known defects) on **3 consecutive nightly runs**.
- [ ] Flaky rate **< 2%** over the last 10 runs; smoke **< 5 min**, regression **< 20 min**.
- [ ] No open **S1/S2** defects without a PO-accepted decision.
- [ ] The suite catches at least **70% of seeded defects** on the `with-bugs` variant.
- [ ] The Test Summary Report is published.

## 8. Suspension and resumption criteria

| Suspend when | Resume when |
|--------------|-------------|
| Environment unavailable or blocked by Cloudflare for > 4 h | Environment reachable, or the switch to the fallback env is done |
| An S1 defect blocks login or the catalog (> 50% of tests fail for one cause) | Defect fixed or workaround agreed, smoke green |
| Database reset during a run invalidates results | Re-run after the reset window |
| Major unannounced UI/API change (> 20% of tests broken by selectors/contract) | Impact assessed, re-estimation approved |

## 9. Schedule and milestones

1 engineer, **137 h** of work in **5 weeks** (160 h capacity at 32 h/week, buffer 14%, at least
11% every week). The planning week is already done. Hours per task are in the
[Estimation](05-test-estimation.md#3-estimate-by-week).

### Epics

| # | Epic | Hours | Weeks | Done when |
|---|------|------:|-------|-----------|
| E0 | Test Planning ✅ | 26 | Oct 19 – 24 | Planning artifacts written and approved by the PO |
| E1 | Test Management Setup | 4 | W1 | 2 real test cases (TC-AUTH-007, TC-AUTH-008) are in Testomat.io with IDs; `.test.md` format fixed |
| E2 | Test Case Design | 24 | W1 | All 80 test cases are in Testomat.io with IDs and can be run manually |
| E3 | Automation Framework & Release 1 (P1) | 35 | W2 – W3 | 24 P1 cases automated; regression runs in CI, reports to Testomat.io and blocks PRs on P1 failure |
| E4 | Regression Automation | 50 | W3 – W4 | 50 P2/P3 functional cases automated |
| E5 | Non-functional & Stabilization | 19 | W5 | 6 NFR cases automated, nightly run, flaky tests fixed, `with-bugs` run done |
| E6 | Reporting & Sign-off | 5 | W5 | Test Summary Report published |

E2 is split by functionality, about 20 cases per task: Authentication & Account; Cart, Checkout &
Orders; Catalog & Product pages; Admin, Contact & Non-functional. E3 and E4 use the same groups,
so a module is automated as soon as its cases are written. E3 starts with one UI and one API test
(TC-AUTH-007, TC-AUTH-008), together with only the structure, config, CI workflow and Testomat.io
reporting those two tests need.

E4 hours include 5 h of failure triage and defect reports.

### Timeline

| Week | Dates (2026) | Work | Milestone |
|------|-------------|------|-----------|
| 0 | Oct 19 – 24 | E0: exploratory session, test artifacts (this document set), PO review and approval | **M0: Planning artifacts approved** ✅ |
| 1 | Oct 26 – 30 | E1: Testomat.io setup, 2 real test cases; E2: remaining 78 test cases | **M1: All test cases in Testomat.io** |
| 2 | Nov 2 – 6 | E3: first UI + API test, CI regression workflow, Testomat.io reporting, Cloudflare check on CI; P1 automation starts | M2a: First CI run reported to Testomat.io |
| 3 | Nov 9 – 13 | E3: remaining P1 cases, P1 required for merge; E4 starts | **M2: Release 1. P1 suite gates PRs to `main`** · control point (R-12) |
| 4 | Nov 16 – 20 | E4: P2/P3 automation by module | **M3: Regression suite complete** |
| 5 | Nov 23 – 27 | E5: NFR, nightly + cross-browser, stabilization, `with-bugs` run; E6: Test Summary Report, demo | **M4: Exit criteria measured** · **M5: Release 1.0 of the suite signed off** |

**Scope-cut rule (R-12):** if fewer than 60% of the 74 functional cases are automated by the end
of week 3, P3 cases move to the release-2 backlog and stay in Testomat.io as manual test cases.

## 10. Roles and responsibilities (RACI)

R = Responsible, A = Accountable, C = Consulted, I = Informed

| Activity | QA Automation Engineer | QA Lead | Product Owner | Dev Lead | DevOps |
|----------|:--:|:--:|:--:|:--:|:--:|
| Test strategy and plan | R | A | C | C | I |
| Requirements baseline and open questions | R | I | A | C | — |
| Framework and test implementation | R/A | C | — | C (code review) | — |
| CI/CD pipeline and secrets | R | I | — | I | A |
| Test environment availability | C | I | I | A/R | C |
| Defect reporting and triage | R | C | A (priority) | R (fix) | — |
| Exit-criteria sign-off | R | A | C | I | I |
| Test summary report | R | A | I | I | I |

In this project one person is both QA Automation Engineer and QA Lead. The RACI shows how the
responsibilities split in a full team.

## 11. Deliverables

| Deliverable | When | Where |
|-------------|------|-------|
| Test Strategy, Test Plan, RTM, Risk Register, Estimation | W0 (done) | `docs/test-planning/` |
| Test cases (80) | W1 | `test-cases/<module>/<test-case-title>.test.md`, synced to Testomat.io |
| Automation framework and test suite | W2 → W5 | `specs/`, `pages/`, `helpers/`, `fixtures/`, `test-data/` |
| CI workflows: regression (W2), nightly (W5) | W2, W5 | `.github/workflows/` |
| Testomat.io project with test cases and run history | W1 → | Testomat.io |
| Defect reports | Ongoing | GitHub Issues (`bug` label), linked to TC |
| Weekly status (progress vs plan, risks, defects) | Weekly | GitHub Discussions / status note |
| Test Summary Report | W5 | `docs/test-summary-report.md` |

## 12. Resources and tools

| Resource | Purpose | Cost |
|----------|---------|------|
| 1 QA Automation Engineer, 5 weeks + planning week | Planning, test cases, framework, tests, reporting | See [Estimation §5](05-test-estimation.md#5-cost) |
| Playwright Test (TypeScript) | UI + API test runner | Open source |
| `@axe-core/playwright` | Accessibility checks | Open source |
| JSON schema validator (e.g. Ajv) | API contract checks against OpenAPI | Open source |
| GitHub + GitHub Actions | Repo, CI, issues | Free (public repo) |
| Testomat.io + `check-tests` + `@testomatio/reporter` | Test cases synced from the repository, run reporting | Free plan |

## 13. Risks

The main risks and their mitigations are in the [Risk Register](04-risk-register.md). The ones that
affect this plan directly:

- **R-01 Shared environment** → own test data per test; fallback env.
- **R-02 Cloudflare on CI** → regular browser user agent; checked by the first CI run in week 2,
  before most UI tests are written.
- **R-03 No requirements** → requirement baseline approved by the PO during planning; open questions Q-01…Q-06 tracked in the RTM.
- **R-12 Aggressive estimate** → weekly buffer ≥ 11%, control points, scope-cut rule (§9).

## 14. Approvals

| Role | Name | Decision | Date |
|------|------|----------|------|
| QA Lead | | Approved | 2026-10-24 |
| Product Owner | | Approved | 2026-10-24 |
| Dev Lead | | | |
