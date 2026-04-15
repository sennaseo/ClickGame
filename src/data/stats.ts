// ════════════════════════════════════════════
// 신입사원 스탯 빌더 — 데이터 & 타입
// v6: 강화 확률 시스템 + 구체적 시나리오 + 칭호
// ════════════════════════════════════════════

export interface Stat {
  id: string;
  name: string;
  em: string;
  c: string;
  desc: string;
}

export interface EnhanceItem {
  id: string;
  name: string;
  cost: number;
  stat: string;        // "random" = 럭키박스
  successAmt: number;  // 성공 시 +%
  failAmt: number;     // 실패 시 -% (0이면 유지, 음수면 하락)
  successRate: number;  // 0~1 확률
  em: string;
}

export interface Scenario {
  situation: string;    // 구체적 상황 설명
  choiceA: { label: string; stat: string; desc: string };
  choiceB: { label: string; stat: string; desc: string };
}

export interface Title {
  id: string;
  name: string;
  condition: (stats: StatsMap) => boolean;
  desc: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// ─── 8 스탯 ───
export const STATS: Stat[] = [
  { id: "anger",    name: "분노조절장애", em: "🤬", c: "#FF416C", desc: "퇴근 직전 업무 추가에 혈압 상승" },
  { id: "peterpan", name: "피터팬증후군", em: "🧚", c: "#A18CD1", desc: "책임 회피의 달인, 영원한 신입" },
  { id: "avoidant", name: "회피형",       em: "🏃", c: "#667EEA", desc: "읽씹 3일째, 슬랙 자리비움 전문가" },
  { id: "menhera",  name: "멘헤라력",     em: "🩹", c: "#F093FB", desc: "화장실에서 울다가 복귀하는 프로" },
  { id: "tsundere", name: "쯔쿤데레력",   em: "💢", c: "#FA709A", desc: "관심 없다면서 야근하는 당신" },
  { id: "chuuni",   name: "중2병",       em: "⚔️", c: "#8E2DE2", desc: "봉인된 왼팔 안의 사직서" },
  { id: "simp",     name: "호구력",       em: "🐶", c: "#38EF7D", desc: "팀 전체 커피 셔틀 자처" },
  { id: "delusion", name: "망상력",       em: "🌀", c: "#FFD200", desc: "퇴사 후 사업으로 30억 버는 상상 중" },
];

// ─── 강화 아이템 (확률 기반!) ───
export const ENHANCE_ITEMS: EnhanceItem[] = [
  // 기본 (10pt, 70% 성공, 실패 시 유지)
  { id: "e1", name: "에너지드링크 원샷",  cost: 10, stat: "anger",    successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "🥤" },
  { id: "e2", name: "닌텐도 e숍 카드",    cost: 10, stat: "peterpan", successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "🎮" },
  { id: "e3", name: "노이즈캔슬링 이어폰", cost: 10, stat: "avoidant", successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "🎧" },
  { id: "e4", name: "감성 일기장",        cost: 10, stat: "menhera",  successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "📓" },
  { id: "e5", name: "까칠한 선글라스",     cost: 10, stat: "tsundere", successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "🕶️" },
  { id: "e6", name: "검은 망토",          cost: 10, stat: "chuuni",   successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "🧥" },
  { id: "e7", name: "스타벅스 기프티콘",   cost: 10, stat: "simp",     successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "☕" },
  { id: "e8", name: "자기계발서",         cost: 10, stat: "delusion",  successAmt: 8,  failAmt: 0,  successRate: 0.7,  em: "📖" },
  // 고급 (25pt, 50% 성공, 실패 시 -3%)
  { id: "e9",  name: "🎰 럭키박스",      cost: 25, stat: "random",   successAmt: 15, failAmt: -5, successRate: 0.5,  em: "🎰" },
];

// ─── 강화 결과 메시지 ───
export const ENHANCE_SUCCESS_MSGS = [
  "강화 성공! 🔥",
  "대성공!! ✨",
  "올랐다!! 💪",
  "성공이다!! 🎉",
  "강화 완료! ⚡",
];

export const ENHANCE_FAIL_MSGS = [
  "강화 실패... 💀",
  "실패했다... 😭",
  "터졌다... 💔",
  "안 됐다... 🫠",
  "다음엔 되겠지... 😇",
];

// ─── 초구체적 직장 시나리오 ───
export const SCENARIOS: Scenario[] = [
  {
    situation: "금요일 오후 5시 55분, 팀장님이 \"이거 하나만\" 이라고 했다.",
    choiceA: { label: "\"네? 지금요?\" 🤬", stat: "anger", desc: "분노가 치밀어 오른다" },
    choiceB: { label: "이어폰 끼고 못 들은 척 🏃", stat: "avoidant", desc: "투명인간 모드 발동" },
  },
  {
    situation: "월요일 아침 9시 01분. 팀장님이 \"다들 주말 잘 보냈어?\" 라고 물었다.",
    choiceA: { label: "\"네 잘 쉬었습니다\" (거짓말) 🐶", stat: "simp", desc: "반사적 리액션의 달인" },
    choiceB: { label: "\"...\" (무시하고 컴퓨터 킴) 💢", stat: "tsundere", desc: "관심 없다는 표현" },
  },
  {
    situation: "동기가 3개월 만에 승진했다. 나는 2년째 제자리.",
    choiceA: { label: "\"축하해~\" (이 악물고) 🩹", stat: "menhera", desc: "속으로 무너지는 중" },
    choiceB: { label: "\"나도 곧 CEO 될건데\" 🌀", stat: "delusion", desc: "CEO 망상 발동" },
  },
  {
    situation: "사수가 카톡으로 \"한번 보자\"를 보냈다. 토요일 밤 11시.",
    choiceA: { label: "읽씹하고 잠들기 🏃", stat: "avoidant", desc: "세상을 차단한다" },
    choiceB: { label: "\"무슨 일이세요?\" 즉답 🐶", stat: "simp", desc: "호구 본능 발동" },
  },
  {
    situation: "회의가 끝나려는 순간, 부장님이 \"근데 한 가지만 더\" 라고 했다.",
    choiceA: { label: "노트북 덮으려다 멈춤 🤬", stat: "anger", desc: "혈압이 올라간다" },
    choiceB: { label: "화장실 도망각 🏃", stat: "avoidant", desc: "자연스럽게 도주" },
  },
  {
    situation: "점심시간에 팀장님이 \"오늘 다 같이 먹자~\" 라고 했다.",
    choiceA: { label: "\"좋죠~\" (죽고 싶다) 🐶", stat: "simp", desc: "거절을 모르는 DNA" },
    choiceB: { label: "\"저 약속이...\" (거짓말) 🧚", stat: "peterpan", desc: "현실 도피 성공" },
  },
  {
    situation: "퇴근 버튼을 누르려는데, 팀장님이 아직 자리에 있다.",
    choiceA: { label: "팀장님보다 먼저 퇴근 못 함 🩹", stat: "menhera", desc: "눈치 100단의 비애" },
    choiceB: { label: "\"봉인을 풀 때가 왔군\" (칼퇴) ⚔️", stat: "chuuni", desc: "다크플레임마스터 각성" },
  },
  {
    situation: "슬랙에 @전체 멘션이 왔다. \"내일 토요일 출근 가능한 분?\"",
    choiceA: { label: "알림 끄고 자는 척 🏃", stat: "avoidant", desc: "사라지는 기술" },
    choiceB: { label: "\"네 저 가능합니다\" 🐶", stat: "simp", desc: "왜 대답했을까..." },
  },
  {
    situation: "연봉 협상에서 2% 인상을 제안받았다. 물가 상승률은 5%.",
    choiceA: { label: "\"감사합니다\" (분노 억제) 💢", stat: "tsundere", desc: "속으로는 사표 쓰는 중" },
    choiceB: { label: "\"전 이 회사 나가면 30억 법니다\" 🌀", stat: "delusion", desc: "망상 풀파워" },
  },
  {
    situation: "신입이 들어왔다. 그리고 나한테 교육을 맡겼다. 내가 아직 신입인데.",
    choiceA: { label: "\"네 알겠습니다\" (나도 모르는데) 🐶", stat: "simp", desc: "호구력 만렙" },
    choiceB: { label: "\"이건 제 업무가 아닌데요\" 🤬", stat: "anger", desc: "처음으로 반항" },
  },
  {
    situation: "퇴사한 선배가 연락했다. \"거기 아직도 다녀?\"",
    choiceA: { label: "\"ㅋㅋ 곧 나갈거야\" (3년째 같은 말) 🌀", stat: "delusion", desc: "매년 하는 말" },
    choiceB: { label: "(선배 인스타 보며 울음) 🩹", stat: "menhera", desc: "자유로운 삶에 눈물" },
  },
  {
    situation: "회식 2차 노래방. 부장님이 마이크를 건넨다.",
    choiceA: { label: "열정적으로 부름 (속은 죽어가는 중) 🐶", stat: "simp", desc: "프로 리액션러" },
    choiceB: { label: "화장실 간다며 탈출 🏃", stat: "avoidant", desc: "최종 회피 스킬 발동" },
  },
];

// ─── 칭호 시스템 ───
export const TITLES: Title[] = [
  // 단일 스탯 기반
  { id: "t1",  name: "퇴근 5분전 폭주기관차",     condition: s => s.anger >= 50,    desc: "분노 50% 이상", rarity: "rare" },
  { id: "t2",  name: "영원한 인턴",              condition: s => s.peterpan >= 50, desc: "피터팬 50% 이상", rarity: "rare" },
  { id: "t3",  name: "투명인간 마스터",           condition: s => s.avoidant >= 50, desc: "회피 50% 이상", rarity: "rare" },
  { id: "t4",  name: "감정 롤러코스터",           condition: s => s.menhera >= 50,  desc: "멘헤라 50% 이상", rarity: "rare" },
  { id: "t5",  name: "관심 없거든 전문가",         condition: s => s.tsundere >= 50, desc: "쯔쿤데레 50% 이상", rarity: "rare" },
  { id: "t6",  name: "봉인 해제된 신입",          condition: s => s.chuuni >= 50,   desc: "중2병 50% 이상", rarity: "rare" },
  { id: "t7",  name: "만년 커피셔틀",            condition: s => s.simp >= 50,     desc: "호구 50% 이상", rarity: "rare" },
  { id: "t8",  name: "미래의 일론 머스크 (자칭)",   condition: s => s.delusion >= 50, desc: "망상 50% 이상", rarity: "rare" },

  // 콤보 칭호
  { id: "t9",  name: "울면서 출근하는 유형",       condition: s => s.menhera >= 30 && s.simp >= 30,     desc: "멘헤라+호구 30%↑", rarity: "epic" },
  { id: "t10", name: "읽씹하면서 선물 보내는 유형", condition: s => s.avoidant >= 30 && s.simp >= 30,    desc: "회피+호구 30%↑", rarity: "epic" },
  { id: "t11", name: "사표 쓰고 안 내는 유형",     condition: s => s.anger >= 30 && s.avoidant >= 30,   desc: "분노+회피 30%↑", rarity: "epic" },
  { id: "t12", name: "별로라면서 새벽 장문 카톡",   condition: s => s.tsundere >= 30 && s.menhera >= 30, desc: "쯔쿤데레+멘헤라 30%↑", rarity: "epic" },
  { id: "t13", name: "이세계 전생 대기 중",       condition: s => s.chuuni >= 30 && s.delusion >= 30,  desc: "중2병+망상 30%↑", rarity: "epic" },

  // 레전드
  { id: "t14", name: "인간 회사 부적합 판정",     condition: s => Object.values(s).reduce((a,b)=>a+b,0) >= 400, desc: "총 오염도 400%↑", rarity: "legendary" },
  { id: "t15", name: "사회 부적응자 (공식)",      condition: s => Object.values(s).reduce((a,b)=>a+b,0) >= 600, desc: "총 오염도 600%↑", rarity: "legendary" },
  { id: "t16", name: "퇴사각 확정",             condition: s => s.anger >= 70 && s.avoidant >= 70,   desc: "분노+회피 70%↑", rarity: "legendary" },
];

export const TITLE_COLORS: Record<Title["rarity"], string> = {
  common: "#71717a",
  rare: "#818cf8",
  epic: "#f093fb",
  legendary: "#fbbf24",
};

// ─── 유틸 ───
export const EYES: string[][] = [["◕","◕"],["◔","◔"],["◉","◉"],["⊙","⊙"],["◎","◎"],["✖","✖"]];
export const MOUTHS: string[] = ["ω","д","∀","Д","益","□"];

export const corruptionLevel = (total: number) =>
  total < 50 ? 0 : total < 150 ? 1 : total < 300 ? 2 : total < 500 ? 3 : total < 700 ? 4 : 5;

export type StatsMap = Record<string, number>;

export const INITIAL_STATS: StatsMap = {
  anger: 0, peterpan: 0, avoidant: 0, menhera: 0,
  tsundere: 0, chuuni: 0, simp: 0, delusion: 0,
};

// ─── 스탯 조합 캐릭터 시스템 ───

/** 부 성향 표시용 데코 이모지 레이어
 * [0] = 30%+ (secondary deco)
 * [1] = 60%+ (planned: intense)
 * [2] = reserved
 */
export const STAT_DECO_LAYERS: Record<string, string[]> = {
  anger:    ["💢", "🔥", "😤"],
  peterpan: ["✨", "🧚", "🫧"],
  avoidant: ["🎧", "💨", "👻"],
  menhera:  ["🩹", "🌧️", "💙"],
  tsundere: ["🌹", "💢", "😳"],
  chuuni:   ["⚡", "🌑", "🗡️"],
  simp:     ["🐶", "💕", "☕"],
  delusion: ["🌀", "💫", "💰"],
};

/** 희귀도 한국어 표기 */
export const RARITY_KO: Record<string, string> = {
  legendary: "전설",
  epic: "희귀",
  rare: "특별",
};

/** 조합 캐릭터 이름 테이블
 * 키 포맷: `${primary}` 또는 `${primary}+${secondaries를 알파벳 오름차순.join("+")}`
 * specialTitle이 있는 조합은 이 테이블 대신 specialTitle.title 사용
 */
export const COMBINATION_NAMES: Record<string, string> = {
  "anger":                   "현실 분노기계",
  "anger+peterpan":          "화난 요정",
  "anger+avoidant":          "튀려는 분노왕",
  "anger+menhera":           "폭발 직전 멘헤라",
  "anger+tsundere":          "화나지만 챙겨줌",
  "anger+chuuni":            "봉인된 분노",
  "anger+simp":              "화나지만 예스맨",
  "anger+delusion":          "퇴사 상상 폭주",
  "peterpan":                "영원한 신입",
  "peterpan+anger":          "화난 피터팬",
  "peterpan+avoidant":       "도망치는 요정",
  "peterpan+menhera":        "상처받은 아이",
  "peterpan+chuuni":         "봉인된 요정왕",
  "avoidant":                "읽씹 전문가",
  "avoidant+anger":          "화나서 튀는 중",
  "avoidant+menhera":        "읽씹하고 화장실 울기",
  "avoidant+delusion":       "도망치며 사업 구상",
  "menhera":                 "화장실 복귀 프로",
  "menhera+anger":           "폭발 직전의 멘헤라",
  "menhera+simp":            "감성 셔틀",
  "menhera+chuuni":          "봉인된 슬픔",
  "tsundere":                "관심 없다는 야근러",
  "tsundere+anger":          "화나지만 챙겨주는 유형",
  "tsundere+simp":           "쯔쿤데레 심부름꾼",
  "tsundere+delusion":       "관심 없다면서 사업 구상",
  "chuuni":                  "봉인된 사직서",
  "chuuni+delusion":         "어둠의 사업가",
  "chuuni+peterpan":         "봉인된 요정왕",
  "chuuni+simp":             "어둠의 심부름꾼",
  "simp":                    "팀 커피 셔틀",
  "simp+anger":              "화나지만 예스맨",
  "simp+delusion":           "사업가 강아지",
  "simp+menhera":            "감성 셔틀",
  "simp+peterpan":           "영원한 신입 강아지",
  "delusion":                "30억 상상 중",
  "delusion+anger":          "퇴사 상상 폭주",
  "delusion+avoidant":       "도망치며 사업 구상",
  "delusion+chuuni":         "어둠의 사업가",
};

/** 조합 이름 반환 — specialTitle이 있으면 호출 불필요 */
export function getCombinationName(primary: string, secondaries: string[]): string {
  const key = secondaries.length > 0
    ? `${primary}+${secondaries.join("+")}` // getActiveCombination에서 이미 알파벳 정렬됨
    : primary;
  return COMBINATION_NAMES[key] ?? `${primary} 복합형`;
}

export const pick2 = (): [Stat, Stat] => {
  const shuffled = [...STATS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};

export const getUnlockedTitles = (stats: StatsMap): Title[] =>
  TITLES.filter(t => t.condition(stats));

export const getBestTitle = (stats: StatsMap): Title | null => {
  const unlocked = getUnlockedTitles(stats);
  if (unlocked.length === 0) return null;
  const order: Title["rarity"][] = ["legendary", "epic", "rare", "common"];
  for (const r of order) {
    const found = unlocked.find(t => t.rarity === r);
    if (found) return found;
  }
  return unlocked[0];
};
