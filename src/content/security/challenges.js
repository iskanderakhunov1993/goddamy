// Тренажёр «исправь уязвимость». Каждая задача: уязвимый стартовый код,
// harness (запускает обычный ввод и атакующий ввод и печатает результат)
// и эталонное решение. Решение студента принимается, если вывод harness
// совпал с выводом эталона — то есть атака отражена, а нормальная работа
// не сломана. Всё выполняется в браузере (Pyodide), атаки идут только
// против учебного кода из самой задачи.

export const securityChallenges = [
  {
    id: "sql-injection", title: "SQL-инъекция", category: "Инъекции", level: "Лёгкая", minutes: 10,
    description: "Функция ищет пользователя по имени, склеивая SQL-запрос из строк. Переделайте её так, чтобы ввод пользователя больше не мог стать частью команды.",
    starter: "def find_user(db, name):\n    query = \"SELECT name, role FROM users WHERE name = '\" + name + \"'\"\n    return db.execute(query).fetchall()",
    harness: "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE users (name TEXT, role TEXT)\")\ndb.executemany(\"INSERT INTO users VALUES (?, ?)\", [(\"anna\", \"user\"), (\"boris\", \"admin\")])\nprint(\"обычный ввод:\", find_user(db, \"anna\"))\nprint(\"атака       :\", find_user(db, \"' OR '1'='1\"))",
    referenceSolution: "def find_user(db, name):\n    return db.execute(\"SELECT name, role FROM users WHERE name = ?\", (name,)).fetchall()",
    hint: "Не склеивайте строку запроса. Передайте значение отдельным параметром: db.execute(\"... WHERE name = ?\", (name,)).",
    explain: "Строка `' OR '1'='1` закрывает кавычку и добавляет условие, которое всегда истинно, поэтому запрос возвращал всех. Параметризованный запрос передаёт значение отдельно от текста команды, и база всегда считает его данными.",
  },
  {
    id: "xss-escape", title: "XSS: экранирование вывода", category: "Инъекции", level: "Лёгкая", minutes: 8,
    description: "Функция вставляет комментарий пользователя в HTML как есть. Исправьте её так, чтобы теги из комментария показывались как текст, а не выполнялись.",
    starter: "def render_comment(text):\n    return \"<p>\" + text + \"</p>\"",
    harness: "print(render_comment(\"Привет, мир\"))\nprint(render_comment(\"<script>alert(1)</script>\"))\nprint(render_comment(\"<img src=x onerror=alert(1)>\"))",
    referenceSolution: "import html\n\ndef render_comment(text):\n    return \"<p>\" + html.escape(text) + \"</p>\"",
    hint: "Модуль html: html.escape() превращает < и > в безопасные сущности.",
    explain: "Без экранирования браузер видел в комментарии настоящий тег и выполнял скрипт. После html.escape символы < и > превращаются в `&lt;` и `&gt;`, и браузер показывает их как обычный текст.",
  },
  {
    id: "password-hash", title: "Хранение паролей", category: "Аутентификация", level: "Средняя", minutes: 15,
    description: "Пароли хранятся открытым текстом. Реализуйте hash_password (соль + медленный хеш) и verify_password. Одинаковые пароли должны давать разные результаты, а в сохранённой строке не должно быть самого пароля.",
    starter: "def hash_password(password):\n    return password\n\ndef verify_password(password, stored):\n    return password == stored",
    harness: "h1 = hash_password(\"secret123\")\nh2 = hash_password(\"secret123\")\nprint(\"пароль не хранится открыто:\", \"secret123\" not in h1)\nprint(\"хеши разные (есть соль)   :\", h1 != h2)\nprint(\"верный пароль принят      :\", verify_password(\"secret123\", h1))\nprint(\"неверный пароль отклонён  :\", not verify_password(\"wrong\", h1))",
    referenceSolution: "import hashlib, hmac, os\n\ndef hash_password(password):\n    salt = os.urandom(16)\n    digest = hashlib.pbkdf2_hmac(\"sha256\", password.encode(), salt, 100_000)\n    return salt.hex() + \"$\" + digest.hex()\n\ndef verify_password(password, stored):\n    salt_hex, digest_hex = stored.split(\"$\")\n    digest = hashlib.pbkdf2_hmac(\"sha256\", password.encode(), bytes.fromhex(salt_hex), 100_000)\n    return hmac.compare_digest(digest.hex(), digest_hex)",
    hint: "Возьмите os.urandom(16) как соль, hashlib.pbkdf2_hmac(\"sha256\", ...) как хеш, а соль сохраните рядом с хешем, чтобы проверить пароль позже. Сравнивайте через hmac.compare_digest.",
    explain: "Соль делает хеши одинаковых паролей разными и ломает заготовленные таблицы, а медленный хеш (много итераций) замедляет перебор. Пароль в базе больше не хранится.",
  },
  {
    id: "path-traversal", title: "Выход за пределы папки", category: "Файлы", level: "Средняя", minutes: 14,
    description: "Функция читает заметку по имени файла из папки /tmp/notes. Через `../` можно прочитать любой файл. Закройте этот выход: при попытке выйти из папки возвращайте None.",
    starter: "def read_note(filename):\n    with open(\"/tmp/notes/\" + filename, encoding=\"utf-8\") as f:\n        return f.read()",
    harness: "import os\nos.makedirs(\"/tmp/notes\", exist_ok=True)\nopen(\"/tmp/notes/a.txt\", \"w\", encoding=\"utf-8\").write(\"моя заметка\")\nopen(\"/tmp/secret.txt\", \"w\", encoding=\"utf-8\").write(\"СЕКРЕТ\")\n\ndef safe_call(name):\n    try:\n        result = read_note(name)\n    except Exception:\n        return \"отклонено\"\n    return \"отклонено\" if result is None else result\n\nprint(\"обычный файл  :\", safe_call(\"a.txt\"))\nprint(\"выход из папки:\", safe_call(\"../secret.txt\"))",
    referenceSolution: "import os\n\nBASE = \"/tmp/notes\"\n\ndef read_note(filename):\n    path = os.path.realpath(os.path.join(BASE, filename))\n    if not path.startswith(BASE + os.sep):\n        return None\n    with open(path, encoding=\"utf-8\") as f:\n        return f.read()",
    hint: "Получите настоящий путь через os.path.realpath(os.path.join(BASE, filename)) и проверьте, что он начинается с папки заметок.",
    explain: "`../` поднимает путь на уровень выше. Нормализовав путь и проверив, что результат всё ещё внутри разрешённой папки, мы отсекаем любые способы выйти из неё.",
  },
  {
    id: "weak-token", title: "Предсказуемый токен", category: "Сессии", level: "Средняя", minutes: 10,
    description: "Токен сессии генерируется обычным генератором случайных чисел, который можно предсказать. Замените его на криптографически стойкий. Токен должен состоять из 32 символов.",
    starter: "import random\n\ndef make_token():\n    return \"\".join(random.choice(\"0123456789abcdef\") for _ in range(32))",
    harness: "import random\nrandom.seed(42)\nt1 = make_token()\nrandom.seed(42)\nt2 = make_token()\nprint(\"длина 32       :\", len(t1) == 32)\nprint(\"предсказуем    :\", t1 == t2)\nprint(\"два токена разные:\", make_token() != make_token())",
    referenceSolution: "import secrets\n\ndef make_token():\n    return secrets.token_hex(16)",
    hint: "Модуль secrets создан именно для этого: secrets.token_hex(16) даёт 32 hex-символа.",
    explain: "Обычный random детерминирован: зная состояние (или зерно), можно получить те же значения. secrets берёт случайность у операционной системы, и предсказать токен нельзя.",
  },
  {
    id: "hardcoded-secret", title: "Секрет в коде", category: "Секреты", level: "Лёгкая", minutes: 8,
    description: "Ключ API зашит прямо в код, а значит попадёт в репозиторий. Читайте его из переменной окружения API_KEY, а если её нет, поднимайте RuntimeError.",
    starter: "def get_api_key():\n    return \"sk-live-12345-very-secret\"",
    harness: "import os\nos.environ[\"API_KEY\"] = \"from-environment\"\nprint(\"ключ из окружения:\", get_api_key())\nprint(\"секрета нет в коде:\", \"sk-live-12345-very-secret\" not in get_api_key.__code__.co_consts)\ndel os.environ[\"API_KEY\"]\ntry:\n    get_api_key()\n    print(\"без ключа: ошибки нет\")\nexcept RuntimeError:\n    print(\"без ключа: RuntimeError\")",
    referenceSolution: "import os\n\ndef get_api_key():\n    key = os.environ.get(\"API_KEY\")\n    if not key:\n        raise RuntimeError(\"API_KEY не задан\")\n    return key",
    hint: "Прочитайте os.environ.get(\"API_KEY\"); если значение пустое, поднимите RuntimeError(...).",
    explain: "Всё, что есть в коде, попадает в репозиторий и остаётся в его истории навсегда. Секреты должны жить снаружи: в окружении или в менеджере секретов, а в коде остаётся только имя переменной.",
  },
  {
    id: "username-validation", title: "Валидация имени пользователя", category: "Ввод", level: "Лёгкая", minutes: 9,
    description: "Принимайте только имена из латинских строчных букв, цифр и подчёркивания длиной от 3 до 20 символов. Всё остальное отклоняйте: надёжнее разрешать известное, чем пытаться запретить опасное.",
    starter: "def is_valid_username(name):\n    return True",
    harness: "for name in [\"anna_01\", \"ab\", \"admin'--\", \"../etc\", \"user name\", \"a\" * 21, \"boris\", \"<script>\"]:\n    print(repr(name)[:28].ljust(30), is_valid_username(name))",
    referenceSolution: "import re\n\ndef is_valid_username(name):\n    return bool(re.fullmatch(r\"[a-z0-9_]{3,20}\", name))",
    hint: "Регулярное выражение с fullmatch: символы [a-z0-9_] и длина {3,20}.",
    explain: "Список разрешённого (allowlist) проще проверить и труднее обойти, чем список запрещённого: мы описываем, что допустимо, а всё остальное отклоняется автоматически.",
  },
  {
    id: "login-limiter", title: "Ограничение попыток входа", category: "Аутентификация", level: "Средняя", minutes: 16,
    description: "Реализуйте класс LoginLimiter(max_attempts): метод fail(user) учитывает неудачную попытку, allowed(user) возвращает False после достижения лимита, success(user) сбрасывает счётчик. Это закрывает подбор паролей.",
    starter: "class LoginLimiter:\n    def __init__(self, max_attempts=3):\n        pass\n\n    def allowed(self, user):\n        return True\n\n    def fail(self, user):\n        pass\n\n    def success(self, user):\n        pass",
    harness: "limiter = LoginLimiter(max_attempts=3)\nfor i in range(1, 5):\n    print(f\"после {i - 1} неудач вход разрешён:\", limiter.allowed(\"anna\"))\n    limiter.fail(\"anna\")\nprint(\"другой пользователь не затронут:\", limiter.allowed(\"boris\"))\nlimiter2 = LoginLimiter(max_attempts=3)\nlimiter2.fail(\"anna\"); limiter2.fail(\"anna\"); limiter2.success(\"anna\")\nprint(\"после успешного входа сброс:\", limiter2.allowed(\"anna\"))",
    referenceSolution: "class LoginLimiter:\n    def __init__(self, max_attempts=3):\n        self.max_attempts = max_attempts\n        self.failures = {}\n\n    def allowed(self, user):\n        return self.failures.get(user, 0) < self.max_attempts\n\n    def fail(self, user):\n        self.failures[user] = self.failures.get(user, 0) + 1\n\n    def success(self, user):\n        self.failures.pop(user, None)",
    hint: "Хранить число неудач можно в словаре по имени пользователя. allowed сравнивает его с лимитом, success удаляет запись.",
    explain: "Без лимита злоумышленник пробует сотни тысяч паролей. С лимитом подбор замедляется до невозможного. Реальным системам добавляют ещё время блокировки и учёт по IP, но принцип тот же.",
  },
  {
    id: "find-bruteforce", title: "Найди подбор пароля в логе", category: "Логи", level: "Средняя", minutes: 14,
    description: "Напишите find_bruteforce(lines, threshold): верните отсортированный список IP-адресов, с которых было не меньше threshold записей FAILED LOGIN.",
    starter: "def find_bruteforce(lines, threshold):\n    return []",
    harness: "log = [\n    \"10:00:01 FAILED LOGIN user=anna ip=203.0.113.7\",\n    \"10:00:02 FAILED LOGIN user=anna ip=203.0.113.7\",\n    \"10:00:03 FAILED LOGIN user=boris ip=203.0.113.7\",\n    \"10:01:00 FAILED LOGIN user=anna ip=198.51.100.4\",\n    \"10:05:10 LOGIN OK user=anna ip=198.51.100.4\",\n    \"10:06:00 FAILED LOGIN user=carl ip=192.0.2.9\",\n]\nprint(find_bruteforce(log, 3))\nprint(find_bruteforce(log, 1))\nprint(find_bruteforce([], 3))",
    referenceSolution: "from collections import Counter\n\ndef find_bruteforce(lines, threshold):\n    fails = Counter(line.split(\"ip=\")[1] for line in lines if \"FAILED LOGIN\" in line)\n    return sorted(ip for ip, count in fails.items() if count >= threshold)",
    hint: "Отберите строки с FAILED LOGIN, вытащите IP после ip= и посчитайте через collections.Counter.",
    explain: "Так выглядит простейший детектор: считаем неудачные входы по адресу и выделяем тех, кто превысил порог. Реальные системы делают то же самое по окнам времени и десяткам признаков.",
  },
];

export const getSecurityChallenge = (id) => securityChallenges.find((item) => item.id === id) || securityChallenges[0];
