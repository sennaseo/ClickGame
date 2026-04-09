# 신입사원 스탯 빌더 — v6 변경사항 문서

> 작성일: 2026-04-09
> 버전: v6 (확률 강화 시스템 리뉴얼)

---

## 1. 변경 배경

v5까지의 서비스는 "클릭 → 포인트 → 스탯 확정 구매"라는 단순한 루프였다. 사용자 피드백과 시장 분석 결과, 세 가지 핵심 문제가 드러났다.

1. **정체성 부재** — 범용적인 성격 테스트와 차별점이 없었다. "직장인 밈"이라는 테마가 UI에만 존재하고 게임 플레이에는 녹아들지 못했다.
2. **재방문 동기 부족** — 스탯을 한 번 사면 끝이었고, 결과가 예측 가능해서 반복 플레이 유인이 없었다.
3. **공유 가능성 부재** — 캡처 없이 결과를 공유할 방법이 없었고, SNS 바이럴을 유도하는 장치가 없었다.

### 핵심 참고 사례

- 카카오톡 검 강화하기 (확률 기반 강화의 중독성)
- 쿠키런 가챠 시스템 (변동 보상 루프)
- MBTI 밈 테스트 (공유 기반 바이럴)

---

## 2. 변경 요약

| 영역 | v5 (이전) | v6 (현재) |
|------|-----------|-----------|
| 핵심 메커닉 | 포인트로 스탯 확정 구매 | **확률 기반 강화** (성공/실패) |
| 시나리오 | 랜덤 2개 스탯 중 택1 | **12개 구체적 직장 상황** + 택1 |
| 강화 결과 | 즉시 반영 | **1.2초 긴장감 연출** → 성공/실패 애니메이션 |
| 공유 기능 | 없음 | **결과 카드** (Web Share API + 클립보드 복사) |
| 칭호 시스템 | 없음 | **16개 칭호** (4단계 희귀도) |
| 상점 | 22개 아이템 (확정 구매) | **9개 아이템** (확률 강화, 실패 시 하락 가능) |
| 음수 방지 | 없음 | **클라이언트 + DB 양쪽** 0 클램핑 |
| 진화 시스템 | 없음 | **8스탯 × 5단계 = 40폼** 시각적 진화 |
| 도감 | 없음 | **수집형 갤러리** (완성도 %, 해금 추적) |

---

## 3. 파일별 변경 상세

### 3.1 `src/data/stats.ts` — 완전 재작성

게임의 모든 상수, 타입, 유틸리티를 담는 핵심 데이터 파일.

#### 새로 추가된 타입

```typescript
// 강화 아이템 (확률 시스템)
interface EnhanceItem {
  id: string;
  name: string;
  cost: number;        // 필요 포인트
  stat: string;        // "random" = 럭키박스
  successAmt: number;  // 성공 시 +%
  failAmt: number;     // 실패 시 -% (0이면 유지, 음수면 하락)
  successRate: number;  // 0~1 확률
  em: string;          // 이모지
}

// 직장 시나리오
interface Scenario {
  situation: string;    // 구체적 상황 설명
  choiceA: { label: string; stat: string; desc: string };
  choiceB: { label: string; stat: string; desc: string };
}

// 칭호
interface Title {
  id: string;
  name: string;
  condition: (stats: StatsMap) => boolean;
  desc: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}
```

#### 강화 아이템 구성 (ENHANCE_ITEMS)

| 아이템 | 비용 | 대상 스탯 | 성공률 | 성공 시 | 실패 시 |
|--------|------|-----------|--------|---------|---------|
| 에너지드링크 원샷 | 10pt | anger | 70% | +8% | 유지 |
| 닌텐도 e숍 카드 | 10pt | peterpan | 70% | +8% | 유지 |
| 노이즈캔슬링 이어폰 | 10pt | avoidant | 70% | +8% | 유지 |
| 감성 일기장 | 10pt | menhera | 70% | +8% | 유지 |
| 까칠한 선글라스 | 10pt | tsundere | 70% | +8% | 유지 |
| 검은 망토 | 10pt | chuuni | 70% | +8% | 유지 |
| 스타벅스 기프티콘 | 10pt | simp | 70% | +8% | 유지 |
| 자기계발서 | 10pt | delusion | 70% | +8% | 유지 |
| 🎰 럭키박스 | 25pt | 랜덤 | 50% | +15% | **-5%** |

