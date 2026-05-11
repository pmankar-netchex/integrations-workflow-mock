# Integrations Workflow — Product & Implementation Spec

**Audience:** Product, engineering, and Claude Code (implementation of mocks / prototypes).  
**Stack (target UI):** MUI X, Next.js, deploy to GitHub Pages.

---

## 1. Executive summary

**Goal:** Give payroll admins a **single, predictable path** to pull third-party or internal data into the payroll run, instead of jumping across modules (Edit Timesheets, Import Earnings, integration-specific pages, “Move to Pay”, etc.).

**North star:** One entry point from **Edit Timesheets** (or equivalent “active timesheet” context), with **guided choices** (by *where data lives* — vendor name, “generic file”, Netchex module — not by internal integration type), then **type-specific configuration**, then **review / filter / remove** before data is committed to the backend — aligned across file, API on-demand, API scheduled, and Netchex-internal sources.

---

## 2. Problem statement

Users run payroll in Netchex, but required data often originates from **one or more** of:

| Source class | Examples |
|--------------|----------|
| Netchex modules | Payroll module pop-ups; Time & Attendance → “Move to Pay” |
| Files | Generic long/wide payroll formats; generic time format; provider-specific layouts |
| APIs | On-demand (e.g. Dealertrack, Daxko, Delaget); scheduled pushes (e.g. TCP-style) |

Today those paths differ (extra clicks, different screens, “Import Earnings” for time). We want a **common workflow** that stays **simple** for the common case and **transparent** when admins need to understand what will be pulled.

---

## 3. Personas

| Persona | Needs |
|---------|--------|
| **Payroll Admin** | Fast payroll; clarity on *what* is pulled, *when*, and *from where*; minimal training. |
| **Netchex Onboarding** | Repeatable playbooks; in-product guidance instead of memorizing per-integration navigation. |

---

## 4. Product principles (implementation guardrails)

1. **One primary entry** to “get data into this payroll / timesheet context” — avoid competing buttons that mean the same thing to the user.
2. **User mental model = “where is my data?”** — marketplace-style cards/categories; internal taxonomy (generic vs specific file, 180 vs 360 sync) stays behind the UI.
3. **Parity payroll vs Time & Attendance** — same *steps* where possible; T&A may still need a backend equivalent of “Move to Pay”, but the **user** should see one explicit action in the flow, not a scavenger hunt.
4. **Review before commit** — selection (dates, org structure, employees), preview, filter, delete rows where applicable (files and APIs).
5. **Observability for admins** — logs / status where integrations already support it; goal is self-serve debugging for customers and onboarding, not only engineering log dives.
6. **Reactive data dependencies — no manual “Refresh Data” buttons.** When a user changes an upstream input (date range, org slice, sync type, credentials), any downstream data that depends on it (employee mappings, location lists, preview rows, validation status) is **automatically invalidated and refetched**. The current Delaget-style separate “Refresh Data” button is **anti-pattern**: it puts the burden on the admin to remember which inputs invalidate which outputs, and users have shipped payrolls against stale mappings because they forgot to click it. The wizard must encode the dependency graph itself; the UI’s job is to **show that a refresh is happening** (inline spinner on the affected step, “updating mappings…” status, disabled forward nav until consistent), not to ask the user to trigger it. Some integrations may still expose a manual refresh as a power-user override (e.g., to retry after a vendor-side fix), but it is **never** the primary path.

---

## 5. User stories (refined)

Each story: **current pain** → **target** → **acceptance criteria** (for mocks: screen states + copy; for product: behavior).

### STORY01 — Netchex Payroll module → active timesheets

- **Current:** Modal “yes” pulls payroll data into active timesheets.
- **Target:** Same outcome inside the unified flow; no extra conceptual steps.
- **Acceptance:** User can complete “pull from Netchex Payroll” without leaving the unified wizard; confirmation copy explains what will update.

### STORY02 — Netchex Time & Attendance → active timesheets

- **Current:** “Move to Pay” per period; extra step vs STORY01.
- **Target:** Equivalent to STORY01 simplicity — one clear CTA in the unified flow (may still map to “move to pay” server-side).
- **Acceptance:** Period is implied by active timesheet context; user does not visit a separate T&A-only import screen for the happy path.

### STORY03 — Generic file import (Payroll)

- **Current:** Separate “Import Data” opens a menu of generic formats (Long, Wide).
- **Target:** Generic file import is **one option** inside the unified tree (alongside vendor cards, APIs, modules).
- **Acceptance:** User picks generic payroll → format (Long / Wide) → upload → map / validate → review → submit.

### STORY04 — Generic file import (Time & Attendance)

