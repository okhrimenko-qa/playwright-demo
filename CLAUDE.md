# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Playwright UI and API test automation for Toolshop (<https://practicesoftwaretesting.com>), run as if
automation were being introduced to a real product: planning docs first, then plain-language test
cases, then automated tests. The work is split into epics and tasks (`E3-1`, ...); the status is in
[README.md](README.md).

Black-box access only: the deployed app and its OpenAPI spec, no source code or database.

## Commands

```bash
npm ci
npx playwright install --with-deps chromium

npm test                                             # all tests
npx playwright test specs/api/auth/getUserToken.spec.ts   # one file
npx playwright test -g "Customer logs in"            # by title
npx playwright test --project=api                    # api or chromium
npx playwright test --grep '@smoke'                  # by tag
npx playwright show-report

npm run typecheck                                    # tsc --noEmit, covers all .ts files
npm run lint                                         # warnings fail too
```

Quote tags: in PowerShell an unquoted `@smoke` is parsed as a variable and the command fails.

Both `typecheck` and `lint` are required PR checks, along with the regression run.

`.env` is optional. Empty `BASE_URL` / `API_URL` fall back to the public demo (`constants/index.ts`),
so `.env.example` must keep them empty rather than hold placeholders. The reporter turns on whenever
`TESTOMATIO` is non-empty, so a local run with the key set reports to Testomat.io; clear the variable
to avoid that.

To run against the self-hosted Toolshop as CI does (UI on `:4200`, API on `:8091`):

```bash
docker compose -f docker/toolshop.compose.yml up -d
docker compose -f docker/toolshop.compose.yml exec -T laravel-api php artisan migrate:fresh --seed --force
```

Then set `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`. CI always runs here,
because the public site is behind a Cloudflare challenge (risk R-02). That is also why the `chromium`
project overrides the user agent with a regular Chrome one.

## Architecture

The flow for a test: `specs/` use the `test` from `fixtures/fixtures.ts`, not the one from
`@playwright/test`. Fixtures prepare state through the API, and tests then act through page objects
and assert against values from `test-data/`.

- `playwright.config.ts`: two projects. `api` (`specs/api`, no browser, `baseURL` is the API) and
  `chromium` (`specs/e2e`, `baseURL` is the UI). `testIdAttribute` is `data-test`, so `getByTestId`
  targets `data-test` attributes.
- `fixtures/fixtures.ts`: `apiHelper` creates its own request context because in `chromium` the
  `baseURL` points at the UI, so the built-in `request` fixture cannot reach the API. `createNewUser`
  registers a fresh user per test. `login` builds on it and logs in through the UI.
- `helpers/apiHelper.ts`: API calls, one method per endpoint. Declare the response type here with
  the generic (`request.post<T>()`, `Promise<APIResponse<T>>`), so specs get a typed `json()` without `as`.
- `helpers/users.ts`: generators of unique test data.
- `pages/`: page objects; `pages/fragments/`: parts shared by several pages, composed into a page
  object as a field (`accountPage.navBar`).
- `test-data/<api|e2e>/<module>/`: expected values, one file per spec mirroring its path, as a
  default export.
- `interfaces/`: shared types, one per file.
- `test-cases/`: plain-language cases synced with Testomat.io. Follow
  [test-cases/CLAUDE.md](test-cases/CLAUDE.md) when editing them.
- `docs/test-planning/`: test plan, strategy, RTM, risk register, estimation.

## Conventions

- Test titles carry the Testomat ID of the case and its run tags, for example
  `'... @Ta8031e0b @ui @auth @regression @smoke @P1'`. The title and tags repeat the case in
  `test-cases/`, and a case is automated only after it exists there with an ID. Tests are selected
  only by tags: the level is `@api`, `@ui` or `@e2e`, not the folder (all browser tests are in `specs/e2e`).
- Each test creates its own data through the API. Shared demo accounts are for read-only checks.
- Selectors: `data-test` first, then role or label; CSS and XPath only as a last resort.
- Web-first assertions only, no `waitForTimeout`.
- Page objects expose locators and actions, with no `expect`. Assertions live in specs, and in
  fixtures when a fixture has to confirm its setup succeeded.
- Assert the status before calling `response.json()`, so a non-JSON error shows as a wrong status.
- Assertion messages state the expectation (`'Login form should disappear after login'`), and only
  where the default output is not self-explanatory.
- File names: `*.page.ts`, `*.fragment.ts`, `*.spec.ts` in camelCase; files in `interfaces/` are
  named after the exported type. Folders are kebab-case.
- A test failing on a known defect is marked `test.fail()` with a link to the defect.
- Commit messages: `test(<task-index>): <what> <why>`, for example `test(E2-4): add ... to ...`.

## Testomat.io

- `npm run tms:push` and `npm run tms:pull` change the Testomat.io project or local case files. Run
  them only when the user asks.
- `npm run tms:import` runs in CI on push to `main` only, so PR branches do not change the project.
  It uses `--no-detached` so manual cases that are not automated yet stay attached.
