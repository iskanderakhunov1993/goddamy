"""Проверка проекта «Аналитика интернет-магазина» курса Godemy.

Нужен только Python 3.8+ (модуль sqlite3 входит в стандартную библиотеку).

    python check.py --make-db     создать учебную базу shop.db в текущей папке
    python check.py --run FILE    выполнить запрос из файла на shop.db и показать результат
    python check.py               проверить все запросы в папке queries/

Каждый запрос проверяется на двух базах: на вашей shop.db и на второй,
с другими данными, которую скрипт собирает сам. Поэтому ответ нельзя
«подогнать» под конкретные числа — запрос должен быть верным по смыслу.
Правильных запросов в этом файле нет: только отпечатки (хеши) верных результатов.
"""
import hashlib
import json
import os
import random
import sqlite3
import sys
from datetime import date, timedelta

TASKS = [
    # (спринт, файл, что сделать)
    (1, "01_cheap_products.sql", "Товары дешевле 1000: name, price. Сортировка: price по возрастанию, затем name."),
    (1, "02_kazan_customers.sql", "Клиенты из города «Казань»: name, email. Сортировка: name."),
    (1, "03_march_delivered.sql", "Заказы со статусом delivered, созданные в марте 2026: id, customer_id, created_at. Сортировка: created_at, затем id."),
    (2, "04_order_customers.sql", "Все заказы с именем клиента: order_id, customer_name, status. Сортировка: order_id."),
    (2, "05_order_totals.sql", "Сумма каждого заказа (quantity * price из order_items): order_id, total. Сортировка: order_id."),
    (2, "06_never_ordered.sql", "Клиенты, у которых нет ни одного заказа: name. Сортировка: name."),
    (3, "07_revenue_by_category.sql", "Выручка по категориям, только заказы delivered: category, revenue. Сортировка: revenue по убыванию."),
    (3, "08_busy_cities.sql", "Города, где не меньше 30 заказов (любого статуса): city, orders_count. Сортировка: orders_count по убыванию, затем city."),
    (3, "09_monthly_revenue.sql", "Выручка по месяцам, только delivered: month (ГГГГ-ММ), revenue. Сортировка: month."),
    (4, "10_top_customers.sql", "Пять клиентов с наибольшей суммой delivered-заказов: name, spent. Сортировка: spent по убыванию, затем name."),
    (4, "11_above_category_avg.sql", "Товары дороже средней цены своей категории: name, category, price. Сортировка: category, затем price по убыванию, затем name."),
    (4, "12_top3_in_category.sql", "Топ-3 товаров по проданным штукам (delivered) в каждой категории с RANK(): category, name, units, rnk. Только rnk <= 3. Сортировка: category, rnk, name."),
]

