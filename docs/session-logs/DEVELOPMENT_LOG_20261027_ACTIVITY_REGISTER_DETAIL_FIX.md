# 5S 자율개선 등록 후 팝업 미종료 및 개선번호 상세조회 누락 수정

## 재현 증상
1. 등록 성공 후 등록 팝업이 계속 열린 상태로 남음.
2. 자율개선 이력 표에 개선번호가 없어 상세조회 팝업을 열 수 없음.

## 원인
- activity-register-modal.js가 저장 성공을 인지하지 않고 등록 버튼 클릭 120ms 뒤 입력값 공란 여부로 팝업 종료를 추측함. 개선내용 입력 필드가 없는 폼에서는 조건이 성립하지 않음.
- activity-workflow.js의 활동 실적 테이블은 6열(일자·구분·생산팀·문제점·개선내용·상태)만 렌더링하며 레코드 ID/조회 핸들러 없음.

## 반영
- activity-workflow.js: localStorage 저장 완료 직후 `hd20-activity-register-success` 이벤트 발생. 원래 `hd20-gmes-5s-imported` 이벤트 및 KPI 갱신 유지.
- activity-register-modal.js: 성공 이벤트 수신 시에만 팝업 닫기. 120ms 추정 종료 로직 제거.
- activity-workflow.js: 개선번호 첫 열, 번호 버튼, 상세 팝업 및 기존 최근 등록 리스트 번호 링크 추가. 기존 ID 우선, 구형 레코드에 ID가 없는 경우 화면용 날짜·인덱스 대체번호 표시(원천 데이터 불변).
- 상세조회: 활동일/유형/팀/등록자/작업장/위치/상태/판정/문제점/개선내용/BEFORE·AFTER 사진.
- activity-detail-dialog.css: 링크·팝업 스타일.
- index.html: 캐시 버전 갱신.

## 검증 상태
- 두 JS 파일 구문검사 PASS.
- 성공 이벤트와 종료 리스너, 테이블 개선번호, 상세조회 함수, CSS/JS 버전 참조 정적검사 PASS.
- 실제 GitHub Pages 브라우저에서 저장·재조회·사진 표시까지의 E2E 검증은 아직 미완료.
- 데이터 구조 및 저장된 원천 레코드는 변경하지 않음.
