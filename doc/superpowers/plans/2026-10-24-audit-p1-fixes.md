# Audit P1 Fixes (Accessibility & Theming) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix P1 critical accessibility contrast violations, dark mode token omissions, and matrix keyboard/ARIA navigation identified in `/impeccable audit`.

**Architecture:** Update Next.js components to use semantic CSS tokens (`DESIGN.md`), WCAG 2.1 AA compliant text contrast, ARIA grid attributes, and keyboard listeners. Verify via Jest test suite.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Jest, React Testing Library.

**Spec:** Impeccable Audit Findings (P1 items) from 2026-10-23 session.

## Global Constraints
- Must maintain 100% pass rate on all Jest test suites.
- Must preserve mobile-first ergonomics and safe area insets.
- Do not introduce new third-party dependencies.
- Follow `antislop-ui`, `antislop-layoutmobile`, and `antislop-code` guidelines.

## Review Focus
- Contrast ratio on attendance matrix cell hover must exceed 4.5:1.
- Matrix cells must support keyboard navigation (`Enter` / `Space`) to cycle status.
- Dark theme styling on Button variants (`secondary`, `outline`, `ghost`) and Badge variants.
- Root dashboard shell and login page background must inherit `var(--bg-main)`.

---

### Task 1: Fix Text Contrast in Attendance Matrix
**Files:**
- Modify: `src/app/(dashboard)/kehadiran/input/page.tsx:900-915`

- [ ] **Step 1: Update cell contrast classes**
  Replace low-contrast `text-slate-400 on bg-blue-200` with `text-blue-950 font-bold dark:text-blue-100` and `text-slate-300` with accessible `text-slate-500 dark:text-slate-400`.
- [ ] **Step 2: Verify visually and structurally**

### Task 2: Implement Design Tokens & Dark Mode Shell
**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Update `layout.tsx` and `login/page.tsx` wrapper backgrounds to `bg-[var(--bg-main)] dark:bg-[#090d16]`**
- [ ] **Step 2: Update `Button.tsx` variants with dark mode styles**
- [ ] **Step 3: Update `Badge.tsx` variants with dark mode styles**

### Task 3: Keyboard Navigation & ARIA Grid in Monthly Matrix
**Files:**
- Modify: `src/app/(dashboard)/kehadiran/input/page.tsx:830-920`

- [ ] **Step 1: Add `role="grid"` to table, `role="row"` to trs, `role="gridcell"` to interactive tds**
- [ ] **Step 2: Add `tabIndex={0}` and keyboard handler for `Enter` and `Space` key presses**
- [ ] **Step 3: Add descriptive `aria-label` specifying student name, day date, and current status**

### Task 4: Unit Test Suite for P1
**Files:**
- Create: `tests/components/a11y-p1-audit.test.tsx`

- [ ] **Step 1: Write tests verifying dark mode classes on Button & Badge**
- [ ] **Step 2: Write tests verifying keyboard Enter/Space and ARIA attributes on attendance matrix**
- [ ] **Step 3: Run Jest suite to verify 100% pass**

### Task 5: Documentation & Changelog
**Files:**
- Modify: `doc/PRD.md`
- Create: `changelogs/CHANGELOG_24_10_2026.md`

- [ ] **Step 1: Update `doc/PRD.md` with accessibility and theming requirements**
- [ ] **Step 2: Create `changelogs/CHANGELOG_24_10_2026.md` summarizing changes**
