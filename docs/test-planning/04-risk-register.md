# Risk Register — Toolshop Test Automation

| Field | Value |
|-------|-------|
| Document ID | QA-RSK-001 |
| Version | 1.2: R-02 occurred in E3-1 (Cloudflare challenge after login) |
| Date | 2026-10-27 |
| Review cadence | Weekly, at the QA status sync. Owner updates status and score |

## Scoring

- **Likelihood (L)** and **Impact (I)** on a 1–5 scale. **Score = L × I**.
- 🔴 **High** ≥ 15: needs an active mitigation before the related work starts.
- 🟠 **Medium** 8–14: mitigation planned, monitored weekly.
- 🟢 **Low** ≤ 7: accepted and monitored.
- For **product risks** the score drives test priority: score ≥ 10 → **P1**, 6–9 → **P2**,
  ≤ 5 → **P3** (see [RTM](03-requirements-traceability-matrix.md)).

---

## 1. Project and environment risks

| ID | Risk | Evidence / trigger | L | I | Score | Mitigation | Contingency | Owner | Status |
|----|------|--------------------|---|---|------:|------------|-------------|-------|--------|
| R-01 | **Shared public environment**: other users change data, lock accounts or delete entities while our tests run | Observed 2026-10-24: `customer@practicesoftwaretesting.com` locked ("too many failed attempts") | 5 | 4 | 🔴 20 | Every test creates its own data via the API (unique email per worker, own cart/invoices). Seed accounts are used only for read-only checks. No assertions on global counts | Run against a self-hosted Docker env of the same version (Q-06) | QA | Open |
| R-02 | **Cloudflare challenge blocks UI tests on CI**: headless browsers are detected; GitHub-hosted runners use datacenter IPs that may be challenged as well | Verified locally 2026-10-24: headless Chromium with the default `HeadlessChrome` user agent → 403 "Just a moment..."; the same browser with a regular Chrome user agent → 200, products rendered. **Occurred 2026-10-27 (E3-1), locally, before CI:** with the regular user agent the first page load passes, but after login the app does a full page load of `/account` (`window.location.href`), which gets a Cloudflare Turnstile challenge (403) in 3 of 3 headless runs; headed Chromium passed 1 of 2 runs. Datacenter-IP behaviour not verified yet | 5 | 5 | 🔴 25 | Regular Chrome `userAgent` in `playwright.config.ts` (enough for single page loads only). API tests target the API host, which has no challenge | Self-hosted env inside the CI job (Docker Compose service), which also removes R-01; headed mode via `xvfb-run` (unreliable locally); or a self-hosted runner | QA / DevOps | Occurred: UI login test fails, fallback to be chosen |
| R-03 | **No requirements documentation**: expected results may be wrong, causing false passes/failures and rework | No spec available; requirements reverse-engineered | 5 | 3 | 🔴 15 | Baseline requirements in the RTM, approved by the PO during planning; open-questions log (Q-01…Q-06). Tests for unconfirmed rules are marked in the RTM | Treat unconfirmed behaviour as "current behaviour" (characterization tests) and flag it | QA / PO | Open |
| R-04 | **Periodic database reset**: IDs and seed data change, runs that span the reset fail | Seed records have the current day's `created_at` | 4 | 3 | 🟠 12 | Never hard-code IDs: look up by name/slug at runtime. Schedule nightly away from the reset window (Q-05) | Re-run the failed job automatically once | QA | Open |
| R-05 | **Flaky tests** erode trust in the suite | Typical for UI suites on shared envs | 3 | 4 | 🟠 12 | Web-first assertions, test isolation, `data-test` selectors, retries only on CI, flaky-rate metric, 2-day quarantine policy | Move to `@quarantine`, exclude from merge gate | QA | Open |
| R-06 | **Unannounced application changes** (new version of UI/API) break tests | Public demo with multiple app versions (v1–v5) | 3 | 3 | 🟠 9 | Schema checks detect contract changes early; nightly run; selectors on `data-test` attributes | Pin `baseURL` to a versioned instance if available | QA | Open |
| R-07 | **Single QA engineer** (bus factor, illness, priority shifts) | Team of one | 2 | 4 | 🟠 8 | Readable code with conventions, docs in repo, PR review by a developer, plan prioritized so that P1 ships first | Re-plan scope: P3 deferred | QA Lead | Open |
| R-08 | **API rate limiting / throttling** when tests run in parallel | Not observed yet (7 rapid calls → all 200) | 2 | 3 | 🟢 6 | Limit workers on CI; API client retries on HTTP 429 with backoff | Reduce parallelism | QA | Monitoring |
| R-09 | **Scope creep**: admin/reporting areas and new features grow the backlog | 90+ API operations, many admin-only | 3 | 2 | 🟢 6 | Scope fixed in Test Plan §3; changes go through PO and re-estimation | Push to release 2 | QA Lead / PO | Open |
| R-10 | **Test management integration issues** (Testomat.io key, plan limits, ID sync conflicts; an automated test with a case's ID may not link to the `.md` case as expected, or a later `push` may reset its automated status) | New tool on the project; server-side linking not verified yet | 2 | 3 | 🟢 6 | E1 and E3-1 verify the full chain on 2 real cases before the other 78 are written and automated. Reporter enabled only when `TESTOMATIO` is set, so tests run without the TMS. Testomat IDs committed to the repository | Keep cases in `.md` as documentation and link them to automated tests through the `REQ-*` tag; HTML report + GitHub job summary as fallback | QA | Open |
| R-11 | **Secrets leakage** (API key, admin password in repo or logs) | `.env` used locally | 2 | 4 | 🟠 8 | `.env` in `.gitignore`, `.env.example` without values, GitHub Secrets, no credentials in test titles/traces | Rotate key immediately | QA / DevOps | Mitigated |
| R-12 | **Aggressive estimate**: the 5-week plan has no P90 reserve, and an overrun on the per-test rates eats the buffer | Estimation v1.1: 137 h of work in 160 h capacity (buffer 14%, ≥ 11% per week) vs. the v1.0 baseline of 287 h | 3 | 3 | 🟠 9 | Buffer ≥ 11% every week. Control point after the first 10 UI tests (re-estimate if off by > 30%). Priority order P1 → P2 → P3 | End of week 3: if < 60% of the 74 functional cases are automated, P3 moves to the release-2 backlog and stays in Testomat.io as manual cases | QA Lead | Open |

## 2. Product risks (drive test priority)

| ID | Risk (what can go wrong for the business) | Area | L | I | Score | Test priority | Covered by |
|----|-------------------------------------------|------|---|---|------:|---------------|------------|
| P-01 | Customers cannot complete checkout or pay → direct revenue loss | CHK | 3 | 5 | 🔴 15 | P1 | REQ-CHK-01…06 |
| P-02 | **Authorization bypass**: a customer reads other customers' data, or catalog data is changed without admin rights | ACC, ADM | 3 | 5 | 🔴 15 | P1 | REQ-ACC-03, REQ-ADM-08 (see Q-01: brand write endpoints look unauthenticated) |
| P-03 | Wrong cart/invoice totals → financial and legal impact | CART, CHK | 3 | 4 | 🟠 12 | P1 | REQ-CART-02, REQ-CHK-06 |
| P-04 | Users cannot register or log in → no returning customers | AUTH | 2 | 5 | 🟠 10 | P1 | REQ-AUTH-01, 05, 06 |
| P-05 | Product search/details broken → customers cannot find products | CAT | 2 | 5 | 🟠 10 | P1 | REQ-CAT-02, 07 |
| P-06 | Filters/sorting return wrong products → poor conversion | CAT | 3 | 3 | 🟠 9 | P2 | REQ-CAT-01, 03–06, 08 |
| P-07 | Account lockout / password rules weak or broken → security and support load | AUTH, ACC | 2 | 4 | 🟠 8 | P2 | REQ-AUTH-02, 03, 07, 08; REQ-ACC-01, 02 |
| P-08 | Admin cannot manage catalog/orders → operational delays | ADM | 2 | 4 | 🟠 8 | P2 | REQ-ADM-01, 03, 04 |
| P-09 | Sensitive data exposed or API contract broken for clients | NFR | 2 | 4 | 🟠 8 | P2 | REQ-NFR-01, 06 |
| P-10 | Order history / contact form broken → support load | INV, CON | 2 | 3 | 🟢 6 | P2 | REQ-INV-01, REQ-CON-01, 02 |
| P-11 | Browser-specific defects on Firefox/Safari | NFR | 2 | 3 | 🟢 6 | P2 | REQ-NFR-04 |
| P-12 | Secondary features broken (favorites, PDF, rentals, reports, postcode lookup, refresh token) | various | 2 | 2 | 🟢 4 | P3 | REQ-FAV-*, REQ-INV-02, REQ-CAT-09, REQ-ADM-02, 05–07, … |
| P-13 | Accessibility barriers on key pages | NFR | 2 | 2 | 🟢 4 | P3 | REQ-NFR-03, 05 |
| P-14 | Missing or wrong translations | I18N | 3 | 1 | 🟢 3 | P3 | REQ-I18N-01 |

## 3. Risk heat map (current)

| Likelihood ↓ / Impact → | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **5** | | | 🔴 R-03 | 🔴 R-01 | 🔴 R-02 |
| **4** | | | 🟠 R-04 | | |
| **3** | 🟢 P-14 | 🟢 R-09 | 🟠 R-06, R-12, P-06 | 🟠 R-05, P-03 | 🔴 P-01, P-02 |
| **2** | | 🟢 P-12, P-13 | 🟢 R-08, R-10, P-10, P-11 | 🟠 R-07, R-11, P-07, P-08, P-09 | 🟠 P-04, P-05 |
| **1** | | | | | |
