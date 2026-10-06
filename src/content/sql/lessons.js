// Уроки курса SQL. Все запросы с run: "shop" выполняются прямо в уроке на учебной
// базе магазина — той же, что в проекте. Примеры отвечают на другие вопросы,
// чем задания проекта, чтобы не выдавать готовые ответы.
import { buildLessonTrack } from "../lessonTrack.js";

const q = (code) => ({ type: "code", language: "sql", run: "shop", code });

const basics = {
  id: "sql-basics", title: "Выборки и связи", phase: "ОСНОВЫ",
  summary: "SELECT, WHERE, ORDER BY и соединение таблиц.",
  topics: [
    { id: "select", title: "Выборка данных", lessons: [
      {
        title: "Таблицы и SELECT",
        summary: "Что лежит в базе магазина и как достать нужные столбцы.",
        blocks: [
          { type: "paragraph", text: "База — это набор **таблиц**. У каждой таблицы есть столбцы (что храним) и строки (записи). В нашей базе четыре таблицы: `customers`, `products`, `orders` и `order_items`. Нажмите «Запустить» — запрос выполнится на настоящей базе SQLite прямо в браузере." },
          q("SELECT * FROM products LIMIT 5;"),
          { type: "paragraph", text: "`*` — все столбцы. На практике перечисляют нужные: так запрос понятнее и не ломается, если в таблицу добавят столбец." },
          q("SELECT name, category, price FROM products LIMIT 5;"),
          { type: "callout", tone: "info", title: "Как связаны таблицы", text: "`orders.customer_id` указывает на `customers.id`, а `order_items` связывает заказ (`order_id`) с товаром (`product_id`) и хранит количество и цену в момент покупки." },
          { type: "task", title: "Сделай сам", text: "Выведи `name`, `email` и `city` первых 10 клиентов. Измени код в своей базе (`python check.py --run`) или прямо здесь, скопировав пример.", checklist: ["Перечислены три столбца", "Использован LIMIT 10"] },
        ],
      },
      {
        title: "WHERE и ORDER BY",
        summary: "Фильтруем строки и задаём порядок.",
        blocks: [
          { type: "paragraph", text: "`WHERE` оставляет только строки, для которых условие истинно. Условия объединяют через `AND` и `OR`; для списка значений есть `IN`, для диапазона — `BETWEEN`." },
          q("SELECT name, price FROM products\nWHERE category = 'Спорт' AND price BETWEEN 500 AND 3000\nORDER BY price DESC, name;"),
          { type: "paragraph", text: "`ORDER BY` сортирует: `ASC` по возрастанию (по умолчанию), `DESC` по убыванию. Второй столбец сортировки решает ничьи. **Без ORDER BY порядок строк не гарантирован** — база может вернуть их как угодно." },
          q("SELECT id, status, created_at FROM orders\nWHERE status IN ('cancelled', 'new') AND created_at >= '2026-05-01'\nORDER BY created_at\nLIMIT 10;"),
          { type: "callout", tone: "tip", title: "Даты", text: "Даты хранятся строкой `ГГГГ-ММ-ДД ЧЧ:ММ:СС`, поэтому их можно сравнивать как строки. «Весь май» — это `created_at >= '2026-05-01' AND created_at < '2026-06-01'`." },
          { type: "quiz", question: "Нужно получить заказы за апрель 2026. Какое условие верное?", options: ["created_at = '2026-04'", "*created_at >= '2026-04-01' AND created_at < '2026-05-01'", "created_at BETWEEN '2026-04-01' AND '2026-04-30'"], explanation: "BETWEEN '2026-04-30' не включит заказы 30 апреля после полуночи: строка '2026-04-30 10:00:00' больше '2026-04-30'." },
          { type: "task", title: "Сделай сам", text: "Выведи товары категории «Книги» дороже 2000, от дорогих к дешёвым.", checklist: ["Условие по двум столбцам", "Сортировка DESC"] },
        ],
      },
    ] },
    { id: "join", title: "Соединения", lessons: [
      {
        title: "JOIN",
        summary: "Собираем данные из нескольких таблиц в один результат.",
        blocks: [
          { type: "paragraph", text: "В заказе хранится только `customer_id`. Чтобы увидеть имя клиента, таблицы соединяют по ключу: `JOIN ... ON`. Короткие псевдонимы (`o`, `c`) делают запрос читаемым." },
          q("SELECT o.id, c.name, c.city, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.city = 'Пермь'\nORDER BY o.id\nLIMIT 10;"),
          { type: "paragraph", text: "Соединять можно цепочкой: позиции заказа → товары, чтобы увидеть названия купленного." },
          q("SELECT oi.order_id, p.name, oi.quantity, oi.price\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE oi.order_id = 1;"),
          { type: "callout", tone: "warning", title: "Две цены", text: "`products.price` — текущая цена, `order_items.price` — цена в момент покупки, иногда со скидкой. Для выручки берите цену из `order_items`." },
          { type: "task", title: "Сделай сам", text: "Выведи для заказа 2 имя клиента и названия всех купленных товаров — соедини три таблицы.", checklist: ["Соединены orders, customers, order_items и products", "Отфильтрован заказ 2"] },
        ],
      },
      {
        title: "LEFT JOIN и NULL",
        summary: "Находим то, чего нет: товары без продаж, клиентов без заказов.",
        blocks: [
          { type: "paragraph", text: "Обычный `JOIN` оставляет только строки, у которых нашлась пара. `LEFT JOIN` сохраняет **все** строки левой таблицы; если пары нет, столбцы правой будут `NULL`." },
          { type: "paragraph", text: "Пример: какие товары **не покупали с 1 мая**? Берём все товары и пристёгиваем к ним майские позиции заказов. У кого пары не нашлось — тот и не продавался." },
          q("SELECT p.name\nFROM products p\nLEFT JOIN order_items oi\n  ON oi.product_id = p.id\n AND oi.order_id IN (SELECT id FROM orders WHERE created_at >= '2026-05-01')\nWHERE oi.id IS NULL\nORDER BY p.name;"),
          { type: "callout", tone: "info", title: "Условие в ON или в WHERE", text: "Условие про май стоит в `ON`: оно ограничивает, **что пристёгивать**. Если перенести его в `WHERE`, оно отбросит строки с NULL, и LEFT JOIN превратится в обычный JOIN." },
          { type: "callout", tone: "warning", title: "NULL сравнивают через IS", text: "`x = NULL` никогда не бывает истинным — даже если x пуст. Правильно: `x IS NULL` или `x IS NOT NULL`." },
          { type: "task", title: "Сделай сам", text: "Запусти пример. Затем замени LEFT JOIN на JOIN и объясни, почему результат стал пустым.", checklist: ["Пример запущен", "Объяснено, куда пропали строки"] },
        ],
      },
    ] },
  ],
};

