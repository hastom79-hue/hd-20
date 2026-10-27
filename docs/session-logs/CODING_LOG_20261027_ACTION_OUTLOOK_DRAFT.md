# HD-20 개선요청 등록 시 Outlook 메일 초안 자동 생성 (2026-10-27)

## 요구
사용자 제공 Outlook 작성 화면을 기준으로 개선요청 등록 시 담당자에게 전달할 메일 초안을 자동으로 열어야 함.

## 구현
- `action-mail-workflow.js`: 등록창의 기본 발송 방법을 `outlook`으로 변경. 등록 성공 후 기존 `openOutlookWeb(c)`를 통해 Outlook 웹 작성창이 자동 열림.
- Outlook 작성창에는 생산팀 마스터의 담당자 이메일(To), 통합기준정보 메일링 설정의 활성 CC, 제목 [5S 개선요청] 생산팀 / 작업장 / 요청번호, 발굴출처·요청번호·작업장·생산팀·미흡사항·조치기한·해당 개선조치 응답 URL이 자동 입력됨.
- Outlook 데스크톱(기본 메일앱 연동) 및 명시적 자동발송은 보조 옵션으로 유지.
- 발송은 Outlook에서 사용자가 직접 '보내기'를 눌러야 하며, 초안 생성만으로 메일이 전송되지는 않음.
- 등록된 개선요청 현황에서 '발송'을 다시 누를 때도 Outlook 초안이 기본값.
- `index.html`: 신규 JS cache version으로 교체.
- `tests/action-outlook-draft-smoke.cjs`: Outlook compose 링크, To/CC/제목/본문/조치 링크/기본값 검사.
- GitHub Actions workflow 추가.

## 검증
- JS 구문검사 및 HTML 캐시 버전 참조는 정적 확인.
- GitHub Pages 실브라우저, Outlook 로그인 및 팝업 허용 여부, 실제 메일 작성창 동작은 아직 미검증.
- 기존 등록 사례·팀 마스터·메일링 기준정보 데이터는 변경하지 않음.
