-- ============================================
-- 신입사원 스탯 빌더 — Supabase DB Schema
-- Supabase SQL Editor에 복붙해서 실행하면 됨
-- ============================================

-- 1. 공유 게임 상태 (모든 유저가 같이 보는 캐릭터)
create table if not exists game_state (
  id          int primary key default 1,
  stats       jsonb not null default '{
    "anger": 0, "peterpan": 0, "avoidant": 0, "menhera": 0,
    "tsundere": 0, "chuuni": 0, "simp": 0, "delusion": 0
  }',
  total_clicks bigint not null default 0,
  bank         bigint not null default 0,
  updated_at   timestamptz not null default now(),

  -- 항상 1줄만 유지
  constraint single_row check (id = 1)
);

-- 초기 데이터 삽입
insert into game_state (id) values (1) on conflict do nothing;

-- 2. 유저 테이블 (익명 UUID → 나중에 OAuth 연결 가능)
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  nickname      text,
  auth_id       uuid references auth.users(id),  -- 나중에 로그인 시 연결
  total_clicks  bigint not null default 0,
  total_spent   bigint not null default 0,
  created_at    timestamptz not null default now(),
  last_active   timestamptz not null default now()
);

-- 3. 활동 로그 (클릭/구매/이벤트 기록)
create type action_type as enum ('click', 'buy', 'event');

create table if not exists action_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references users(id),
  action      action_type not null,
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_action_log_user on action_log(user_id);
create index if not exists idx_action_log_created on action_log(created_at desc);
create index if not exists idx_users_auth on users(auth_id);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- game_state: 누구나 읽기 가능, 서버만 수정
alter table game_state enable row level security;
create policy "game_state_read" on game_state for select using (true);
create policy "game_state_update" on game_state for update using (true);

-- users: 자기 데이터만 읽기/수정
alter table users enable row level security;
create policy "users_insert" on users for insert with check (true);
create policy "users_read" on users for select using (true);
create policy "users_update" on users for update using (true);

-- action_log: 삽입은 누구나, 읽기는 자기것만
alter table action_log enable row level security;
create policy "log_insert" on action_log for insert with check (true);
create policy "log_read" on action_log for select using (true);

-- ============================================
-- RPC 함수 (atomic 업데이트 — 동시 접속 충돌 방지)
-- ============================================

-- 클릭 시: total_clicks +1, bank +earn
create or replace function game_add_click(earn int)
returns void language plpgsql security definer as $$
begin
  update game_state
  set total_clicks = total_clicks + 1,
      bank = bank + earn,
      updated_at = now()
  where id = 1;
end;
$$;

-- 상점 구매: 스탯 올리고 포인트 차감
create or replace function game_buy_stat(stat_id text, amt int, cost int)
returns void language plpgsql security definer as $$
begin
  update game_state
  set stats = jsonb_set(
        stats,
        array[stat_id],
        to_jsonb(least((stats->>stat_id)::int + amt, 100))
      ),
      bank = greatest(bank - cost, 0),
      updated_at = now()
  where id = 1;
end;
$$;

-- 이벤트 선택: 스탯만 올림
create or replace function game_event_stat(stat_id text, amt int)
returns void language plpgsql security definer as $$
begin
  update game_state
  set stats = jsonb_set(
        stats,
        array[stat_id],
        to_jsonb(least((stats->>stat_id)::int + amt, 100))
      ),
      updated_at = now()
  where id = 1;
end;
$$;

-- 유저 클릭 수 증가
create or replace function increment_user_clicks(uid uuid, n int)
returns void language plpgsql security definer as $$
begin
  update users set total_clicks = total_clicks + n, last_active = now() where id = uid;
end;
$$;

-- 유저 소비 금액 증가
create or replace function increment_user_spent(uid uuid, n int)
returns void language plpgsql security definer as $$
begin
  update users set total_spent = total_spent + n, last_active = now() where id = uid;
end;
$$;

-- ============================================
-- Realtime 활성화
-- ============================================
alter publication supabase_realtime add table game_state;
