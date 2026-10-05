"""Проверка проекта «Тестирование интернет-магазина» курса Godemy.

Запуск из папки проекта (там, где ваши test_*.py):

    python check.py

Как проверяется. Ваши тесты запускаются на нескольких версиях shop.py:
  1. на исправной версии — здесь все тесты обязаны пройти (иначе тест
     ложно обвиняет рабочий код);
  2. на версиях, в каждую из которых заложен ровно один баг из тех, что есть
     в вашем shop.py, — здесь хотя бы один тест обязан упасть.
Баг считается найденным, если ваши тесты его ловят. Версии модуля
хранятся в этом файле в сжатом виде.
"""
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zlib

PAYLOAD = "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"
ENV = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1", "PYTHONDONTWRITEBYTECODE": "1"}


def unpack():
    data = json.loads(zlib.decompress(base64.b64decode(PAYLOAD)).decode("utf-8"))
    return data["correct"], data["mutants"], {int(k): v for k, v in data["sprints"].items()}


def run_tests(project, source, tests):
    with tempfile.TemporaryDirectory() as tmp:
        with open(os.path.join(tmp, "shop.py"), "w", encoding="utf-8") as f:
            f.write(source)
        for name in tests:
            shutil.copy(os.path.join(project, name), tmp)
        try:
            proc = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", tmp, "-p", "test*.py"],
                                  cwd=tmp, capture_output=True, text=True, encoding="utf-8", errors="replace", env=ENV, timeout=120)
        except subprocess.TimeoutExpired:
            return False, 0, "тесты выполнялись дольше 2 минут"
        ran = re.search(r"Ran (\d+) test", proc.stderr)
        return proc.returncode == 0, int(ran.group(1)) if ran else 0, proc.stderr


def check_report(project):
    path = os.path.join(project, "bugs.md")
    if not os.path.exists(path):
        return 0, "нет файла bugs.md"
    text = open(path, encoding="utf-8").read()
    sections = [s for s in re.split(r"^##\s", text, flags=re.MULTILINE)[1:]]
    labels = ("шаги", "ожидаем", "фактическ", "серьёзность")
    complete = [s for s in sections if all(label in s.lower() for label in labels)]
    return len(complete), f"полных баг-репортов: {len(complete)} (в каждом разделе ## нужны «Шаги», «Ожидаемый результат», «Фактический результат», «Серьёзность»)"


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    project = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    tests = sorted(n for n in os.listdir(project) if n.startswith("test") and n.endswith(".py"))
    print("Проверяю тесты в:", project)
    if not tests:
        print("\n✗ Не найдено ни одного файла test*.py")
        sys.exit(1)
    correct, mutants, sprints = unpack()

    ok, count, log = run_tests(project, correct, tests)
    print(f"\nТестов найдено: {count}")
    if count == 0:
        print("✗ Тесты не запустились:\n" + log[-1500:])
        sys.exit(1)
    if not ok:
        print("✗ На исправной версии shop.py ваши тесты падают — значит, какой-то тест проверяет не то,")
        print("  что написано в требованиях (ложное срабатывание). Сверьтесь с REQUIREMENTS.md:\n")
        print(log[-2500:])
        sys.exit(1)
    print("✓ На исправной версии все тесты проходят — ложных срабатываний нет")

    caught = 0
    found = {}
    for bug_id, requirement, old, new in mutants:
        assert correct.count(old) == 1
        passed, _, _ = run_tests(project, correct.replace(old, new), tests)
        found[bug_id] = (requirement, not passed)
        caught += not passed
    for sprint in sorted(sprints):
        print(f"\nСпринт {sprint}")
        for bug_id in sprints[sprint]:
            requirement, hit = found[bug_id]
            print(f"  {'✓' if hit else '✗'} {requirement}: баг {'пойман' if hit else 'не пойман — добавьте тест на это требование'}")
    reports, note = check_report(project)
    report_ok = reports >= caught and caught > 0
    print(f"\nБаг-репорты")
    print(f"  {'✓' if report_ok else '✗'} {note}; найдено багов тестами: {caught}")
    total = len(mutants) + 1
    score = caught + report_ok
    print(f"\nИтог: поймано {caught} из {len(mutants)} багов, отчёт {'готов' if report_ok else 'не готов'} — {score} из {total}")
    sys.exit(0 if score == total else 1)


if __name__ == "__main__":
    main()
