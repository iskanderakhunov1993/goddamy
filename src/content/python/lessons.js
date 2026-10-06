// Уроки курса Python. Они готовят ровно к проекту «Учёт расходов»: каждый урок —
// короткая теория, запускаемый пример (Pyodide) и задача. Последний урок ведёт в проект.
import { buildLessonTrack } from "../lessonTrack.js";

const py = (code) => ({ type: "code", language: "python", code });

const basics = {
  id: "py-basics", title: "Основы для проекта", phase: "ОСНОВЫ",
  summary: "Типы, коллекции, функции, исключения и файлы — всё, из чего состоит консольное приложение.",
  topics: [
    { id: "data", title: "Данные", lessons: [
      {
        title: "Значения, типы и f-строки",
        summary: "Числа, строки, логические значения и как красиво вывести результат.",
        blocks: [
          { type: "paragraph", text: "Программа работает со **значениями**: числами (`250`, `99.99`), строками (`\"еда\"`), логическими `True`/`False` и `None` — «ничего». Тип определяет, что со значением можно делать: числа складываются, строки склеиваются." },
          py("amount = 250\ncategory = \"еда\"\nprice = 99.99\nprint(type(amount), type(price), type(category))\nprint(amount + price)\nprint(f\"{category}: {amount + price:.2f}\")"),
          { type: "paragraph", text: "**f-строка** подставляет значения в текст: `f\"{x}\"`. После двоеточия — формат: `:.2f` — два знака после точки. Так в проекте печатается `еда: 150.00`." },
          { type: "callout", tone: "warning", title: "Ввод — всегда строка", text: "Всё, что пришло из командной строки, — строка. `\"250\" + \"1\"` даст `\"2501\"`. Сначала преобразуйте: `int(\"250\")`, `float(\"99.99\")`. Если строка не число, будет `ValueError` — это нужно обработать." },
          py("for text in [\"250\", \"99.99\", \"abc\"]:\n    try:\n        print(text, \"->\", float(text))\n    except ValueError:\n        print(text, \"-> не число\")"),
          { type: "task", title: "Сделай сам", text: "Измени пример: выведи сумму трёх покупок (120.5, 80, 29.5) в формате `Итого: 230.00`.", checklist: ["Использована f-строка с :.2f", "Вывод совпадает с форматом"] },
        ],
      },
      {
        title: "Списки и словари",
        summary: "Как хранить набор расходов и одну запись с полями.",
        blocks: [
          { type: "paragraph", text: "**Словарь** хранит запись с именованными полями — один расход. **Список** хранит много записей по порядку. Список словарей — ровно то, что ляжет в `expenses.json`." },
          py("expenses = [\n    {\"id\": 1, \"amount\": 250, \"category\": \"еда\"},\n    {\"id\": 2, \"amount\": 80, \"category\": \"транспорт\"},\n]\nexpenses.append({\"id\": 3, \"amount\": 30, \"category\": \"еда\"})\nprint(len(expenses), expenses[0][\"category\"])\nfood = [e for e in expenses if e[\"category\"] == \"еда\"]\nprint(\"на еду:\", sum(e[\"amount\"] for e in food))\nprint(\"следующий id:\", max(e[\"id\"] for e in expenses) + 1)"),
          { type: "callout", tone: "info", title: "Почему max + 1, а не len + 1", text: "Если удалить расход с id 2, останутся id 1 и 3, `len` вернёт 2, и новый расход получит id 3 — дубликат. `max(...) + 1` даёт 4. Скрипт проверки проекта ловит именно эту ошибку." },
          py("totals = {}\nfor e in [{\"c\": \"еда\", \"a\": 250}, {\"c\": \"такси\", \"a\": 80}, {\"c\": \"еда\", \"a\": 30}]:\n    totals[e[\"c\"]] = totals.get(e[\"c\"], 0) + e[\"a\"]\nprint(totals)"),
          { type: "task", title: "Сделай сам", text: "Удали из списка `expenses` расход с id 2 через генератор списка и посчитай следующий id.", checklist: ["Удаление через [e for e in ... if e[\"id\"] != 2]", "Следующий id равен 4"] },
        ],
      },
    ] },
    { id: "code", title: "Код и ошибки", lessons: [
      {
        title: "Функции и исключения",
        summary: "Делим программу на функции и сообщаем об ошибках без Traceback.",
        blocks: [
          { type: "paragraph", text: "Функция делает одно дело и возвращает результат. Ошибку ввода функция **не печатает**, а **выбрасывает исключением** — так вызывающий код решает, что с ней делать." },
          py("class AppError(Exception):\n    pass\n\ndef parse_amount(text):\n    try:\n        value = float(text)\n    except ValueError:\n        raise AppError(f\"сумма должна быть числом: {text}\")\n    if value <= 0:\n        raise AppError(\"сумма должна быть больше нуля\")\n    return value\n\nfor text in [\"250\", \"0\", \"abc\"]:\n    try:\n        print(parse_amount(text))\n    except AppError as error:\n        print(\"Ошибка:\", error)"),
          { type: "paragraph", text: "В настоящей программе ошибки перехватываются в одном месте — в точке входа — и программа завершается с ненулевым кодом. Пользователь видит понятное сообщение, а не Traceback." },
          py("import sys\n\nclass AppError(Exception):\n    pass\n\ndef main():\n    raise AppError(\"расход 99 не найден\")\n\nif __name__ == \"__main__\":\n    try:\n        main()\n    except AppError as error:\n        print(\"Ошибка:\", error, file=sys.stderr)\n        # sys.exit(1) — в проекте обязательно; здесь не вызываем, чтобы пример не прерывался"),
          { type: "quiz", question: "Зачем завершать программу с кодом 1 при ошибке?", options: ["Чтобы ошибка была красной", "*Чтобы скрипты и другие программы узнали, что команда не удалась", "Так требует Python"], explanation: "Код выхода 0 — успех, остальное — ошибка. По нему ориентируются скрипты, CI и check.py." },
          { type: "task", title: "Сделай сам", text: "Допиши в `parse_amount` проверку: больше двух знаков после точки (`10.123`) — ошибка.", checklist: ["10.12 принимается", "10.123 даёт AppError"] },
        ],
      },
      {
        title: "Файлы и JSON",
        summary: "Сохраняем данные между запусками и не теряем их при сбое.",
        blocks: [
          { type: "paragraph", text: "Модуль `json` превращает списки и словари в текст и обратно. `ensure_ascii=False` сохраняет кириллицу читаемой, `indent=2` делает файл удобным для глаз." },
          py("import json, os\n\ndef save(items, path=\"expenses.json\"):\n    tmp = path + \".tmp\"\n    with open(tmp, \"w\", encoding=\"utf-8\") as f:\n        json.dump(items, f, ensure_ascii=False, indent=2)\n    os.replace(tmp, path)\n\ndef load(path=\"expenses.json\"):\n    if not os.path.exists(path):\n        return []\n    with open(path, encoding=\"utf-8\") as f:\n        return json.load(f)\n\nsave([{\"id\": 1, \"amount\": 250, \"category\": \"еда\"}])\nprint(open(\"expenses.json\", encoding=\"utf-8\").read())\nprint(load())"),
          { type: "callout", tone: "info", title: "Почему через временный файл", text: "Если программа упадёт посреди записи, `expenses.json` окажется обрезанным. Запись во временный файл и `os.replace` подменяют файл целиком за одну операцию." },
          py("import json\nopen(\"broken.json\", \"w\").write(\"{сломано\")\ntry:\n    json.load(open(\"broken.json\"))\nexcept json.JSONDecodeError as error:\n    print(\"файл повреждён:\", error)"),
          { type: "callout", tone: "warning", title: "Повреждённый файл не перезаписываем", text: "Если `json.load` упал, остановите программу **до** `save`. Иначе следующая команда запишет пустой список поверх данных пользователя." },
          { type: "task", title: "Сделай сам", text: "Сделай так, чтобы `load` при повреждённом файле выбрасывал `AppError` с понятным текстом.", checklist: ["JSONDecodeError перехвачен", "Выбрасывается AppError"] },
        ],
      },
    ] },
  ],
};

