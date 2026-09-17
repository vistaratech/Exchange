import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://yzchkhbunqyfyuizxmop.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_XHFFhQ7xwXI7Pc3x97nE6w_0h8mUCv6";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
