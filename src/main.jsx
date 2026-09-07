import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { supabase } from "./lib/supabaseClient.js";
import { syncOnSignIn } from "./lib/cloudSync.js";
import "./styles.css";

async function bootstrap() {
  // A returning signed-in user: pull their cloud state into localStorage
  // before the app reads it, so the very first render already shows the
  // synced data instead of a stale local copy.
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) await syncOnSignIn();
    } catch {
      // offline or Supabase unreachable — fall back to whatever is already local
    }
  }

  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
