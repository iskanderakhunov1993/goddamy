"""Учебное приложение «Заметки».

ВНИМАНИЕ: приложение НАМЕРЕННО содержит уязвимости. Это учебный полигон курса
«Основы кибербезопасности» на Godemy. Запускай его только у себя на компьютере
и не открывай наружу.

Запуск:   python3 app.py
Проверка: python3 check.py

Не переименовывай DB_PATH, LOG_PATH, SESSIONS, init_db и make_server:
на них опирается check.py.
"""
import random
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

DB_PATH = "notes.db"
LOG_PATH = "app.log"
SESSIONS = {}  # токен сессии -> id пользователя


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)")
        conn.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER, title TEXT, body TEXT)")


def log_event(message):
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(message + "\n")


def page(title, body):
    return f"<!doctype html><meta charset='utf-8'><title>{title}</title><h1>{title}</h1>{body}"


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def send(self, status, body, headers=None):
        data = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, location, headers=None):
        self.send_response(302)
        self.send_header("Location", location)
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def current_user(self):
        for part in self.headers.get("Cookie", "").split(";"):
            name, _, value = part.strip().partition("=")
            if name == "session":
                return SESSIONS.get(value)
        return None

    def form(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode("utf-8")
        return {key: values[0] for key, values in parse_qs(raw).items()}

    def do_GET(self):
        url = urlparse(self.path)
        params = parse_qs(url.query)
        if url.path == "/":
            return self.send(200, page("Заметки", """
                <h2>Регистрация</h2>
                <form method='post' action='/register'><input name='username'> <input name='password' type='password'> <button>Создать</button></form>
                <h2>Вход</h2>
                <form method='post' action='/login'><input name='username'> <input name='password' type='password'> <button>Войти</button></form>"""))
        user_id = self.current_user()
        if url.path == "/notes":
            if not user_id:
                return self.redirect("/")
            query = params.get("q", [""])[0]
            with db() as conn:
                rows = conn.execute(
                    "SELECT id, title FROM notes WHERE owner_id = %d AND title LIKE '%%%s%%'" % (user_id, query)
                ).fetchall()
            items = "".join(f"<li><a href='/note?id={row['id']}'>{row['title']}</a></li>" for row in rows)
            return self.send(200, page("Мои заметки", f"""
                <form method='get'><input name='q' value=''> <button>Поиск</button></form>
                <ul>{items}</ul>
                <h2>Новая заметка</h2>
                <form method='post' action='/notes'><input name='title'><br><textarea name='body'></textarea><br><button>Сохранить</button></form>"""))
        if url.path == "/note":
            if not user_id:
                return self.redirect("/")
            note_id = params.get("id", ["0"])[0]
            with db() as conn:
                row = conn.execute("SELECT title, body FROM notes WHERE id = ?", (note_id,)).fetchone()
            if not row:
                return self.send(404, page("Не найдено", ""))
            return self.send(200, page(row["title"], f"<div>{row['body']}</div><a href='/notes'>Назад</a>"))
        self.send(404, page("Не найдено", ""))

    def do_POST(self):
        data = self.form()
        if self.path == "/register":
            with db() as conn:
                try:
                    conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (data.get("username", ""), data.get("password", "")))
                except sqlite3.IntegrityError:
                    return self.send(409, page("Ошибка", "Такой пользователь уже есть"))
            return self.redirect("/")
        if self.path == "/login":
            username, password = data.get("username", ""), data.get("password", "")
            log_event(f"LOGIN attempt user={username} password={password}")
            with db() as conn:
                row = conn.execute(
                    "SELECT id FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
                ).fetchone()
            if not row:
                return self.send(401, page("Ошибка", "Неверный логин или пароль"))
            token = str(random.randint(100000, 999999))
            SESSIONS[token] = row["id"]
            return self.redirect("/notes", {"Set-Cookie": f"session={token}; Path=/"})
        if self.path == "/notes":
            user_id = self.current_user()
            if not user_id:
                return self.redirect("/")
            with db() as conn:
                conn.execute("INSERT INTO notes (owner_id, title, body) VALUES (?, ?, ?)", (user_id, data.get("title", ""), data.get("body", "")))
            return self.redirect("/notes")
        self.send(404, page("Не найдено", ""))


def make_server(port):
    init_db()
    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = make_server(port)
    print(f"Заметки: http://127.0.0.1:{port}  (Ctrl+C — остановить)")
    server.serve_forever()
