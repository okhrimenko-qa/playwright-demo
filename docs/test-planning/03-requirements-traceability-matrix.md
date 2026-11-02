# Requirements Traceability Matrix — Toolshop

| Field | Value |
|-------|-------|
| Document ID | QA-RTM-001 |
| Version | 1.0 (approved) |
| Date | 2026-10-24 |
| Related | [Test Plan](01-test-plan.md), [Risk Register](04-risk-register.md), [Estimation](05-test-estimation.md) |

## How to read this matrix

- **Requirement source.** The product has no written specification. Requirements were derived from
  (a) an exploratory session on the UI and (b) the published OpenAPI spec (Toolshop API v5.0.0).
  Each requirement is a *baseline to be confirmed by the PO*. Open questions are listed at the end.
- **Priority** follows the [Risk Register](04-risk-register.md): **P1** = must pass for release and
  gates every merge, **P2** = regression, **P3** = nice to have / nightly.
- **Level:** `API` (HTTP via Playwright `request`), `UI` (browser, data seeded via API), `E2E`
  (full journey).
- **Suite:** `S` = included in `@smoke`. Every test is also in `@regression`.
- **Status:** `Planned` → `Automated` → `Passing` / `Failing (DEF-xxx)`. `Deferred` = consciously not
  covered in this release (reason given).
- **Traceability chain:** REQ → test case in `test-cases/<module>/<test-case-title>.test.md`
  (tagged with its TC ID and `REQ-…`) → Testomat ID (`@T…`) → automated test with the same ID in
  its title. Coverage per requirement can be filtered in Testomat.io by the `REQ-*` tag.

---

## 1. Authentication (AUTH)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-AUTH-01 | A visitor can register a customer account with valid data | P1 | TC-AUTH-001 | Register via UI form → redirected to login, can sign in | UI | | Automated |
| REQ-AUTH-01 | | P1 | TC-AUTH-002 | `POST /users/register` valid payload → 201, body matches `UserResponse`, no password in body | API | | Automated |
| REQ-AUTH-02 | Password must be ≥ 8 chars and contain upper, lower, digit and symbol | P2 | TC-AUTH-003 | Data-driven: each violated rule → 422 with the matching message; 7 vs 8 chars boundary | API | | Planned |
| REQ-AUTH-02 | | P2 | TC-AUTH-004 | Registration form shows password-rule errors inline and blocks submit | UI | | Planned |
| REQ-AUTH-03 | Registering with an already-used email is rejected | P2 | TC-AUTH-005 | Register same email twice → second call rejected (409/422), no duplicate account | API | | Planned |
| REQ-AUTH-04 | Postal code is validated against the selected country | P3 | TC-AUTH-006 | Invalid postal code for country → 422 `address.postal_code` | API | | Planned |
| REQ-AUTH-05 | A customer can log in with valid credentials | P1 | TC-AUTH-007 | Login via UI → "My account" page, user name in header | UI | S | Planned |
| REQ-AUTH-05 | | P1 | TC-AUTH-008 | `POST /users/login` → 200, `access_token` (JWT), `token_type`, `expires_in` | API | S | Planned |
| REQ-AUTH-06 | Invalid credentials are rejected with a generic error (no user enumeration) | P1 | TC-AUTH-009 | Wrong password / unknown email → same generic UI error | UI | | Automated |
| REQ-AUTH-06 | | P1 | TC-AUTH-010 | Wrong password and unknown email both → 401 with identical body | API | | Automated |
| REQ-AUTH-07 | The account is locked after repeated failed login attempts | P2 | TC-AUTH-011 | Fresh user: N failed attempts → "Account locked"; correct password then also rejected | API | | Planned |
| REQ-AUTH-08 | Logout invalidates the session token | P2 | TC-AUTH-012 | `GET /users/logout` → old token on `/users/me` → 401 | API | | Planned |
| REQ-AUTH-08 | | P2 | TC-AUTH-013 | Sign out via UI → protected page redirects to login | UI | | Planned |
| REQ-AUTH-09 | A valid token can be refreshed | P3 | TC-AUTH-014 | `GET /users/refresh` → new token works, response schema valid | API | | Planned |
| REQ-AUTH-10 | A user can request a password reset | P3 | TC-AUTH-015 | `POST /users/forgot-password` known/unknown email → same response (no enumeration) | API | | Planned |
| REQ-AUTH-11 | A user can enable TOTP two-factor authentication | P3 | — | — | — | | Deferred: needs a TOTP generator + secret handling; planned for release 2 |

