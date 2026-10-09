import { createClient } from "@supabase/supabase-js";

// Вне Vite (тесты в Node) import.meta.env не определён — тогда облака просто нет.
/** @type {Partial<ImportMetaEnv>} */
const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const ALLOWED_EDITOR_EMAIL = env.VITE_EDITOR_ALLOWED_EMAIL || "";

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
