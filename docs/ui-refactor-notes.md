# UI Refactor Notes

## Current UI Problems
- 클릭해야 하는 캐릭터 영역과 보조 정보 패널의 시각적 위계가 비슷해서 메인 액션 집중도가 약했다.
- 상점이 단순 버튼 그리드라서 8개 스탯의 현재 상태와 강화 결과를 한눈에 파악하기 어려웠다.
- 이벤트 모달이 기능은 있지만 임팩트가 약해서 10클릭 보상 순간이 충분히 크게 느껴지지 않았다.
- 공유 CTA와 결과 요약이 약해서 밈 게임 특유의 "찍고 퍼가고 싶은" 마감 포인트가 부족했다.
- 모바일에서는 패널이 단순 누적이라 정보 밀도가 높고, 클릭 루프가 직관적으로 강조되지 않았다.

## Refactor Plan
- 캐릭터 클릭 스테이지를 화면의 주인공으로 올리고, 포인트/진단/보상 정보를 그 주변에 묶는다.
- 상점을 스탯 진행형 리스트로 바꿔 스캔성과 상호작용 명확성을 높인다.
- 이벤트 모달, 토스트, 캐릭터, 레이더 그래프의 피드백 강도를 높여 클릭 보상감을 강화한다.
- 결과 요약 카드와 공유 버튼을 별도 섹션으로 분리해 공유 동기를 직접적으로 만든다.
- 전역 스타일 토큰과 패널 스타일을 정리해 전체 UI를 더 일관된 다크 프리미엄 톤으로 맞춘다.

## Files Changed
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/ChoiceModal.tsx`
- `src/components/Face.tsx`
- `src/components/Radar.tsx`
- `src/components/Toast.tsx`

## Follow-up Pass
- 모바일에서는 정보량을 줄이기 위해 상단 지표를 압축하고, `스탯 / 로그 / 결과` 탭 구조로 재정리했다.
- 하단 고정 CTA 바와 safe area 패딩을 넣어 한 손 플레이 시 접근성을 높였다.
- 이벤트 등장 타이밍은 누적 클릭 기준 `10 -> 50 -> 100 -> 500 -> 1000 ...` 식으로 점점 드물어지도록 변경했다.

## Verification Notes
- 게임 로직 훅과 기존 핸들러 (`addPoints`, `buyStat`, `eventStat`, `logAction`) 는 그대로 유지했다.
- 로컬에서 `npm run build` 검증을 시도했지만 현재 환경에는 의존성이 설치되지 않아 `next: command not found` 로 중단됐다.