const tools = {
  id: "py-tools", title: "Инструменты проекта", phase: "ИНСТРУМЕНТЫ",
  summary: "argparse, даты и деньги, CSV и тесты — стандартная библиотека, без установки пакетов.",
  topics: [
    { id: "cli", title: "Командная строка", lessons: [
      {
        title: "argparse: команды и аргументы",
        summary: "Как программа понимает `add 250 еда обед --date 2026-03-15`.",
        blocks: [
          { type: "paragraph", text: "Модуль `argparse` разбирает аргументы, сам пишет справку `--help` и сам сообщает об ошибке, если аргумента не хватает. Подкоманды (`add`, `list`, `delete`) делаются через `add_subparsers`." },
          py("import argparse\n\nparser = argparse.ArgumentParser(prog=\"expenses\")\nsub = parser.add_subparsers(dest=\"command\", required=True)\nadd = sub.add_parser(\"add\")\nadd.add_argument(\"amount\")\nadd.add_argument(\"category\")\nadd.add_argument(\"description\", nargs=\"?\", default=\"\")\nadd.add_argument(\"--date\")\ndelete = sub.add_parser(\"delete\")\ndelete.add_argument(\"id\", type=int)\n\nprint(parser.parse_args([\"add\", \"250\", \"еда\", \"обед\", \"--date\", \"2026-03-15\"]))\nprint(parser.parse_args([\"delete\", \"3\"]))"),
          { type: "callout", tone: "info", title: "Ошибки argparse", text: "Если пользователь ввёл `delete abc`, argparse напечатает ошибку и завершит программу с кодом 2 — без Traceback. Это уже соответствует контракту проекта." },
          { type: "task", title: "Сделай сам", text: "Добавь подкоманду `summary` с необязательным `--month` и проверь `parse_args([\"summary\", \"--month\", \"2026-03\"])`.", checklist: ["summary разбирается", "--month необязателен"] },
        ],
      },
      {
        title: "Даты и деньги",
        summary: "datetime для дат и Decimal для точных сумм.",
        blocks: [
          py("from datetime import date, datetime\n\nprint(date.today().isoformat())\nday = datetime.strptime(\"2026-03-15\", \"%Y-%m-%d\").date()\nprint(day, day.strftime(\"%Y-%m\"))\ntry:\n    datetime.strptime(\"вчера\", \"%Y-%m-%d\")\nexcept ValueError:\n    print(\"неверная дата\")"),
          { type: "paragraph", text: "Дробные числа `float` хранятся в двоичном виде, поэтому `0.1 + 0.2` не равно `0.3`. Для денег используют `Decimal` из строки — он считает так, как бухгалтер." },
          py("from decimal import Decimal\n\nprint(0.1 + 0.2)\nprint(Decimal(\"0.1\") + Decimal(\"0.2\"))\ntotal = sum([Decimal(\"120.50\"), Decimal(\"29.50\")], Decimal(0))\nprint(f\"Итого: {total:.2f}\")"),
          { type: "callout", tone: "tip", title: "Фильтр по месяцу", text: "Дата хранится строкой `2026-03-15`, поэтому расходы марта — это те, у которых `date.startswith(\"2026-03\")`." },
          { type: "task", title: "Сделай сам", text: "Напиши функцию `month_total(items, month)`, которая суммирует расходы месяца через Decimal.", checklist: ["Используется Decimal(str(amount))", "Расходы других месяцев не попадают"] },
        ],
      },
    ] },
    { id: "quality", title: "Выгрузка и тесты", lessons: [
      {
        title: "CSV для таблиц",
        summary: "Выгружаем данные так, чтобы их открыл Excel или Google Таблицы.",
        blocks: [
          py("import csv\n\nitems = [{\"id\": 1, \"date\": \"2026-03-02\", \"category\": \"еда\", \"amount\": 120.5, \"description\": \"обед\"}]\nwith open(\"report.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    writer = csv.DictWriter(f, fieldnames=[\"id\", \"date\", \"category\", \"amount\", \"description\"])\n    writer.writeheader()\n    writer.writerows(items)\nprint(open(\"report.csv\", encoding=\"utf-8\").read())"),
          { type: "callout", tone: "info", title: "newline=\"\"", text: "Без этого параметра на Windows между строками CSV появятся пустые строки. Модуль `csv` сам решает, как переносить строки." },
          { type: "task", title: "Сделай сам", text: "Прочитай `report.csv` обратно через `csv.DictReader` и выведи описание каждой строки.", checklist: ["Используется DictReader", "Выведены описания"] },
        ],
      },
      {
        title: "Тесты на unittest",
        summary: "Проверяем логику автоматически, чтобы не ломать её при изменениях.",
        blocks: [
          { type: "paragraph", text: "Тест вызывает функцию и сравнивает результат с ожидаемым. Тестируют **логику** (функции), а не печать в терминал. В проекте тесты лежат в `test_expenses.py` и запускаются `python -m unittest`." },
          py("import unittest\n\ndef next_id(items):\n    return max((i[\"id\"] for i in items), default=0) + 1\n\nclass NextIdTest(unittest.TestCase):\n    def test_empty(self):\n        self.assertEqual(next_id([]), 1)\n\n    def test_after_delete(self):\n        self.assertEqual(next_id([{\"id\": 1}, {\"id\": 3}]), 4)\n\n    def test_error(self):\n        with self.assertRaises(ValueError):\n            int(\"abc\")\n\nunittest.main(argv=[\"x\"], exit=False, verbosity=2)"),
          { type: "callout", tone: "tip", title: "Дальше — проект", text: "Вы знаете всё, что нужно для «Учёта расходов». Откройте проект, скачайте `check.py` и начните со спринта 1." },
          { type: "task", title: "Сделай сам", text: "Добавь тест, что `next_id` для списка `[{\"id\": 7}]` возвращает 8, и запусти пример.", checklist: ["Тест добавлен", "Все тесты OK"] },
        ],
      },
    ] },
  ],
};

export const pythonLessons = buildLessonTrack({ slug: "python-lessons", base: "/python", modules: [basics, tools] });