## 2. Customer account (ACC)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-ACC-01 | A customer can view and update their profile | P2 | TC-ACC-001 | Edit profile (phone, address) via UI → saved and shown after reload | UI | | Planned |
| REQ-ACC-01 | | P2 | TC-ACC-002 | `GET /users/me` returns own profile, matches `UserResponse` | API | | Planned |
| REQ-ACC-02 | A customer can change their password | P2 | TC-ACC-003 | Change password → old password fails, new password works | API | | Planned |
| REQ-ACC-03 | A customer can access only their own data (object-level authorization) | P1 | TC-ACC-004 | Customer A requests user B / invoice B by ID → 403/404, no data leaked | API | | Automated |
| REQ-ACC-03 | A customer cannot use admin endpoints (role-level authorization) | P1 | TC-ACC-005 | Customer token on `GET /users`, `DELETE /brands/{id}`, `/reports/*` → 403 | API | S | Automated |

## 3. Product catalog (CAT)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-CAT-01 | Product list is paginated (9 per page) | P2 | TC-CAT-001 | `GET /products?page=n` → `per_page`, `total`, `last_page` consistent; last page boundary | API | | Planned |
| REQ-CAT-01 | | P2 | TC-CAT-002 | UI pagination: page 2 shows different products, active page highlighted | UI | | Planned |
| REQ-CAT-02 | Products can be searched by name | P1 | TC-CAT-003 | Search "pliers" via UI → only matching products; no-result message for nonsense query | UI | S | Planned |
| REQ-CAT-02 | | P1 | TC-CAT-004 | `GET /products/search?q=` → every result name contains the query; empty result for no match | API | S | Planned |
| REQ-CAT-03 | Products can be filtered by category, including subcategories | P2 | TC-CAT-005 | Tick a category in the sidebar → all products belong to it | UI | | Planned |
| REQ-CAT-03 | | P2 | TC-CAT-006 | `GET /products?by_category=` → all results in that category | API | | Planned |
| REQ-CAT-04 | Products can be filtered by brand | P2 | TC-CAT-007 | `GET /products?by_brand=` → all results of that brand; combined with category (pairwise) | API | | Planned |
| REQ-CAT-04 | | P2 | TC-CAT-008 | Tick a brand in the sidebar → product list updates accordingly | UI | | Planned |
| REQ-CAT-05 | Products can be filtered by price range | P3 | TC-CAT-009 | `between=price,min,max` → all prices within range; boundary values included | API | | Planned |
| REQ-CAT-06 | Products can be sorted by name and price (asc/desc) | P2 | TC-CAT-010 | Data-driven: 4 sort options in UI → list ordered correctly | UI | | Planned |
| REQ-CAT-06 | | P2 | TC-CAT-011 | `sort=name,asc` / `price,desc` etc. → API returns ordered list | API | | Planned |
| REQ-CAT-07 | Product details show name, price, description, specs and related products | P1 | TC-CAT-012 | Open product → all fields visible, related products link to other details pages | UI | S | Planned |
| REQ-CAT-07 | | P1 | TC-CAT-013 | `GET /products/{id}` matches `ProductResponse`; unknown ID → 404 | API | S | Planned |
| REQ-CAT-08 | An out-of-stock product cannot be added to the cart | P2 | TC-CAT-014 | Out-of-stock product → "Out of stock" label, add-to-cart disabled | UI | | Planned |
| REQ-CAT-09 | Rental products are listed separately | P3 | TC-CAT-015 | `GET /products?is_rental=true` → only rental products | API | | Planned |

