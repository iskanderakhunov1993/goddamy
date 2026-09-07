import { supabase } from "./supabaseClient.js";

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function signInWithEmail(email) {
  if (!supabase) throw new Error("Supabase не настроен");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}
