/**
 * 캐릭터 이미지 사전 생성 스크립트
 *
 * 실행 방법:
 *   npx tsx scripts/generate-characters.ts
 *
 * 필요한 환경 변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
 *   SUPABASE_SERVICE_ROLE_KEY=eyJxxx   (Storage 쓰기에 필요)
 *
 * 이미지 생성: Pollinations.ai (무료, API 키 불필요)
 *
 * 생성 결과:
 *   Supabase Storage > characters 버킷 > {statId}/level-{n}.jpg
 *   총 40장 (8 스탯 × 5 단계)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { CHARACTER_PROMPTS } from "../src/data/imagePrompts";

// ─── 환경 변수 로드 (.env.local) ──────────────────────────
function loadEnv() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch {
    // .env.local 없으면 환경 변수 직접 주입 필요
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ 환경 변수 누락:");
  if (!SUPABASE_URL) console.error("   NEXT_PUBLIC_SUPABASE_URL 없음");
  if (!SUPABASE_SERVICE_KEY) console.error("   SUPABASE_SERVICE_ROLE_KEY 없음");
  process.exit(1);
}

// URL 형식 검증
if (!SUPABASE_URL.startsWith("https://")) {
  console.error(`❌ SUPABASE_URL 형식 오류: "${SUPABASE_URL}"`);
  console.error('   https://xxxx.supabase.co 형식이어야 합니다');
  process.exit(1);
}
console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY.slice(0, 20)}...`);
console.log(`🎨 이미지 생성: Pollinations.ai (무료)\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET = "characters";
const DELAY_MS = 3000; // Pollinations.ai 과부하 방지 딜레이

// ─── Pollinations.ai 호출 (무료, API 키 불필요) ───────────
async function generateImage(prompt: string): Promise<ArrayBuffer> {
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&model=flux&nologo=true&seed=${seed}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Pollinations.ai 오류: ${res.status} ${res.statusText}`);
  }

  return res.arrayBuffer();
}

// ─── Supabase Storage 업로드 ──────────────────────────────
async function uploadToStorage(
  imageData: ArrayBuffer,
  statId: string,
  level: number
): Promise<string> {
  const path = `${statId}/level-${level}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, imageData, {
      contentType: "image/jpeg",
      upsert: true, // 이미 있으면 덮어쓰기
    });

  if (error) throw new Error(`Storage 업로드 실패: ${error.message}`);

  // 공개 URL 반환
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ─── 버킷 존재 확인 / 생성 ────────────────────────────────
async function ensureBucket() {
  console.log("🔄 Supabase Storage 연결 확인 중...");

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();

  if (listErr) {
    console.error("❌ listBuckets 오류:", listErr);
    console.error("\n원인 가능성:");
    console.error("  1. SUPABASE_SERVICE_ROLE_KEY가 틀렸거나 anon key를 사용함");
    console.error("  2. Supabase 프로젝트가 일시정지 상태");
    console.error("  3. Supabase URL이 잘못됨");
    console.error("\nSupabase 대시보드 → Settings → API에서 service_role key 확인");
    throw new Error(`버킷 목록 조회 실패: ${listErr.message}`);
  }

  const exists = buckets?.some(b => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error) throw new Error(`버킷 생성 실패: ${error.message}`);
    console.log(`✅ '${BUCKET}' 버킷 생성됨`);
  } else {
    console.log(`✅ '${BUCKET}' 버킷 확인됨`);
  }
}

// ─── 이미 생성된 파일 목록 확인 ───────────────────────────
async function getExistingFiles(): Promise<Set<string>> {
  const existing = new Set<string>();
  const stats = ["anger", "peterpan", "avoidant", "menhera", "tsundere", "chuuni", "simp", "delusion"];

  for (const statId of stats) {
    const { data } = await supabase.storage.from(BUCKET).list(statId);
    for (const file of data ?? []) {
      existing.add(`${statId}/${file.name}`);
    }
  }

  return existing;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── 메인 ─────────────────────────────────────────────────
async function main() {
  console.log("🎨 캐릭터 이미지 생성 시작\n");
  console.log(`총 ${CHARACTER_PROMPTS.length}개 생성 예정 (8 스탯 × 5 단계)\n`);

  await ensureBucket();
  const existing = await getExistingFiles();

  const results: { path: string; url: string }[] = [];
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const item of CHARACTER_PROMPTS) {
    const path = `${item.statId}/level-${item.level}.jpg`;
    const label = `${item.statId} Lv.${item.level}`;

    // 이미 있으면 건너뛰기
    if (existing.has(path)) {
      console.log(`⏭️  ${label} — 이미 존재, 건너뜀`);
      skipCount++;
      continue;
    }

    console.log(`⏳ ${label} 생성 중...`);

    try {
      const imageData = await generateImage(item.prompt);
      const publicUrl = await uploadToStorage(imageData, item.statId, item.level);

      results.push({ path, url: publicUrl });
      successCount++;
      console.log(`✅ ${label} → ${publicUrl}`);
    } catch (err) {
      failCount++;
      console.error(`❌ ${label} 실패:`, err instanceof Error ? err.message : err);
    }

    // 딜레이 (API rate limit 방지)
    await sleep(DELAY_MS);
  }

  console.log("\n─────────────────────────────────────");
  console.log(`완료: ✅ ${successCount}개 생성  ⏭️ ${skipCount}개 건너뜀  ❌ ${failCount}개 실패`);

  if (results.length > 0) {
    console.log("\n생성된 파일 URL:");
    for (const { path, url } of results) {
      console.log(`  ${path}: ${url}`);
    }
  }

  if (failCount > 0) {
    console.log("\n실패한 항목은 다시 실행하면 자동으로 재시도됩니다 (이미 성공한 건 건너뜀).");
    process.exit(1);
  }
}

main().catch(err => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