## 4. Shopping cart (CART)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-CART-01 | A product can be added to the cart; the cart badge shows the item count | P1 | TC-CART-001 | Add product (qty 2) from details page → toast, badge = 2, item in cart | UI | S | Planned |
| REQ-CART-01 | | P1 | TC-CART-002 | `POST /carts` → `POST /carts/{id}` add item → `GET /carts/{id}` contains item with qty | API | S | Planned |
| REQ-CART-02 | Changing quantity recalculates line and cart totals | P1 | TC-CART-003 | Change qty in cart → line total = price × qty, cart total updated | UI | | Planned |
| REQ-CART-02 | | P1 | TC-CART-004 | `PUT /carts/{id}/product/quantity` → quantity and totals updated | API | | Planned |
| REQ-CART-03 | An item can be removed from the cart | P2 | TC-CART-005 | Remove item in UI → disappears, total and badge updated | UI | | Planned |
| REQ-CART-03 | | P2 | TC-CART-006 | `DELETE /carts/{id}/product/{productId}` → item gone, others intact | API | | Planned |
| REQ-CART-04 | The cart persists across page reloads | P3 | TC-CART-007 | Add item → reload / new tab → cart unchanged | UI | | Planned |
| REQ-CART-05 | Invalid quantities are rejected | P2 | TC-CART-008 | Data-driven: qty 0, -1, "abc", very large → 422, cart unchanged | API | | Planned |

## 5. Checkout and payment (CHK)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-CHK-01 | A registered customer can complete checkout and receives an order confirmation | P1 | TC-CHK-001 | Login → add 2 products → cart → address → payment → confirmation with invoice number; invoice visible in "My invoices" | E2E | S | Planned |
| REQ-CHK-02 | A guest can complete checkout without registering | P1 | TC-CHK-002 | Guest checkout journey → confirmation | E2E | | Planned |
| REQ-CHK-02 | | P1 | TC-CHK-003 | `POST /invoices/guest` valid payload → 200, invoice created; invalid → 422 | API | | Planned |
| REQ-CHK-03 | Billing address fields are validated | P2 | TC-CHK-004 | Empty required fields → step cannot be completed, errors shown | UI | | Planned |
| REQ-CHK-04 | All 5 payment methods are accepted with valid details | P1 | TC-CHK-005 | Data-driven `POST /payment/check` × {bank transfer, COD, credit card, BNPL, gift card} → success | API | S | Planned |
| REQ-CHK-04 | | P1 | TC-CHK-006 | UI payment step: each method shows its own fields; credit card path completes | UI | | Planned |
| REQ-CHK-05 | Invalid payment details are rejected | P1 | TC-CHK-007 | Decision table: invalid card number / expired date / bad CVV / missing gift card code → rejected | API | | Planned |
| REQ-CHK-06 | Invoice totals equal the sum of line totals | P1 | TC-CHK-008 | Create invoice via API → `total` = Σ(qty × unit_price), lines match cart | API | | Planned |
| REQ-CHK-07 | Postcode lookup returns address details | P3 | TC-CHK-009 | `GET /postcode-lookup` valid → street/city; invalid → 422 | API | | Planned |

## 6. Invoices / order history (INV)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-INV-01 | A customer can see their order history and invoice details | P2 | TC-INV-001 | "My invoices" lists the new order; details show lines, totals, payment method | UI | | Planned |
| REQ-INV-01 | | P2 | TC-INV-002 | `GET /invoices` returns only own invoices; `GET /invoices/{id}` schema valid | API | | Planned |
| REQ-INV-02 | A customer can download an invoice PDF | P3 | TC-INV-003 | `download-pdf-status` → ready → `download-pdf` returns `application/pdf` | API | | Planned |