#### 시나리오 (SCENARIOS) — 12개

한국 직장인이라면 공감할 수밖에 없는 초구체적 상황들. 예시:

- "금요일 오후 5시 55분, 팀장님이 '이거 하나만' 이라고 했다."
- "동기가 3개월 만에 승진했다. 나는 2년째 제자리."
- "슬랙에 @전체 멘션이 왔다. '내일 토요일 출근 가능한 분?'"

각 시나리오는 두 가지 선택지를 제공하고, 선택한 스탯에 대해 **65% 확률로 강화를 시도**한다.

#### 칭호 시스템 (TITLES) — 16개

| 희귀도 | 개수 | 조건 예시 |
|--------|------|-----------|
| rare | 8개 | 단일 스탯 50% 이상 (예: "퇴근 5분전 폭주기관차") |
| epic | 5개 | 2개 스탯 콤보 30%+ (예: "울면서 출근하는 유형") |
| legendary | 3개 | 총 오염도 400%+ 또는 극한 콤보 (예: "사회 부적응자 (공식)") |

#### 유틸 함수

- `getUnlockedTitles(stats)` — 현재 해금된 칭호 목록
- `getBestTitle(stats)` — 가장 높은 희귀도의 칭호 반환
- `corruptionLevel(total)` — 총 오염도 기반 레벨 (0~5)
- `pick2()` — 랜덤 2개 스탯 선택

---

### 3.2 `src/components/EnhanceResult.tsx` — 신규

강화 성공/실패를 드라마틱하게 보여주는 풀스크린 오버레이 컴포넌트.

**동작 흐름:**

1. **rolling 페이즈** (1.2초): 이모지가 흔들리며 "강화 중..." 텍스트 표시. 긴장감 연출.
2. **result 페이즈** (2초 후 자동 닫힘):
   - 성공: 이모지에 glow 이펙트 + 랜덤 성공 메시지 ("대성공!! ✨" 등) + 스탯 증가량 표시
   - 실패: 이모지 grayscale + 투명도 50% + 빨간 실패 메시지 + 하락량 표시 (있을 경우)

**Props:**

```typescript
interface Props {
  statId: string;      // 강화 대상 스탯
  success: boolean;    // 성공 여부
  amount: number;      // 변동량 (+/-)
  onDone: () => void;  // 닫힌 후 콜백
}
```

---

### 3.3 `src/components/ChoiceModal.tsx` — 재작성

이전: `opts: [Stat, Stat]` props로 랜덤 2개 스탯 표시
현재: `scenario: Scenario` props로 **구체적 직장 상황** 표시

**주요 변경:**

- 상황 텍스트 (`scenario.situation`) 표시 영역 추가
- 각 선택지에 라벨 + 설명 + "강화 시도" 버튼 포함
- 10초 카운트다운, 3초 이하 시 빨간색 경고
- 시간 초과 시 랜덤 선택
- `useRef`로 더블 클릭 방지

---

### 3.4 `src/components/ResultCard.tsx` — 신규

공유 가능한 결과 카드 컴포넌트. SNS 바이럴의 핵심 장치.

**구성 요소:**

- 그라데이션 헤더 바 (1위 + 2위 스탯 색상)
- 칭호 배지 (해금 시)
- 메인/서브 성향 (이모지 + 이름 + 수치)
- 레이더 차트 (180px)
- 통계 행: 총 클릭 / 강화 시도 / 성공률
- 상태 메시지 (오염도 기반)
- 공유 버튼: Web Share API 우선 → 미지원 시 클립보드 복사

**공유 텍스트 포맷:**

```
🏢 나의 직장인 성격 카드
주 성향: 🤬 분노조절장애 72%
부 성향: 🏃 회피형 45%
칭호: 퇴근 5분전 폭주기관차
강화 15회 (성공률 67%)
"인사팀에서 면담 요청이 왔습니다"

👉 너도 해봐! [링크]
```

---

### 3.5 `src/app/page.tsx` — 완전 재작성

모든 신규 시스템을 통합하는 메인 페이지.

#### 새로운 상태값

