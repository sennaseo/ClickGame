import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    [
      "Missing Supabase environment variables.",
      "Create .env.local in the project root and set:",
      "NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY",
    ].join("\n")
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