- **Current:** **Import Earnings** (different module/screen) → then “Move to Pay” — highest friction.
- **Target:** Same *shape* as STORY03: choose generic time → upload → validate → review → single explicit “bring into timesheet / payroll context” action.
- **Acceptance:** No mandatory navigation to legacy “Import Earnings” for the unified flow; backend may auto-invoke move-to-pay equivalent when user confirms.

### STORY05 — Dealertrack-style API (existing robust flow)

- **Current:** Older internal pages; good UX reference; full rewrite not in scope.
- **Target:** **Launch** Dealertrack (and similar) **from** the unified entry; may **embed** or **deep-link** to existing UI until rewrite.
- **Acceptance:** User never wonders “where is Dealertrack?” — it appears in the same marketplace/list; handoff to legacy is obvious (title, back navigation).

### STORY06 — Specific file format (Payroll)

- **Same as STORY03** with: (1) card tied to **specific provider** (marketplace-like), (2) **file-specific options** beyond employee ID mapping.
- **Acceptance:** Provider card → provider-specific options → upload → review → submit.

### STORY07 — Specific file format (Time & Attendance)

- **Same as STORY04** with provider card + file-specific options.
- **Acceptance:** Parity with STORY06 for time path, including post-import review and single “apply to timesheet” step.

### STORY08 — On-demand API (Payroll), e.g. Daxko

- **Current:** Next.js app; slightly modernized UI vs STORY05.
- **Target:** Same flow slot as STORY05; credentials, mappings, date/department selection, preview, push.
- **Acceptance:** Screenshots in repo (when added) document reference layout; spec requires credential + mapping + pull + review.

### STORY09 — On-demand API (Time), e.g. Delaget

- **Current:** Data may land in T&A first; “Move to Pay” still surfaces as extra admin step.
- **Target:** Unified flow surfaces **one** “make this data available for this payroll run” confirmation after review.
- **Acceptance:** Admin understands whether data is “timesheet-only” vs “ready for pay” in copy; minimal extra clicks vs STORY08.

### STORY10 — Scheduled API (Payroll)

- **Current:** Feels like STORY01 (data already in Netchex) but vendor configures **what** syncs (e.g. TCP); may need **RCA**-style visibility.
- **Target:** Optional step: “what was synced for this vendor / period” + optional “pull vendor-specific slice for this run” if product allows.
- **Acceptance:** User sees **source of truth** (scheduled sync) and **delta / override** rules in plain language; empty states documented.

### STORY11 — Scheduled API (Time & Attendance)

- **Same as STORY10** for time; vendor-specific pull option if product supports it.
- **Acceptance:** Aligned messaging with STORY10; T&A-specific sync status if available.

---

## 6. User problems → product responses

| ID | Problem | Response in UX |
|----|---------|----------------|
| PROBLEM01 | Admins don’t know what will happen for a given integration | Per-step summaries, “what we’ll pull”, preview, links to help |
| PROBLEM02 | Multiple third parties → process must stay consistent | Same wizard shell; only inner steps differ |
| PROBLEM03 | Onboarding overload — too many paths to memorize | Marketplace + categories + in-flow hints |
| PROBLEM04 | Too many screens to run payroll | Single entry from Edit Timesheets; deep-link/embed legacy only when needed |

---

## 7. Screen & flow guidance

### 7.1 Entry

- **Edit Timesheets** remains the visual anchor (“existing screen as-is” for surrounding chrome).
- Replace **multiple** competing entry points with **one** primary CTA: e.g. “Add / import data for this run” (exact label TBD with UX).

### 7.2 Selection layer

- User may not know “generic long” vs “API 180”; they know **vendor names** or “Excel / CSV”.
- Use **integration marketplace** patterns: cards, search, categories (Netchex internal, Files, APIs, Scheduled).
- List is **curated** (tenant-aware): only integrations enabled for the client.

### 7.3 Configuration layer

- **Files:** Upload, format-specific fields, employee / column mapping, optional “delete existing rows for this import” behavior where applicable.
- **APIs:** Credentials management (store, rotate, mask); **mappings** (department structure, employees; note one-way vs two-way in admin docs, not necessarily in primary wizard). See §7.3.2.
- **All:** Date range and org slice (department / location) when supported; then **review grid** (filter, remove rows) before submit.

#### 7.3.1 Dependency graph (which inputs invalidate which outputs)

The wizard must encode this explicitly per integration so reactive refresh (Principle 6) works automatically:

| Upstream input | Downstream outputs invalidated when it changes |
|----------------|-------------------------------------------------|
| Date range | Employee list, mappings (employees active in range), preview rows, validation summary |
| Org slice (division / business unit / department / location) | Employee list, mappings, preview rows |
| Sync type / mode | Mappings (different fields per mode), preview |
| Credentials | Everything downstream — full re-pull |
| Uploaded file | Column mapping, preview, validation summary |
| Mapping edits | Preview rows, validation summary |