## 7. Favorites (FAV)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-FAV-01 | A logged-in customer can add and remove favorites | P3 | TC-FAV-001 | Add to favorites from product page → listed in "My favorites" → remove | UI | | Planned |
| REQ-FAV-01 | | P3 | TC-FAV-002 | `POST /favorites` → `GET` lists it → `DELETE` → gone; duplicate add rejected | API | | Planned |
| REQ-FAV-02 | Guests cannot manage favorites | P3 | TC-FAV-003 | `POST /favorites` without token → 401 | API | | Planned |

## 8. Contact (CON)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-CON-01 | A visitor can send a contact message | P2 | TC-CON-001 | Fill contact form → success message | UI | | Planned |
| REQ-CON-01 | | P2 | TC-CON-002 | `POST /messages` guest (with email) → 200; message visible to admin | API | | Planned |
| REQ-CON-02 | Required fields and max lengths are enforced | P2 | TC-CON-003 | Empty form → field errors; invalid email format | UI | | Planned |
| REQ-CON-02 | | P2 | TC-CON-004 | Missing subject/message, guest without email, message > 250 chars → 422 | API | | Planned |
| REQ-CON-03 | A file can be attached to a contact message (allowed types/size) | P3 | TC-CON-005 | Attach allowed file → accepted; disallowed type → error | UI | | Planned (rules pending Q-03) |

## 9. Administration (ADM)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-ADM-01 | Admin can create, read, update, delete brands | P2 | TC-ADM-001 | API CRUD lifecycle; duplicate slug rejected | API | | Planned |
| REQ-ADM-01 | | P2 | TC-ADM-002 | Admin UI: add brand → appears in list and in shop sidebar filter | UI | | Planned |
| REQ-ADM-02 | Admin can manage categories (incl. parent/child) | P3 | TC-ADM-003 | API CRUD with parent category; category tree reflects change | API | | Planned |
| REQ-ADM-03 | Admin can manage products | P2 | TC-ADM-004 | API CRUD product; required fields / price validation | API | | Planned |
| REQ-ADM-03 | | P2 | TC-ADM-005 | Admin UI: add product → visible in shop and searchable | UI | | Planned |
| REQ-ADM-04 | Admin can change order status; customer sees the new status | P2 | TC-ADM-006 | Customer places order → admin sets status "Shipped" → customer's invoice shows "Shipped" | E2E | | Planned |
| REQ-ADM-05 | Admin can read and reply to contact messages | P3 | TC-ADM-007 | `GET /messages` → reply → status updated | API | | Planned |
| REQ-ADM-06 | Admin can search users | P3 | TC-ADM-008 | `GET /users/search?q=` → matching users only | API | | Planned |
| REQ-ADM-07 | Sales reports are available to admin | P3 | TC-ADM-009 | Data-driven: 7 `/reports/*` endpoints → 200 + expected structure | API | | Planned |
| REQ-ADM-08 | Write operations on catalog data require admin authentication | P1 | TC-ADM-010 | Without token: `DELETE` brand/category/product → 401; `POST/PUT/PATCH` brand → expected 401 | API | S | Planned (see Q-01) |

## 10. Internationalization (I18N)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-I18N-01 | The UI language can be switched and the choice is kept | P3 | TC-I18N-001 | Data-driven over languages in the switcher → nav labels translated, persists after reload | UI | | Planned |

## 11. Non-functional (NFR)

