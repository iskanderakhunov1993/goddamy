import { useEffect, useState } from "react";
import { EnvelopeSimple, LockKey, SignOut } from "@phosphor-icons/react";
import { ALLOWED_EDITOR_EMAIL, supabase } from "../lib/supabaseClient.js";
import "../styles-course-editor.css";

export function EditorAuthGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return <main className="editor-gate">
      <div className="editor-gate-card">
        <LockKey size={28}/>
        <h1>Вход не настроен</h1>
        <p>Не заданы переменные окружения Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).</p>
      </div>
    </main>;
  }

  if (session === undefined) return null;

  const signedInEmail = session?.user?.email || null;
  const allowed = signedInEmail && ALLOWED_EDITOR_EMAIL && signedInEmail.toLowerCase() === ALLOWED_EDITOR_EMAIL.toLowerCase();

  if (allowed) return children;

  const sendLink = async (event) => {
    event.preventDefault();
    setError("");
    setSending(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/course-editor` },
    });
    setSending(false);
    if (authError) setError(authError.message);
    else setSent(true);
  };

  return <main className="editor-gate">
    <div className="editor-gate-card">
      <LockKey size={28}/>
      <h1>Редактор курса закрыт</h1>
      {signedInEmail && !allowed ? <>
        <p>Ты вошёл как <b>{signedInEmail}</b>, но у этого адреса нет доступа к редактору.</p>
        <button className="editor-gate-signout" onClick={() => supabase.auth.signOut()}><SignOut size={16}/> Выйти и войти другой почтой</button>
      </> : sent ? <>
        <p>Ссылка для входа отправлена на <b>{email}</b>. Открой письмо и перейди по ссылке — вернёшься сюда уже авторизованным.</p>
        <button className="editor-gate-signout" onClick={() => setSent(false)}>Отправить ещё раз</button>
      </> : <>
        <p>Вход только по ссылке на почту, доступ есть у одного конкретного адреса.</p>
        <form onSubmit={sendLink}>
          <label className="editor-gate-field"><EnvelopeSimple size={17}/><input type="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/></label>
          <button className="primary" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Прислать ссылку для входа"}</button>
        </form>
        {error && <p className="editor-gate-error">{error}</p>}
      </>}
    </div>
  </main>;
}