**UI rules:**
- On change of an upstream input, downstream steps in the sidebar enter a **"needs update"** state and the user cannot navigate forward until refetch completes.
- Refetch is **automatic** with a debounce (~400 ms) on rapid edits.
- A persistent inline status (`Updating mappings for new date range…`) shows on the affected step.
- A power-user **manual retry** button is allowed only when the auto-refetch fails (vendor error, timeout) — not as the primary path.

#### 7.3.2 Credentials lifecycle (API integrations)

API integrations carry per-tenant credentials whose state must be visible to the admin and gated correctly inside the workflow.

**States:**

| State | Meaning | Marketplace card | Wizard entry |
|-------|---------|------------------|--------------|
| `not-connected` | No credentials saved yet | "Not connected" chip; primary CTA = `Set up connection` | Routes to `/connect/[slug]/` |
| `connected` | Credentials saved and last test passed | "Connected" chip; primary CTA = `Configure` (opens wizard) | Wizard renders normally; header shows last-tested timestamp + `Manage credentials` link |
| `error` | Credentials saved but last test or last vendor sync failed | "Connection issue" chip (warning color); CTA = `Open (issue)` | Wizard renders, but a persistent banner explains the failure with `Open credentials` action |
| `testing` | Test in progress (transient) | "Testing…" chip | n/a (state lives on the credentials screen) |

**Setup screen rules (`/connect/[slug]/`):**

1. **Auth-type-aware fields** — schema declares `oauth2 | apikey | basic`; UI renders the right inputs (Client ID/Secret, API key, username/password, plus vendor-specific fields like region, tenant, subdomain, webhook URL).
2. **Mask secrets in transit and at rest** — never echo the raw secret back; show `••••••••` for saved values; "show" toggle is opt-in per field.
3. **Test-before-save is the primary path.** `Save and continue` is disabled until a test passes. After a passing test, save and route the user into the wizard for that integration.
4. **Save-anyway escape hatch.** When a test fails, expose a discreet `Save anyway (skip test)` link — only useful when the admin knows the failure is vendor-side and they want to retry from the flow. Never the default path.
5. **Editing invalidates the prior test result** — the test pill resets to "idle" the moment any field changes; admins cannot save against a stale-pass.
6. **Disconnect** is a single explicit action, separated from the form; clears credentials but does not touch already-imported runs.
7. **Webhook-style integrations** show the destination URL the admin must paste into the vendor (TCP). Copy-to-clipboard control is required.
8. **Vendor docs link** is always present when the schema declares one — admins should never need to memorize field meanings.

**Where credentials are managed:**

- **Inside the marketplace flow** (primary): the `Manage` link on a connected card, or the auto-route on a not-connected card.
- **Inside the wizard header**: a `Manage credentials` text link next to the connection chip on the Configure step. This handles credential rotation mid-run without leaving the run.
- **Settings/Maintenance area** (deferred — not in v0.3 mock): tenant-wide credential index for superadmins.

### 7.4 Observability (API-heavy)

- Surface **status**, **last sync**, and **customer-visible logs** where the integration supports it — for admin and onboarding, not only engineering.

### 7.5 Reference artifacts

- Spec references screenshots for **Dealertrack**, **Daxko**, **Delaget**, and file-import examples. **Add to repo** under e.g. `integrations_workflow/assets/` and link filenames here when available.

---

## 8. Integration taxonomy (for engineering / Claude Code)

Use this matrix to scope components and routes (exact route names are implementation details).

| Mechanism | Payroll context | Time context | Notes |
|-----------|-----------------|--------------|--------|
| Netchex module | STORY01 | STORY02 | May map to existing modals / APIs |
| Generic file | STORY03 | STORY04 | Long/Wide vs single time format |
| Specific file | STORY06 | STORY07 | Provider plugin config |
| API on-demand | STORY08 | STORY09 | Credentials + mappings + preview |
| API scheduled | STORY10 | STORY11 | Mostly “inspect / optional pull”; vendor-side config |

**Claude Code hint:** Implement a **shell wizard** (steps: Choose source → Configure → Review → Confirm) with **pluggable step content** per taxonomy cell above.

---

## 9. API integration scope (domain entities)

Futuristic / platform view of syncable entities (not all in every integration):

| Entity | Typical direction | Notes |
|--------|-------------------|--------|
| Employee sync | 360 (GET + map + POST) | |
| Department structure | 360 | |
| Type codes (earnings / deductions) | 360 | |
| Time & Attendance | 180 (GET + map) | Often precedes pay |
| Payroll data | 180 (GET + map) | |
| GL / Accounting | 180 (POST) | May be out of scope for first wizard |

Availability depends on vendor APIs; the **UI** should declare which capabilities an integration exposes.

---

## 10. Technology & deployment