| REQ ID | Requirement | Pri | TC ID | Test case | Level | Suite | Status |
|--------|-------------|-----|-------|-----------|-------|-------|--------|
| REQ-NFR-01 | API responses conform to the published OpenAPI contract | P2 | TC-NFR-001 | Shared schema assertion used in all API tests + dedicated check of core GET endpoints | API | | Planned |
| REQ-NFR-02 | Catalog API responds within the agreed budget (proposed p95 < 1 s) | P3 | TC-NFR-002 | 20 sequential calls to `/products`, `/products/{id}`, `/categories/tree` → p95 under budget | API | | Planned (budget pending Q-04) |
| REQ-NFR-03 | Key pages have no critical/serious WCAG 2.1 AA violations | P3 | TC-NFR-003 | axe scan: home, product details, login, register, cart, checkout | UI | | Planned |
| REQ-NFR-04 | Core journeys work in Chromium, Firefox and WebKit | P2 | TC-NFR-004 | `@smoke` UI suite executed on 3 browser projects (nightly) | UI | | Planned |
| REQ-NFR-05 | The shop is usable on a mobile viewport | P3 | TC-NFR-005 | Mobile (Pixel 7): menu, search, add to cart, open cart | UI | | Planned |
| REQ-NFR-06 | Sensitive data is never exposed in API responses | P2 | TC-NFR-006 | User endpoints never return password/hash/TOTP secret; error responses contain no stack traces | API | | Planned |

---

## Out of scope (not traced)

| Feature | Reason |
|---------|--------|
| Live sales stream (`/sales-stream`, SSE) | Internal/admin demo feature, low business value for the shop |
| Social login (Google) | Third-party flow, not automatable reliably on a public env |
| Load / stress / soak testing | Shared public environment (see Test Strategy §5) |
| Product image upload (`/images`) | Read-only endpoint in the spec; no upload flow observed |
| HTTP `QUERY` method variants of search endpoints | Same behaviour as GET, covered by GET tests; revisit if they diverge |

## Coverage summary

| Module | Requirements | Test cases | API | UI | E2E | P1 TCs | Smoke |
|--------|-------------:|-----------:|----:|---:|----:|-------:|------:|
| AUTH | 11 | 15 | 10 | 5 | 0 | 6 | 2 |
| ACC | 3 | 5 | 4 | 1 | 0 | 2 | 1 |
| CAT | 9 | 15 | 8 | 7 | 0 | 4 | 4 |
| CART | 5 | 8 | 4 | 4 | 0 | 4 | 2 |
| CHK | 7 | 9 | 5 | 2 | 2 | 7 | 2 |
| INV | 2 | 3 | 2 | 1 | 0 | 0 | 0 |
| FAV | 2 | 3 | 2 | 1 | 0 | 0 | 0 |
| CON | 3 | 5 | 2 | 3 | 0 | 0 | 0 |
| ADM | 8 | 10 | 7 | 2 | 1 | 1 | 1 |
| I18N | 1 | 1 | 0 | 1 | 0 | 0 | 0 |
| NFR | 6 | 6 | 3 | 3 | 0 | 0 | 0 |
| **Total** | **57** | **80** | **47** | **30** | **3** | **24** | **12** |

56 of 57 requirements (98%) have at least one planned test case. REQ-AUTH-11 (TOTP) is deferred.

## Open questions for the Product Owner

| ID | Question | Affects | Raised |
|----|----------|---------|--------|
| Q-01 | `POST /brands` without a token returns 422 (validation) instead of 401: brand create/update appear to be **unauthenticated**. Is this intended for the sandbox or a defect? The OpenAPI spec marks only `DELETE` as protected. | REQ-ADM-08, R-09 | 2026-10-24 |
| Q-02 | How many failed login attempts lock an account, and how is it unlocked? | REQ-AUTH-07 | 2026-10-24 |
| Q-03 | Which file types and sizes are allowed for contact message attachments? | REQ-CON-03 | 2026-10-24 |
| Q-04 | Is there a performance SLA for the API? The proposed p95 < 1 s is a placeholder. | REQ-NFR-02 | 2026-10-24 |
| Q-05 | How often is the database reset, and at what time (UTC)? Needed to schedule the nightly run. | R-04 | 2026-10-24 |
| Q-06 | Can QA get a dedicated environment (self-hosted Docker image of the same version) for CI? | R-01, R-02 | 2026-10-24 |
