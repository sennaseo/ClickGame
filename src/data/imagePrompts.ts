// ════════════════════════════════════════════
// 캐릭터 이미지 생성용 프롬프트
// 8 스탯 × 5 단계 = 40개
// ════════════════════════════════════════════
//
// 스타일 기준:
//   cute chibi Korean office worker character,
//   flat cartoon illustration, clean simple lines,
//   centered on pure black background, no text, single character

const STYLE_BASE =
  "cute chibi Korean office worker character, flat cartoon illustration, " +
  "clean simple lines, centered on pure black background, no text, single character, " +
  "white simple office shirt and slacks, expressive face, LINE sticker style";

const NEGATIVE =
  "realistic, photographic, multiple characters, text, watermark, " +
  "complex background, western cartoon, 3d render";

export interface CharacterPrompt {
  statId: string;
  level: number;       // 1-5
  prompt: string;
  negative: string;
  color: string;       // 스탯 색상 (#rrggbb) — 이미지 매칭 확인용
}

export const CHARACTER_PROMPTS: CharacterPrompt[] = [
  // ─── anger 🤬 ───────────────────────────────────────
  {
    statId: "anger", level: 1, color: "#FF416C",
    prompt: `${STYLE_BASE}, slightly annoyed expression, mild frown, subtle anger vein on forehead, arms crossed, faint red tint on cheeks`,
    negative: NEGATIVE,
  },
  {
    statId: "anger", level: 2, color: "#FF416C",
    prompt: `${STYLE_BASE}, visibly angry face, flushed red cheeks, clenched fists, multiple anger veins on forehead, steam puffs from ears`,
    negative: NEGATIVE,
  },
  {
    statId: "anger", level: 3, color: "#FF416C",
    prompt: `${STYLE_BASE}, furious expression, bright red glowing face, cracked keyboard in hand, large steam cloud above head, fire emoji effects around character`,
    negative: NEGATIVE,
  },
  {
    statId: "anger", level: 4, color: "#FF416C",
    prompt: `${STYLE_BASE}, demonic rage mode, glowing red eyes, small devil horns, intense fire aura surrounding character, dramatic red-orange glow, broken objects floating`,
    negative: NEGATIVE,
  },
  {
    statId: "anger", level: 5, color: "#FF416C",
    prompt: `${STYLE_BASE}, ultimate rage form, volcanic eruption aura, fully engulfed in bright crimson flames, lava cracks on ground beneath character, epic dramatic pose`,
    negative: NEGATIVE,
  },

  // ─── peterpan 🧚 ─────────────────────────────────────
  {
    statId: "peterpan", level: 1, color: "#A18CD1",
    prompt: `${STYLE_BASE}, fresh-faced young adult, starry wide eyes, new business suit worn slightly wrong, innocent cheerful smile, small stars around`,
    negative: NEGATIVE,
  },
  {
    statId: "peterpan", level: 2, color: "#A18CD1",
    prompt: `${STYLE_BASE}, childlike accessories mixed with office wear, toy hanging from bag, carefree expression, floating sparkles, pastel purple aura`,
    negative: NEGATIVE,
  },
  {
    statId: "peterpan", level: 3, color: "#A18CD1",
    prompt: `${STYLE_BASE}, tiny fairy wings on back, floating slightly off ground, magical purple sparkles everywhere, dreamy expression, whimsical accessories`,
    negative: NEGATIVE,
  },
  {
    statId: "peterpan", level: 4, color: "#A18CD1",
    prompt: `${STYLE_BASE}, Peter Pan green hat over business shirt, fully floating in air, tinker bell companion glowing nearby, lavender magical aura, completely weightless pose`,
    negative: NEGATIVE,
  },
  {
    statId: "peterpan", level: 5, color: "#A18CD1",
    prompt: `${STYLE_BASE}, ultimate fantasy form, large fairy wings spreading wide, rainbow sparkles erupting, clouds and stars beneath feet, ethereal purple-gold glow, transcendent expression`,
    negative: NEGATIVE,
  },

  // ─── avoidant 🏃 ─────────────────────────────────────
  {
    statId: "avoidant", level: 1, color: "#667EEA",
    prompt: `${STYLE_BASE}, shy expression, gaze averted downward, slightly hunched shoulders, subtle blue-grey tone, minimalist design`,
    negative: NEGATIVE,
  },
  {
    statId: "avoidant", level: 2, color: "#667EEA",
    prompt: `${STYLE_BASE}, hiding behind giant laptop screen, only eyes peeking over, soft blue glow from screen, translucent edges of character, invisible vibes`,
    negative: NEGATIVE,
  },
  {
    statId: "avoidant", level: 3, color: "#667EEA",
    prompt: `${STYLE_BASE}, ghost-like transparency effect on body edges, running pose mid-disappear, motion blur, blue mist trailing behind, 50% opacity character`,
    negative: NEGATIVE,
  },
  {
    statId: "avoidant", level: 4, color: "#667EEA",
    prompt: `${STYLE_BASE}, nearly invisible character outline only, ghost silhouette, blue ethereal glow, empty shoes on ground, character fading into nothingness`,
    negative: NEGATIVE,
  },
  {
    statId: "avoidant", level: 5, color: "#667EEA",
    prompt: `${STYLE_BASE}, completely vanished — only a glowing blue outline remains, dimensional rift opening, ghostly afterimage, reality bending around empty space`,
    negative: NEGATIVE,
  },

  // ─── menhera 🩹 ──────────────────────────────────────
  {
    statId: "menhera", level: 1, color: "#F093FB",
    prompt: `${STYLE_BASE}, slightly teary wide eyes, delicate expression, pastel pink-purple color palette, small heart bandage on cheek, gentle kawaii aesthetic`,
    negative: NEGATIVE,
  },
  {
    statId: "menhera", level: 2, color: "#F093FB",
    prompt: `${STYLE_BASE}, crying mascara streaks down cheeks, tissue clutched in hands, bathroom stall hint, pastel purple aura, cute sad expression`,
    negative: NEGATIVE,
  },
  {
    statId: "menhera", level: 3, color: "#F093FB",
    prompt: `${STYLE_BASE}, band-aids and plasters all over face and arms, teary eyes, surrounded by emotional support items, pink bandage aesthetic, kawaii sad vibes`,
    negative: NEGATIVE,
  },
  {
    statId: "menhera", level: 4, color: "#F093FB",
    prompt: `${STYLE_BASE}, dramatic cry, storm cloud appearing above head, mini rain shower on character only, hospital drip bag floating, completely soaked but cute, pink storm`,
    negative: NEGATIVE,
  },
  {
    statId: "menhera", level: 5, color: "#F093FB",
    prompt: `${STYLE_BASE}, ultimate emotional breakdown form, surrounded by swirling hearts and teardrops, intense pink-purple magical storm, messy hair, dramatic sobbing pose, strangely beautiful`,
    negative: NEGATIVE,
  },

  // ─── tsundere 💢 ─────────────────────────────────────
  {
    statId: "tsundere", level: 1, color: "#FA709A",
    prompt: `${STYLE_BASE}, arms crossed, slight pouty face, secretly working hard, warm pink blush on cheeks, subtle contradictory expression`,
    negative: NEGATIVE,
  },
  {
    statId: "tsundere", level: 2, color: "#FA709A",
    prompt: `${STYLE_BASE}, tsundere pose turning away but peeking back, large anime blush marks, embarrassed expression, pink aura, secretly caring energy`,
    negative: NEGATIVE,
  },
  {
    statId: "tsundere", level: 3, color: "#FA709A",
    prompt: `${STYLE_BASE}, elaborate "I don't care" pose while clearly caring, giant anime blush covering half face, dramatic hair flip, intense pink-red energy`,
    negative: NEGATIVE,
  },
  {
    statId: "tsundere", level: 4, color: "#FA709A",
    prompt: `${STYLE_BASE}, split personality energy, angel halo and devil tail simultaneously, dramatic contrasting expressions on split face, rose petals floating, intense pink aura`,
    negative: NEGATIVE,
  },
  {
    statId: "tsundere", level: 5, color: "#FA709A",
    prompt: `${STYLE_BASE}, ultimate tsundere form, most dramatic anime pose possible, giant anime blush radiating light, rose petals erupting everywhere, duality energy visible as split aura, pink lightning`,
    negative: NEGATIVE,
  },

  // ─── chuuni ⚔️ ──────────────────────────────────────
  {
    statId: "chuuni", level: 1, color: "#8E2DE2",
    prompt: `${STYLE_BASE}, one eye hidden behind hair, dramatic pose, slight dark aura hinting at hidden power, serious intense expression, dark purple tone`,
    negative: NEGATIVE,
  },
  {
    statId: "chuuni", level: 2, color: "#8E2DE2",
    prompt: `${STYLE_BASE}, imaginary dark cape flowing behind office wear, hero pose, dark energy particles swirling, determined intense eyes, purple glow`,
    negative: NEGATIVE,
  },
  {
    statId: "chuuni", level: 3, color: "#8E2DE2",
    prompt: `${STYLE_BASE}, bandaged left arm glowing purple, fantasy sword appearing beside character, dark magic particles, dramatic lighting, forbidden power awakening pose`,
    negative: NEGATIVE,
  },
  {
    statId: "chuuni", level: 4, color: "#8E2DE2",
    prompt: `${STYLE_BASE}, glowing forbidden eye revealed, dark energy erupting from bandaged arm, shadowy wings forming, intense purple-black aura, reality cracking around character`,
    negative: NEGATIVE,
  },
  {
    statId: "chuuni", level: 5, color: "#8E2DE2",
    prompt: `${STYLE_BASE}, ultimate dark power unleashed, large shadowy wings spread wide, dual glowing forbidden eyes, reality shattering purple-black explosion, most dramatic pose, epic final form`,
    negative: NEGATIVE,
  },

  // ─── simp 🐶 ─────────────────────────────────────────
  {
    statId: "simp", level: 1, color: "#38EF7D",
    prompt: `${STYLE_BASE}, eagerly helpful expression, carrying two coffees in arms, bright sunny smile, puppy-like eyes, fresh green aura, enthusiastic posture`,
    negative: NEGATIVE,
  },
  {
    statId: "simp", level: 2, color: "#38EF7D",
    prompt: `${STYLE_BASE}, stacking multiple tasks at once, arms overflowing with items, overwhelmed but still smiling, sweat drops, green helpful energy`,
    negative: NEGATIVE,
  },
  {
    statId: "simp", level: 3, color: "#38EF7D",
    prompt: `${STYLE_BASE}, yes-man pose with thumbs up, surrounded by everyone else's belongings, puppy eyes and puppy ears as accessory, cannot say no expression, glowing green aura`,
    negative: NEGATIVE,
  },
  {
    statId: "simp", level: 4, color: "#38EF7D",
    prompt: `${STYLE_BASE}, carrying impossible stack of boxes and tasks for others, still smiling and waving, items floating around in orbit, super cheerful expression, green saint halo`,
    negative: NEGATIVE,
  },
  {
    statId: "simp", level: 5, color: "#38EF7D",
    prompt: `${STYLE_BASE}, ultimate servant form, surrounded by orbiting items belonging to everyone else, glowing green saint aura, angelic wings, arms extended to help, everyone else's belongings floating in perfect orbit`,
    negative: NEGATIVE,
  },

  // ─── delusion 🌀 ─────────────────────────────────────
  {
    statId: "delusion", level: 1, color: "#FFD200",
    prompt: `${STYLE_BASE}, daydreaming expression, stars in eyes, small thought bubble with tiny mansion, absent-minded smile, golden sparkle accents`,
    negative: NEGATIVE,
  },
  {
    statId: "delusion", level: 2, color: "#FFD200",
    prompt: `${STYLE_BASE}, large thought bubble with luxury cars and mansions, absentminded sitting pose, golden glow, fantasy imagery surrounding real office wear`,
    negative: NEGATIVE,
  },
  {
    statId: "delusion", level: 3, color: "#FFD200",
    prompt: `${STYLE_BASE}, fully lost in daydream, surrounded by floating wealth imagery, business plan document glowing with golden ideas, spiral vortex of fantasy around head`,
    negative: NEGATIVE,
  },
  {
    statId: "delusion", level: 4, color: "#FFD200",
    prompt: `${STYLE_BASE}, half real half fantasy dual world, golden CEO fantasy imagery overlapping reality, intense golden spiral vortex, eyes replaced by golden stars, transcending office reality`,
    negative: NEGATIVE,
  },
  {
    statId: "delusion", level: 5, color: "#FFD200",
    prompt: `${STYLE_BASE}, fully living in delusion world, everything around turned gold, CEO fantasy materialized as golden aura explosion, money raining down, giant golden spiral vortex, most extravagant pose, reality irrelevant`,
    negative: NEGATIVE,
  },
];

/** statId + level로 프롬프트 빠르게 찾기 */
export const getCharacterPrompt = (
  statId: string,
  level: number
): CharacterPrompt | undefined =>
  CHARACTER_PROMPTS.find(p => p.statId === statId && p.level === level);
