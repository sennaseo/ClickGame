// ════════════════════════════════════════════
// 신입사원 스탯 빌더 — 진화 시스템
// 8 스탯 × 5 단계 = 40개 수집 폼
// ════════════════════════════════════════════

import type { StatsMap } from "./stats";

export interface EvolutionStage {
  level: number;        // 1-5
  name: string;         // 폼 이름
  minPercent: number;   // 필요 스탯 %
  deco: string[];       // 장식 이모지 (캐릭터 주변에 표시)
  aura: string;         // glow 색상
  desc: string;         // 설명 (도감용)
}

export interface StatEvolution {
  statId: string;
  stages: EvolutionStage[];
}

// ─── 8 스탯 × 5 단계 진화 데이터 ───

export const EVOLUTIONS: StatEvolution[] = [
  {
    statId: "anger",
    stages: [
      { level: 1, name: "살짝 짜증러",       minPercent: 1,  deco: ["😤"],              aura: "#FF416C33", desc: "미세먼지 같은 짜증이 쌓이기 시작했다" },
      { level: 2, name: "혈압 상승",         minPercent: 20, deco: ["😠", "💢"],         aura: "#FF416C55", desc: "점심 메뉴 정할 때도 화가 난다" },
      { level: 3, name: "폭주모드",          minPercent: 40, deco: ["🤬", "💢", "🔥"],   aura: "#FF416C88", desc: "키보드가 부서지기 직전이다" },
      { level: 4, name: "분노의 도깨비",     minPercent: 60, deco: ["👹", "🔥", "⚡"],   aura: "#FF416CBB", desc: "사무실에 화재경보가 울린다" },
      { level: 5, name: "분노의 화신",       minPercent: 80, deco: ["☄️", "🔥", "👹", "💥"], aura: "#FF416CFF", desc: "퇴근길에 용암이 흐른다" },
    ],
  },
  {
    statId: "peterpan",
    stages: [
      { level: 1, name: "풋풋한 신입",       minPercent: 1,  deco: ["😊"],              aura: "#A18CD133", desc: "신입 냄새가 솔솔 난다" },
      { level: 2, name: "영원한 22살",       minPercent: 20, deco: ["🧒", "✨"],         aura: "#A18CD155", desc: "아직 어른이 되고 싶지 않다" },
      { level: 3, name: "네버랜드 시민",     minPercent: 40, deco: ["🧚", "✨", "🌟"],   aura: "#A18CD188", desc: "현실 거부 선언. 팅커벨이 보인다" },
      { level: 4, name: "자유로운 영혼",     minPercent: 60, deco: ["🦋", "🧚", "🌸"],   aura: "#A18CD1BB", desc: "책임? 그게 뭔데 먹는건데?" },
      { level: 5, name: "동화 속 주인공",    minPercent: 80, deco: ["🌈", "🦋", "🧚", "⭐"], aura: "#A18CD1FF", desc: "이 세계의 법칙이 통하지 않는다" },
    ],
  },
  {
    statId: "avoidant",
    stages: [
      { level: 1, name: "조용한 사람",       minPercent: 1,  deco: ["😶"],              aura: "#667EEA33", desc: "존재감이 약간 희미하다" },
      { level: 2, name: "투명인간",          minPercent: 20, deco: ["🫥", "💨"],         aura: "#667EEA55", desc: "읽씹 3일째. 슬랙 자리비움" },
      { level: 3, name: "도주 전문가",       minPercent: 40, deco: ["🏃", "💨", "🌫️"],   aura: "#667EEA88", desc: "회의 시작 5분 전 사라짐" },
      { level: 4, name: "유령 사원",         minPercent: 60, deco: ["👻", "🌫️", "💨"],   aura: "#667EEABB", desc: "출근했는데 아무도 모른다" },
      { level: 5, name: "차원의 틈",         minPercent: 80, deco: ["🕳️", "👻", "🌀", "🌫️"], aura: "#667EEAFF", desc: "이 세계에서 완전히 사라졌다" },
    ],
  },
  {
    statId: "menhera",
    stages: [
      { level: 1, name: "민감한 편",         minPercent: 1,  deco: ["🥺"],              aura: "#F093FB33", desc: "감정의 잔물결이 인다" },
      { level: 2, name: "감정 롤러코스터",   minPercent: 20, deco: ["😢", "💧"],         aura: "#F093FB55", desc: "화장실 울음 1회차 달성" },
      { level: 3, name: "붕대 투성이",       minPercent: 40, deco: ["🩹", "💧", "💔"],   aura: "#F093FB88", desc: "멘탈 응급처치 시행 중" },
      { level: 4, name: "유리멘탈",          minPercent: 60, deco: ["💔", "🩹", "😭"],   aura: "#F093FBBB", desc: "터치하면 깨짐. 취급 주의" },
      { level: 5, name: "감정의 쓰나미",     minPercent: 80, deco: ["🌊", "💔", "😭", "🩹"], aura: "#F093FBFF", desc: "사무실이 바다가 됐다" },
    ],
  },
  {
    statId: "tsundere",
    stages: [
      { level: 1, name: "약간 까칠",         minPercent: 1,  deco: ["😤"],              aura: "#FA709A33", desc: "별로야 (약간 관심 있음)" },
      { level: 2, name: "까칠 선배",         minPercent: 20, deco: ["💢", "😤"],         aura: "#FA709A55", desc: "관심 없거든 (몰래 도와줌)" },
      { level: 3, name: "쿨한 척 달인",      minPercent: 40, deco: ["🕶️", "💢", "❄️"],   aura: "#FA709A88", desc: "좋으면 좋다고 해~ 싫은데?" },
      { level: 4, name: "빙하기",            minPercent: 60, deco: ["❄️", "🕶️", "💢"],   aura: "#FA709ABB", desc: "겉은 남극, 속은 용암이다" },
      { level: 5, name: "쯔쿤데레 마왕",     minPercent: 80, deco: ["🌋", "❄️", "💢", "🕶️"], aura: "#FA709AFF", desc: "좋아하는 거 아니거든!!! (맞음)" },
    ],
  },
  {
    statId: "chuuni",
    stages: [
      { level: 1, name: "상상력 풍부",       minPercent: 1,  deco: ["✨"],              aura: "#8E2DE233", desc: "약간의 판타지가 있다" },
      { level: 2, name: "봉인된 왼팔",       minPercent: 20, deco: ["⚔️", "✨"],         aura: "#8E2DE255", desc: "사직서에 마법진을 그렸다" },
      { level: 3, name: "다크플레임마스터",   minPercent: 40, deco: ["🗡️", "⚔️", "🔮"],   aura: "#8E2DE288", desc: "회의실에서 주문 영창 시작" },
      { level: 4, name: "드래곤 소환사",     minPercent: 60, deco: ["🐉", "🗡️", "🔮"],   aura: "#8E2DE2BB", desc: "사무실이 던전이 됐다" },
      { level: 5, name: "마왕 강림",         minPercent: 80, deco: ["👑", "🐉", "⚔️", "🔮"], aura: "#8E2DE2FF", desc: "이 세계의 지배자가 강림했다" },
    ],
  },
  {
    statId: "simp",
    stages: [
      { level: 1, name: "기본적으로 착함",    minPercent: 1,  deco: ["🐕"],              aura: "#38EF7D33", desc: "순한 맛. 아직은 정상이다" },
      { level: 2, name: "커피셔틀",           minPercent: 20, deco: ["🐶", "☕"],         aura: "#38EF7D55", desc: "시키면 다 해주는 단계" },
      { level: 3, name: "만능 집사",          minPercent: 40, deco: ["🦮", "☕", "📋"],   aura: "#38EF7D88", desc: "부서 전체 일을 떠안았다" },
      { level: 4, name: "산타 사원",          minPercent: 60, deco: ["🎅", "🎁", "☕"],   aura: "#38EF7DBB", desc: "거절이란 단어를 모른다" },
      { level: 5, name: "전설의 호구",        minPercent: 80, deco: ["🏆", "🎅", "🐶", "🎁"], aura: "#38EF7DFF", desc: "전설이 된 호구. 사가에 기록됨" },
    ],
  },
  {
    statId: "delusion",
    stages: [
      { level: 1, name: "가끔 상상",         minPercent: 1,  deco: ["💭"],              aura: "#FFD20033", desc: "퇴사 후 커피숍 상상 정도" },
      { level: 2, name: "망상 시동",         minPercent: 20, deco: ["🌀", "💭"],         aura: "#FFD20055", desc: "CEO 취임 연설 연습 중이다" },
      { level: 3, name: "선지자",            minPercent: 40, deco: ["🔮", "🌀", "💭"],   aura: "#FFD20088", desc: "미래가 보인다 (안 보임)" },
      { level: 4, name: "우주인",            minPercent: 60, deco: ["🪐", "🔮", "🌀"],   aura: "#FFD200BB", desc: "여기서 제 능력이 안 맞아요" },
      { level: 5, name: "차원 초월자",       minPercent: 80, deco: ["🌌", "🪐", "🔮", "⭐"], aura: "#FFD200FF", desc: "30억은 기본이고 우주가 보인다" },
    ],
  },
];

