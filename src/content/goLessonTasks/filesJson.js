// Задания уроков темы «Файлы, JSON и конфигурация» Модуля 3. Каждое код-задание проверено скриптом verify-tasks.mjs: эталон работает (локально и в Go Playground), заготовка компилируется и печатает другой вывод.
// Файлы создаются только во временной папке (os.MkdirTemp в harness), переменные окружения задаются в harness через os.Setenv.
export const filesJsonTasks = {
  "go-foundations-files-json-1": [
    {
      id: "files-json-1-save-note",
      kind: "code",
      title: "Заметка в файл",
      minutes: 4,
      description: "Допиши SaveNote: она записывает текст заметки в файл по пути path и возвращает ошибку записи, если она случилась.",
      starter: `package main

import (
	"fmt"
	"os"
)

func SaveNote(path, text string) error {
	// твой код
	return nil
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "notes")
	defer os.RemoveAll(dir)

	path := dir + "/note.txt"
	fmt.Println(SaveNote(path, "Купить хлеб и молоко"))
	data, err := os.ReadFile(path)
	fmt.Println(string(data), err != nil)

	fmt.Println(SaveNote(path, "Позвонить в библиотеку"))
	data, _ = os.ReadFile(path)
	fmt.Println(string(data))

	fmt.Println(SaveNote(dir+"/нет/такой/папки.txt", "текст") != nil)
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
)

func SaveNote(path, text string) error {
	return os.WriteFile(path, []byte(text), 0644)
}`,
      hint: "os.WriteFile принимает путь, срез байт и права доступа. Строку в срез байт превращает []byte(text). Ошибку из WriteFile можно вернуть как есть.",
    },
    {
      id: "files-json-1-greeting",
      kind: "code",
      title: "Приветствие с запасным вариантом",
      minutes: 5,
      description: "Напиши ReadGreeting: она возвращает содержимое файла приветствия. Если файл прочитать не удалось (например, его ещё нет), верни строку «Добро пожаловать!».",
      starter: `package main

import (
	"fmt"
	"os"
)

func ReadGreeting(path string) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "greeting")
	defer os.RemoveAll(dir)

	path := dir + "/greeting.txt"
	fmt.Println(ReadGreeting(path))

	os.WriteFile(path, []byte("Привет из файла!"), 0644)
	fmt.Println(ReadGreeting(path))

	os.WriteFile(path, []byte(""), 0644)
	fmt.Printf("%q\\n", ReadGreeting(path))
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
)

func ReadGreeting(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return "Добро пожаловать!"
	}
	return string(data)
}`,
      hint: "os.ReadFile возвращает два значения: байты и ошибку. Сначала проверь ошибку, потом приведи байты к строке через string(data). Пустой файл прочитается без ошибки, и запасной текст для него не нужен.",
    },
    {
      id: "files-json-1-q-overwrite",
      kind: "quiz",
      title: "Что останется в файле",
      question: "В файле weather.txt записано «солнечно». Программа вызывает os.WriteFile(\"weather.txt\", []byte(\"дождь\"), 0644). Что будет в файле после этого?",
      options: ["«солнечнодождь»: WriteFile дописывает в конец", "*«дождь»: WriteFile заменяет всё содержимое", "Ничего не изменится: WriteFile вернёт ошибку, потому что файл уже существует"],
      explanation: "os.WriteFile создаёт файл, если его нет, а если он есть, обрезает его до нуля и пишет заново. Чтобы дописать строку, нужно сначала прочитать старое содержимое и записать его вместе с новым.",
    },
    {
      id: "files-json-1-append-log",
      kind: "code",
      title: "Журнал температуры",
      minutes: 8,
      description: "Напиши AppendLine: она добавляет строку line и перевод строки в конец файла, не стирая того, что там уже было. Если файла ещё нет, начни с пустого содержимого. Ошибку записи верни.",
      starter: `package main

import (
	"fmt"
	"os"
)

func AppendLine(path, line string) error {
	// твой код
	return nil
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "log")
	defer os.RemoveAll(dir)

	path := dir + "/temperature.log"
	fmt.Println(AppendLine(path, "08:00 +12"))
	fmt.Println(AppendLine(path, "12:00 +18"))
	fmt.Println(AppendLine(path, "20:00 +9"))
	data, _ := os.ReadFile(path)
	fmt.Print(string(data))

	fmt.Println(AppendLine(dir+"/нет/папки.log", "00:00 0") != nil)
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
)

func AppendLine(path, line string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		data = []byte{}
	}
	data = append(data, []byte(line+"\\n")...)
	return os.WriteFile(path, data, 0644)
}`,
      hint: "Сначала прочитай файл через os.ReadFile; если вернулась ошибка, считай, что содержимое пустое. Потом допиши к байтам новую строку (append со срезом и ...) и сохрани всё через os.WriteFile. Частая ошибка: сразу вызвать WriteFile с новой строкой, и старые записи пропадут.",
    },
  ],

  "go-foundations-files-json-2": [
    { challenge: "json-backup" },
    {
      id: "files-json-2-book",
      kind: "code",
      title: "Книга в JSON",
      minutes: 5,
      description: "Допиши BookJSON: она превращает книгу в JSON-строку через json.Marshal. Если Marshal вернул ошибку, верни пустую строку и эту ошибку.",
      starter: `package main

import "fmt"

type Book struct {
	Title  string
	Author string
	Year   int
}

func BookJSON(b Book) (string, error) {
	// твой код
	return "", nil
}`,
      harness: `func main() {
	fmt.Println(BookJSON(Book{Title: "Мастер и Маргарита", Author: "Булгаков", Year: 1967}))
	fmt.Println(BookJSON(Book{Title: "Пикник на обочине", Author: "Стругацкие", Year: 1972}))
	fmt.Println(BookJSON(Book{}))
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

type Book struct {
	Title  string
	Author string
	Year   int
}

func BookJSON(b Book) (string, error) {
	data, err := json.Marshal(b)
	if err != nil {
		return "", err
	}
	return string(data), nil
}`,
      hint: "Добавь импорт \"encoding/json\". json.Marshal возвращает срез байт и ошибку; в строку байты превращает string(data). Обрати внимание, как в JSON выглядят поля пустой книги.",
    },
    {
      id: "files-json-2-max-temp",
      kind: "code",
      title: "Самый тёплый город",
      minutes: 8,
      description: "Напиши MaxTemp: она разбирает JSON-список городов с температурой и возвращает самую высокую температуру. Для пустого списка и для некорректного JSON верни 0 и ошибку.",
      starter: `package main

import "fmt"

type City struct {
	Name string
	Temp int
}

func MaxTemp(data []byte) (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	t, err := MaxTemp([]byte(\`[{"Name":"Сочи","Temp":24},{"Name":"Казань","Temp":17},{"Name":"Мурманск","Temp":6}]\`))
	fmt.Println(t, err != nil)

	t, err = MaxTemp([]byte(\`[{"Name":"Якутск","Temp":-38},{"Name":"Норильск","Temp":-25}]\`))
	fmt.Println(t, err != nil)

	t, err = MaxTemp([]byte(\`[]\`))
	fmt.Println(t, err != nil)

	t, err = MaxTemp([]byte(\`[{"Name":"Сочи","Temp":24\`))
	fmt.Println(t, err != nil)
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

type City struct {
	Name string
	Temp int
}

func MaxTemp(data []byte) (int, error) {
	var cities []City
	if err := json.Unmarshal(data, &cities); err != nil {
		return 0, fmt.Errorf("не удалось разобрать JSON: %w", err)
	}
	if len(cities) == 0 {
		return 0, fmt.Errorf("в списке нет городов")
	}
	best := cities[0].Temp
	for _, c := range cities[1:] {
		if c.Temp > best {
			best = c.Temp
		}
	}
	return best, nil
}`,
      hint: "Разбери данные через json.Unmarshal в переменную []City и передай её адрес (&). Максимум начинай с температуры первого города, а не с нуля: зимой все значения бывают ниже нуля.",
    },
    {
      id: "files-json-2-orders-file",
      kind: "code",
      title: "Заказы кафе в файле",
      minutes: 10,
      description: "Напиши две функции. SaveOrders сохраняет список заказов в файл как JSON, сделанный json.Marshal (без отступов). LoadOrders читает файл и возвращает список заказов; если файл не читается или JSON некорректный, она возвращает nil и ошибку.",
      starter: `package main

import (
	"fmt"
	"os"
)

type Order struct {
	Dish string
	Qty  int
}

func SaveOrders(path string, orders []Order) error {
	// твой код
	return nil
}

func LoadOrders(path string) ([]Order, error) {
	// твой код
	return nil, nil
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "cafe")
	defer os.RemoveAll(dir)

	path := dir + "/orders.json"
	orders := []Order{{Dish: "Капучино", Qty: 2}, {Dish: "Сырники", Qty: 1}}
	fmt.Println(SaveOrders(path, orders))
	data, _ := os.ReadFile(path)
	fmt.Println(string(data))

	loaded, err := LoadOrders(path)
	fmt.Println(loaded, err)

	loaded, err = LoadOrders(dir + "/missing.json")
	fmt.Println(loaded == nil, err != nil)

	os.WriteFile(path, []byte("Капучино x2"), 0644)
	loaded, err = LoadOrders(path)
	fmt.Println(loaded == nil, err != nil)
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Order struct {
	Dish string
	Qty  int
}

func SaveOrders(path string, orders []Order) error {
	data, err := json.Marshal(orders)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func LoadOrders(path string) ([]Order, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var orders []Order
	if err := json.Unmarshal(data, &orders); err != nil {
		return nil, err
	}
	return orders, nil
}`,
      hint: "Добавь импорт \"encoding/json\". Сохранение: json.Marshal, затем os.WriteFile. Загрузка: os.ReadFile, затем json.Unmarshal в переменную []Order по адресу. После каждого шага проверяй ошибку.",
    },
  ],

  "go-foundations-files-json-3": [
    {
      id: "files-json-3-reader-tags",
      kind: "code",
      title: "Читательский билет",
      minutes: 4,
      description: "Функция ReaderJSON уже написана. Добавь полям структуры теги, чтобы JSON выглядел так: {\"name\":\"…\",\"card_number\":\"…\",\"books\":…}.",
      starter: `package main

import (
	"encoding/json"
	"fmt"
)

type Reader struct {
	Name       string
	CardNumber string
	Books      int
}

func ReaderJSON(r Reader) string {
	data, err := json.Marshal(r)
	if err != nil {
		return "ошибка: " + err.Error()
	}
	return string(data)
}`,
      harness: `func main() {
	fmt.Println(ReaderJSON(Reader{Name: "Анна Петрова", CardNumber: "A-1024", Books: 3}))
	fmt.Println(ReaderJSON(Reader{Name: "Илья", CardNumber: "B-7", Books: 0}))
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

type Reader struct {
	Name       string \`json:"name"\`
	CardNumber string \`json:"card_number"\`
	Books      int    \`json:"books"\`
}

func ReaderJSON(r Reader) string {
	data, err := json.Marshal(r)
	if err != nil {
		return "ошибка: " + err.Error()
	}
	return string(data)
}`,
      hint: "Тег пишется после типа поля в обратных кавычках: `json:\"имя\"`. В JSON попадёт ровно то имя, которое написано в теге. Количество книг 0 тоже должно попасть в JSON, поэтому omitempty здесь не нужен.",
    },
    {
      id: "files-json-3-weather-omitempty",
      kind: "code",
      title: "Сводка погоды без пустых полей",
      minutes: 6,
      description: "Добавь тегам структуры Report имена city, temp, wind и note. Поля city и temp должны быть в JSON всегда (температура 0 тоже настоящее значение), а wind и note только тогда, когда они заданы.",
      starter: `package main

import (
	"encoding/json"
	"fmt"
)

type Report struct {
	City string
	Temp int
	Wind int
	Note string
}

func ReportJSON(r Report) string {
	data, err := json.Marshal(r)
	if err != nil {
		return "ошибка: " + err.Error()
	}
	return string(data)
}`,
      harness: `func main() {
	fmt.Println(ReportJSON(Report{City: "Мурманск", Temp: -4, Wind: 12, Note: "метель"}))
	fmt.Println(ReportJSON(Report{City: "Псков", Temp: 0}))
	fmt.Println(ReportJSON(Report{City: "Сочи", Temp: 21, Note: "штиль"}))
	fmt.Println(ReportJSON(Report{}))
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

type Report struct {
	City string \`json:"city"\`
	Temp int    \`json:"temp"\`
	Wind int    \`json:"wind,omitempty"\`
	Note string \`json:"note,omitempty"\`
}

func ReportJSON(r Report) string {
	data, err := json.Marshal(r)
	if err != nil {
		return "ошибка: " + err.Error()
	}
	return string(data)
}`,
      hint: "omitempty дописывается в тег через запятую после имени: `json:\"имя,omitempty\"`. Подумай, у каких полей нулевое значение означает «не задано», а у каких это обычные данные.",
    },
    {
      id: "files-json-3-parse-book",
      kind: "code",
      title: "Книга из каталога",
      minutes: 8,
      description: "Каталог библиотеки отдаёт JSON с ключами book_title, page_count и is_available. Добавь структуре Book теги и напиши ParseBook, которая разбирает такой JSON. Для некорректного JSON верни пустую книгу и ошибку.",
      starter: `package main

import "fmt"

type Book struct {
	Title     string
	PageCount int
	Available bool
}

func ParseBook(data []byte) (Book, error) {
	// твой код
	return Book{}, nil
}`,
      harness: `func main() {
	b, err := ParseBook([]byte(\`{"book_title":"Дюна","page_count":704,"is_available":true}\`))
	fmt.Printf("%+v %v\\n", b, err != nil)

	b, err = ParseBook([]byte(\`{"book_title":"Солярис","page_count":256}\`))
	fmt.Printf("%+v %v\\n", b, err != nil)

	b, err = ParseBook([]byte(\`{"book_title":"Солярис",}\`))
	fmt.Printf("%+v %v\\n", b, err != nil)
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

type Book struct {
	Title     string \`json:"book_title"\`
	PageCount int    \`json:"page_count"\`
	Available bool   \`json:"is_available"\`
}

func ParseBook(data []byte) (Book, error) {
	var b Book
	if err := json.Unmarshal(data, &b); err != nil {
		return Book{}, err
	}
	return b, nil
}`,
      hint: "Теги работают в обе стороны: json.Unmarshal по ним находит, какой ключ JSON положить в какое поле. Без тегов ключ book_title не совпадёт с полем Title, и поле останется пустым. Не забудь импорт \"encoding/json\".",
    },
    {
      id: "files-json-3-q-omitempty-false",
      kind: "quiz",
      title: "omitempty и false",
      question: "В структуре есть поле InStock bool `json:\"in_stock,omitempty\"`. Товара нет на складе, InStock равно false. Что окажется в JSON после json.Marshal?",
      options: ["\"in_stock\":false", "*Поля in_stock не будет вовсе", "\"in_stock\":null"],
      explanation: "Для bool нулевое значение false, а omitempty выбрасывает нулевые значения. Тот, кто читает JSON, не отличит «товара нет» от «поле забыли». Для полей, где false или 0 что-то значат, omitempty ставить не стоит.",
    },
  ],

  "go-foundations-files-json-4": [
    {
      id: "files-json-4-scores",
      kind: "code",
      title: "Журнал оценок",
      minutes: 7,
      description: "Напиши LoadScores: она читает JSON-объект «имя → оценка» из файла. Если файла нет, верни пустую (не nil) map и nil. Если файл есть, но JSON в нём некорректный, верни nil и ошибку.",
      starter: `package main

import (
	"fmt"
	"os"
)

func LoadScores(path string) (map[string]int, error) {
	// твой код
	return nil, nil
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "scores")
	defer os.RemoveAll(dir)

	good := dir + "/good.json"
	os.WriteFile(good, []byte(\`{"Аня":5,"Борис":4,"Вера":3}\`), 0644)
	broken := dir + "/broken.json"
	os.WriteFile(broken, []byte(\`{"Аня":5,"Бор\`), 0644)

	m, err := LoadScores(good)
	fmt.Println(m, err)

	m, err = LoadScores(dir + "/missing.json")
	fmt.Println(len(m), m == nil, err)

	m, err = LoadScores(broken)
	fmt.Println(m == nil, err != nil)
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func LoadScores(path string) (map[string]int, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return map[string]int{}, nil
		}
		return nil, fmt.Errorf("чтение файла: %w", err)
	}
	var scores map[string]int
	if err := json.Unmarshal(data, &scores); err != nil {
		return nil, fmt.Errorf("файл повреждён: %w", err)
	}
	return scores, nil
}`,
      hint: "Отличить отсутствующий файл от других ошибок помогает os.IsNotExist(err). Пустую map создаёт map[string]int{}. Для разбора добавь импорт \"encoding/json\".",
    },
    {
      id: "files-json-4-status",
      kind: "code",
      title: "Что случилось со списком книг",
      minutes: 8,
      description: "Напиши FileStatus для файла со списком книг (JSON-массив строк). Она возвращает «нет файла», если его не существует; «ошибка чтения» при любой другой ошибке ReadFile; «пустой файл», если в нём только пробелы и переводы строк; «файл повреждён», если JSON не разбирается; иначе «книг: N».",
      starter: `package main

import (
	"fmt"
	"os"
)

func FileStatus(path string) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "library")
	defer os.RemoveAll(dir)

	write := func(name, text string) string {
		p := dir + "/" + name
		os.WriteFile(p, []byte(text), 0644)
		return p
	}

	fmt.Println(FileStatus(dir + "/missing.json"))
	fmt.Println(FileStatus(dir))
	fmt.Println(FileStatus(write("empty.json", "")))
	fmt.Println(FileStatus(write("spaces.json", "  \\n\\t\\n")))
	fmt.Println(FileStatus(write("broken.json", \`["Дюна", "Солярис"\`)))
	fmt.Println(FileStatus(write("none.json", \`[]\`)))
	fmt.Println(FileStatus(write("books.json", \`["Дюна", "Солярис", "Обломов"]\`)))
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func FileStatus(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return "нет файла"
		}
		return "ошибка чтения"
	}
	if strings.TrimSpace(string(data)) == "" {
		return "пустой файл"
	}
	var books []string
	if err := json.Unmarshal(data, &books); err != nil {
		return "файл повреждён"
	}
	return fmt.Sprintf("книг: %d", len(books))
}`,
      hint: "Проверяй по порядку: ошибка чтения (и среди них os.IsNotExist), потом пустота (strings.TrimSpace из пакета \"strings\"), потом json.Unmarshal. Если вместо файла передали папку, ReadFile тоже вернёт ошибку, но это не «нет файла».",
    },
    {
      id: "files-json-4-wrap",
      kind: "code",
      title: "Меню с понятной ошибкой",
      minutes: 8,
      description: "Меню кафе обязано существовать, поэтому отсутствие файла здесь считается ошибкой. Напиши LoadMenu так, чтобы ошибка чтения начиналась с «меню: », ошибка разбора начиналась с «меню повреждено: », а исходная причина сохранялась внутри: errors.Is(err, os.ErrNotExist) для отсутствующего файла должна давать true.",
      starter: `package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

type Dish struct {
	Name  string
	Price int
}

func LoadMenu(path string) ([]Dish, error) {
	// твой код
	return nil, nil
}`,
      harness: `func main() {
	dir, _ := os.MkdirTemp("", "menu")
	defer os.RemoveAll(dir)

	good := dir + "/menu.json"
	os.WriteFile(good, []byte(\`[{"Name":"Борщ","Price":320},{"Name":"Морс","Price":120}]\`), 0644)
	broken := dir + "/broken.json"
	os.WriteFile(broken, []byte(\`[{"Name":"Борщ","Price":\`), 0644)

	menu, err := LoadMenu(good)
	fmt.Println(menu, err)

	_, err = LoadMenu(dir + "/missing.json")
	fmt.Println(err != nil, errors.Is(err, os.ErrNotExist), strings.HasPrefix(fmt.Sprint(err), "меню: "))

	_, err = LoadMenu(broken)
	fmt.Println(err != nil, errors.Is(err, os.ErrNotExist), strings.HasPrefix(fmt.Sprint(err), "меню повреждено: "))
}`,
      referenceSolution: `package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
)

type Dish struct {
	Name  string
	Price int
}

func LoadMenu(path string) ([]Dish, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("меню: %w", err)
	}
	var menu []Dish
	if err := json.Unmarshal(data, &menu); err != nil {
		return nil, fmt.Errorf("меню повреждено: %w", err)
	}
	return menu, nil
}`,
      hint: "fmt.Errorf(\"меню: %w\", err) добавляет пояснение и сохраняет исходную ошибку внутри. С глаголом %v текст будет тот же, но errors.Is уже не найдёт os.ErrNotExist. Для разбора добавь импорт \"encoding/json\".",
    },
    {
      id: "files-json-4-q-half-written",
      kind: "quiz",
      title: "Файл записан наполовину",
      question: "Программа хранит список покупок в shopping.json. Свет моргнул во время записи, и в файле осталась половина JSON. Как лучше поступить при следующем запуске?",
      options: ["Начать с пустого списка и сразу сохранить его поверх файла, чтобы программа снова работала", "*Сообщить об ошибке с понятным пояснением и не перезаписывать файл", "Вызвать panic: данные испорчены, дальше работать нельзя"],
      explanation: "Повреждённый файл ещё можно восстановить вручную, а перезаписанный уже нет. Понятная ошибка без перезаписи сохраняет данные и подсказывает, что делать. panic роняет программу и показывает человеку стек вызовов вместо объяснения.",
    },
  ],

  "go-foundations-files-json-5": [
    {
      id: "files-json-5-default",
      kind: "code",
      title: "Значение по умолчанию",
      minutes: 4,
      description: "Напиши GetEnvOrDefault: она возвращает значение переменной окружения key, а если переменная не задана или пустая, возвращает def.",
      starter: `package main

import (
	"fmt"
	"os"
)

func GetEnvOrDefault(key, def string) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	os.Setenv("LIBRARY_CITY", "Казань")
	os.Setenv("LIBRARY_HALL", "")
	os.Unsetenv("LIBRARY_FLOOR")

	fmt.Println(GetEnvOrDefault("LIBRARY_CITY", "Москва"))
	fmt.Println(GetEnvOrDefault("LIBRARY_HALL", "читальный зал"))
	fmt.Println(GetEnvOrDefault("LIBRARY_FLOOR", "1"))
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
)

func GetEnvOrDefault(key, def string) string {
	value := os.Getenv(key)
	if value == "" {
		return def
	}
	return value
}`,
      hint: "os.Getenv для незаданной переменной возвращает пустую строку, поэтому одна проверка на \"\" покрывает оба случая.",
    },
    {
      id: "files-json-5-config",
      kind: "code",
      title: "Настройки сервиса погоды",
      minutes: 7,
      description: "Напиши LoadConfig: City берётся из WEATHER_CITY (по умолчанию «Москва»), Units из WEATHER_UNITS (по умолчанию «metric»), Verbose равно true, только если WEATHER_VERBOSE равно «true».",
      starter: `package main

import (
	"fmt"
	"os"
)

type Config struct {
	City    string
	Units   string
	Verbose bool
}

func LoadConfig() Config {
	// твой код
	return Config{}
}`,
      harness: `func main() {
	os.Unsetenv("WEATHER_CITY")
	os.Unsetenv("WEATHER_UNITS")
	os.Unsetenv("WEATHER_VERBOSE")
	fmt.Printf("%+v\\n", LoadConfig())

	os.Setenv("WEATHER_CITY", "Владивосток")
	os.Setenv("WEATHER_VERBOSE", "true")
	fmt.Printf("%+v\\n", LoadConfig())

	os.Setenv("WEATHER_UNITS", "imperial")
	os.Setenv("WEATHER_VERBOSE", "yes")
	fmt.Printf("%+v\\n", LoadConfig())
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
)

type Config struct {
	City    string
	Units   string
	Verbose bool
}

func getEnvOrDefault(key, def string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return def
}

func LoadConfig() Config {
	return Config{
		City:    getEnvOrDefault("WEATHER_CITY", "Москва"),
		Units:   getEnvOrDefault("WEATHER_UNITS", "metric"),
		Verbose: os.Getenv("WEATHER_VERBOSE") == "true",
	}
}`,
      hint: "Повторяющуюся логику «значение или запасное» удобно вынести во вспомогательную функцию. Для Verbose хватит сравнения строки с \"true\": результат сравнения уже имеет тип bool.",
    },
    {
      id: "files-json-5-number",
      kind: "code",
      title: "Число из окружения",
      minutes: 8,
      description: "Напиши CacheMinutes: она читает CACHE_MINUTES. Если переменная не задана, верни 10 и nil. Если в ней не число или число меньше 1, верни 0 и ошибку. В остальных случаях верни число. Строку в int превращает strconv.Atoi(s): она возвращает число и ошибку, если строка не число.",
      starter: `package main

import (
	"fmt"
	"os"
)

func CacheMinutes() (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	for _, value := range []string{"", "30", "1", "0", "-5", "десять", "15m"} {
		if value == "" {
			os.Unsetenv("CACHE_MINUTES")
		} else {
			os.Setenv("CACHE_MINUTES", value)
		}
		n, err := CacheMinutes()
		fmt.Printf("%q -> %d %v\\n", value, n, err != nil)
	}
}`,
      referenceSolution: `package main

import (
	"fmt"
	"os"
	"strconv"
)

func CacheMinutes() (int, error) {
	raw := os.Getenv("CACHE_MINUTES")
	if raw == "" {
		return 10, nil
	}
	n, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("CACHE_MINUTES должно быть числом: %w", err)
	}
	if n < 1 {
		return 0, fmt.Errorf("CACHE_MINUTES должно быть не меньше 1, получено %d", n)
	}
	return n, nil
}`,
      hint: "Добавь импорт \"strconv\". Проверяй по порядку: сначала пустую строку, потом ошибку Atoi, потом число меньше 1. Ошибку лучше сразу пояснить через fmt.Errorf, чтобы человек понял, какую переменную исправить.",
    },
    {
      id: "files-json-5-q-case",
      kind: "quiz",
      title: "TRUE или true",
      question: "Сервис запустили с переменной DEBUG=TRUE, а в коде написано debug := os.Getenv(\"DEBUG\") == \"true\". Чему равно debug?",
      options: ["true: Go не различает регистр в значениях переменных окружения", "*false: сравнение строк учитывает регистр, \"TRUE\" не равно \"true\"", "Программа вернёт ошибку при чтении переменной"],
      explanation: "== сравнивает строки посимвольно, с учётом регистра. Такие опечатки в настройках встречаются часто, поэтому допустимые значения стоит описать в документации сервиса.",
    },
  ],
};