```typescript
const [enhanceResult, setEnhanceResult] = useState(null);  // 강화 결과 (성공/실패)
const [showResult, setShowResult] = useState(false);         // 결과 카드 표시
const [enhanceAttempts, setEnhanceAttempts] = useState(0);   // 총 강화 시도 횟수
const [enhanceSuccesses, setEnhanceSuccesses] = useState(0); // 강화 성공 횟수
```

#### 핵심 로직 변경

**doClick (클릭):**
- 포인트 적립 (오염 레벨에 따라 1~3pt)
- 10클릭마다 랜덤 시나리오 발생 (`SCENARIOS`에서 랜덤 선택)

**doPick (시나리오 선택):**
- 65% 확률로 강화 성공/실패 판정
- 성공: `eventStat(sid, +inc)` → 성공 애니메이션
- 실패: `eventStat(sid, -loss)` (inc의 30%) → 실패 애니메이션

**doEnhance (상점 강화):**
- 아이템별 `successRate` 확률로 성공/실패 판정
- 성공: `buyStat(sid, +successAmt, cost)`
- 실패: `buyStat(sid, failAmt, cost)` (포인트는 무조건 차감)
- 럭키박스: 랜덤 스탯 대상

#### 레이아웃

- **데스크톱 (md+)**: h-screen 2컬럼, 스크롤 없음. 왼쪽=캐릭터, 오른쪽=레이더+상점
- **모바일**: 1컬럼, 상점 접이식 토글
- 상점은 데스크톱에서 항상 열려있음 (`md:grid`), 모바일에서만 토글

---

### 3.6 `src/hooks/useGameState.ts` — 음수 방지 패치

**변경 내용:**

`buyStat`과 `eventStat`에서 스탯 값이 음수로 내려가는 것을 방지.

```typescript
// v5 (이전)
Math.min((prev.stats[statId] || 0) + amount, 100)

// v6 (현재) — 0 이상, 100 이하로 클램핑
Math.max(0, Math.min((prev.stats[statId] || 0) + amount, 100))
```

이 변경은 클라이언트 측 optimistic update에 적용되며, 실제 DB 업데이트는 RPC 함수에서 동일한 로직으로 처리된다.

---

### 3.7 `supabase/schema.sql` — RPC 함수 음수 방지

**변경 함수:** `game_buy_stat`, `game_event_stat`

```sql
-- v5 (이전)
to_jsonb(least((stats->>stat_id)::int + amt, 100))

-- v6 (현재) — 0 이상, 100 이하로 클램핑
to_jsonb(greatest(least((stats->>stat_id)::int + amt, 100), 0))
```

**적용 방법:** Supabase SQL Editor에서 `game_buy_stat`과 `game_event_stat` 함수를 `CREATE OR REPLACE`로 재실행.

---

### 3.8 `src/data/evolution.ts` — 신규 (진화 시스템 데이터)

8개 스탯 각각에 5단계 진화 폼 = **총 40개 수집 폼**.

#### 진화 단계 구조

```typescript
interface EvolutionStage {
  level: number;        // 1-5
  name: string;         // 폼 이름 (예: "분노의 화신")
  minPercent: number;   // 필요 스탯 % (1, 20, 40, 60, 80)
  deco: string[];       // 장식 이모지 (캐릭터 주변에 표시)
  aura: string;         // glow 색상 (강해질수록 진해짐)
  desc: string;         // 도감 설명 텍스트
}
```

#### 단계별 임계점

| 단계 | 필요 스탯 | 등급 | 비주얼 변화 |
|------|-----------|------|-------------|
| Lv.1 | 1% | COMMON | 장식 이모지 1개 |
| Lv.2 | 20% | COMMON | 장식 이모지 2개 + 진화 뱃지 |
| Lv.3 | 40% | RARE | 장식 이모지 3개 + 강한 오라 |
| Lv.4 | 60% | EPIC | 장식 이모지 3개 + 더 강한 오라 |
| Lv.5 | 80% | LEGENDARY | 장식 이모지 4개 + 최대 오라 |

#### 예시: anger 스탯 진화