// ─── 유틸 함수 ───

/** 특정 스탯의 현재 진화 단계 (없으면 null) */
export function getStatStage(statId: string, percent: number): EvolutionStage | null {
  const evo = EVOLUTIONS.find(e => e.statId === statId);
  if (!evo || percent < 1) return null;
  // 가장 높은 단계부터 확인
  for (let i = evo.stages.length - 1; i >= 0; i--) {
    if (percent >= evo.stages[i].minPercent) return evo.stages[i];
  }
  return null;
}

/** 특정 스탯의 다음 진화 단계 (없으면 null = 이미 만렙) */
export function getNextStage(statId: string, percent: number): EvolutionStage | null {
  const evo = EVOLUTIONS.find(e => e.statId === statId);
  if (!evo) return null;
  for (const stage of evo.stages) {
    if (percent < stage.minPercent) return stage;
  }
  return null;
}

/** 진화 임계점을 넘었는지 확인 (이전 값 → 현재 값) */
export function checkEvolution(statId: string, prevPercent: number, newPercent: number): EvolutionStage | null {
  const evo = EVOLUTIONS.find(e => e.statId === statId);
  if (!evo) return null;
  for (const stage of evo.stages) {
    if (prevPercent < stage.minPercent && newPercent >= stage.minPercent) {
      // 가장 높은 새 단계를 찾기 위해 계속 탐색
      let highest = stage;
      for (let i = evo.stages.indexOf(stage) + 1; i < evo.stages.length; i++) {
        if (newPercent >= evo.stages[i].minPercent) highest = evo.stages[i];
        else break;
      }
      return highest;
    }
  }
  return null;
}

/** 현재 해금된 모든 폼 목록 */
export function getUnlockedForms(stats: StatsMap): { statId: string; stage: EvolutionStage }[] {
  const result: { statId: string; stage: EvolutionStage }[] = [];
  for (const evo of EVOLUTIONS) {
    const percent = stats[evo.statId] || 0;
    for (const stage of evo.stages) {
      if (percent >= stage.minPercent) {
        result.push({ statId: evo.statId, stage });
      }
    }
  }
  return result;
}

/** 전체 폼 수 */
export const TOTAL_FORMS = EVOLUTIONS.reduce((sum, e) => sum + e.stages.length, 0); // 40