DIGESTS = {
    "01_cheap_products.sql": {
        "1": [
            "615f624d76150972384712a3a6767131c17a2c5ebd24d89f65e17a5b2e1b1ecb",
            13,
            2
        ],
        "2": [
            "20796bf04480408c4ef26c40b9756a568e93383f00b6aed50039b77c67e6f125",
            13,
            2
        ]
    },
    "02_kazan_customers.sql": {
        "1": [
            "392d3a28ba6cdfe34bbddcd43b3b4ce9a9f42cf7f9e79966ad904a20ea2162c5",
            5,
            2
        ],
        "2": [
            "cd288587a4f7e093d1941e7cb30bfd4787110c9e950d399e08cfd2f4371a928b",
            4,
            2
        ]
    },
    "03_march_delivered.sql": {
        "1": [
            "bba7baf20b4762081fcebc5faa0f57d882b92f06938abd8ae971ec53fec9e505",
            20,
            3
        ],
        "2": [
            "6dc8dd4d70f10eb357f9a29024bb0002ce3aba25cd1cf11a170e7516387d4086",
            19,
            3
        ]
    },
    "04_order_customers.sql": {
        "1": [
            "3fc87e9fffcb34c88104cb988b43c3e7172d424715486cd5d9d8c27b58cadb88",
            180,
            3
        ],
        "2": [
            "40786600d9c597d1b3708855c5188c984f1b7ded04f64303a46d831c4a781972",
            180,
            3
        ]
    },
    "05_order_totals.sql": {
        "1": [
            "e6d600bd33d51d260243f4eb10b5513e5f9b5ef88a29b44e9f9d92b83a5693e4",
            180,
            2
        ],
        "2": [
            "18f59b4270859c90740c436ebf60436ee030ff5fce37c9bd0e20504bc7ec1acd",
            180,
            2
        ]
    },
    "06_never_ordered.sql": {
        "1": [
            "3d348d94ea77cc76fcbc4a3dccc13fe4d11216f9e36def697c2a465d0197dc12",
            6,
            1
        ],
        "2": [
            "3930e0cfcc5b3cc30df07fc14d849e0dc2d42c3ac06fbe78481da3ff901247b3",
            6,
            1
        ]
    },
    "07_revenue_by_category.sql": {
        "1": [
            "d4d6a60fbd05d1c82574a83e77af109f5a7bb0c98aa0e412fd1243fc1de90c70",
            4,
            2
        ],
        "2": [
            "354b5a672b8588d0fd97275ed29a94cca65a07f52122fdc8680e9c3a3314cb3e",
            4,
            2
        ]
    },
    "08_busy_cities.sql": {
        "1": [
            "9792c18945ae7b504a9a2f78e344b04e9379cbecc30341061a6cff4d4d050b6d",
            2,
            2
        ],
        "2": [
            "a832eefed8c2c63723a7691c7d3a88a4cebb59f556fcdc056cad97644a990083",
            4,
            2
        ]
    },
    "09_monthly_revenue.sql": {
        "1": [
            "0f2ec8b91b2be15e183225a56843a5f179a0d60221010f2e418fea4f659e2056",
            5,
            2
        ],
        "2": [
            "dbc9d6798d3a31bab6453c8b1494d9188fc08d827a6eeef45cf1dd142b24d568",
            5,
            2
        ]
    },
    "10_top_customers.sql": {
        "1": [
            "598c3820ed786ae64c6dc5ebb3257d4b53e62c5343652de087c437d974df66b9",
            5,
            2
        ],
        "2": [
            "ab63e1c3fa75b0513f8992fe0c1257d0bdce0c9d459031da1c6ac929cc4f86c4",
            5,
            2
        ]
    },
    "11_above_category_avg.sql": {
        "1": [
            "90e0cfd2e427e92a181b87245afd00499f22e8be2597c5dbb6d1e01111a8ca7b",
            20,
            3
        ],
        "2": [
            "99f389ec302998368815661d38e614acd32e21f253bde76fe8c6c92656b975ae",
            21,
            3
        ]
    },
    "12_top3_in_category.sql": {
        "1": [
            "f250d2c03ac6ae3007ffb47b87bcde6092c9991d614a62241b04e558e85d0cc0",
            14,
            4
        ],
        "2": [
            "1e39e0d9b3329f31f0d4b7bd5f2bdbe840565d7b125702eed56812152e528668",
            13,
            4
        ]
    }
}

CITIES = ["Москва", "Казань", "Новосибирск", "Екатеринбург", "Самара", "Пермь"]
FIRST = ["Анна", "Борис", "Вера", "Глеб", "Дина", "Егор", "Жанна", "Илья", "Карина", "Лев", "Мария", "Никита", "Ольга", "Павел", "Роза", "Сергей", "Таня", "Ульяна", "Фёдор", "Юлия"]
LAST = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Соколов", "Лебедев", "Козлов", "Новиков", "Морозов", "Волков"]
CATEGORIES = {
    "Книги": ["Роман", "Справочник", "Комикс", "Учебник", "Сборник стихов"],
    "Электроника": ["Наушники", "Зарядка", "Флешка", "Колонка", "Мышь"],
    "Дом": ["Кружка", "Плед", "Лампа", "Подушка", "Органайзер"],
    "Спорт": ["Скакалка", "Коврик", "Гантели", "Бутылка", "Эспандер"],
}
STATUSES = ["delivered", "delivered", "delivered", "shipped", "cancelled", "new"]


