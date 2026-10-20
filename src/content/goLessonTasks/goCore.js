// Задания уроков темы «Основа Go-программы» Модуля 3. Каждое код-задание проверено скриптом verify-tasks.mjs: эталон работает, заготовка компилируется и печатает другой вывод.
// Это первые уроки с кодом: в заданиях только то, что уже объяснено (пакет, Println, переменные, if/switch, for, функции и error).
// Слайсы, map и структуры здесь не используются: они идут в следующей теме.
export const goCoreTasks = {
  "go-foundations-go-core-1": [
    { challenge: "greeting" },
    {
      id: "go-core-1-library-sign",
      kind: "code",
      title: "Табличка библиотеки",
      minutes: 3,
      description: "Допиши функцию PrintSign: она печатает на экран две строки: «Библиотека открыта» и «Часы работы: 10–20». Каждая строка выводится своим вызовом fmt.Println.",
      starter: `package main

import "fmt"

func PrintSign() {
	// твой код
}`,
      harness: `func main() {
	PrintSign()
	fmt.Println("---")
}`,
      referenceSolution: `package main

import "fmt"

func PrintSign() {
	fmt.Println("Библиотека открыта")
	fmt.Println("Часы работы: 10–20")
}`,
      hint: "fmt.Println печатает текст и переводит строку. Текст пишется в двойных кавычках. Пакет fmt уже подключён через import.",
    },
    {
      id: "go-core-1-route",
      kind: "code",
      title: "Маршрут поезда",
      minutes: 4,
      description: "Функция Route получает город отправления и город прибытия и возвращает строку маршрута: для «Москва» и «Казань» получится «Москва → Казань».",
      starter: `package main

import "fmt"

func Route(from, to string) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println(Route("Москва", "Казань"))
	fmt.Println(Route("Тула", "Сочи"))
	fmt.Println(Route("", "Омск"))
}`,
      referenceSolution: `package main

import "fmt"

func Route(from, to string) string {
	return from + " → " + to
}`,
      hint: "Склей три строки оператором +: город отправления, стрелку с пробелами по бокам и город прибытия.",
    },
    {
      id: "go-core-1-q-entry",
      kind: "quiz",
      title: "Точка входа",
      question: "В файле с package main функцию main переименовали в start. Что будет при go run?",
      options: [
        "Go найдёт start сам: это первая функция в файле",
        "*Программа не соберётся: в пакете main нет функции main",
        "Программа соберётся, но ничего не напечатает",
      ],
      explanation: "Go начинает исполняемую программу только с func main в package main. Если её нет, компилятор сообщает, что main не объявлена, и программа не запускается.",
    },
  ],

  "go-foundations-go-core-2": [
    { challenge: "seconds" },
    {
      id: "go-core-2-fahrenheit",
      kind: "code",
      title: "Градусы по Фаренгейту",
      minutes: 4,
      description: "Переведи температуру из градусов Цельсия в градусы Фаренгейта по формуле F = C × 9 / 5 + 32. Функция получает и возвращает float64.",
      starter: `package main

import "fmt"

func Fahrenheit(celsius float64) float64 {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(Fahrenheit(0))
	fmt.Println(Fahrenheit(100))
	fmt.Println(Fahrenheit(-40))
	fmt.Println(Fahrenheit(37.5))
}`,
      referenceSolution: `package main

import "fmt"

func Fahrenheit(celsius float64) float64 {
	f := celsius*9/5 + 32
	return f
}`,
      hint: "Умножение и деление выполняются раньше сложения, как в математике. Сохрани результат в переменную через := и верни её.",
    },
    {
      id: "go-core-2-boxes",
      kind: "code",
      title: "Коробки для пирожных",
      minutes: 4,
      description: "В коробку помещается 6 пирожных. Функция FullBoxes получает число пирожных и возвращает, сколько коробок получится заполнить полностью. Деление двух int в Go отбрасывает дробную часть: 13 / 6 даёт 2.",
      starter: `package main

import "fmt"

func FullBoxes(cakes int) int {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(FullBoxes(13))
	fmt.Println(FullBoxes(6))
	fmt.Println(FullBoxes(5))
	fmt.Println(FullBoxes(0))
}`,
      referenceSolution: `package main

import "fmt"

func FullBoxes(cakes int) int {
	boxSize := 6
	return cakes / boxSize
}`,
      hint: "Здесь хватит одного деления. Размер коробки удобно держать в переменной, чтобы число 6 не терялось в выражении.",
    },
    {
      id: "go-core-2-average",
      kind: "code",
      title: "Средний балл",
      minutes: 6,
      description: "Функция Average получает три оценки типа int и возвращает средний балл типа float64: для 5, 4 и 4 это 4.333333333333333. Превратить int в float64 можно так: float64(x).",
      starter: `package main

import "fmt"

func Average(a, b, c int) float64 {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(Average(5, 4, 4))
	fmt.Println(Average(5, 5, 5))
	fmt.Println(Average(3, 4, 4))
	fmt.Println(Average(2, 3, 3))
}`,
      referenceSolution: `package main

import "fmt"

func Average(a, b, c int) float64 {
	sum := a + b + c
	return float64(sum) / 3
}`,
      hint: "Если сначала поделить целые числа, а потом превратить результат в float64, дробная часть уже потеряется и получится 4. Преврати в float64 сумму, а затем дели.",
    },
    {
      id: "go-core-2-q-short",
      kind: "quiz",
      title: "Где работает :=",
      question: "Какая строка не скомпилируется, если написать её на уровне пакета, вне всех функций?",
      options: [
        "var city = \"Пермь\"",
        "var rooms int = 3",
        "*floor := 5",
      ],
      explanation: "Короткое объявление := работает только внутри функций. На уровне пакета переменную объявляют через var, с типом или без него.",
    },
  ],

  "go-foundations-go-core-3": [
    { challenge: "grade" },
    {
      id: "go-core-3-weekend",
      kind: "code",
      title: "Выходной день",
      minutes: 4,
      description: "Функция IsWeekend получает название дня недели строчными буквами и возвращает true для «суббота» и «воскресенье», для всех остальных строк — false.",
      starter: `package main

import "fmt"

func IsWeekend(day string) bool {
	// твой код
	return false
}`,
      harness: `func main() {
	fmt.Println(IsWeekend("суббота"))
	fmt.Println(IsWeekend("вторник"))
	fmt.Println(IsWeekend("воскресенье"))
	fmt.Println(IsWeekend(""))
}`,
      referenceSolution: `package main

import "fmt"

func IsWeekend(day string) bool {
	switch day {
	case "суббота", "воскресенье":
		return true
	default:
		return false
	}
}`,
      hint: "В одном case можно перечислить несколько значений через запятую. Всё остальное попадёт в default.",
    },
    {
      id: "go-core-3-ticket",
      kind: "code",
      title: "Цена билета в музей",
      minutes: 6,
      description: "Верни цену билета по возрасту посетителя: до 7 лет — 0, от 7 до 17 лет включительно — 150, от 65 лет — 100, всем остальным — 300.",
      starter: `package main

import "fmt"

func TicketPrice(age int) int {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(TicketPrice(3))
	fmt.Println(TicketPrice(7))
	fmt.Println(TicketPrice(17))
	fmt.Println(TicketPrice(18))
	fmt.Println(TicketPrice(40))
	fmt.Println(TicketPrice(65))
	fmt.Println(TicketPrice(80))
}`,
      referenceSolution: `package main

import "fmt"

func TicketPrice(age int) int {
	if age < 7 {
		return 0
	} else if age < 18 {
		return 150
	} else if age >= 65 {
		return 100
	}
	return 300
}`,
      hint: "Проверяй возраст по порядку, начиная с самых маленьких. Внимательно посмотри на границы 7, 17, 18 и 65: какие из них входят в диапазон?",
    },
    {
      id: "go-core-3-q-switch",
      kind: "quiz",
      title: "Что напечатает switch",
      question: "В switch level три ветки: case \"easy\" печатает A, case \"medium\" печатает B, default печатает C. Что напечатает программа, если level равно \"easy\"?",
      options: [
        "A, B и C, каждую с новой строки: без break выполняются все case ниже",
        "*Только A",
        "A и C: default выполняется всегда",
      ],
      explanation: "В Go после подходящего case выполнение switch заканчивается само, break писать не нужно. default срабатывает, только если не подошёл ни один case.",
    },
  ],

  "go-foundations-go-core-4": [
    { challenge: "factorial" },
    {
      id: "go-core-4-countdown",
      kind: "code",
      title: "Обратный отсчёт",
      minutes: 4,
      description: "Функция Countdown печатает числа от n до 1, каждое на своей строке, а затем строку «Старт!». Если n равно нулю, печатается только «Старт!».",
      starter: `package main

import "fmt"

func Countdown(n int) {
	// твой код
}`,
      harness: `func main() {
	Countdown(3)
	fmt.Println("---")
	Countdown(0)
}`,
      referenceSolution: `package main

import "fmt"

func Countdown(n int) {
	for i := n; i >= 1; i-- {
		fmt.Println(i)
	}
	fmt.Println("Старт!")
}`,
      hint: "Классический for может идти и вниз: начни счётчик с n и уменьшай его через i--, пока он не меньше 1. «Старт!» печатается уже после цикла.",
    },
    {
      id: "go-core-4-stars",
      kind: "code",
      title: "Рейтинг звёздами",
      minutes: 5,
      description: "Функция Stars получает оценку от 0 до 5 и возвращает строку из такого же числа звёздочек: для 3 получится «***», для 0 — пустая строка.",
      starter: `package main

import "fmt"

func Stars(rating int) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println("[" + Stars(3) + "]")
	fmt.Println("[" + Stars(0) + "]")
	fmt.Println("[" + Stars(5) + "]")
	fmt.Println("[" + Stars(1) + "]")
}`,
      referenceSolution: `package main

import "fmt"

func Stars(rating int) string {
	result := ""
	for i := 0; i < rating; i++ {
		result += "*"
	}
	return result
}`,
      hint: "Начни с пустой строки и в цикле добавляй к ней по одной звёздочке: result += \"*\". Цикл должен выполниться ровно rating раз.",
    },
    {
      id: "go-core-4-savings",
      kind: "code",
      title: "Копилка на велосипед",
      minutes: 6,
      description: "Каждую неделю в копилку кладут одну и ту же сумму. Функция Weeks получает цель и сумму в неделю (она всегда больше нуля) и возвращает, сколько недель нужно, чтобы в копилке стало не меньше цели. Если цель 0, недель нужно 0.",
      starter: `package main

import "fmt"

func Weeks(goal, perWeek int) int {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(Weeks(100, 30))
	fmt.Println(Weeks(90, 30))
	fmt.Println(Weeks(10, 50))
	fmt.Println(Weeks(0, 20))
}`,
      referenceSolution: `package main

import "fmt"

func Weeks(goal, perWeek int) int {
	saved := 0
	weeks := 0
	for saved < goal {
		saved += perWeek
		weeks++
	}
	return weeks
}`,
      hint: "Здесь подходит for в форме while: пока накопленное меньше цели, добавляй сумму недели и увеличивай счётчик недель.",
    },
    {
      id: "go-core-4-q-while",
      kind: "quiz",
      title: "Цикл с условием",
      question: "Как в Go записать цикл, который повторяется, пока count меньше 10?",
      options: [
        "while count < 10 { ... }",
        "*for count < 10 { ... }",
        "do { ... } while count < 10",
      ],
      explanation: "В Go нет while и do-while. Цикл только с условием записывается через for: for count < 10 { ... }.",
    },
  ],

  "go-foundations-go-core-5": [
    {
      id: "go-core-5-min-max",
      kind: "code",
      title: "Самая низкая и самая высокая температура",
      minutes: 4,
      description: "Функция MinMax получает две температуры и возвращает два значения: сначала меньшую, потом большую. Если температуры равны, вернуть их обе.",
      starter: `package main

import "fmt"

func MinMax(a, b int) (int, int) {
	// твой код
	return 0, 0
}`,
      harness: `func main() {
	fmt.Println(MinMax(3, -5))
	fmt.Println(MinMax(-2, 7))
	fmt.Println(MinMax(4, 4))
}`,
      referenceSolution: `package main

import "fmt"

func MinMax(a, b int) (int, int) {
	if a < b {
		return a, b
	}
	return b, a
}`,
      hint: "Типы результатов перечисляют в скобках: (int, int). В return значения пишут через запятую в том же порядке.",
    },
    {
      id: "go-core-5-split-bill",
      kind: "code",
      title: "Поделить счёт",
      minutes: 5,
      description: "Функция Share делит счёт в кафе поровну и возвращает долю одного человека и ошибку. Если людей 0 или меньше, верни 0 и ошибку с текстом «некому платить». Иначе верни сумму, делённую на число людей (деление целых, остаток отбрасывается), и nil.",
      starter: `package main

import "fmt"

func Share(total, people int) (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	fmt.Println(Share(1200, 4))
	fmt.Println(Share(1000, 3))
	fmt.Println(Share(500, 0))
	fmt.Println(Share(500, -2))
}`,
      referenceSolution: `package main

import "fmt"

func Share(total, people int) (int, error) {
	if people <= 0 {
		return 0, fmt.Errorf("некому платить")
	}
	return total / people, nil
}`,
      hint: "Ошибку создают через fmt.Errorf(\"текст\"). Сначала проверь плохой случай и сразу верни ошибку, а обычный результат верни в конце.",
    },
    {
      id: "go-core-5-seats",
      kind: "code",
      title: "Бронь мест в кинозале",
      minutes: 7,
      description: "Функция Book получает число свободных мест и число мест в брони. Верни, сколько мест останется, и nil. Если в брони 0 мест или меньше, верни 0 и ошибку «нужно хотя бы одно место». Если мест в брони больше, чем свободных, верни 0 и ошибку «столько свободных мест нет».",
      starter: `package main

import "fmt"

func Book(free, wanted int) (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	fmt.Println(Book(10, 3))
	fmt.Println(Book(10, 10))
	fmt.Println(Book(10, 11))
	fmt.Println(Book(10, 0))
	fmt.Println(Book(0, -1))
}`,
      referenceSolution: `package main

import "fmt"

func Book(free, wanted int) (int, error) {
	if wanted <= 0 {
		return 0, fmt.Errorf("нужно хотя бы одно место")
	}
	if wanted > free {
		return 0, fmt.Errorf("столько свободных мест нет")
	}
	return free - wanted, nil
}`,
      hint: "Проверь две плохие ситуации по очереди, каждую отдельным if с return. Обрати внимание на порядок: при брони на −1 место нужна первая ошибка.",
    },
    {
      id: "go-core-5-q-nil",
      kind: "quiz",
      title: "Что значит nil",
      question: "Функция вернула result, err. Как понять, что всё прошло успешно и result можно использовать?",
      options: [
        "*Проверить, что err == nil",
        "Проверить, что result не равен нулю",
        "Ничего проверять не нужно: при ошибке программа остановится сама",
      ],
      explanation: "По соглашению Go при успехе функция возвращает nil вместо ошибки. Ноль в result может быть верным ответом, а ошибка без проверки err никак не остановит программу.",
    },
    { challenge: "safe-parse" },
  ],
};
