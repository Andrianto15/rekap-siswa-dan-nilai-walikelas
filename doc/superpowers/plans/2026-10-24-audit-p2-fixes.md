# Audit P2 Fixes (Touch Targets & Accessibility) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all table action icon buttons and daily attendance status toggles to min 44x44px touch targets with explicit `aria-label` / `aria-pressed`, and optimize matrix column hover rendering.

**Architecture:** Update Next.js admin tables, attendance inputs, and mapping views to use mobile touch ergonomics (`min-h-[44px] min-w-[44px]`), descriptive `aria-label`, and accessible `aria-pressed` states. Verify via Jest test suite.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, React Testing Library.

**Spec:** Impeccable Audit Findings (P2 items).

## Global Constraints
- Preserve 100% pass on all 23+ Jest test suites.
- Adhere to `antislop-ui`, `antislop-layoutmobile`, and `antislop-code`.
- Prioritize mobile layout ergonomics first.

## Review Focus
- All table icon buttons across admin pages must have `min-h-[44px] min-w-[44px]` and `aria-label`.
- Daily attendance buttons must have `min-h-[44px]` and `aria-pressed`.
- Column hover in monthly attendance grid must not break layout or lag.

---

### Task 1: Enforce 44x44px Touch Targets & ARIA Labels on Admin & Table Action Buttons
**Files:**
- Modify: `src/app/(dashboard)/admin/kelas/page.tsx`
- Modify: `src/app/(dashboard)/admin/users/page.tsx`
- Modify: `src/app/(dashboard)/admin/periode/page.tsx`
- Modify: `src/app/(dashboard)/admin/mapel/page.tsx`
- Modify: `src/app/(dashboard)/admin/mapping/page.tsx`
- Modify: `src/app/(dashboard)/kehadiran/page.tsx`
- Modify: `src/app/(dashboard)/nilai/input/page.tsx`

- [ ] **Step 1: Update icon action buttons with `min-h-[44px] min-w-[44px] flex items-center justify-center` and `aria-label`**
- [ ] **Step 2: Verify visually that table layout remains balanced and responsive**

### Task 2: Standardize Daily Attendance Status Toggles
**Files:**
- Modify: `src/app/(dashboard)/kehadiran/input/page.tsx:735-795`

- [ ] **Step 1: Increase touch target to `min-h-[44px] px-3.5 py-2`**
- [ ] **Step 2: Add `aria-pressed={currentStatus === ...}` and dark mode styling**

### Task 3: Unit Tests for P2 Touch Targets & ARIA Contracts
**Files:**
- Create: `tests/components/a11y-p2-audit.test.tsx`

- [ ] **Step 1: Test admin table action buttons have min 44px bounds and `aria-label`**
- [ ] **Step 2: Test daily attendance buttons have `aria-pressed` and min 44px bounds**
- [ ] **Step 3: Run Jest suite to verify 100% pass**

### Task 4: Documentation & Changelog
**Files:**
- Modify: `doc/PRD.md`
- Modify: `changelogs/CHANGELOG_24_10_2026.md`

- [ ] **Step 1: Document touch target standardization and aria-pressed attributes in `PRD.md`**
- [ ] **Step 2: Add P2 summary under current version in `changelogs/CHANGELOG_24_10_2026.md`**
