import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const ALLOWED_EDITOR_EMAIL = import.meta.env.VITE_EDITOR_ALLOWED_EMAIL || "";

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
