# HD-20 RC QA Coding Log — 2026-10-06

## Scope
Release Candidate QA for workflow/navigation UX, production-data isolation, deep-link persistence, advancement ownership, master-data IA, responsive layout contracts, and retirement of legacy/demo presentation paths.

## Verified corrections
- Advancement is owned by seven operational subtabs; legacy awWorkplace is defensive-hidden.
- Advancement qualification remains strict: evidence completeness -> 3 criteria -> workplace evidence verification -> formal review -> official confirmation. 3/3 is not automatic confirmation.
- Field and maturity showcase loaders are removed from production boot.
- web-validation-fixture activates only with ?validation=1.
- Supabase remote sync is isolated only with ?validation=1; normal production URL retains DB sync.
- demo-seed-data.js is not referenced by index.html or final-layout-polish.js.
- Canonical area/sub deep links take precedence over legacy tab and preserve advancement/map across reload.
- Integrated Master is the canonical five-function operating-standard UI: organization/team, per-person targets, request source, work/factors, mailing.
- maturity-condition-analysis.js is retired from production boot because its legacy LEVEL panel duplicates the current 3-criteria judgement subtab.
- Browser smoke enforces exclusive advancement owner visibility and rejects legacy awWorkplace resurrection.
- Design smoke covers 1440, 1152, 900 and 375 widths and checks navigation, body overflow, desktop workflow-rail overflow and Master modal bounds.

## Important correction to earlier QA note
advancement-subtab-dedupe-guard.js is not a direct index script, but it is dynamically loaded by final-layout-polish.js. Its current role is defensive only and it is runtime-relevant.

## Key commits
cabeb804, fbf99dd, 0998b373, 5de666bd, 8d6ad722, 359bf067, c7b02b69, 31dd2440, 72388aee, 707710fc, c7193baf, 00690762, d7fe8a53, f504a87d, 3c82dfee, 3a805f45, cdb15ed8, fad41648, dd99cd56, e7f6ad96, 45fcf968, f97c1347, 43478c61.

## Release gate
Do not label the RC as PASS solely from static code inspection or committed smoke contracts. Final PASS requires an observable successful current workflow/runtime execution or equivalent browser evidence for the latest production revision.