| Lv | 이름 | 장식 | 설명 |
|----|------|------|------|
| 1 | 살짝 짜증러 | 😤 | "미세먼지 같은 짜증이 쌓이기 시작했다" |
| 2 | 혈압 상승 | 😠💢 | "점심 메뉴 정할 때도 화가 난다" |
| 3 | 폭주모드 | 🤬💢🔥 | "키보드가 부서지기 직전이다" |
| 4 | 분노의 도깨비 | 👹🔥⚡ | "사무실에 화재경보가 울린다" |
| 5 | 분노의 화신 | ☄️🔥👹💥 | "퇴근길에 용암이 흐른다" |

#### 유틸 함수

- `getStatStage(statId, percent)` — 현재 진화 단계
- `getNextStage(statId, percent)` — 다음 진화 단계 (미리보기용)
- `checkEvolution(statId, prevPercent, newPercent)` — 임계점 돌파 감지
- `getUnlockedForms(stats)` — 전체 해금 폼 목록
- `TOTAL_FORMS` — 상수 40

---

### 3.9 `src/components/EvolutionAlert.tsx` — 신규

진화 임계점 돌파 시 풀스크린 연출 컴포넌트. 강화 성공 후 자동 트리거.

**3단계 페이즈:**

1. **intro** (0.8초): "진 화 중 . . ." + 번개 이모지 흔들림
2. **reveal** (0.8초): 진화 이모지 확대 등장 + "진화 완료!" 텍스트
3. **show** (2.6초): 폼 이름 + 등급 뱃지 + 설명 + 장식 이모지 + "📖 도감에 등록되었습니다"

**총 4.2초 후 자동 닫힘.**

---

### 3.10 `src/components/Collection.tsx` — 신규

진화 도감 모달. 수집 콘텐츠의 핵심.

**구성:**

- **헤더**: 수집 진행도 (예: "12 / 40 폼 수집") + 완성도 퍼센트 + 프로그레스 바
- **스탯별 섹션** (8개): 스탯 아이콘/이름 + 현재 % + 해금 수 + 다음 진화 필요 %
- **5칸 그리드**: 각 진화 단계를 카드로 표시
  - 해금: 이모지 + 이름 + 등급 도트
  - 미해금: ❓ + 필요 % (흐릿하게)
  - 현재 단계: ★ 표시 + 하이라이트 테두리
- **설명**: 현재 도달한 단계의 desc 텍스트 표시

---

### 3.11 `src/components/Face.tsx` — 진화 장식 추가

**추가된 props**: `stats?: StatsMap`

**변경 내용:**

- 지배 스탯의 현재 진화 단계를 계산 (`getStatStage`)
- 진화 데코 이모지를 캐릭터 주변에 원형으로 배치 (motion/react로 부유 애니메이션)
- 오라 glow를 진화 단계의 `aura` 색상으로 강화
- Lv.2 이상이면 하단에 진화 이름 뱃지 표시 (예: "👹 분노의 도깨비")

---

### 3.12 `src/app/page.tsx` — 진화 + 도감 통합

**새 상태:**

```typescript
const [showCollection, setShowCollection] = useState(false);
const [evolutionAlert, setEvolutionAlert] = useState(null);
const [pendingEvolution, setPendingEvolution] = useState(null);
```

**진화 감지 흐름:**

1. `doPick` 또는 `doEnhance`에서 강화 성공 시 `checkEvolution()` 호출
2. 임계점 돌파 시 `pendingEvolution`에 저장
3. `EnhanceResult` 애니메이션 종료 후 (`onDone`) → `EvolutionAlert` 자동 표시
4. 진화 알림 종료 후 자동 닫힘

**새 UI 요소:**

- 캐릭터 카드에 "다음 진화: {이름} ({필요%})" 미리보기 텍스트
- "📖 도감 12/40" 버튼 (결과 카드 버튼 옆)

---

### 3.13 `src/app/globals.css` — evolutionBurst 애니메이션 추가

```css
@keyframes evolutionBurst {
  0%   { opacity: 0; transform: scale(0.3) rotate(-10deg); filter: brightness(3); }
  50%  { opacity: 1; transform: scale(1.15) rotate(3deg); filter: brightness(1.5); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(1); }
}
```

---

## 4. 기존 유지 컴포넌트 (변경 없음)

