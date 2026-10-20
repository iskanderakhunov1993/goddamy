// Задания уроков темы «Основы PostgreSQL» Модуля 3. Каждое код-задание проверено скриптом verify-tasks.mjs: эталон работает, заготовка компилируется и печатает другой вывод.
// В браузере нет базы данных, и Go Playground к PostgreSQL не подключается. Поэтому SQL проверяется квизами,
// а код-задания работают с тем, что бывает вокруг запроса: строки результата в виде слайса структур,
// текст запроса, имена файлов миграций, строка подключения. Ни одно задание не выдаёт себя за работу с настоящей базой.
export const databaseBasicsTasks = {
  "go-foundations-database-basics-1": [
    {
      id: "database-basics-1-q-row",
      kind: "quiz",
      title: "Строка и столбец",
      question: "В таблице readers есть столбцы id, name и phone. Что в ней одна строка?",
      options: [
        "Все телефоны всех читателей",
        "*Один читатель: его id, имя и телефон",
        "Описание того, какие столбцы есть в таблице",
        "Один столбец, например name",
      ],
      explanation: "Строка таблицы описывает одну запись, и у неё есть значение в каждом столбце. Все телефоны всех читателей образуют столбец phone, а список столбцов задаёт структуру таблицы.",
    },
    {
      id: "database-basics-1-column",
      kind: "code",
      title: "Один столбец таблицы",
      minutes: 4,
      description: "Строки таблицы books уже лежат в слайсе структур: так они выглядят в Go после чтения из базы. Напиши функцию Titles, которая возвращает значения одного столбца, title, в том же порядке, что и строки. Для пустой таблицы верни пустой слайс. База здесь не нужна: работаешь только со слайсом.",
      starter: `package main

import "fmt"

type Book struct {
	ID    int
	Title string
	Year  int
}

func Titles(rows []Book) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	rows := []Book{
		{ID: 1, Title: "Мастер и Маргарита", Year: 1967},
		{ID: 2, Title: "Пикник на обочине", Year: 1972},
		{ID: 3, Title: "Солярис", Year: 1961},
	}
	titles := Titles(rows)
	fmt.Println(len(titles), titles)
	fmt.Println(len(Titles([]Book{})))
	fmt.Println(Titles([]Book{{ID: 7, Title: "Лето Господне", Year: 1948}}))
}`,
      referenceSolution: `package main

import "fmt"

type Book struct {
	ID    int
	Title string
	Year  int
}

func Titles(rows []Book) []string {
	titles := make([]string, 0, len(rows))
	for _, row := range rows {
		titles = append(titles, row.Title)
	}
	return titles
}`,
      hint: "Пройди по rows через range и добавляй row.Title в новый слайс через append.",
    },
    {
      id: "database-basics-1-join",
      kind: "code",
      title: "Связь по идентификатору",
      minutes: 7,
      description: "В таблице books нет имени автора, только author_id, ссылка на строку таблицы authors. Напиши функцию WithAuthors: для каждой книги верни строку «Название — Имя автора». Если автора с таким id нет, вместо имени напиши «автор не найден». Порядок такой же, как в books.",
      starter: `package main

import "fmt"

type Author struct {
	ID   int
	Name string
}

type Book struct {
	Title    string
	AuthorID int
}

func WithAuthors(books []Book, authors []Author) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	authors := []Author{
		{ID: 1, Name: "Аркадий и Борис Стругацкие"},
		{ID: 2, Name: "Станислав Лем"},
	}
	books := []Book{
		{Title: "Солярис", AuthorID: 2},
		{Title: "Понедельник начинается в субботу", AuthorID: 1},
		{Title: "Непобедимый", AuthorID: 2},
		{Title: "Книга без автора", AuthorID: 9},
	}
	for _, line := range WithAuthors(books, authors) {
		fmt.Println(line)
	}
	fmt.Println(len(WithAuthors(nil, authors)))
	fmt.Println(WithAuthors([]Book{{Title: "Солярис", AuthorID: 2}}, nil))
}`,
      referenceSolution: `package main

import "fmt"

type Author struct {
	ID   int
	Name string
}

type Book struct {
	Title    string
	AuthorID int
}

func WithAuthors(books []Book, authors []Author) []string {
	names := make(map[int]string, len(authors))
	for _, a := range authors {
		names[a.ID] = a.Name
	}
	lines := make([]string, 0, len(books))
	for _, b := range books {
		name, ok := names[b.AuthorID]
		if !ok {
			name = "автор не найден"
		}
		lines = append(lines, b.Title+" — "+name)
	}
	return lines
}`,
      hint: "Сначала разложи авторов в map[int]string по ID. Потом для каждой книги ищи имя по AuthorID и проверяй второе значение: name, ok := names[id].",
    },
    {
      id: "database-basics-1-q-reference",
      kind: "quiz",
      title: "Зачем ссылаться по id",
      question: "В библиотеке у каждой книги есть жанр. Почему жанры обычно выносят в отдельную таблицу genres, а в books хранят только genre_id?",
      options: [
        "Потому что в столбец TEXT нельзя записать название жанра",
        "*Название жанра хранится в одном месте: если его переименовать, менять придётся одну строку, а не тысячи книг",
        "Потому что запрос по числу всегда возвращает больше строк, чем запрос по тексту",
        "Так требует Go: database/sql не умеет читать строки из таблицы",
      ],
      explanation: "Это и есть идея «реляционной» базы: таблицы ссылаются друг на друга по идентификатору. Название лежит в genres один раз, книги на него ссылаются, и данные не расходятся, когда одну копию исправили, а другую забыли.",
    },
  ],

  "go-foundations-database-basics-2": [
    {
      id: "database-basics-2-q-not-null",
      kind: "quiz",
      title: "Обязательное поле",
      question: "В таблице rooms гостиницы у каждого номера обязательно есть этаж. Как объявить столбец floor, чтобы база не сохранила номер без этажа?",
      options: [
        "floor INTEGER",
        "*floor INTEGER NOT NULL",
        "floor INTEGER DEFAULT now()",
        "floor SERIAL",
      ],
      explanation: "NOT NULL запрещает сохранять строку без значения в этом столбце. Без ограничения столбец примет пустое значение (NULL), DEFAULT now() подставляет текущее время, а SERIAL сам раздаёт числа по возрастанию, это для id.",
    },
    {
      id: "database-basics-2-create-table",
      kind: "code",
      title: "Чертёж таблицы",
      minutes: 7,
      description: "Напиши функцию CreateTable, которая собирает текст CREATE TABLE из имени таблицы и списка столбцов. Первая строка: CREATE TABLE <имя таблицы> (, например CREATE TABLE rooms (. Дальше каждый столбец на своей строке с отступом в четыре пробела: имя, тип и ограничение, если оно есть. Между столбцами запятая, после последнего её нет. Последняя строка: );.",
      starter: `package main

import "fmt"

type Column struct {
	Name       string
	Type       string
	Constraint string
}

func CreateTable(table string, cols []Column) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println(CreateTable("rooms", []Column{
		{Name: "id", Type: "SERIAL", Constraint: "PRIMARY KEY"},
		{Name: "number", Type: "INTEGER", Constraint: "NOT NULL"},
		{Name: "note", Type: "TEXT"},
	}))
	fmt.Println(CreateTable("guests", []Column{
		{Name: "name", Type: "TEXT", Constraint: "NOT NULL"},
	}))
}`,
      referenceSolution: `package main

import (
	"fmt"
	"strings"
)

type Column struct {
	Name       string
	Type       string
	Constraint string
}

func CreateTable(table string, cols []Column) string {
	lines := make([]string, 0, len(cols))
	for _, c := range cols {
		line := "    " + c.Name + " " + c.Type
		if c.Constraint != "" {
			line += " " + c.Constraint
		}
		lines = append(lines, line)
	}
	return fmt.Sprintf("CREATE TABLE %s (\\n%s\\n);", table, strings.Join(lines, ",\\n"))
}`,
      hint: "Собери строки столбцов в слайс, а запятые расставит strings.Join(lines, \",\\n\"): после последней строки он запятую не ставит. Пакет strings нужно добавить в import.",
    },
    {
      id: "database-basics-2-missing",
      kind: "code",
      title: "Проверка до INSERT",
      minutes: 6,
      description: "Перед сохранением гостя хочется заранее знать, что база откажет из-за NOT NULL. Строка пришла как map: столбец → значение; если ключа нет, значит значения нет (NULL). Напиши MissingRequired: верни обязательные столбцы, которых нет в строке, в порядке списка required. Пустая строка \"\" считается значением: в PostgreSQL пустой текст и NULL различаются, такой столбец не считай пропущенным.",
      starter: `package main

import "fmt"

func MissingRequired(row map[string]string, required []string) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	required := []string{"name", "phone", "room"}
	fmt.Println(MissingRequired(map[string]string{"name": "Ирина", "phone": "+7 900 000-00-00", "room": "12"}, required))
	fmt.Println(MissingRequired(map[string]string{"name": "Олег"}, required))
	fmt.Println(MissingRequired(map[string]string{"name": "Ника", "phone": "", "room": "5"}, required))
	fmt.Println(MissingRequired(map[string]string{}, required))
	fmt.Println(len(MissingRequired(map[string]string{"note": "поздний заезд"}, nil)))
}`,
      referenceSolution: `package main

import "fmt"

func MissingRequired(row map[string]string, required []string) []string {
	missing := []string{}
	for _, col := range required {
		if _, ok := row[col]; !ok {
			missing = append(missing, col)
		}
	}
	return missing
}`,
      hint: "Иди по required, а не по map: так порядок будет предсказуемым. Наличие ключа проверяет вторая переменная: _, ok := row[col].",
    },
    {
      id: "database-basics-2-q-comma",
      kind: "quiz",
      title: "Найди ошибку",
      question: "PostgreSQL отказывается выполнять запрос CREATE TABLE guests (id SERIAL PRIMARY KEY, name TEXT NOT NULL, ); Что не так?",
      options: [
        "У таблицы не может быть больше одного ограничения",
        "*После последнего столбца стоит лишняя запятая",
        "SERIAL нельзя сочетать с PRIMARY KEY",
        "Имя таблицы должно быть в единственном числе",
      ],
      explanation: "Запятая разделяет столбцы, поэтому после последнего её быть не должно: PostgreSQL сообщит о синтаксической ошибке рядом с «)». Сочетание id SERIAL PRIMARY KEY обычное, оно есть в уроке.",
    },
  ],

  "go-foundations-database-basics-3": [
    {
      id: "database-basics-3-q-update",
      kind: "quiz",
      title: "Правильный UPDATE",
      question: "В кафе подорожало одно блюдо: у строки с id = 7 в таблице dishes нужно поставить цену 450. Какой запрос это сделает?",
      options: [
        "UPDATE dishes SET price = 450;",
        "*UPDATE dishes SET price = 450 WHERE id = 7;",
        "UPDATE dishes WHERE id = 7 SET price = 450;",
        "INSERT INTO dishes (price) VALUES (450);",
      ],
      explanation: "SET задаёт, что поменять, WHERE выбирает строки и пишется после SET. Первый вариант без WHERE поставит 450 всем блюдам меню, а INSERT добавит новую строку вместо изменения старой.",
    },
    {
      id: "database-basics-3-select",
      kind: "code",
      title: "SELECT с условием",
      minutes: 5,
      description: "Повтори в Go то, что делает запрос SELECT title FROM films WHERE minutes > $1: функция LongerThan возвращает названия фильмов, которые длиннее limit минут, в исходном порядке. Фильм ровно в limit минут не подходит: условие строгое. База не нужна, строки таблицы уже в слайсе.",
      starter: `package main

import "fmt"

type Film struct {
	Title   string
	Minutes int
}

func LongerThan(rows []Film, limit int) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	films := []Film{
		{Title: "Сталкер", Minutes: 163},
		{Title: "Ёжик в тумане", Minutes: 10},
		{Title: "Брат", Minutes: 100},
		{Title: "Москва слезам не верит", Minutes: 150},
	}
	fmt.Println(LongerThan(films, 120))
	fmt.Println(LongerThan(films, 100))
	fmt.Println(len(LongerThan(films, 200)))
	fmt.Println(len(LongerThan(nil, 0)))
}`,
      referenceSolution: `package main

import "fmt"

type Film struct {
	Title   string
	Minutes int
}

func LongerThan(rows []Film, limit int) []string {
	titles := []string{}
	for _, f := range rows {
		if f.Minutes > limit {
			titles = append(titles, f.Title)
		}
	}
	return titles
}`,
      hint: "Условию WHERE minutes > $1 в Go соответствует if f.Minutes > limit внутри цикла. В результат идёт только столбец title.",
    },
    {
      id: "database-basics-3-delete",
      kind: "code",
      title: "Сколько строк удалит DELETE",
      minutes: 7,
      description: "Функция Delete повторяет DELETE FROM orders WHERE status = $1 на слайсе заказов кафе. Верни оставшиеся заказы в исходном порядке и число удалённых строк. Пустой status означает запрос без WHERE: тогда удаляются все строки, как в уроке.",
      starter: `package main

import "fmt"

type Order struct {
	ID     int
	Status string
}

func Delete(rows []Order, status string) ([]Order, int) {
	// твой код
	return rows, 0
}`,
      harness: `func main() {
	orders := []Order{
		{ID: 1, Status: "готов"},
		{ID: 2, Status: "отменён"},
		{ID: 3, Status: "готовится"},
		{ID: 4, Status: "отменён"},
	}
	for _, status := range []string{"отменён", "доставлен", ""} {
		kept, deleted := Delete(orders, status)
		ids := []int{}
		for _, o := range kept {
			ids = append(ids, o.ID)
		}
		fmt.Printf("%q: удалено %d, осталось %v\\n", status, deleted, ids)
	}
}`,
      referenceSolution: `package main

import "fmt"

type Order struct {
	ID     int
	Status string
}

func Delete(rows []Order, status string) ([]Order, int) {
	kept := []Order{}
	deleted := 0
	for _, o := range rows {
		if status == "" || o.Status == status {
			deleted++
			continue
		}
		kept = append(kept, o)
	}
	return kept, deleted
}`,
      hint: "Собирай новый слайс kept, а не удаляй элементы из rows на ходу: harness вызывает функцию трижды на одних и тех же данных. Строка удаляется, если status пустой или совпадает с o.Status.",
    },
    {
      id: "database-basics-3-q-before-delete",
      kind: "quiz",
      title: "Перед DELETE",
      question: "Нужно удалить из таблицы bookings все отменённые брони. Что разумно сделать перед DELETE FROM bookings WHERE status = 'cancelled';?",
      options: [
        "Сначала выполнить DELETE FROM bookings; и заново добавить нужные строки",
        "*Выполнить SELECT id, status FROM bookings WHERE status = 'cancelled'; и посмотреть, какие строки попадут под условие",
        "Убрать WHERE, чтобы запрос выполнился быстрее",
        "Ничего: если WHERE написан, ошибиться невозможно",
      ],
      explanation: "SELECT с тем же WHERE показывает ровно те строки, которые удалит DELETE, и ничего не меняет. Опечатка в условии, например 'canceled' вместо 'cancelled', всплывёт здесь, а не после удаления.",
    },
  ],

  "go-foundations-database-basics-4": [
    {
      id: "database-basics-4-down",
      kind: "code",
      title: "Пара для отката",
      minutes: 4,
      description: "У каждой миграции два файла: .up.sql и .down.sql с тем же номером и именем. Напиши DownFile: по имени up-файла верни имя down-файла. Если имя не заканчивается на .up.sql, верни пустую строку и ошибку «не up-миграция: <имя>».",
      starter: `package main

import "fmt"

func DownFile(up string) (string, error) {
	// твой код
	return "", nil
}`,
      harness: `func main() {
	for _, name := range []string{
		"0001_create_rooms.up.sql",
		"0003_add_floor_to_rooms.up.sql",
		"0002_create_guests.down.sql",
		"notes.txt",
		"",
	} {
		down, err := DownFile(name)
		fmt.Printf("%q %q %v\\n", name, down, err)
	}
}`,
      referenceSolution: `package main

import (
	"fmt"
	"strings"
)

func DownFile(up string) (string, error) {
	if !strings.HasSuffix(up, ".up.sql") {
		return "", fmt.Errorf("не up-миграция: %s", up)
	}
	return strings.TrimSuffix(up, ".up.sql") + ".down.sql", nil
}`,
      hint: "Пригодятся strings.HasSuffix и strings.TrimSuffix, для них добавь пакет strings в import. Ошибку с именем файла собери через fmt.Errorf.",
    },
    {
      id: "database-basics-4-pending",
      kind: "code",
      title: "Что ещё не применено",
      minutes: 8,
      description: "Инструмент миграций помнит, какие up-файлы уже применены к базе. Напиши Pending: из списка файлов папки migrations верни только up-миграции, которых нет в applied, отсортированные по имени. Номер в начале имени дополнен нулями, поэтому порядок имён совпадает с порядком номеров. Файлы .down.sql и посторонние файлы пропускай.",
      starter: `package main

import "fmt"

func Pending(files []string, applied map[string]bool) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	files := []string{
		"0003_create_guests.up.sql",
		"0001_create_rooms.up.sql",
		"0002_add_floor_to_rooms.down.sql",
		"README.md",
		"0002_add_floor_to_rooms.up.sql",
		"0003_create_guests.down.sql",
		"0001_create_rooms.down.sql",
		"0004_add_phone_to_guests.up.sql",
	}
	fmt.Println(Pending(files, map[string]bool{}))
	fmt.Println(Pending(files, map[string]bool{"0001_create_rooms.up.sql": true, "0002_add_floor_to_rooms.up.sql": true}))
	fmt.Println(len(Pending(files, map[string]bool{
		"0001_create_rooms.up.sql":        true,
		"0002_add_floor_to_rooms.up.sql":  true,
		"0003_create_guests.up.sql":       true,
		"0004_add_phone_to_guests.up.sql": true,
	})))
}`,
      referenceSolution: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func Pending(files []string, applied map[string]bool) []string {
	pending := []string{}
	for _, f := range files {
		if strings.HasSuffix(f, ".up.sql") && !applied[f] {
			pending = append(pending, f)
		}
	}
	sort.Strings(pending)
	return pending
}`,
      hint: "Отбери файлы с суффиксом .up.sql, которых нет в applied (для отсутствующего ключа map вернёт false), а затем отсортируй результат через sort.Strings. Нужны пакеты strings и sort.",
    },
    {
      id: "database-basics-4-q-order",
      kind: "quiz",
      title: "Порядок миграций",
      question: "Миграция 0001 создаёт таблицу rooms, миграция 0002 добавляет в rooms столбец floor. Что случится, если на пустой базе применить 0002 раньше 0001?",
      options: [
        "Ничего страшного: база сама дождётся 0001",
        "*ALTER TABLE завершится ошибкой, потому что таблицы rooms ещё нет",
        "База создаст таблицу rooms с одним столбцом floor",
        "Миграция 0002 откатится через свой .down.sql и применится снова",
      ],
      explanation: "Каждая миграция рассчитывает на состояние базы после предыдущих. Поэтому у файлов номера, и инструмент применяет их строго по возрастанию на любой машине.",
    },
    {
      id: "database-basics-4-q-applied",
      kind: "quiz",
      title: "Миграция уже у всех",
      question: "Миграция 0002 уже применена на сервере и у коллег. Теперь в rooms нужно добавить ещё один столбец. Как поступить?",
      options: [
        "Дописать ALTER TABLE в файл 0002 и закоммитить",
        "*Создать новую миграцию 0003 с парой .up.sql и .down.sql",
        "Выполнить ALTER TABLE вручную на сервере, а файлы не трогать",
        "Удалить файл 0002 и создать его заново с обоими изменениями",
      ],
      explanation: "Уже применённый файл никто повторно запускать не будет, поэтому правка в 0002 до других баз не дойдёт. Новая миграция с новым номером применится у всех в одном порядке, так же как новый коммит поверх старых.",
    },
  ],

  "go-foundations-database-basics-5": [
    {
      id: "database-basics-5-dsn",
      kind: "code",
      title: "Строка подключения",
      minutes: 5,
      description: "sql.Open получает строку подключения вида postgres://user:password@host:port/dbname?sslmode=disable. Напиши функцию DSN, которая собирает её из полей структуры. Если Host пустой, подставь localhost; если Port равен нулю, подставь 5432, стандартный порт PostgreSQL. Здесь ничего не подключается: функция только собирает строку.",
      starter: `package main

import "fmt"

type DBConfig struct {
	User     string
	Password string
	Host     string
	Port     int
	Name     string
}

func DSN(c DBConfig) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println(DSN(DBConfig{User: "library", Password: "secret", Host: "db.local", Port: 6543, Name: "books"}))
	fmt.Println(DSN(DBConfig{User: "cafe", Password: "pass", Name: "menu"}))
	fmt.Println(DSN(DBConfig{User: "hotel", Password: "123", Host: "10.0.0.5", Name: "rooms"}))
}`,
      referenceSolution: `package main

import "fmt"

type DBConfig struct {
	User     string
	Password string
	Host     string
	Port     int
	Name     string
}

func DSN(c DBConfig) string {
	host := c.Host
	if host == "" {
		host = "localhost"
	}
	port := c.Port
	if port == 0 {
		port = 5432
	}
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable", c.User, c.Password, host, port, c.Name)
}`,
      hint: "Сначала вычисли host и port с подстановкой значений по умолчанию, потом собери строку одним fmt.Sprintf: %s для текста и %d для порта.",
    },
    {
      id: "database-basics-5-placeholders",
      kind: "code",
      title: "Плейсхолдеры вместо склейки",
      minutes: 6,
      description: "Заготовка вклеивает значения прямо в текст запроса, так делать нельзя. Перепиши BooksByAuthor: верни текст SELECT title FROM books WHERE author = $1 AND year > $2 и отдельно аргументы в порядке плейсхолдеров: сначала author, потом minYear. Проверка смотрит, что в тексте есть $1 и $2, что имени автора в нём нет и что аргументы переданы отдельно. Запрос никуда не отправляется.",
      starter: `package main

import "fmt"

func BooksByAuthor(author string, minYear int) (string, []any) {
	query := fmt.Sprintf("SELECT title FROM books WHERE author = '%s' AND year > %d", author, minYear)
	return query, nil
}`,
      harness: `func main() {
	has := func(s, sub string) bool {
		for i := 0; i+len(sub) <= len(s); i++ {
			if s[i:i+len(sub)] == sub {
				return true
			}
		}
		return false
	}
	for _, author := range []string{"Станислав Лем", "Л'Энгл'; DROP TABLE books; --"} {
		query, args := BooksByAuthor(author, 1960)
		fmt.Println("$1:", has(query, "$1"), "$2:", has(query, "$2"), "имя в тексте:", has(query, author))
		fmt.Println("аргументы:", len(args), args)
	}
}`,
      referenceSolution: `package main

import "fmt"

func BooksByAuthor(author string, minYear int) (string, []any) {
	query := "SELECT title FROM books WHERE author = $1 AND year > $2"
	return query, []any{author, minYear}
}`,
      hint: "Текст запроса можно записать обычной строковой константой: в ней нет значений, только $1 и $2. Аргументы верни слайсом []any{...} в том же порядке.",
    },
    {
      id: "database-basics-5-scan-total",
      kind: "code",
      title: "Итог по строкам результата",
      minutes: 7,
      description: "Запрос SELECT reader, days FROM loans вернул строки, и после rows.Scan они лежат в слайсе структур. Напиши TotalDays: для каждого читателя посчитай, сколько дней всего у него были книги. Верни map: читатель → сумма дней. Пустой результат даёт пустую map.",
      starter: `package main

import "fmt"

type LoanRow struct {
	Reader string
	Days   int
}

func TotalDays(rows []LoanRow) map[string]int {
	// твой код
	return nil
}`,
      harness: `func main() {
	rows := []LoanRow{
		{Reader: "Анна", Days: 14},
		{Reader: "Борис", Days: 7},
		{Reader: "Анна", Days: 21},
		{Reader: "Вера", Days: 3},
		{Reader: "Борис", Days: 10},
	}
	totals := TotalDays(rows)
	fmt.Println("читателей:", len(totals))
	for _, name := range []string{"Анна", "Борис", "Вера", "Глеб"} {
		fmt.Println(name, totals[name])
	}
	empty := TotalDays(nil)
	fmt.Println("пусто:", empty != nil, len(empty))
}`,
      referenceSolution: `package main

import "fmt"

type LoanRow struct {
	Reader string
	Days   int
}

func TotalDays(rows []LoanRow) map[string]int {
	totals := make(map[string]int)
	for _, row := range rows {
		totals[row.Reader] += row.Days
	}
	return totals
}`,
      hint: "Создай map через make, чтобы в неё можно было писать, и в цикле прибавляй row.Days к totals[row.Reader]: для нового ключа map вернёт ноль.",
    },
    {
      id: "database-basics-5-q-ping",
      kind: "quiz",
      title: "Зачем Ping",
      question: "sql.Open(\"postgres\", dsn) вернул err == nil. Что это гарантирует?",
      options: [
        "Что база запущена и пароль верный",
        "*Только то, что объект для работы с базой подготовлен; отвечает ли база, покажет db.Ping()",
        "Что таблицы из миграций уже созданы",
        "Что первый запрос db.Query точно выполнится без ошибки",
      ],
      explanation: "sql.Open не устанавливает соединение сразу. Если база выключена или пароль неверный, это выяснится при первом обращении. db.Ping() делает такое обращение на старте, и приложение падает с понятной ошибкой сразу, а не на первом запросе пользователя.",
    },
  ],
};
