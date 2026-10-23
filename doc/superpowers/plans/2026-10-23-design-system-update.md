# Design System Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update and standardize the application's design system tokens, typography, UI primitives, and layout ergonomics based on `DESIGN.md`.

**Architecture:** Centralize all theme colors, elevation shadows, radii, and typography scales into semantic CSS custom properties in `src/app/globals.css`. Apply Google Fonts `Public Sans` and `JetBrains Mono` via Next.js Font in `src/app/layout.tsx`. Refactor core UI primitives and navigation components to consume these tokens, adhere to mobile-first touch ergonomics (min 44px tap targets, safe-area insets), and eliminate slop patterns.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, React 19, Lucide Icons, Jest, Testing Library.

**Spec:** `DESIGN.md`

## Global Constraints

- Primary Color: Steel Blue Accent `#4682b4` (dark: `#6ba3ce`), hover: `#36648b`
- Secondary / Accent Color: Sky Glow `#0ea5e9` (dark: `#38bdf8`)
- Neutral Light: bg `#f8fafc` (`--bg-main`), card `#ffffff` (`--bg-card`), border `#e2e8f0` (`--border-card`), text `#0f172a` (`--text-main`), text muted `#64748b` (`--text-muted`)
- Neutral Dark: bg `#090d16`, card `#0f172a`, border `#1e293b`, text `#f8fafc`, text muted `#94a3b8`
- Display & Body Font: Public Sans; Code/Mono Font: JetBrains Mono
- Minimum tap target size on coarse/mobile pointers: 44px (`min-h-[44px]` on interactive controls)
- The Elevation on Action Rule: Resting surfaces remain grounded with hairline borders (`1px solid var(--border-card)`); dynamic elevation lifts only during hover, focus, drag, or modal states.
- Antislop Mode DURING: No em dashes (`—`), no decorative pulses without function, no dead links, icons must be contextually relevant (R-02, R-03, R-04, R-19, R-25, R-26, R-32).

## Review Focus

- Color Contrast: Ensure all text and badge combinations maintain at least 4.5:1 WCAG AA contrast ratio in light and dark contexts.
- Mobile Tap Targets: Ensure mobile action buttons, select inputs, bottom navigation items, and drawer close buttons have at least 44x44px touch areas.
- Safe Area Handling: Verify floating or fixed components (BottomNav, drawers) respect `env(safe-area-inset-bottom)`.
- Existing UI Unit Tests: Ensure existing tests in `tests/components/ui.test.tsx` pass without regression when class names or styling tokens are updated.
- Keyboard Navigation: Ensure focus states utilize the Steel Blue focus ring (`2px solid #4682b4` with accessible offset) across buttons, inputs, selects, and modals.

---

### Task 1: CSS Variables & Design Tokens Setup

**Files:**
- Modify: `src/app/globals.css`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Consumes: Token specifications from `DESIGN.md`
- Produces: CSS custom properties (`--color-primary`, `--color-primary-hover`, `--color-accent`, `--bg-main`, `--bg-card`, `--border-card`, `--text-main`, `--text-muted`, `--shadow-card-rest`, `--shadow-card-hover`, `--shadow-modal`) and base utilities.

- [ ] **Step 1: Write unit test assertion for design token classes or custom CSS rules**
- [ ] **Step 2: Run test to check current baseline**
- [ ] **Step 3: Update `src/app/globals.css` with semantic tokens and utilities**
- [ ] **Step 4: Run test to verify passes**
- [ ] **Step 5: Commit task changes**

---

### Task 2: Typography & Viewport Setup in Root Layout

**Files:**
- Modify: `src/app/layout.tsx`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Consumes: CSS variables from `src/app/globals.css`
- Produces: `Public_Sans` and `JetBrains_Mono` font variables injected to `<html>`, theme color `#4682b4`.

- [ ] **Step 1: Verify font imports and metadata in `src/app/layout.tsx`**
- [ ] **Step 2: Update `layout.tsx` to configure Public Sans and JetBrains Mono with themeColor `#4682b4`**
- [ ] **Step 3: Run Jest tests to verify layout integration**
- [ ] **Step 4: Commit task changes**

---

### Task 3: Core UI Primitives Refactor

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Input.tsx`
- Modify: `src/components/ui/Select.tsx`
- Modify: `src/components/ui/Badge.tsx`
- Modify: `src/components/ui/Modal.tsx`
- Modify: `src/components/ui/Table.tsx`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Consumes: CSS tokens (`--color-primary`, `--border-card`, etc.) and `DESIGN.md` component guidelines.
- Produces: Updated primitive components adhering to 44px tap targets, Steel Blue accent focus rings, hairline borders, and proper badge color variants.

- [ ] **Step 1: Review failing or changed expectations in `tests/components/ui.test.tsx`**
- [ ] **Step 2: Update `Button.tsx` with primary Steel Blue `#4682b4`, hover `#36648b`, radius `rounded-lg`, and min 44px tap height on mobile**
- [ ] **Step 3: Update `Input.tsx` and `Select.tsx` with stroke border `#cbd5e1`, focus ring `#4682b4`, and min 44px tap height**
- [ ] **Step 4: Update `Badge.tsx` with pill radius and refined status colors matching DESIGN.md**
- [ ] **Step 5: Update `Modal.tsx` with `rounded-xl`, modal float shadow, and safe area paddings**
- [ ] **Step 6: Update `Table.tsx` with hairline border and label hierarchy headers**
- [ ] **Step 7: Update `tests/components/ui.test.tsx` if class assertions changed and run Jest**
- [ ] **Step 8: Commit task changes**

---

### Task 4: Layout & Navigation Components Refactor

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Test: `tests/components/ui.test.tsx`

**Interfaces:**
- Consumes: UI components and Steel Blue tokens
- Produces: Refined navigation with mobile-first tap targets, contextual non-slop icons, safe area padding, and clean hover elevations.

- [ ] **Step 1: Update `Header.tsx` replacing generic pulse/sparkles with contextual semester indicator icon**
- [ ] **Step 2: Update `Sidebar.tsx` brand styling and active navigation states to Steel Blue**
- [ ] **Step 3: Update `BottomNav.tsx` active states, 44px min tap targets, and safe bottom padding**
- [ ] **Step 4: Run Jest tests to verify layout components render cleanly**
- [ ] **Step 5: Commit task changes**

---

### Task 5: End-to-End Verification of All Unit Tests

**Files:**
- Test: `tests/**/*`

**Interfaces:**
- Consumes: Entire application codebase
- Produces: 100% passing test suite across all 19 test files.

- [ ] **Step 1: Run `rtk npm test` across all test suites**
- [ ] **Step 2: Verify zero failures or regressions**
- [ ] **Step 3: Commit verification milestone if any test adjustments made**

---

### Task 6: Documentation, PRD & Changelog

**Files:**
- Modify: `doc/PRD.md`
- Create: `changelogs/CHANGELOG_23_10_2026.md`

**Interfaces:**
- Consumes: Completed implementation summary
- Produces: Updated PRD documentation detailing the design system specifications and date-stamped changelog.

- [ ] **Step 1: Update `doc/PRD.md` with Design System specifications from `DESIGN.md`**
- [ ] **Step 2: Create `changelogs/CHANGELOG_23_10_2026.md` with version summary and detailed changes**
- [ ] **Step 3: Commit documentation updates**
