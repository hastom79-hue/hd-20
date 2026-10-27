# HD-20 Development Log — 2026-09-16 Zero-Activity Team Comparison Fix

검증 중 전월에는 활동이 있었으나 당월 0건인 팀이 당월 Map에 존재하지 않아 감소팀에서 누락될 수 있는 경계조건을 발견했다.

최신월 팀 집합과 직전월 팀 집합의 합집합으로 비교 대상을 재구성했다. 따라서 `전월 > 0, 당월 = 0` 팀도 증감과 감소팀 분석에 포함된다.

캐시를 `activity-import-analysis-mail-preview.js?v=20260916-2`로 갱신했다. 운영 데이터 write, 자동 메일 발송, 임의 목표 생성은 추가하지 않았다.