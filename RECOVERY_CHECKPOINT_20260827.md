# HD-20 Recovery Checkpoint

- Approved landing visual reference: `울산캠퍼스 5S 활동관리 대시보드(1).png`
- Recovery source branch: `backup-before-design2-restore-20260827-1410`
- Source commit before mistaken Design2 rollback: `1f43015f98d6b264866064eda58203a742a6b9d4`
- Rule: HD-20 only. Do not mix HD-22 assets, code, UI, or business rules.
- Recovery order: restore accumulated HD-20 functionality -> verify landing route -> match approved dashboard visual -> verify navigation/drilldowns/audit/actions.
