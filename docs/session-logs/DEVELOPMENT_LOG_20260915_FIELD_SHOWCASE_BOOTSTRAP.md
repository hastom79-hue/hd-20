# Development Log — 2026-09-15 Field Showcase Bootstrap

사용자 요청에 따라 빈 화면 체감을 줄이기 위해 울산 생산현장 맥락의 초기 샘플 Case 6건과 공개 현장 참고사진 영역을 대시보드에 추가했다.

중요 원칙:
- 생성 Case는 `초기 구축 샘플 · 운영실적 제외`로 명시한다.
- canonical Activity/Audit/Action localStorage와 Supabase 운영 데이터에는 쓰지 않는다.
- KPI에 합산하지 않는다.
- 공개 현장사진은 특정 샘플 Case의 Before/After 증빙으로 연결하지 않고 별도 참고사진으로 표시한다.
- 실제 운영 데이터가 확보되면 샘플을 대체할 수 있는 구조로 둔다.

현장 맥락은 정리·청소·시각화·정돈·Green Zone·AGV 동선개선 등으로 구성했다.