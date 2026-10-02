"""Проверка безопасности учебного приложения «Заметки».

Запуск (в той же папке, что и app.py):   python3 check.py

Скрипт сам поднимает твою версию app.py на свободном порту, во временной базе,
и пробует девять атак на ней. Твои данные и настоящая notes.db не затрагиваются.
Атаки идут только на это учебное приложение на твоём компьютере.
"""
import http.client
import os
import re
import sqlite3
import sys
import tempfile
import threading
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import app  # noqa: E402

_tmp = tempfile.mkdtemp()
app.DB_PATH = os.path.join(_tmp, "notes.db")
app.LOG_PATH = os.path.join(_tmp, "app.log")
_server = app.make_server(0)
PORT = _server.server_address[1]
threading.Thread(target=_server.serve_forever, daemon=True).start()


def request(method, path, data=None, cookie=None):
    conn = http.client.HTTPConnection("127.0.0.1", PORT, timeout=10)
    headers, body = {}, None
    if data is not None:
        body = urllib.parse.urlencode(data)
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    if cookie:
        headers["Cookie"] = "session=" + cookie
    conn.request(method, path, body=body, headers=headers)
    response = conn.getresponse()
    text = response.read().decode("utf-8", "replace")
    cookies = response.msg.get_all("Set-Cookie") or []
    conn.close()
    return response.status, text, cookies


def register(username, password):
    return request("POST", "/register", {"username": username, "password": password})


def login(username, password):
    status, text, cookies = request("POST", "/login", {"username": username, "password": password})
    token = None
    for header in cookies:
        found = re.match(r"session=([^;]+)", header)
        if found:
            token = found.group(1)
    return status, text, token, cookies


def create_note(token, title, body):
    return request("POST", "/notes", {"title": title, "body": body}, cookie=token)


def note_ids(token, query=""):
    path = "/notes" + (("?q=" + urllib.parse.quote(query)) if query else "")
    _, text, _ = request("GET", path, cookie=token)
    return re.findall(r"/note\?id=(\d+)", text), text


def user_session(username, password):
    register(username, password)
    _, _, token, _ = login(username, password)
    return token


# ---- проверки: каждая возвращает True, если уязвимость ЗАКРЫТА ----

def basic_work():
    token = user_session("sanity_user", "sanity-pass-1")
    if not token:
        return False, "не удалось войти под только что созданным пользователем"
    create_note(token, "Обычная заметка", "Текст")
    _, listing = note_ids(token)
    if "Обычная заметка" not in listing:
        return False, "созданная заметка не видна в списке"
    status, _, bad_token, _ = login("sanity_user", "неверный-пароль")
    if bad_token:
        return False, "вход с неверным паролем прошёл"
    return True, ""


def v1_sql_login():
    register("victim", "victim-pass-1")
    _, _, token, _ = login("victim'--", "что-угодно")
    return token is None, "вход под чужим именем без пароля: victim'--"


def v2_sql_search():
    alice = user_session("alice", "alice-pass-1")
    create_note(alice, "ALICE-SECRET-TITLE", "тело")
    bob = user_session("bob", "bob-pass-1")
    _, listing = note_ids(bob, "' OR '1'='1' --")
    return "ALICE-SECRET-TITLE" not in listing, "поиск Боба показал заметку Алисы"


def v3_xss():
    alice = user_session("alice", "alice-pass-1")
    create_note(alice, "<script>alert(1)</script>", "<img src=x onerror=alert(1)>")
    ids, listing = note_ids(alice)
    pages = [listing]
    for note_id in ids:
        pages.append(request("GET", f"/note?id={note_id}", cookie=alice)[1])
    dirty = any("<script>alert(1)</script>" in p or "<img src=x onerror" in p for p in pages)
    return not dirty, "теги из заметки попали на страницу как есть"


def v4_passwords():
    register("pw_one", "same-pass-123")
    register("pw_two", "same-pass-123")
    with sqlite3.connect(app.DB_PATH) as conn:
        stored = [row[0] for row in conn.execute("SELECT password FROM users WHERE username IN ('pw_one', 'pw_two')")]
    if len(stored) != 2:
        return False, "не удалось прочитать пароли из базы"
    leaked = any("same-pass-123" in value for value in stored)
    return (not leaked) and stored[0] != stored[1], "пароль лежит в базе открыто, либо одинаковые пароли дают одинаковые значения (нет соли)"