const analytics = {
  id: "sql-analytics", title: "Аналитика", phase: "ОТЧЁТЫ",
  summary: "Агрегаты, группировка, подзапросы и оконные функции.",
  topics: [
    { id: "group", title: "Группировка", lessons: [
      {
        title: "Агрегаты и GROUP BY",
        summary: "COUNT, SUM, AVG и итоги по группам.",
        blocks: [
          { type: "paragraph", text: "Агрегатные функции сворачивают много строк в одно значение: `COUNT(*)`, `SUM`, `AVG`, `MIN`, `MAX`. С `GROUP BY` они считаются отдельно для каждой группы." },
          q("SELECT status, COUNT(*) AS orders_count\nFROM orders\nGROUP BY status\nORDER BY orders_count DESC;"),
          q("SELECT category, COUNT(*) AS products, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category\nORDER BY avg_price DESC;"),
          { type: "callout", tone: "info", title: "Правило GROUP BY", text: "В SELECT можно выводить только столбцы из GROUP BY и агрегаты. Остальные столбцы у группы разные, и база не знает, какое значение показать." },
          { type: "task", title: "Сделай сам", text: "Посчитай, сколько штук товаров (сумма `quantity`) куплено в каждом заказе, и выведи 5 самых крупных заказов.", checklist: ["SUM(quantity) по order_id", "Сортировка DESC и LIMIT 5"] },
        ],
      },
      {
        title: "HAVING и даты в отчётах",
        summary: "Фильтруем группы и группируем по месяцам.",
        blocks: [
          { type: "paragraph", text: "`WHERE` отбирает строки **до** группировки, `HAVING` — группы **после**. Условие на агрегат (`COUNT(*) > 10`) возможно только в HAVING." },
          q("SELECT c.name, COUNT(*) AS cancelled\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'cancelled'\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= 2\nORDER BY cancelled DESC, c.name;"),
          { type: "paragraph", text: "Функция `strftime` вырезает часть даты. Группировка по `strftime('%Y-%m', created_at)` даёт отчёт по месяцам." },
          q("SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders_count\nFROM orders\nGROUP BY month\nORDER BY month;"),
          { type: "task", title: "Сделай сам", text: "Найди дни недели, в которые было больше 25 заказов. Подсказка: `strftime('%w', created_at)` возвращает номер дня недели.", checklist: ["Группировка по дню недели", "Фильтр в HAVING"] },
        ],
      },
    ] },
    { id: "advanced", title: "Сложные запросы", lessons: [
      {
        title: "Подзапросы и CTE",
        summary: "Запрос внутри запроса и именованные шаги через WITH.",
        blocks: [
          { type: "paragraph", text: "Подзапрос — это запрос в скобках, результат которого используется как значение или как таблица. **Коррелированный** подзапрос ссылается на строку внешнего запроса и вычисляется для каждой строки." },
          q("SELECT name, price FROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC\nLIMIT 5;"),
          { type: "paragraph", text: "`WITH` (CTE) даёт имя промежуточному результату. Сложный отчёт превращается в понятные шаги." },
          q("WITH order_sizes AS (\n  SELECT order_id, SUM(quantity) AS items\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT items, COUNT(*) AS orders_count\nFROM order_sizes\nGROUP BY items\nORDER BY items;"),
          { type: "task", title: "Сделай сам", text: "Через CTE найди средний размер заказа (в штуках) для каждого статуса заказа.", checklist: ["CTE считает штуки в заказе", "Внешний запрос группирует по статусу"] },
        ],
      },
      {
        title: "Оконные функции",
        summary: "Рейтинги и итоги, не схлопывая строки.",
        blocks: [
          { type: "paragraph", text: "`GROUP BY` сворачивает строки в одну, а **оконная функция** считает по группе строк и оставляет каждую строку на месте. `PARTITION BY` задаёт группу, `ORDER BY` внутри `OVER` — порядок." },
          q("SELECT category, name, price,\n       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS place\nFROM products\nORDER BY category, place\nLIMIT 12;"),
          { type: "list", items: [
            "`ROW_NUMBER()` — 1, 2, 3, 4 всегда подряд, даже при равенстве.",
            "`RANK()` — при равенстве одинаковые места и пропуск: 1, 1, 3.",
            "`DENSE_RANK()` — одинаковые места без пропуска: 1, 1, 2.",
          ] },
          q("SELECT created_at, id,\n       COUNT(*) OVER (ORDER BY created_at) AS orders_so_far\nFROM orders\nORDER BY created_at\nLIMIT 8;"),
          { type: "callout", tone: "tip", title: "Дальше — проект", text: "Вы знаете всё для проекта «Аналитика интернет-магазина»: откройте его, создайте базу и начните со спринта 1." },
          { type: "task", title: "Сделай сам", text: "Замени в первом примере RANK на ROW_NUMBER и найди категорию, где результат отличается.", checklist: ["Запрос изменён", "Найдено различие при равных ценах"] },
        ],
      },
    ] },
  ],
};

export const sqlLessons = buildLessonTrack({ slug: "sql-lessons", base: "/sql", modules: [basics, analytics] });
