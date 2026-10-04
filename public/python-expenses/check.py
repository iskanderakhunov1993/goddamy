"""Проверка проекта «Учёт расходов» курса Godemy.

Запуск из папки проекта (рядом с expenses.py):

    python check.py

или с путём к проекту:

    python check.py ../expenses

Скрипт запускает ваш expenses.py в пустой временной папке и проверяет
поведение по контракту курса. Ваш expenses.json он не трогает.

Контракт:
    add <сумма> <категория> [описание] [--date ГГГГ-ММ-ДД]
    list
    delete <id>
    summary [--month ГГГГ-ММ]      строки «категория: 123.45» и «Итого: 123.45»
    export <файл.csv>              колонки id,date,category,amount,description

Данные хранятся в expenses.json в текущей папке: список объектов
{"id", "amount", "category", "description", "date"}. Ошибки (неверная
сумма, неизвестный id, неизвестная команда, повреждённый файл) — понятное
сообщение и ненулевой код выхода, без Traceback.
"""
import csv
import json
import os
import re
import subprocess
import sys
import tempfile

PROJECT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
SCRIPT = os.path.join(PROJECT, "expenses.py")
results = []
# На Windows вывод в канал идёт в кодировке системы; просим UTF-8, чтобы кириллица читалась.
ENV = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}


def check(sprint, name, ok, why=""):
    results.append((sprint, name, bool(ok), why))


def run(work, *args):
    proc = subprocess.run([sys.executable, SCRIPT, *args], cwd=work, capture_output=True, env=ENV,
                          text=True, encoding="utf-8", errors="replace", timeout=30)
    return proc.returncode, proc.stdout + proc.stderr


def crashed(out):
    return "Traceback (most recent call last)" in out


def load(work):
    with open(os.path.join(work, "expenses.json"), encoding="utf-8") as f:
        return json.load(f)


def clean_error(code, out):
    return code != 0 and not crashed(out)


def amount_in(out, label, value):
    pattern = r"^\s*" + re.escape(label) + r"\s*:\s*" + re.escape(value) + r"\s*$"
    return re.search(pattern, out, re.MULTILINE | re.IGNORECASE) is not None