| 파일 | 역할 |
|------|------|
| `src/components/Face.tsx` | 캐릭터 얼굴 (220x220, 진화 장식 추가) ✅ 패치 |
| `src/components/Radar.tsx` | SVG 레이더 차트 (size prop, 기본 180px) |
| `src/components/Toast.tsx` | 알림 토스트 (motion/react) |
| `src/components/Burst.tsx` | 클릭 파티클 이펙트 (motion/react) |
| `src/hooks/useUser.ts` | UUID 기반 익명 유저 관리 (localStorage) |
| `src/lib/supabase.ts` | Supabase 클라이언트 싱글톤 |
| `src/app/layout.tsx` | Outfit 폰트, 한국어 OG 메타데이터 |
| `src/app/globals.css` | Tailwind v4 + CSS 변수 + 키프레임 애니메이션 |

---

## 5. 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15.3+ | App Router, SSR |
| React | 19.1+ | UI 렌더링 |
| TypeScript | 5.8+ | 타입 안전성 |
| Tailwind CSS | 4.1+ (v4) | 스타일링 (`@tailwindcss/postcss`) |
| Supabase | 2.49+ | Realtime DB (WebSocket), RPC, RLS |
| motion | 12.38+ | 애니메이션 (Face, Toast, Burst) |
| Outfit | Google Font | 메인 폰트 |

---

## 6. DB 스키마

### 테이블

| 테이블 | 설명 |
|--------|------|
| `game_state` | 공유 게임 상태 (단일 행, id=1). stats(jsonb), total_clicks, bank |
| `users` | 익명 유저 (UUID PK). total_clicks, total_spent |
| `action_log` | 활동 로그. action_type enum (click/buy/event) |

### RPC 함수

| 함수 | 파라미터 | 동작 |
|------|----------|------|
| `game_add_click` | earn:int | total_clicks +1, bank +earn |
| `game_buy_stat` | stat_id:text, amt:int, cost:int | 스탯 변경 (0~100 클램핑), bank 차감 |
| `game_event_stat` | stat_id:text, amt:int | 스탯 변경만 (0~100 클램핑) |
| `increment_user_clicks` | uid:uuid, n:int | 유저 개인 클릭 수 증가 |
| `increment_user_spent` | uid:uuid, n:int | 유저 개인 소비 기록 증가 |

---

## 7. 프로젝트 구조

```
ClickGame/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (Outfit 폰트, OG 메타)
│   │   ├── page.tsx            # 메인 페이지 (게임 로직 통합) ✅ 재작성
│   │   └── globals.css         # Tailwind v4 + CSS 변수 + 애니메이션
│   ├── components/
│   │   ├── Face.tsx            # 캐릭터 얼굴 (motion/react)
│   │   ├── Radar.tsx           # SVG 레이더 차트
│   │   ├── ChoiceModal.tsx     # 시나리오 선택 모달 ✅ 재작성
│   │   ├── EnhanceResult.tsx   # 강화 성공/실패 연출 ✅ 신규
│   │   ├── EvolutionAlert.tsx  # 진화 풀스크린 연출 ✅ 신규
│   │   ├── Collection.tsx      # 진화 도감 모달 ✅ 신규
│   │   ├── ResultCard.tsx      # 공유 결과 카드 ✅ 신규
│   │   ├── Toast.tsx           # 알림 토스트
│   │   └── Burst.tsx           # 클릭 파티클
│   ├── data/
│   │   ├── stats.ts            # 게임 데이터 전체 ✅ 재작성
│   │   └── evolution.ts        # 진화 시스템 데이터 ✅ 신규
│   ├── hooks/
│   │   ├── useGameState.ts     # Supabase Realtime 훅 ✅ 패치
│   │   └── useUser.ts          # 익명 유저 관리
│   └── lib/
│       └── supabase.ts         # Supabase 클라이언트
├── supabase/
│   └── schema.sql              # DB 스키마 + RPC 함수 ✅ 패치
├── package.json
├── .env.local.example          # 환경변수 템플릿
└── docs/
    └── v6-changelog.md         # 이 문서
```

---

## 8. 남은 작업

- [ ] Supabase SQL Editor에서 `game_buy_stat`, `game_event_stat` RPC 함수 재실행 (음수 방지 적용)
- [ ] `npm run dev`로 전체 플로우 테스트
- [ ] Vercel 배포
- [ ] (선택) html2canvas로 결과 카드 이미지 생성 기능 추가
- [ ] (선택) 실제 도메인 링크를 공유 텍스트에 반영