def v5_idor():
    alice = user_session("alice", "alice-pass-1")
    create_note(alice, "ALICE-IDOR-TITLE", "ALICE-IDOR-BODY")
    ids, _ = note_ids(alice)
    bob = user_session("bob", "bob-pass-1")
    for note_id in ids:
        _, text, _ = request("GET", f"/note?id={note_id}", cookie=bob)
        if "ALICE-IDOR-BODY" in text:
            return False, "Боб открыл чужую заметку по номеру в адресе"
    return True, ""


def v6_tokens():
    tokens = []
    for _ in range(3):
        register("alice", "alice-pass-1")
        _, _, token, _ = login("alice", "alice-pass-1")
        tokens.append(token or "")
    ok = all(len(t) >= 32 and not t.isdigit() for t in tokens) and len(set(tokens)) == 3
    return ok, "токен сессии короткий или состоит из цифр: его можно перебрать"


def v8_cookie_flags():
    register("alice", "alice-pass-1")
    _, _, _, cookies = login("alice", "alice-pass-1")
    header = " ".join(cookies).lower()
    return "httponly" in header and "samesite" in header, "у куки сессии нет флагов HttpOnly и SameSite"


def v9_logs():
    register("alice", "alice-pass-1")
    login("alice", "LEAK-MARKER-9f3a")
    try:
        with open(app.LOG_PATH, encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        content = ""
    return "LEAK-MARKER-9f3a" not in content, "пароль, введённый пользователем, записан в лог"


def v7_rate_limit():
    register("ratelimit_user", "right-pass-1")
    statuses = [login("ratelimit_user", f"wrong-{i}")[0] for i in range(12)]
    return 429 in statuses[:10], "после 10 неудачных попыток входа сервер не вернул 429"


SECURITY_CHECKS = [
    ("V1", "SQL-инъекция при входе", v1_sql_login),
    ("V2", "SQL-инъекция в поиске", v2_sql_search),
    ("V3", "XSS в заметках", v3_xss),
    ("V4", "Хранение паролей", v4_passwords),
    ("V5", "Доступ к чужим заметкам (IDOR)", v5_idor),
    ("V6", "Предсказуемый токен сессии", v6_tokens),
    ("V7", "Нет ограничения попыток входа", v7_rate_limit),
    ("V8", "Флаги куки сессии", v8_cookie_flags),
    ("V9", "Пароли в логах", v9_logs),
]


def main():
    print("Проверка безопасности приложения «Заметки»\n")
    try:
        ok, detail = basic_work()
    except Exception as error:  # noqa: BLE001
        ok, detail = False, f"ошибка: {error}"
    print(f" [{' OK ' if ok else 'СЛОМАНО'}] Базовая работа приложения" + ("" if ok else f" — {detail}"))
    if not ok:
        print("\nСначала верни приложению рабочее состояние: регистрация, вход, создание заметки.")
        sys.exit(2)
    print()
    results = {}
    # V7 идёт последней: ограничитель попыток может заблокировать и остальные проверки
    ordered = [c for c in SECURITY_CHECKS if c[0] != "V7"] + [c for c in SECURITY_CHECKS if c[0] == "V7"]
    for code, title, check in ordered:
        try:
            closed, detail = check()
        except Exception as error:  # noqa: BLE001
            closed, detail = False, f"ошибка при проверке: {error}"
        results[code] = (title, closed, detail)
    fixed = 0
    for code, title, _ in SECURITY_CHECKS:
        _, closed, detail = results[code]
        fixed += closed
        print(f" [{' OK ' if closed else 'FAIL'}] {code} {title}" + ("" if closed else f"\n          {detail}"))
    print(f"\nИсправлено: {fixed} из {len(SECURITY_CHECKS)}")
    sys.exit(0 if fixed == len(SECURITY_CHECKS) else 1)


if __name__ == "__main__":
    main()
