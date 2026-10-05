// Проект курса SQL: «Аналитика интернет-магазина». Студент создаёт базу SQLite
// у себя (python check.py --make-db), пишет 12 запросов в папке queries/ и
// проверяет их тем же check.py. Скрипт сверяет результаты на его базе и на
// второй, скрытой базе с другими данными — по отпечаткам, без эталонного SQL.
// Эталонные запросы: examples/sql-shop-solution (в git не попадают).

const sh = (code) => ({ type: "code", language: "bash", code });
const sql = (code) => ({ type: "code", language: "sql", code });
const sprintCheck = (n, files) => ({ type: "callout", tone: "info", title: `Проверка спринта ${n}`, text: `Запусти \`python check.py\`. Спринт готов, когда в разделе «Спринт ${n}» отмечены ✓ все файлы: ${files}.` });
const task = (n) => ({ type: "task", title: "Готово, если", text: `Отметь, когда check.py показывает ✓ по спринту ${n}.`, checklist: [`Спринт ${n} в check.py полностью зелёный`, "Запросы закоммичены и отправлены на GitHub"] });

const overview = { blocks: [
  { type: "heading", level: 2, text: "Задача" },
  { type: "paragraph", text: "У вас есть база небольшого интернет-магазина: клиенты, товары, заказы и позиции заказов. Нужно ответить на 12 вопросов бизнеса SQL-запросами — от простых выборок до рейтингов внутри категорий. Каждый ответ лежит в своём файле `.sql` в папке `queries/` вашего репозитория." },
  { type: "heading", level: 2, text: "Как проверяется" },
  { type: "list", items: [
    "Скрипт `check.py` выполняет ваши запросы на **двух** базах: на вашей `shop.db` и на второй, с другими данными, которую он собирает сам.",
    "Поэтому ответ нельзя подогнать под числа из своей базы: запрос должен быть верным по смыслу.",
    "Правильных запросов в скрипте нет — только отпечатки (хеши) верных результатов. При ошибке он подскажет, что не так: число строк, колонок или значения и порядок.",
    "Порядок колонок и сортировка указаны в каждом задании — их нужно соблюдать. Названия колонок не проверяются; числа сравниваются с точностью до копейки.",
  ] },
  { type: "heading", level: 2, text: "Схема базы" },
  sql("customers   (id, name, email, city)\nproducts    (id, name, category, price)\norders      (id, customer_id → customers.id, status, created_at)\norder_items (id, order_id → orders.id, product_id → products.id, quantity, price)"),
  { type: "callout", tone: "info", title: "Цена в двух местах", text: "`products.price` — текущая цена товара, `order_items.price` — цена в момент покупки (бывает со скидкой). Выручку считаем по `order_items`." },
  { type: "list", items: [
    "**Спринт 1.** SELECT, WHERE, ORDER BY — 3 запроса.",
    "**Спринт 2.** JOIN и LEFT JOIN — 3 запроса.",
    "**Спринт 3.** GROUP BY, HAVING, даты — 3 запроса.",
    "**Спринт 4.** Подзапросы, CTE и оконные функции — 3 запроса.",
  ] },
] };

const setup = { blocks: [
  { type: "heading", level: 2, text: "Подготовка" },
  { type: "list", items: [
    "Нужен Python 3.8 или новее (`python --version`): модуль `sqlite3` уже входит в него. Ничего больше ставить не нужно.",
    "Для удобства можно поставить DB Browser for SQLite и открыть в нём `shop.db`, но это не обязательно.",
    "Создайте репозиторий `sql-shop-analytics`, положите в него скачанный `check.py` и создайте базу:",
  ] },
  sh("python check.py --make-db\nmkdir queries"),
  { type: "paragraph", text: "Пишите каждый запрос в свой файл и запускайте его, чтобы видеть результат:" },
  sh("python check.py --run queries/01_cheap_products.sql"),
  { type: "callout", tone: "warning", title: "Один запрос — один файл", text: "В файле должен быть ровно один запрос, начинающийся с SELECT или WITH. Изменять данные (INSERT, UPDATE, DELETE) не нужно и не получится." },
  { type: "callout", tone: "tip", title: "shop.db — в .gitignore", text: "Базу любой может пересоздать командой `--make-db`, хранить её в репозитории не нужно." },
] };