| Choice | Implication for mocks |
|--------|------------------------|
| **MUI X** | DataGrid for review steps; DatePicker for ranges; layout with MUI system |
| **Next.js** | App Router recommended; static export if required for GitHub Pages |
| **GitHub Pages** | No server: API calls are mock/stub or client-only demo; env for real APIs only in non-Pages deploys |

**Claude Code checklist:**

- Static export compatible routing (`output: 'export'` if using Pages).
- No secrets in repo; credentials UI uses placeholders in demo.
- Feature flags or mock JSON per integration for demo data.

---

## 11. Non-goals (clarify to avoid scope creep)

- Full rewrite of Dealertrack (STORY05) — **embed / link** first.
- Replacing all legacy backend contracts in v1 — wizard may call existing endpoints where they exist.
- GL posting wizard — **deferred** unless explicitly prioritized.

---

## 12. Open questions (resolved-for-mock; revisit before product GA)

1. **Single vs multi-source per run:** *Mock = sequential only.* User re-enters wizard from Edit Timesheets to add a second source. Revisit if usability testing surfaces multi-source demand.
2. **Scheduled sync “pull slice”:** *Mock shows the option* (secondary CTA on STORY10/11) so we can usability-test the affordance.
3. **Canonical labels:** *Mock uses placeholder copy.* Primary CTA on Edit Timesheets = `Add data to this run`. Wizard steps = `Configure → Map → Review → Confirm`. Replace before product final.
4. **Tenant configuration:** *Mock reads `integrations.json` statically.* Product backend TBD (superadmin / onboarding JSON / API).
5. **T&A “ready for pay” state:** *Mock confirm-step copy is explicit:* "this data will be moved into pay-ready timesheets" for time sources. Server-side event naming still product TBD.

---

## 15. Mock implementation scope (v0.3)

The first prototype implements **one story per taxonomy cell** plus the Dealertrack embed:

| Mechanism | Story implemented | Notes |
|-----------|-------------------|--------|
| Netchex module | STORY01 + STORY02 | Same shell; copy diverges at Confirm |
| Generic file | STORY03 | Long + Wide payroll formats |
| Specific file | STORY06 | Statewise as the vendor card example |
| API on-demand | STORY08 | Daxko-style; **canonical demo of Principle 6** (reactive refresh on date / scope change, hard-block forward nav until refetch settles, manual retry surfaced only on simulated vendor failure) |
| API scheduled | STORY10 | Inspect last sync + optional "pull slice" CTA |
| API legacy embed | STORY05 | Dealertrack `Import Batch Data` reproduced as-is per §11 |

**Locked behavioral choices for the mock:**

- **Entry consolidation:** Edit Timesheets replaces `Move To Pay` + `Import Time` + `Import Batch Data` + `Import Payroll Data` with a **single** `Add data to this run` CTA. Power-user fast paths deferred.
- **Marketplace shape:** flat list with left-side **category facet** (Netchex modules / Generic files / Specific vendors / APIs (on-demand) / Scheduled syncs) + search.
- **Wizard shell:** Dealertrack-style vertical sidebar progress; uniform across all flows. Netchex-internal flows collapse to **Review → Confirm**.
- **Reactive refresh policy (Principle 6):** **hard block** for *all* upstream input changes (date range, org slice, sync type, credentials, file). Sidebar steps go to "needs update" + spinner; forward nav disabled until consistent. Single uniform rule — no soft-block tier — to keep the user's mental model simple.
- **Manual retry:** demonstrated explicitly via a simulated vendor-error path on the Daxko flow.
- **Tech:** Next.js App Router, `output: 'export'`, MUI v6 + MUI X DataGrid Community, deployable to GitHub Pages with a `basePath`. All data mocked client-side.
- **Visual fidelity:** match Netchex chrome (left module nav, top bar) so the new flow sits in real surrounding context.

---

## 13. Glossary

| Term | Meaning |
|------|--------|
| **Move to Pay** | Existing action moving T&A data into pay-ready timesheets |
| **180 / 360** | Shorthand for one-way vs two-way style sync in spec |
| **RCA** | Root-cause / reconciliation style checks when scheduled sync is source of truth |
| **Long / Wide** | Generic payroll file layout variants |

---

## 14. Revision history

| Version | Notes |
|---------|--------|
| 0.3.2 | Added §7.3.2 credentials lifecycle (states, setup screen rules, where credentials are managed); credential gating wired into marketplace + Daxko/TCP flows in mock |
| 0.3.1 | Resolved §12 open questions for mock scope; added §15 mock-scope appendix with locked entry-CTA, marketplace shape, wizard shell, hard-block refresh policy, retry demo, tech stack |
| 0.3 | Added Principle 6 (reactive data dependencies), §7.3.1 dependency graph; killed the manual “Refresh Data” pattern as primary path |
| 0.2 | Refined for implementation: taxonomy, AC, tech constraints, non-goals, open questions |
| 0.1 | Original draft |
