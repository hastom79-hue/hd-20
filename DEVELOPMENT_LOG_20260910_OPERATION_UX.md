# HD-20 Operational UX Development Log — 2026-09-10

## 목적
HD-20을 단순 메뉴 모음이 아니라 실제 운영 판단과 후속조치가 이어지는 웹 시스템으로 강화한다.

## 서브탭 운영계약
- dashboard.summary: 종합현황
- dashboard.analysis: 성과·운영분석
- activity.manage: 활동관리
- activity.analysis: 실적분석
- advancement.judge: 후보·판정
- advancement.standard: 확정·수평전개
- audit.audit: Audit 관리
- audit.retention: 유지관리
- action.manage: 개선조치
- action.verify: 효과·재발관리

각 서브탭에는 목적, 판단기준, 다음 행동, 핵심 기능을 명시한다.

## 상세 데이터 그리드
- 현재 화면의 실제 표를 우선 사용
- 표가 없을 경우 Canonical localStorage 원천을 사용
- 검색, CSV 다운로드, 정렬, 행 표시 수, 행 상세팝업 제공
- 실제 데이터가 없으면 Empty State 표시
- 임의/샘플 데이터 생성 금지

원천 키:
- 5S 활동 / 고도화: `hd20GMES5SAutoImproveRawV1`
- Audit / 유지관리: `hd20AuditRandomDrawsV1`
- 개선조치 / 효과·재발: `hd20ActionCasesV2`

## Traceability
Audit → 개선조치 → 효과검증 → 재발 흐름을 `auditDrawId` / `sourceCaseId` 기준으로 연결한다.

## 2026-09-10 추가 무결성 보정
- 한국 운영 기준의 기한경과 판단은 `Asia/Seoul` 날짜를 사용하도록 보정.
- 효과검증 완료 집계는 `조치 완료 + 효과검증 완료` 조건을 모두 만족한 Case만 포함.
- 재발 집계는 `조치 완료 + 효과검증 완료 + 재발 확인` Case만 포함.
- 기존 V2 본체를 임의 중복 수정하지 않고 `hd20-operational-integrity.js` 모듈로 운영기준 보정 기능을 분리.

## 자동검증
- `.github/workflows/subtab-contract-grid-smoke.yml`
- `.github/workflows/ops-v2-smoke.yml`
- 기존 Runtime / Browser / Layout / IA smoke와 병행 확인

## 검증 원칙
- GitHub Pages 배포 SHA가 최신 main SHA와 일치하는지 확인
- Actions 공통 실행환경 실패와 애플리케이션 코드 실패를 분리 판단
- 실제 운영 데이터에 Demo/E2E fixture를 저장하거나 동기화하지 않음
