// Задачи курса «Python для школьников»: реальные задачи из жизни школьника.
// Код выполняется в браузере (Pyodide); решение принимается, если вывод проверки
// совпал с выводом эталона. Ничего устанавливать не нужно.

const raw = String.raw;

export const schoolChallenges = [
  {
    id: "save-money", title: "Накопить на наушники", category: "Деньги", level: "Лёгкая", minutes: 10,
    description: "Наушники стоят `price` рублей, у тебя уже есть `saved`, и каждую неделю ты откладываешь `per_week`. Напиши `weeks_to_save(price, saved, per_week)`: сколько **целых недель** нужно копить. Если денег уже хватает — `0`.",
    starter: raw`def weeks_to_save(price, saved, per_week):
    return (price - saved) / per_week`,
    harness: raw`print(weeks_to_save(3000, 1000, 500))
print(weeks_to_save(3000, 1000, 600))
print(weeks_to_save(2000, 2500, 300))
print(weeks_to_save(1500, 0, 1500))`,
    referenceSolution: raw`def weeks_to_save(price, saved, per_week):
    need = price - saved
    if need <= 0:
        return 0
    weeks = need // per_week
    if need % per_week != 0:
        weeks += 1
    return weeks`,
    hint: "Деление `/` даёт дробь (3.33…), а неделя бывает только целой. `//` — целая часть, `%` — остаток. Если остаток не ноль, нужна ещё одна неделя.",
    explain: "2000 рублей по 600 в неделю — это 3 недели и ещё немного. За 3 недели наберётся только 1800, поэтому нужно 4. Округление «вверх» в задачах про деньги и время встречается постоянно.",
  },
  {
    id: "shopping", title: "Хватит ли денег на покупки", category: "Деньги", level: "Лёгкая", minutes: 10,
    description: "В магазине ты набрал товары с ценами `prices` (список). Напиши `check_budget(budget, prices)`: если денег хватает, верни `(\"хватает\", остаток)`, иначе `(\"не хватает\", сколько не хватает)`.",
    starter: raw`def check_budget(budget, prices):
    return ("хватает", 0)`,
    harness: raw`print(check_budget(500, [120, 80, 45]))
print(check_budget(300, [150, 99, 70]))
print(check_budget(200, [200]))
print(check_budget(100, []))`,
    referenceSolution: raw`def check_budget(budget, prices):
    total = sum(prices)
    if total <= budget:
        return ("хватает", budget - total)
    return ("не хватает", total - budget)`,
    hint: "`sum(prices)` складывает все числа в списке. Сравни сумму с бюджетом.",
    explain: "Обрати внимание на случай «ровно хватает» (200 из 200): остаток 0, и это «хватает». Такие граничные случаи — частый источник ошибок.",
  },
  {
    id: "change", title: "Сдача купюрами и монетами", category: "Деньги", level: "Средняя", minutes: 15,
    description: "Кассир выдаёт сдачу самыми крупными купюрами и монетами: 1000, 500, 100, 50, 10, 5, 2, 1. Напиши `give_change(price, paid)`: верни словарь `номинал → количество` только для используемых номиналов. Если заплачено меньше цены — верни `None`.",
    starter: raw`def give_change(price, paid):
    return {}`,
    harness: raw`print(give_change(347, 1000))
print(give_change(99, 100))
print(give_change(500, 500))
print(give_change(800, 500))`,
    referenceSolution: raw`def give_change(price, paid):
    if paid < price:
        return None
    rest = paid - price
    result = {}
    for coin in [1000, 500, 100, 50, 10, 5, 2, 1]:
        count = rest // coin
        if count > 0:
            result[coin] = count
            rest -= coin * count
    return result`,
    hint: "Иди от крупного номинала к мелкому: сколько раз номинал помещается в остаток (`//`), столько и выдать, потом уменьшить остаток.",
    explain: "Это «жадный» алгоритм: на каждом шаге берём самое крупное, что помещается. Для наших купюр он даёт наименьшее число купюр и монет. Сдача с 347 из 1000 — 653: 500 + 100 + 50 + 2 + 1.",
  },
  {
    id: "score-to-grade", title: "Баллы в оценку", category: "Оценки", level: "Лёгкая", minutes: 8,
    description: "За контрольную ставят баллы от 0 до 100. Напиши `grade(score)`: меньше 50 — `2`, от 50 до 69 — `3`, от 70 до 84 — `4`, от 85 — `5`. Если баллы вне 0–100 — `None`.",
    starter: raw`def grade(score):
    if score > 85:
        return 5
    if score > 70:
        return 4
    if score > 50:
        return 3
    return 2`,
    harness: raw`for score in [0, 49, 50, 69, 70, 84, 85, 100, -5, 101]:
    print(score, grade(score))`,
    referenceSolution: raw`def grade(score):
    if score < 0 or score > 100:
        return None
    if score >= 85:
        return 5
    if score >= 70:
        return 4
    if score >= 50:
        return 3
    return 2`,
    hint: "«От 85» значит 85 тоже даёт пятёрку — нужен `>=`, а не `>`. И сначала отсей неверные баллы.",
    explain: "В стартовом коде ученик с 85 баллами получал четвёрку вместо пятёрки. Такие ошибки «на границе» встречаются в настоящих программах постоянно, поэтому всегда проверяй сами границы: 49, 50, 69, 70, 84, 85.",
  },
  {
    id: "final-grade", title: "Итоговая оценка за четверть", category: "Оценки", level: "Средняя", minutes: 15,
    description: "Напиши `final_grade(marks)`: средний балл по списку оценок, округлённый **по школьным правилам** — 4.5 и выше это 5, 3.5 это 4, 3.49 это 3. Если оценок нет — `None`.",
    starter: raw`def final_grade(marks):
    return round(sum(marks) / len(marks))`,
    harness: raw`print(final_grade([5, 4, 5, 4]))
print(final_grade([4, 3, 4, 3]))
print(final_grade([3, 3, 4, 4, 3, 4, 3]))
print(final_grade([5]))
print(final_grade([]))`,
    referenceSolution: raw`def final_grade(marks):
    if not marks:
        return None
    average = sum(marks) / len(marks)
    return int(average + 0.5)`,
    hint: "Запусти стартовый код: `round(4.5)` в Python даёт 4! Python округляет «к чётному». Для школьного правила прибавь 0.5 и отбрось дробную часть: `int(average + 0.5)`.",
    explain: "Python использует «банковское» округление: 4.5 → 4, а 3.5 → 4. Оно честнее для бухгалтерии, но в школе так не считают. Хороший программист проверяет, как именно работает встроенная функция, а не надеется на неё.",
  },
  {
    id: "english-test", title: "Проверка словарного диктанта", category: "Слова и тексты", level: "Средняя", minutes: 15,
    description: "Есть словарь `words` (английское слово → перевод) и ответы ученика `answers` (английское слово → что он написал). Напиши `check_test(words, answers)`: верни `(верных, список_ошибок)`, где ошибки — отсортированный список английских слов. Регистр и пробелы по краям не важны; пропущенный ответ — ошибка.",
    starter: raw`def check_test(words, answers):
    correct = 0
    mistakes = []
    for word in words:
        if answers[word] == words[word]:
            correct += 1
        else:
            mistakes.append(word)
    return (correct, mistakes)`,
    harness: raw`words = {"cat": "кошка", "dog": "собака", "house": "дом", "apple": "яблоко", "book": "книга"}
answers = {"cat": "Кошка", "dog": " собака ", "house": "дома", "book": "книга"}
print(check_test(words, answers))
print(check_test(words, {}))`,
    referenceSolution: raw`def check_test(words, answers):
    correct = 0
    mistakes = []
    for word, translation in words.items():
        answer = answers.get(word, "")
        if answer.strip().lower() == translation.lower():
            correct += 1
        else:
            mistakes.append(word)
    return (correct, sorted(mistakes))`,
    hint: "`answers.get(word, \"\")` не падает, если ответа нет. `.strip()` убирает пробелы по краям, `.lower()` — делает буквы маленькими.",
    explain: "Стартовый код падал на пропущенном слове (KeyError) и считал «Кошка» ошибкой. Программы для людей должны прощать мелочи вроде заглавной буквы и лишнего пробела, но не настоящие ошибки — «дома» вместо «дом».",
  },
  {
    id: "secret-note", title: "Записка шифром Цезаря", category: "Слова и тексты", level: "Средняя", minutes: 15,
    description: "Шифр Цезаря сдвигает каждую букву на `shift` позиций по алфавиту по кругу (я → а). Напиши `encode(text, shift)` для русских букв: заглавные остаются заглавными, остальные символы (пробелы, цифры, знаки) не меняются. Алфавит: `абвгдеёжзийклмнопрстуфхцчшщъыьэюя`.",
    starter: raw`ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"

def encode(text, shift):
    return text`,
    harness: raw`print(encode("привет", 1))
print(encode("Встречаемся у школы в 15:00!", 3))
print(encode("яблоко", 2))
print(encode(encode("Секрет", 5), -5))`,
    referenceSolution: raw`ALPHABET = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"

def encode(text, shift):
    result = ""
    for char in text:
        lower = char.lower()
        if lower in ALPHABET:
            new = ALPHABET[(ALPHABET.index(lower) + shift) % len(ALPHABET)]
            result += new.upper() if char.isupper() else new
        else:
            result += char
    return result`,
    hint: "Номер буквы — `ALPHABET.index(буква)`. Новый номер — `(номер + shift) % 33`: остаток от деления возвращает «по кругу» в начало алфавита.",
    explain: "Последняя проверка расшифровывает: сдвиг на -5 отменяет сдвиг на 5. Шифр Цезаря легко взломать перебором 33 сдвигов — поэтому настоящие шифры устроены сложнее, но идея «ключа» та же.",
  },
  {
    id: "schedule", title: "Сколько уроков в неделю", category: "Расписание", level: "Лёгкая", minutes: 10,
    description: "Расписание — словарь `день → список уроков`. Напиши `weekly_count(schedule)`: верни словарь `предмет → сколько раз в неделю`, отсортированный по убыванию количества, а при равенстве — по названию.",
    starter: raw`def weekly_count(schedule):
    return {}`,
    harness: raw`schedule = {
    "пн": ["математика", "русский", "физра", "английский"],
    "вт": ["русский", "математика", "история", "литература"],
    "ср": ["математика", "информатика", "русский", "физра"],
    "чт": ["английский", "математика", "литература"],
    "пт": ["история", "русский", "информатика", "математика"],
}
for subject, count in weekly_count(schedule).items():
    print(subject, count)`,
    referenceSolution: raw`def weekly_count(schedule):
    counts = {}
    for lessons in schedule.values():
        for subject in lessons:
            counts[subject] = counts.get(subject, 0) + 1
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return dict(ordered)`,
    hint: "Считай в словаре: `counts[subject] = counts.get(subject, 0) + 1`. Для сортировки по убыванию числа и по алфавиту используй ключ `(-количество, название)`.",
    explain: "Подсчёт «сколько раз встречается» — одна из самых частых задач в программировании: слова в тексте, покупки, ошибки в логах. Шаблон всегда один: словарь и `get(…, 0) + 1`.",
  },
  {
    id: "best-student", title: "Лучший ученик класса", category: "Дневник класса", level: "Средняя", minutes: 12,
    description: "Журнал — словарь `ученик → список оценок`. Напиши `best_student(journal)`: верни имя ученика с наибольшим средним баллом; при равенстве — первого по алфавиту. Ученики без оценок не участвуют. Если никто не подходит — `None`.",
    starter: raw`def best_student(journal):
    best = None
    for name in journal:
        if best is None or sum(journal[name]) > sum(journal[best]):
            best = name
    return best`,
    harness: raw`journal = {
    "Маша": [5, 4, 5],
    "Петя": [5, 5, 5, 3, 4, 4],
    "Аня": [5, 5, 4],
    "Коля": [],
}
print(best_student(journal))
print(best_student({"Оля": [4, 4], "Дима": [5, 3]}))
print(best_student({"Вова": []}))`,
    referenceSolution: raw`def best_student(journal):
    best = None
    best_average = None
    for name in sorted(journal):
        marks = journal[name]
        if not marks:
            continue
        average = sum(marks) / len(marks)
        if best_average is None or average > best_average:
            best, best_average = name, average
    return best`,
    hint: "Сравнивать нужно **средний** балл, а не сумму: у Пети больше оценок, поэтому сумма больше. Перебирай имена в `sorted(journal)` — тогда при равенстве останется первый по алфавиту.",
    explain: "Стартовый код выбирал Петю: у него просто больше оценок. Выбор неправильной метрики — частая ошибка и в программах, и в жизни: «больше всего продаж» и «лучший продавец» — не одно и то же.",
  },
  {
    id: "subject-report", title: "Отчёт по предметам", category: "Дневник класса", level: "Сложная", minutes: 20,
    description: "Оценки класса записаны строками `(ученик, предмет, оценка)`. Напиши `subject_report(rows)`: для каждого предмета посчитай средний балл (округли до 2 знаков) и число оценок. Верни список `(предмет, средний, количество)`, отсортированный по среднему по убыванию, при равенстве — по названию.",
    starter: raw`def subject_report(rows):
    return []`,
    harness: raw`rows = [
    ("Маша", "математика", 5), ("Петя", "математика", 3), ("Аня", "математика", 3),
    ("Маша", "русский", 4), ("Петя", "русский", 5),
    ("Аня", "история", 5), ("Петя", "история", 4), ("Маша", "история", 3),
    ("Аня", "физика", 5), ("Петя", "физика", 3),
]
for line in subject_report(rows):
    print(line)`,
    referenceSolution: raw`def subject_report(rows):
    marks = {}
    for _, subject, mark in rows:
        marks.setdefault(subject, []).append(mark)
    report = [(subject, round(sum(values) / len(values), 2), len(values)) for subject, values in marks.items()]
    return sorted(report, key=lambda item: (-item[1], item[0]))`,
    hint: "Сначала собери оценки по предметам в словарь списков (`setdefault(subject, []).append(mark)`), потом посчитай среднее для каждого.",
    explain: "Это тот же отчёт, который учитель строит в электронном журнале: группировка по предмету и среднее. В курсе SQL ровно это делается одной строкой `GROUP BY`.",
  },
  {
    id: "needs-help", title: "Кому нужна помощь", category: "Дневник класса", level: "Средняя", minutes: 12,
    description: "Журнал — словарь `ученик → предмет → список оценок`. Напиши `needs_help(journal)`: верни отсортированный список пар `(ученик, предмет)`, где средний балл **меньше 3**. Пустые списки оценок пропускай.",
    starter: raw`def needs_help(journal):
    return []`,
    harness: raw`journal = {
    "Петя": {"математика": [2, 3, 2], "русский": [3, 3], "физика": []},
    "Маша": {"математика": [5, 4], "русский": [2, 3, 3]},
    "Коля": {"история": [3, 2], "математика": [3, 3, 2, 4]},
}
print(needs_help(journal))
print(needs_help({}))`,
    referenceSolution: raw`def needs_help(journal):
    result = []
    for student, subjects in journal.items():
        for subject, marks in subjects.items():
            if marks and sum(marks) / len(marks) < 3:
                result.append((student, subject))
    return sorted(result)`,
    hint: "Два вложенных цикла: по ученикам и по их предметам. Не забудь пропустить пустой список — делить на ноль нельзя.",
    explain: "Средний 2.5 у Коли по истории — это «меньше 3», а ровно 3.0 у него же по математике — нет. Программа помогает учителю заметить проблему заранее, а не в конце четверти.",
  },
];

export const getSchoolChallenge = (id) => schoolChallenges.find((item) => item.id === id) || schoolChallenges[0];
