export interface Stat {
  id: string;
  name: string;
  em: string;
  c: string;
  desc: string;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  stat: string;
  amt: number;
  em: string;
}

export interface Scenario {
  t: string;
  s: string;
}

export const STATS: Stat[] = [
  { id: "anger",    name: "분노조절장애", em: "🤬", c: "#FF416C", desc: "사수가 또 퇴근 직전에 일 줌" },
  { id: "peterpan", name: "피터팬증후군", em: "🧚", c: "#A18CD1", desc: "어른이 되기 싫어요..." },
  { id: "avoidant", name: "회피형",       em: "🏃", c: "#667EEA", desc: "카톡 1 읽씹 3일째" },
  { id: "menhera",  name: "멘헤라력",     em: "🩹", c: "#F093FB", desc: "아무도 날 이해 못해..." },
  { id: "tsundere", name: "쯔쿤데레력",   em: "💢", c: "#FA709A", desc: "관심 없거든? (관심 폭발)" },
  { id: "chuuni",   name: "중2병",       em: "⚔️", c: "#8E2DE2", desc: "봉인된 왼팔이 떨린다..." },
  { id: "simp",     name: "호구력",       em: "🐶", c: "#38EF7D", desc: "네 제가 할게요... (또)" },
  { id: "delusion", name: "망상력",       em: "🌀", c: "#FFD200", desc: "나 천재인데 발굴 안 됨" },
];

export const SHOP: ShopItem[] = [
  { id: "s1", name: "에너지드링크 원샷",  cost: 10, stat: "anger",    amt: 8,  em: "🥤" },
  { id: "s2", name: "닌텐도 e숍 카드",    cost: 10, stat: "peterpan", amt: 8,  em: "🎮" },
  { id: "s3", name: "노이즈캔슬링 이어폰", cost: 10, stat: "avoidant", amt: 8,  em: "🎧" },
  { id: "s4", name: "감성 일기장",        cost: 10, stat: "menhera",  amt: 8,  em: "📓" },
  { id: "s5", name: "까칠한 선글라스",     cost: 10, stat: "tsundere", amt: 8,  em: "🕶️" },
  { id: "s6", name: "검은 망토",          cost: 10, stat: "chuuni",   amt: 8,  em: "🧥" },
  { id: "s7", name: "스타벅스 기프티콘",   cost: 10, stat: "simp",     amt: 8,  em: "☕" },
  { id: "s8", name: "자기계발서",         cost: 10, stat: "delusion",  amt: 8,  em: "📖" },
  { id: "s9", name: "🎰 럭키박스",       cost: 25, stat: "random",   amt: 15, em: "🎰" },
];

export const SCENARIOS: Scenario[] = [
  { t: "퇴근 10분 전, 사수가 다가온다...",  s: "\"이거 하나만 더 하고 가\"" },
  { t: "점심시간, 팀장이 회식을 제안한다",   s: "오늘의 운명을 골라주세요" },
  { t: "새벽 2시, 카톡이 울린다",          s: "누가 보냈을까..." },
  { t: "월요일 아침, 알람이 울린다",        s: "이 신입의 반응은?" },
  { t: "동기가 먼저 승진했다",             s: "이 순간의 감정을 골라주세요" },
  { t: "사수가 '한번 보자' 라고 했다",      s: "...뭘 보자는 거지" },
  { t: "인사팀에서 면담 요청이 왔다",       s: "대체 무슨 일이..." },
];

export const EYES: string[][] = [["◕","◕"],["◔","◔"],["◉","◉"],["⊙","⊙"],["◎","◎"],["✖","✖"]];
export const MOUTHS: string[] = ["ω","д","∀","Д","益","□"];

export const corruptionLevel = (total: number) =>
  total < 50 ? 0 : total < 150 ? 1 : total < 300 ? 2 : total < 500 ? 3 : total < 700 ? 4 : 5;

export type StatsMap = Record<string, number>;

export const INITIAL_STATS: StatsMap = {
  anger: 0, peterpan: 0, avoidant: 0, menhera: 0,
  tsundere: 0, chuuni: 0, simp: 0, delusion: 0,
};

export const pick2 = (): [Stat, Stat] => {
  const shuffled = [...STATS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};