const sprints = [
  { number: 1, title: "Выборки и сортировка", time: "1–2 часа", goal: "Достать нужные строки и упорядочить их.", result: "3 запроса на SELECT, WHERE, ORDER BY.",
    blocks: [
      { type: "list", items: [
        "`01_cheap_products.sql` — товары дешевле 1000: `name, price`. Сортировка: price по возрастанию, затем name.",
        "`02_kazan_customers.sql` — клиенты из города «Казань»: `name, email`. Сортировка: name.",
        "`03_march_delivered.sql` — заказы со статусом `delivered`, созданные в марте 2026: `id, customer_id, created_at`. Сортировка: created_at, затем id.",
      ] },
      sql("SELECT name, city FROM customers WHERE city = 'Пермь' ORDER BY name;"),
      { type: "callout", tone: "tip", title: "Даты в SQLite", text: "Даты хранятся строкой `ГГГГ-ММ-ДД ЧЧ:ММ:СС`, поэтому их можно сравнивать как строки: `created_at >= '2026-03-01' AND created_at < '2026-04-01'`." },
      sprintCheck(1, "01, 02, 03"), task(1),
    ] },
  { number: 2, title: "Связи между таблицами", time: "2–3 часа", goal: "Соединять таблицы и находить отсутствующие связи.", result: "3 запроса на JOIN и LEFT JOIN.",
    blocks: [
      { type: "list", items: [
        "`04_order_customers.sql` — все заказы с именем клиента: `order_id, customer_name, status`. Сортировка: order_id.",
        "`05_order_totals.sql` — сумма каждого заказа (`quantity * price` из `order_items`): `order_id, total`. Сортировка: order_id.",
        "`06_never_ordered.sql` — клиенты без единого заказа: `name`. Сортировка: name.",
      ] },
      { type: "callout", tone: "warning", title: "Почему не JOIN", text: "Обычный JOIN оставляет только совпавшие строки, поэтому клиенты без заказов в него не попадут. LEFT JOIN сохраняет всех клиентов, а у тех, кому нет пары, поля заказа будут NULL." },
      sprintCheck(2, "04, 05, 06"), task(2),
    ] },
  { number: 3, title: "Отчёты и агрегаты", time: "2–3 часа", goal: "Группировать данные и фильтровать группы.", result: "3 запроса на GROUP BY и HAVING.",
    blocks: [
      { type: "list", items: [
        "`07_revenue_by_category.sql` — выручка по категориям, только `delivered`: `category, revenue`. Сортировка: revenue по убыванию.",
        "`08_busy_cities.sql` — города, где не меньше 30 заказов любого статуса: `city, orders_count`. Сортировка: orders_count по убыванию, затем city.",
        "`09_monthly_revenue.sql` — выручка по месяцам, только `delivered`: `month` (ГГГГ-ММ), `revenue`. Сортировка: month.",
      ] },
      { type: "callout", tone: "tip", title: "WHERE или HAVING", text: "WHERE фильтрует строки **до** группировки, HAVING — группы **после**. Условие на COUNT(*) возможно только в HAVING. Месяц из даты: `strftime('%Y-%m', created_at)`." },
      sprintCheck(3, "07, 08, 09"), task(3),
    ] },
  { number: 4, title: "Аналитика посложнее", time: "3–4 часа", goal: "Подзапросы, CTE и оконные функции.", result: "3 запроса и итоговый README.",
    blocks: [
      { type: "list", items: [
        "`10_top_customers.sql` — пять клиентов с наибольшей суммой `delivered`-заказов: `name, spent`. Сортировка: spent по убыванию, затем name.",
        "`11_above_category_avg.sql` — товары дороже средней цены своей категории: `name, category, price`. Сортировка: category, затем price по убыванию, затем name.",
        "`12_top3_in_category.sql` — топ-3 товаров по проданным штукам (`delivered`) в каждой категории через `RANK()`: `category, name, units, rnk`, только `rnk <= 3`. Сортировка: category, rnk, name.",
      ] },
      sql("SELECT name, price,\n       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk\nFROM products;"),
      { type: "callout", tone: "info", title: "RANK, а не ROW_NUMBER", text: "При равенстве RANK даёт одинаковые места (1, 1, 3), а ROW_NUMBER всё равно пронумерует подряд. В задаче 12 есть ничьи — проверка это заметит." },
      { type: "paragraph", text: "В конце напишите README: что за данные, как создать базу и запустить проверку, и по одному выводу из запросов 07, 09 и 12 простыми словами — так, как вы рассказали бы руководителю." },
      sprintCheck(4, "10, 11, 12"),
      { type: "task", title: "Готово, если", text: "check.py показывает «Итог: 12 из 12 запросов».", checklist: ["check.py: 12 из 12", "README с выводами", "Репозиторий опубликован"] },
    ] },
];

const build = (id, page) => ({ ...page, id, blocks: page.blocks.map((block, index) => ({ id: `${id}-b${index}`, ...block })) });
const base = "/sql";
const project = {
  title: "Проект · Аналитика интернет-магазина",
  shortTitle: "Аналитика магазина",
  summary: "12 SQL-запросов к базе SQLite у вас на компьютере за четыре спринта. Проверка check.py на вашей и на скрытой базе.",
  includes: "Проект «Аналитика интернет-магазина» с автопроверкой check.py",
  downloads: ["check.py"],
  downloadBase: "/sql-shop",
  overview: build("sql-project-overview", overview),
  setup: build("sql-project-setup", setup),
  sprints: sprints.map((sprint) => build(`sql-project-s${sprint.number}`, sprint)),
};

export const sqlProjectTrack = {
  slug: "sql",
  projectSlug: "sql-project",
  base,
  project: {
    ...project,
    stages: [
      { id: "overview", title: "О проекте", path: `${base}/project` },
      { id: "setup", title: "Подготовка", path: `${base}/project/setup` },
      ...project.sprints.map((sprint) => ({ id: `sprint-${sprint.number}`, title: `Спринт ${sprint.number}`, path: `${base}/project/sprint/${sprint.number}` })),
    ],
  },
};
