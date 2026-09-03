# HD-20 Design System Rebuild — Phase 9

Date: 2026-09-03

## Purpose
Strengthen the regression boundary before reducing the remaining presentation CSS layers. This phase changes test infrastructure only and does not change HDPS/5S business rules, KPI semantics, Audit lifecycle, advancement criteria, deadline policy, or canonical stores.

## Changes
- Extended `.github/workflows/design-layout-smoke.yml`.
- Existing viewport matrix retained: 1440×1000, 1152×800 (125% scale equivalent), 900×900, 375×812.
- Existing five-area checks retained: active tab, scroll reset, horizontal overflow, area header uniqueness, Dashboard-only layer isolation, six approved operational KPIs.
- Added `통합기준정보` modal open/close regression for every viewport.
- Added modal bounding-box assertions: visible, positive size, and fully contained inside viewport.

## Why this matters
The next consolidation target is the remaining presentation CSS (`dashboard-priority-groups.css`, `workflow-area-density.css`). Modal/mobile bounding-box checks now provide a stricter safety net while duplicate selectors and `!important` declarations are reduced.

## Business-rule impact
None. No production data, policy default, threshold, KPI formula, Audit randomization, six-month maintenance rule, advancement criteria, official judgment rule, or improvement deadline logic was changed.

## Next
1. Consolidate Dashboard group presentation into the canonical Dashboard contract.
2. Consolidate common workflow density declarations into canonical five-area component rules.
3. Remove obsolete duplicate declarations only after the strengthened layout smoke remains green.
