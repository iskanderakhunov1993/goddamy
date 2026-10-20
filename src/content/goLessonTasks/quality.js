// Задания уроков темы «Тесты и качество» Модуля 3. Каждое код-задание проверено скриптом verify-tasks.mjs: эталон работает, заготовка компилируется и печатает другой вывод.
// Проверка заданий запускает main и сравнивает вывод, поэтому go test внутри задания не запустить.
// Вместо этого задания тренируют то же умение в формате вывода: сравнить результат с ожидаемым,
// собрать таблицу случаев, найти граничный случай, исправить то, на что ругается go vet.
// В заданиях «Допиши таблицу» проверка прогоняет таблицу ученика на правильной версии функции
// и на нескольких версиях с ошибкой: хорошая таблица проходит на первой и ловит все остальные.
export const qualityTasks = {
  "go-foundations-quality-1": [
    {
      id: "quality-1-check",
      kind: "code",
      title: "Сравнить и сообщить",
      minutes: 4,
      description:
        "Любой тест делает одно и то же: сравнивает полученное с ожидаемым и сообщает о расхождении. Допиши `Check(name, got, want string) string`: при совпадении верни `ok: <name>`, иначе `FAIL <name>: ожидали \"<want>\", получили \"<got>\"`.",
      starter: `package main

import "fmt"

func Check(name, got, want string) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println(Check("приветствие", "Привет, Анна!", "Привет, Анна!"))
	fmt.Println(Check("город", "Казань", "Самара"))
	fmt.Println(Check("пустой ответ", "", "чай"))
	fmt.Println(Check("обе пустые", "", ""))
}`,
      referenceSolution: `package main

import "fmt"

func Check(name, got, want string) string {
	if got == want {
		return "ok: " + name
	}
	return fmt.Sprintf("FAIL %s: ожидали %q, получили %q", name, want, got)
}`,
      hint: "Сначала сравни got и want через ==. Для сообщения об ошибке подойдёт fmt.Sprintf с глаголом %q: он сам добавит кавычки вокруг строки, как t.Errorf в уроке.",
    },
    {
      id: "quality-1-discount",
      kind: "code",
      title: "Прочитай падение и почини",
      minutes: 5,
      description:
        "`PriceAfterDiscount(price, percent int) int` должна вернуть цену со скидкой: 1000 и 15% дают 850. Запусти код: проверки внизу печатают FAIL. По сообщениям пойми, что считает функция, и исправь её. Проверки не трогай.",
      starter: `package main

import "fmt"

func PriceAfterDiscount(price, percent int) int {
	return price * percent / 100
}

func check(name string, got, want int) {
	if got != want {
		fmt.Printf("FAIL %s: ожидали %d, получили %d\\n", name, want, got)
		return
	}
	fmt.Println("ok:", name)
}`,
      harness: `func main() {
	check("скидка 15%", PriceAfterDiscount(1000, 15), 850)
	check("скидка 50%", PriceAfterDiscount(600, 50), 300)
	check("без скидки", PriceAfterDiscount(450, 0), 450)
	check("скидка 100%", PriceAfterDiscount(990, 100), 0)
}`,
      referenceSolution: `package main

import "fmt"

func PriceAfterDiscount(price, percent int) int {
	return price - price*percent/100
}

func check(name string, got, want int) {
	if got != want {
		fmt.Printf("FAIL %s: ожидали %d, получили %d\\n", name, want, got)
		return
	}
	fmt.Println("ok:", name)
}`,
      hint: "Посмотри на случай «без скидки»: функция вернула 0 вместо 450. Сейчас она считает размер скидки, а нужна цена, которая останется после неё.",
    },
    {
      id: "quality-1-first-test",
      kind: "code",
      title: "Первый тест своими руками",
      minutes: 7,
      description:
        "Тип `T` здесь заменяет `*testing.T` в упрощённом виде, его `t.Errorf` отмечает тест проваленным. Напиши тело `TestGreet(t *T)`: вызови `greet(\"Анна\")` и, если результат не равен `Привет, Анна!`, вызови `t.Errorf` с понятным сообщением. Проверка запустит твой тест на правильной версии `greet` и на трёх версиях с ошибкой: на первой тест должен пройти, на остальных упасть.",
      starter: `package main

import "fmt"

// T — упрощённая замена *testing.T: Errorf отмечает тест проваленным.
type T struct {
	failed  bool
	message string
}

func (t *T) Errorf(format string, args ...any) {
	t.failed = true
	t.message = fmt.Sprintf(format, args...)
}

// greet — функция, которую проверяет тест. Проверка подставит сюда
// правильную версию и версии с ошибкой.
var greet = func(name string) string {
	return "Привет, " + name + "!"
}

func TestGreet(t *T) {
	// твой тест
}`,
      harness: `func main() {
	versions := []struct {
		name string
		f    func(string) string
	}{
		{"правильная версия", func(n string) string { return "Привет, " + n + "!" }},
		{"без восклицательного знака", func(n string) string { return "Привет, " + n }},
		{"без пробела", func(n string) string { return "Привет," + n + "!" }},
		{"не использует имя", func(n string) string { return "Привет, мир!" }},
	}
	for _, v := range versions {
		greet = v.f
		t := &T{}
		TestGreet(t)
		if t.failed {
			fmt.Println(v.name + ": тест упал")
		} else {
			fmt.Println(v.name + ": тест прошёл")
		}
	}
}`,
      referenceSolution: `package main

import "fmt"

// T — упрощённая замена *testing.T: Errorf отмечает тест проваленным.
type T struct {
	failed  bool
	message string
}

func (t *T) Errorf(format string, args ...any) {
	t.failed = true
	t.message = fmt.Sprintf(format, args...)
}

// greet — функция, которую проверяет тест. Проверка подставит сюда
// правильную версию и версии с ошибкой.
var greet = func(name string) string {
	return "Привет, " + name + "!"
}

func TestGreet(t *T) {
	got := greet("Анна")
	want := "Привет, Анна!"
	if got != want {
		t.Errorf("greet(%q) = %q, ожидали %q", "Анна", got, want)
	}
}`,
      hint: "Повтори схему теста из урока: результат вызова в переменную, сравнение через !=, а внутри if вызов t.Errorf(\"ожидали %q, получили %q\", want, got).",
    },
    {
      id: "quality-1-q-name",
      kind: "quiz",
      title: "Какой тест запустится",
      question: "Какую функцию go test найдёт и запустит как тест?",
      options: [
        "func testTotal(t *testing.T) в файле cart_test.go",
        "*func TestTotal(t *testing.T) в файле cart_test.go",
        "func TestTotal(t *testing.T) в файле cart.go",
        "func CheckTotal(t *testing.T) в файле cart_test.go",
      ],
      explanation:
        "go test ищет тесты только в файлах *_test.go, и имя функции должно начинаться с Test, за которым идёт заглавная буква. testTotal, CheckTotal и функция в cart.go под эти правила не подходят.",
    },
  ],

  "go-foundations-quality-2": [
    {
      id: "quality-2-run-table",
      kind: "code",
      title: "Прогони таблицу",
      minutes: 6,
      description:
        "Функция `TicketPrice` уже написана. Допиши `RunTable(cases []ticketCase) int`: для каждого случая вызови `TicketPrice(tc.age)`, при совпадении напечатай `ok: <name>`, иначе `FAIL <name>: TicketPrice(<age>) = <получили>, хотели <want>`. Верни число упавших случаев. Во второй таблице проверки есть опечатка в ожидаемом значении: тесты тоже бывают неправы, и вывод должен это показать.",
      starter: `package main

import "fmt"

type ticketCase struct {
	name string
	age  int
	want int
}

// TicketPrice: до 7 лет — 0, до 18 — 200, с 65 — 250, остальным — 400.
func TicketPrice(age int) int {
	switch {
	case age < 7:
		return 0
	case age < 18:
		return 200
	case age >= 65:
		return 250
	}
	return 400
}

func RunTable(cases []ticketCase) int {
	// твой код
	return 0
}`,
      harness: `func main() {
	good := []ticketCase{
		{name: "малыш", age: 4, want: 0},
		{name: "школьник", age: 12, want: 200},
		{name: "взрослый", age: 30, want: 400},
		{name: "пенсионер", age: 70, want: 250},
	}
	fmt.Println("падений:", RunTable(good))
	withTypo := []ticketCase{
		{name: "студент", age: 19, want: 400},
		{name: "пенсионер", age: 66, want: 205},
	}
	fmt.Println("падений:", RunTable(withTypo))
	fmt.Println("падений:", RunTable(nil))
}`,
      referenceSolution: `package main

import "fmt"

type ticketCase struct {
	name string
	age  int
	want int
}

// TicketPrice: до 7 лет — 0, до 18 — 200, с 65 — 250, остальным — 400.
func TicketPrice(age int) int {
	switch {
	case age < 7:
		return 0
	case age < 18:
		return 200
	case age >= 65:
		return 250
	}
	return 400
}

func RunTable(cases []ticketCase) int {
	failed := 0
	for _, tc := range cases {
		got := TicketPrice(tc.age)
		if got != tc.want {
			fmt.Printf("FAIL %s: TicketPrice(%d) = %d, хотели %d\\n", tc.name, tc.age, got, tc.want)
			failed++
			continue
		}
		fmt.Println("ok:", tc.name)
	}
	return failed
}`,
      hint: "Перебери слайс через for _, tc := range cases, как в табличном тесте из урока. Заведи счётчик до цикла и увеличивай его в ветке FAIL. Строку FAIL удобно собрать через fmt.Printf с %s и %d.",
    },
    {
      id: "quality-2-leap",
      kind: "code",
      title: "Таблица нашла баг",
      minutes: 5,
      description:
        "Календарь считает високосные годы. Правило: год високосный, если делится на 4 и не делится на 100, либо делится на 400. Табличная проверка внизу показывает, на каких годах `IsLeap` ошибается. Исправь функцию, чтобы все строки стали ok.",
      starter: `package main

import "fmt"

func IsLeap(year int) bool {
	return year%4 == 0
}`,
      harness: `func main() {
	cases := []struct {
		year int
		want bool
	}{
		{2024, true},
		{2023, false},
		{1900, false},
		{2000, true},
		{2100, false},
		{2400, true},
	}
	for _, tc := range cases {
		got := IsLeap(tc.year)
		if got != tc.want {
			fmt.Printf("FAIL IsLeap(%d) = %v, хотели %v\\n", tc.year, got, tc.want)
			continue
		}
		fmt.Printf("ok IsLeap(%d)\\n", tc.year)
	}
}`,
      referenceSolution: `package main

import "fmt"

func IsLeap(year int) bool {
	if year%400 == 0 {
		return true
	}
	return year%4 == 0 && year%100 != 0
}`,
      hint: "Посмотри, какие годы упали: 1900 и 2100 делятся на 100. Сначала проверь деление на 400, потом условие «делится на 4 и не делится на 100» через &&.",
    },
    {
      id: "quality-2-table-rows",
      kind: "code",
      title: "Допиши таблицу",
      minutes: 8,
      description:
        "Правило оценки за тест: от 90 до 100 баллов `отлично`, от 75 до 89 `хорошо`, от 60 до 74 `удовлетворительно`, от 0 до 59 `неуд`. В таблице `gradeCases` пока одна строка. Добавь строки так, чтобы таблица проходила на правильной версии `Grade` и ловила три версии с ошибкой. Цикл и версии функции лежат в проверке, менять нужно только таблицу.",
      starter: `package main

import "fmt"

type gradeCase struct {
	name  string
	score int
	want  string
}

var gradeCases = []gradeCase{
	{name: "середина «хорошо»", score: 80, want: "хорошо"},
	// добавь строки
}`,
      harness: `func main() {
	correct := func(s int) string {
		switch {
		case s >= 90:
			return "отлично"
		case s >= 75:
			return "хорошо"
		case s >= 60:
			return "удовлетворительно"
		}
		return "неуд"
	}
	versions := []struct {
		name string
		f    func(int) string
	}{
		{"нет «отлично»", func(s int) string {
			if s >= 90 {
				return "хорошо"
			}
			return correct(s)
		}},
		{"нет «удовлетворительно»", func(s int) string {
			if s >= 60 && s < 75 {
				return "хорошо"
			}
			return correct(s)
		}},
		{"нет «неуд»", func(s int) string {
			if s < 60 {
				return "удовлетворительно"
			}
			return correct(s)
		}},
	}
	failures := func(f func(int) string) int {
		n := 0
		for _, tc := range gradeCases {
			if f(tc.score) != tc.want {
				n++
			}
		}
		return n
	}
	fmt.Println("правильная версия, падений:", failures(correct))
	for _, v := range versions {
		if failures(v.f) > 0 {
			fmt.Println(v.name + ": поймана")
		} else {
			fmt.Println(v.name + ": не поймана")
		}
	}
}`,
      referenceSolution: `package main

import "fmt"

type gradeCase struct {
	name  string
	score int
	want  string
}

var gradeCases = []gradeCase{
	{name: "середина «хорошо»", score: 80, want: "хорошо"},
	{name: "середина «отлично»", score: 95, want: "отлично"},
	{name: "середина «удовлетворительно»", score: 67, want: "удовлетворительно"},
	{name: "середина «неуд»", score: 30, want: "неуд"},
}`,
      hint: "Каждая версия с ошибкой ломает одну оценку. Если в таблице есть хотя бы по одному случаю на каждую из четырёх оценок, ошибку заметит какая-нибудь строка. Добавлять пакеты не нужно.",
    },
    {
      id: "quality-2-q-run",
      kind: "quiz",
      title: "Зачем t.Run",
      question: "Зачем в табличном тесте оборачивать каждый случай в t.Run с именем?",
      options: [
        "Без t.Run цикл по таблице не скомпилируется",
        "*Чтобы go test -v показал каждый случай отдельной строкой и было видно, какой именно упал",
        "Чтобы случаи выполнялись быстрее",
      ],
      explanation:
        "Цикл по таблице работает и без t.Run, но тогда все случаи сливаются в один тест. С t.Run у каждого случая есть имя, и в выводе сразу видно, какой сценарий сломался.",
    },
  ],

  "go-foundations-quality-3": [
    {
      id: "quality-3-average",
      kind: "code",
      title: "Среднее пустого списка",
      minutes: 4,
      description:
        "`Average` считает среднюю оценку. На обычных данных она работает, а на пустом списке и на nil печатает `NaN`. Исправь функцию: для пустого входа она должна вернуть 0.",
      starter: `package main

import "fmt"

func Average(grades []int) float64 {
	sum := 0
	for _, g := range grades {
		sum += g
	}
	return float64(sum) / float64(len(grades))
}`,
      harness: `func main() {
	fmt.Printf("%.2f\\n", Average([]int{5, 4, 4, 3}))
	fmt.Printf("%.2f\\n", Average([]int{5}))
	fmt.Printf("%.2f\\n", Average([]int{}))
	fmt.Printf("%.2f\\n", Average(nil))
}`,
      referenceSolution: `package main

import "fmt"

func Average(grades []int) float64 {
	if len(grades) == 0 {
		return 0
	}
	sum := 0
	for _, g := range grades {
		sum += g
	}
	return float64(sum) / float64(len(grades))
}`,
      hint: "Деление на ноль у float64 не вызывает панику, а даёт NaN. Проверь len(grades) в самом начале: для nil-слайса len тоже равен 0.",
    },
    {
      id: "quality-3-max-temp",
      kind: "code",
      title: "Самый тёплый день",
      minutes: 6,
      description:
        "`MaxTemp` возвращает самую высокую температуру за период и `true`. Если данных нет (пустой слайс или nil), нужно вернуть `0, false`. Сейчас функция ошибается на двух граничных случаях: найди их по выводу и исправь.",
      starter: `package main

import "fmt"

func MaxTemp(temps []int) (int, bool) {
	max := 0
	for _, t := range temps {
		if t > max {
			max = t
		}
	}
	return max, true
}`,
      harness: `func main() {
	fmt.Println(MaxTemp([]int{12, 18, 15}))
	fmt.Println(MaxTemp([]int{-5, -2, -9}))
	fmt.Println(MaxTemp([]int{-7}))
	fmt.Println(MaxTemp([]int{}))
	fmt.Println(MaxTemp(nil))
}`,
      referenceSolution: `package main

import "fmt"

func MaxTemp(temps []int) (int, bool) {
	if len(temps) == 0 {
		return 0, false
	}
	max := temps[0]
	for _, t := range temps {
		if t > max {
			max = t
		}
	}
	return max, true
}`,
      hint: "Посмотри на зиму: при температурах -5, -2, -9 функция вернула 0, которого в данных нет. Начальное значение лучше взять из самих данных, а перед этим отдельно обработать пустой вход.",
    },
    {
      id: "quality-3-wind-edges",
      kind: "code",
      title: "Таблица для границ",
      minutes: 8,
      description:
        "Приложение погоды описывает ветер по скорости в м/с: меньше 0 даёт `ошибка`, 0 даёт `штиль`, от 1 до 5 `слабый`, от 6 до 14 `умеренный`, от 15 до 32 `сильный`, от 33 `ураган`. Допиши таблицу `windCases`, чтобы она проходила на правильной версии `Wind` и ловила четыре версии с ошибкой. В каждой из них ошибка на одной из границ.",
      starter: `package main

import "fmt"

type windCase struct {
	speed int
	want  string
}

var windCases = []windCase{
	{speed: 10, want: "умеренный"},
	// добавь строки
}`,
      harness: `func main() {
	correct := func(s int) string {
		switch {
		case s < 0:
			return "ошибка"
		case s == 0:
			return "штиль"
		case s <= 5:
			return "слабый"
		case s <= 14:
			return "умеренный"
		case s <= 32:
			return "сильный"
		}
		return "ураган"
	}
	versions := []struct {
		name string
		f    func(int) string
	}{
		{"отрицательная скорость", func(s int) string {
			if s < 0 {
				return "штиль"
			}
			return correct(s)
		}},
		{"граница 5 и 6", func(s int) string {
			if s == 5 {
				return "умеренный"
			}
			return correct(s)
		}},
		{"граница 14 и 15", func(s int) string {
			if s == 15 {
				return "умеренный"
			}
			return correct(s)
		}},
		{"граница 32 и 33", func(s int) string {
			if s == 32 {
				return "ураган"
			}
			return correct(s)
		}},
	}
	failures := func(f func(int) string) int {
		n := 0
		for _, tc := range windCases {
			if f(tc.speed) != tc.want {
				n++
			}
		}
		return n
	}
	fmt.Println("правильная версия, падений:", failures(correct))
	for _, v := range versions {
		if failures(v.f) > 0 {
			fmt.Println(v.name + ": поймана")
		} else {
			fmt.Println(v.name + ": не поймана")
		}
	}
}`,
      referenceSolution: `package main

import "fmt"

type windCase struct {
	speed int
	want  string
}

var windCases = []windCase{
	{speed: 10, want: "умеренный"},
	{speed: -1, want: "ошибка"},
	{speed: 0, want: "штиль"},
	{speed: 5, want: "слабый"},
	{speed: 6, want: "умеренный"},
	{speed: 14, want: "умеренный"},
	{speed: 15, want: "сильный"},
	{speed: 32, want: "сильный"},
	{speed: 33, want: "ураган"},
}`,
      hint: "Значения из середины диапазонов такие ошибки не ловят. Возьми числа на самих границах: последнее значение одного диапазона и первое следующего. Не забудь отрицательную скорость.",
    },
    {
      id: "quality-3-q-nil",
      kind: "quiz",
      title: "Цикл по nil",
      question:
        "После var temps []int слайс равен nil. Что произойдёт при выполнении for _, t := range temps { fmt.Println(t) }, а затем fmt.Println(len(temps))?",
      options: [
        "Паника: обращение к nil",
        "*Цикл не выполнится ни разу, затем напечатается 0",
        "Ошибка компиляции: nil-слайс нельзя перебирать",
      ],
      explanation:
        "range по nil-слайсу делает ноль итераций, а len(nil-слайса) равен 0. Панику вызывает обращение к полю через nil-указатель, это другая ситуация.",
    },
  ],

  "go-foundations-quality-4": [
    {
      id: "quality-4-receipt",
      kind: "code",
      title: "Чек из кафе",
      minutes: 4,
      description:
        "Код компилируется, но go vet ругается на строку формата: глаголы не совпадают с типами аргументов, и в чеке видны куски вроде `%!d(string=...)`. Исправь глаголы, чтобы `Receipt(\"Капучино\", 2, 180)` возвращал `Капучино x 2 = 360.00 руб.`",
      starter: `package main

import "fmt"

func Receipt(item string, qty int, price float64) string {
	return fmt.Sprintf("%d x %s = %d руб.", item, qty, float64(qty)*price)
}`,
      harness: `func main() {
	fmt.Println(Receipt("Капучино", 2, 180))
	fmt.Println(Receipt("Сырник", 3, 145.5))
	fmt.Println(Receipt("Вода", 1, 60))
}`,
      referenceSolution: `package main

import "fmt"

func Receipt(item string, qty int, price float64) string {
	return fmt.Sprintf("%s x %d = %.2f руб.", item, qty, float64(qty)*price)
}`,
      hint: "Глагол подбирают под тип аргумента: %s для string, %d для int, %f для float64. Два знака после точки даёт %.2f.",
    },
    {
      id: "quality-4-forecast",
      kind: "code",
      title: "Прогноз без процентов",
      minutes: 5,
      description:
        "На эту функцию go vet выдаёт два замечания: `fmt.Sprint` получил строку с глаголами форматирования, а в `fmt.Sprintf` глаголу `%d` не хватает аргумента. Исправь обе строки, чтобы `Forecast(\"Казань\", -3, 5)` возвращал `Казань: -3°C, ветер 5 м/с`.",
      starter: `package main

import "fmt"

func Forecast(city string, temp, wind int) string {
	line := fmt.Sprint("%s: %d°C", city, temp)
	return line + fmt.Sprintf(", ветер %d м/с")
}`,
      harness: `func main() {
	fmt.Println(Forecast("Казань", -3, 5))
	fmt.Println(Forecast("Сочи", 24, 0))
}`,
      referenceSolution: `package main

import "fmt"

func Forecast(city string, temp, wind int) string {
	line := fmt.Sprintf("%s: %d°C", city, temp)
	return line + fmt.Sprintf(", ветер %d м/с", wind)
}`,
      hint: "Глаголы вроде %s и %d понимают только функции с f на конце: Printf, Sprintf, Errorf. Каждому глаголу нужен свой аргумент.",
    },
    {
      id: "quality-4-unreachable",
      kind: "code",
      title: "Недостижимый код",
      minutes: 5,
      description:
        "Термостат держит температуру от `low` до `high`. Функция `Clamp` неправильно работает со значениями выше `high`, и go vet пишет про неё `unreachable code`. Найди строку, после которой код уже не выполняется, и исправь порядок.",
      starter: `package main

import "fmt"

func Clamp(want, low, high int) int {
	if want < low {
		return low
	}
	return want
	if want > high {
		return high
	}
	return want
}`,
      harness: `func main() {
	fmt.Println(Clamp(22, 16, 28))
	fmt.Println(Clamp(10, 16, 28))
	fmt.Println(Clamp(35, 16, 28))
	fmt.Println(Clamp(28, 16, 28))
}`,
      referenceSolution: `package main

import "fmt"

func Clamp(want, low, high int) int {
	if want < low {
		return low
	}
	if want > high {
		return high
	}
	return want
}`,
      hint: "После return функция сразу завершается. Всё, что стоит ниже первого return want, не выполнится никогда.",
    },
    {
      id: "quality-4-q-tool",
      kind: "quiz",
      title: "Кто заметит ошибку",
      question:
        "Строка fmt.Printf(\"%d книг\", \"пять\") компилируется и запускается. Какой инструмент укажет на ошибку до запуска программы?",
      options: [
        "gofmt -l .",
        "*go vet ./...",
        "Компилятор: go build откажется собирать программу",
      ],
      explanation:
        "Компилятор строку формата не проверяет, а gofmt следит только за оформлением. go vet сверяет глаголы с типами аргументов и сообщит, что %d получил строку.",
    },
  ],

  "go-foundations-quality-5": [
    {
      id: "quality-5-find-book",
      kind: "code",
      title: "Ошибка, которая объясняет",
      minutes: 4,
      description:
        "`FindBook` ищет номер полки по названию книги. Когда книги нет, она возвращает ошибку с текстом `error`. Сделай текст полезным: `книга \"<название>\" не найдена`. Для пустого названия верни ошибку `пустое название книги`.",
      starter: `package main

import "fmt"

func FindBook(shelves map[string]int, title string) (int, error) {
	n, ok := shelves[title]
	if !ok {
		return 0, fmt.Errorf("error")
	}
	return n, nil
}`,
      harness: `func main() {
	shelves := map[string]int{"Война и мир": 3, "Дюна": 7}
	for _, title := range []string{"Дюна", "Мастер и Маргарита", ""} {
		n, err := FindBook(shelves, title)
		if err != nil {
			fmt.Println("ошибка:", err)
			continue
		}
		fmt.Println("полка", n)
	}
}`,
      referenceSolution: `package main

import "fmt"

func FindBook(shelves map[string]int, title string) (int, error) {
	if title == "" {
		return 0, fmt.Errorf("пустое название книги")
	}
	n, ok := shelves[title]
	if !ok {
		return 0, fmt.Errorf("книга %q не найдена", title)
	}
	return n, nil
}`,
      hint: "Глагол %q в fmt.Errorf подставит название в кавычках. Проверку пустой строки поставь до поиска в map.",
    },
    {
      id: "quality-5-wrap",
      kind: "code",
      title: "Обернуть через %w",
      minutes: 6,
      description:
        "`Reserve` бронирует места на сеанс. Если сеанса нет, верни `бронь на \"<сеанс>\": ` и следом обёрнутую `ErrUnknownShow`. Если мест не хватает, верни `бронь на \"<сеанс>\": нужно <n>, свободно <free>: ` и следом обёрнутую `ErrNoSeats`. Иначе nil. Проверка печатает текст ошибки и результат `errors.Is`: он найдёт исходную ошибку, только если она обёрнута через `%w`.",
      starter: `package main

import (
	"errors"
	"fmt"
)

var (
	ErrNoSeats     = errors.New("недостаточно свободных мест")
	ErrUnknownShow = errors.New("сеанс не найден")
)

func Reserve(free map[string]int, show string, n int) error {
	left, ok := free[show]
	if !ok {
		return fmt.Errorf("сеанс не найден")
	}
	if n > left {
		return fmt.Errorf("мест нет")
	}
	return nil
}`,
      harness: `func main() {
	free := map[string]int{"Дюна 19:00": 4, "Мульт 11:00": 0}
	tries := []struct {
		show string
		n    int
	}{
		{"Дюна 19:00", 2},
		{"Дюна 19:00", 5},
		{"Мульт 11:00", 1},
		{"Солярис 22:00", 1},
	}
	for _, tr := range tries {
		err := Reserve(free, tr.show, tr.n)
		fmt.Println("ошибка:", err)
		fmt.Println("  нет мест:", errors.Is(err, ErrNoSeats), "| нет сеанса:", errors.Is(err, ErrUnknownShow))
	}
}`,
      referenceSolution: `package main

import (
	"errors"
	"fmt"
)

var (
	ErrNoSeats     = errors.New("недостаточно свободных мест")
	ErrUnknownShow = errors.New("сеанс не найден")
)

func Reserve(free map[string]int, show string, n int) error {
	left, ok := free[show]
	if !ok {
		return fmt.Errorf("бронь на %q: %w", show, ErrUnknownShow)
	}
	if n > left {
		return fmt.Errorf("бронь на %q: нужно %d, свободно %d: %w", show, n, left, ErrNoSeats)
	}
	return nil
}`,
      hint: "Формат такой же, как в уроке: fmt.Errorf(\"... %q ...: %w\", show, ErrNoSeats). Глагол %w ставят последним, а саму ошибку передают последним аргументом.",
    },
    {
      id: "quality-5-describe",
      kind: "code",
      title: "Понятный ответ человеку",
      minutes: 7,
      description:
        "`Describe` превращает ошибку брони в фразу для зрителя. Сейчас она сравнивает ошибки через `==` и не узнаёт обёрнутые. Перепиши проверки на `errors.Is(err, ErrNoSeats)`: эта функция проходит по всей цепочке обёрток. Нужные фразы: для nil `Бронь оформлена`, когда нет мест `Мест не хватает, выбери другой сеанс`, когда нет сеанса `Такого сеанса нет в расписании`, для любой другой ошибки `Что-то пошло не так, попробуй позже`.",
      starter: `package main

import (
	"errors"
	"fmt"
)

var (
	ErrNoSeats     = errors.New("недостаточно свободных мест")
	ErrUnknownShow = errors.New("сеанс не найден")
)

func Describe(err error) string {
	if err == nil {
		return "Бронь оформлена"
	}
	if err == ErrNoSeats {
		return "Мест не хватает, выбери другой сеанс"
	}
	if err == ErrUnknownShow {
		return "Такого сеанса нет в расписании"
	}
	return "Что-то пошло не так, попробуй позже"
}`,
      harness: `func main() {
	wrapped := fmt.Errorf("бронь на %q: %w", "Дюна 19:00", ErrNoSeats)
	cases := []error{
		nil,
		ErrNoSeats,
		wrapped,
		fmt.Errorf("оплата заказа 15: %w", wrapped),
		fmt.Errorf("бронь на %q: %w", "Солярис 22:00", ErrUnknownShow),
		errors.New("касса не отвечает"),
		fmt.Errorf("бронь: %v", ErrNoSeats),
	}
	for _, err := range cases {
		fmt.Println(Describe(err))
	}
}`,
      referenceSolution: `package main

import (
	"errors"
	"fmt"
)

var (
	ErrNoSeats     = errors.New("недостаточно свободных мест")
	ErrUnknownShow = errors.New("сеанс не найден")
)

func Describe(err error) string {
	switch {
	case err == nil:
		return "Бронь оформлена"
	case errors.Is(err, ErrNoSeats):
		return "Мест не хватает, выбери другой сеанс"
	case errors.Is(err, ErrUnknownShow):
		return "Такого сеанса нет в расписании"
	}
	return "Что-то пошло не так, попробуй позже"
}`,
      hint: "Замени err == ErrNoSeats на errors.Is(err, ErrNoSeats), то же для второй ошибки. Обрати внимание на последний случай в проверке: ошибка обёрнута через %v, а не %w, поэтому errors.Is её не найдёт, и это правильное поведение.",
    },
    {
      id: "quality-5-q-wrap",
      kind: "quiz",
      title: "%w или %v",
      question: "Чем fmt.Errorf(\"сохранение: %w\", err) отличается от fmt.Errorf(\"сохранение: %v\", err)?",
      options: [
        "Ничем: для ошибок %w и %v работают одинаково",
        "*С %w исходная ошибка сохраняется внутри новой, и errors.Is может её найти; с %v остаётся только её текст",
        "%w печатает ошибку с переносом строки, а %v в одну строку",
      ],
      explanation:
        "Текст сообщения в обоих случаях одинаковый. Разница в том, что %w оставляет ссылку на исходную ошибку, поэтому вызывающий код может проверить её через errors.Is.",
    },
  ],
};