def main():
    print("Проверяю проект:", PROJECT)
    if not os.path.exists(SCRIPT):
        print("\n✗ Не найден expenses.py в", PROJECT)
        sys.exit(1)

    with tempfile.TemporaryDirectory() as work:
        reset = lambda: os.path.exists(os.path.join(work, "expenses.json")) and os.remove(os.path.join(work, "expenses.json"))

        # Спринт 1: добавление и список.
        code, out = run(work, "list")
        check(1, "list на пустом списке не падает", code == 0 and not crashed(out), out)
        c1, o1 = run(work, "add", "250", "еда", "обед")
        c2, o2 = run(work, "add", "99.99", "транспорт")
        try:
            data = load(work)
        except Exception as error:
            data = None
            check(1, "add сохраняет расходы в expenses.json", False, f"{error}\n{o1}{o2}")
        if data is not None:
            ok = (c1 == 0 and c2 == 0 and isinstance(data, list) and len(data) == 2
                  and float(data[0].get("amount", 0)) == 250 and data[0].get("category") == "еда"
                  and data[0].get("description") == "обед" and float(data[1].get("amount", 0)) == 99.99)
            check(1, "add сохраняет расходы в expenses.json", ok, f"в файле: {data}")
            ids = [item.get("id") for item in data] if isinstance(data, list) else []
            check(1, "У расходов уникальные id", len(ids) == 2 and len(set(ids)) == 2 and None not in ids, f"id: {ids}")
            dates = [item.get("date", "") for item in data] if isinstance(data, list) else []
            check(1, "Дата по умолчанию — сегодня в формате ГГГГ-ММ-ДД", all(re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(d)) for d in dates) and dates, f"даты: {dates}")
        else:
            check(1, "У расходов уникальные id", False, "нет данных")
            check(1, "Дата по умолчанию — сегодня в формате ГГГГ-ММ-ДД", False, "нет данных")
        code, out = run(work, "list")
        check(1, "list показывает расходы", code == 0 and "обед" in out and "транспорт" in out, out)
        for args in (["add", "abc", "еда"], ["add", "-5", "еда"], ["add", "0", "еда"], ["add", "100"], ["fly"]):
            code, out = run(work, *args)
            check(1, "Ошибка для: " + " ".join(args), clean_error(code, out), f"код {code}\n{out}")

        # Спринт 2: удаление и надёжность.
        reset()
        run(work, "add", "10", "a")
        run(work, "add", "20", "b")
        run(work, "add", "30", "c")
        try:
            data = load(work)
            first, second, third = [item["id"] for item in data]
            code, out = run(work, "delete", str(second))
            after = load(work)
            check(2, "delete удаляет только нужный расход", code == 0 and [i["id"] for i in after] == [first, third], f"после delete: {after}")
            run(work, "add", "40", "d")
            after = load(work)
            ids = [i["id"] for i in after]
            check(2, "id не повторяются после удаления", len(set(ids)) == len(ids) == 3, f"id: {ids}")
        except Exception as error:
            check(2, "delete удаляет только нужный расход", False, str(error))
            check(2, "id не повторяются после удаления", False, str(error))
        for args in (["delete", "999"], ["delete", "abc"], ["delete"]):
            code, out = run(work, *args)
            check(2, "Ошибка для: " + " ".join(args), clean_error(code, out), f"код {code}\n{out}")
        path = os.path.join(work, "expenses.json")
        with open(path, "w", encoding="utf-8") as f:
            f.write("{сломано")
        code, out = run(work, "list")
        check(2, "Повреждённый expenses.json — ошибка без Traceback", clean_error(code, out), f"код {code}\n{out}")
        code, out = run(work, "add", "1", "x")
        with open(path, encoding="utf-8") as f:
            check(2, "Повреждённый файл не перезаписывается молча", f.read() == "{сломано" and code != 0, "add поверх повреждённого файла стёр данные")

        # Спринт 3: отчёты.
        reset()
        run(work, "add", "120.50", "еда", "--date", "2026-03-02")
        run(work, "add", "80", "транспорт", "--date", "2026-03-15")
        run(work, "add", "29.50", "еда", "кофе", "--date", "2026-03-20")
        run(work, "add", "1000", "жильё", "--date", "2026-04-01")
        try:
            data = load(work)
            check(3, "add понимает --date", sorted(d["date"] for d in data) == ["2026-03-02", "2026-03-15", "2026-03-20", "2026-04-01"], f"даты: {[d.get('date') for d in data]}")
        except Exception as error:
            check(3, "add понимает --date", False, str(error))
        code, out = run(work, "summary")
        check(3, "summary: суммы по категориям", code == 0 and amount_in(out, "еда", "150.00") and amount_in(out, "транспорт", "80.00") and amount_in(out, "жильё", "1000.00"), "ожидались строки «еда: 150.00», «транспорт: 80.00», «жильё: 1000.00»\n" + out)
        check(3, "summary: строка «Итого»", amount_in(out, "Итого", "1230.00"), "ожидалась строка «Итого: 1230.00»\n" + out)
        code, out = run(work, "summary", "--month", "2026-03")
        check(3, "summary --month учитывает только месяц", code == 0 and amount_in(out, "Итого", "230.00") and "жильё" not in out, "ожидалось «Итого: 230.00» без категории жильё\n" + out)
        code, out = run(work, "summary", "--month", "2026-13")
        check(3, "Ошибка для: summary --month 2026-13", clean_error(code, out), f"код {code}\n{out}")
        code, out = run(work, "add", "5", "еда", "--date", "вчера")
        check(3, "Ошибка для неверной даты", clean_error(code, out), f"код {code}\n{out}")

        # Спринт 4: экспорт, тесты, документация.
        code, out = run(work, "export", "report.csv")
        try:
            with open(os.path.join(work, "report.csv"), encoding="utf-8-sig", newline="") as f:
                rows = list(csv.DictReader(f))
            ok = (code == 0 and len(rows) == 4 and set(rows[0]) >= {"id", "date", "category", "amount", "description"}
                  and any(r["description"] == "кофе" for r in rows))
            check(4, "export создаёт CSV с нужными колонками", ok, f"строки: {rows[:2]}")
        except Exception as error:
            check(4, "export создаёт CSV с нужными колонками", False, f"{error}\n{out}")

    tests = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", PROJECT, "-p", "test*.py"],
                           cwd=PROJECT, capture_output=True, env=ENV, text=True, encoding="utf-8", errors="replace")
    ran = re.search(r"Ran (\d+) test", tests.stderr)
    check(4, "Тесты есть и проходят (python -m unittest)", tests.returncode == 0 and ran and int(ran.group(1)) > 0, tests.stderr[-800:])
    readme = os.path.join(PROJECT, "README.md")
    text = open(readme, encoding="utf-8").read() if os.path.exists(readme) else ""
    check(4, "README.md описывает команды", all(word in text for word in ("add", "summary", "export")), "README.md отсутствует или не упоминает add, summary и export")
    gitignore = os.path.join(PROJECT, ".gitignore")
    check(4, "expenses.json в .gitignore", os.path.exists(gitignore) and "expenses.json" in open(gitignore, encoding="utf-8").read(), "добавьте expenses.json в .gitignore")

    passed = 0
    for sprint in range(1, 5):
        print(f"\nСпринт {sprint}")
        for number, name, ok, why in results:
            if number != sprint:
                continue
            passed += ok
            print("  ✓" if ok else "  ✗", name)
            if not ok:
                for line in str(why).strip().splitlines()[:8]:
                    print("      ", line)
    print(f"\nИтог: {passed} из {len(results)} проверок")
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    main()