def build_db(path, seed):
    rnd = random.Random(seed)
    if path != ":memory:" and os.path.exists(path):
        os.remove(path)
    db = sqlite3.connect(path)
    db.executescript("""
        CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, city TEXT NOT NULL);
        CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL);
        CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL, price REAL NOT NULL);
    """)
    names = set()
    customers = []
    while len(customers) < 40:
        name = f"{rnd.choice(FIRST)} {rnd.choice(LAST)}"
        if name in names:
            continue
        names.add(name)
        customers.append((len(customers) + 1, name, f"user{len(customers) + 1}@example.com", rnd.choice(CITIES)))
    db.executemany("INSERT INTO customers VALUES (?, ?, ?, ?)", customers)
    products = []
    for category, items in CATEGORIES.items():
        for item in items:
            for variant in ("эконом", "стандарт", "премиум"):
                price = rnd.randint(3, 120) * 50 / (2 if variant == "эконом" else 1) * (3 if variant == "премиум" else 1)
                products.append((len(products) + 1, f"{item} {variant}", category, round(price, 2)))
    db.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", products)
    buyers = [c[0] for c in customers[: int(len(customers) * 0.85)]]
    start = date(2026, 1, 1)
    orders, items = [], []
    for order_id in range(1, 181):
        created = start + timedelta(days=rnd.randint(0, 150), minutes=rnd.randint(0, 1439))
        orders.append((order_id, rnd.choice(buyers), rnd.choice(STATUSES), f"{created.isoformat()} {rnd.randint(8, 22):02d}:{rnd.randint(0, 59):02d}:00"))
        for product in rnd.sample(products, rnd.randint(1, 4)):
            discount = rnd.choice([1, 1, 1, 0.9])
            items.append((len(items) + 1, order_id, product[0], rnd.randint(1, 3), round(product[3] * discount, 2)))
    db.executemany("INSERT INTO orders VALUES (?, ?, ?, ?)", orders)
    db.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)", items)
    db.commit()
    return db


def normalize(rows):
    out = []
    for row in rows:
        out.append([f"{float(v):.2f}" if isinstance(v, (int, float)) and not isinstance(v, bool) else v for v in row])
    return out


def digest(rows):
    return hashlib.sha256(json.dumps(normalize(rows), ensure_ascii=False).encode("utf-8")).hexdigest()


def run_query(db, sql):
    sql = sql.strip().rstrip(";").strip()
    if not sql:
        raise ValueError("файл пустой")
    if ";" in sql:
        raise ValueError("в файле должен быть один запрос")
    if not sql.lower().lstrip("(").startswith(("select", "with")):
        raise ValueError("запрос должен начинаться с SELECT или WITH")
    return db.execute(sql).fetchall()


def show(rows, limit=20):
    for row in rows[:limit]:
        print("  ", " | ".join(str(v) for v in row))
    if len(rows) > limit:
        print(f"   … ещё {len(rows) - limit} строк")
    print(f"   ({len(rows)} строк)")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    if "--make-db" in sys.argv:
        build_db("shop.db", 1).close()
        print("Создана shop.db: таблицы customers, products, orders, order_items.")
        return
    if "--run" in sys.argv:
        path = sys.argv[sys.argv.index("--run") + 1]
        db = sqlite3.connect("shop.db") if os.path.exists("shop.db") else build_db(":memory:", 1)
        try:
            show(run_query(db, open(path, encoding="utf-8").read()))
        except Exception as error:
            print("Ошибка:", error)
            sys.exit(1)
        return

    folder = sys.argv[1] if len(sys.argv) > 1 else "queries"
    bases = {seed: build_db(":memory:", seed) for seed in (1, 2)}
    passed = 0
    current = 0
    for sprint, name, text in TASKS:
        if sprint != current:
            current = sprint
            print(f"\nСпринт {sprint}")
        path = os.path.join(folder, name)
        if not os.path.exists(path):
            print(f"  ✗ {name} — файла нет\n       {text}")
            continue
        sql = open(path, encoding="utf-8").read()
        try:
            results = {seed: run_query(db, sql) for seed, db in bases.items()}
        except Exception as error:
            print(f"  ✗ {name} — ошибка: {error}")
            continue
        ok = all(digest(results[seed]) == DIGESTS[name][str(seed)][0] for seed in bases)
        if ok:
            passed += 1
            print(f"  ✓ {name}")
            continue
        print(f"  ✗ {name}\n       {text}")
        for seed in bases:
            got = results[seed]
            want_rows, want_cols = DIGESTS[name][str(seed)][1:]
            label = "ваша shop.db" if seed == 1 else "проверочная база"
            if digest(got) != DIGESTS[name][str(seed)][0]:
                cols = len(got[0]) if got else 0
                hint = []
                if len(got) != want_rows:
                    hint.append(f"строк {len(got)}, ожидалось {want_rows}")
                if got and cols != want_cols:
                    hint.append(f"колонок {cols}, ожидалось {want_cols}")
                if not hint:
                    hint.append("число строк и колонок верное — проверьте значения, округление и порядок сортировки")
                print(f"       {label}: " + "; ".join(hint))
    print(f"\nИтог: {passed} из {len(TASKS)} запросов")
    sys.exit(0 if passed == len(TASKS) else 1)


if __name__ == "__main__":
    main()
