// Задания уроков темы «Данные в Go» Модуля 3. Каждое код-задание проверено скриптом verify-tasks.mjs: эталон работает, заготовка компилируется и печатает другой вывод.
export const dataModelTasks = {
  "go-foundations-data-model-1": [
    { challenge: "book-card" },
    {
      id: "data-model-1-order-total",
      kind: "code",
      title: "Сумма заказа в кафе",
      minutes: 4,
      description: "В заказе есть блюдо, цена одной порции и количество порций. Функция Total возвращает, сколько стоит весь заказ.",
      starter: `package main

import "fmt"

type Order struct {
	Dish  string
	Price int
	Qty   int
}

func Total(o Order) int {
	// твой код
	return 0
}`,
      harness: `func main() {
	fmt.Println(Total(Order{Dish: "Капучино", Price: 180, Qty: 2}))
	fmt.Println(Total(Order{Dish: "Сырники", Price: 260, Qty: 1}))
	fmt.Println(Total(Order{Dish: "Морс", Price: 90, Qty: 0}))
}`,
      referenceSolution: `package main

import "fmt"

type Order struct {
	Dish  string
	Price int
	Qty   int
}

func Total(o Order) int {
	return o.Price * o.Qty
}`,
      hint: "Оба числа лежат в полях структуры: достань их через точку и перемножь.",
    },
    {
      id: "data-model-1-warmer-city",
      kind: "code",
      title: "Где теплее",
      minutes: 6,
      description: "Сводка погоды хранит город и температуру. Функция Warmer получает две сводки и возвращает название более тёплого города, а при одинаковой температуре строку «одинаково».",
      starter: `package main

import "fmt"

type Weather struct {
	City string
	Temp int
}

func Warmer(a, b Weather) string {
	// твой код
	return ""
}`,
      harness: `func main() {
	fmt.Println(Warmer(Weather{City: "Сочи", Temp: 14}, Weather{City: "Мурманск", Temp: -6}))
	fmt.Println(Warmer(Weather{City: "Якутск", Temp: -31}, Weather{City: "Омск", Temp: -18}))
	fmt.Println(Warmer(Weather{City: "Казань", Temp: 3}, Weather{City: "Пермь", Temp: 3}))
}`,
      referenceSolution: `package main

import "fmt"

type Weather struct {
	City string
	Temp int
}

func Warmer(a, b Weather) string {
	if a.Temp > b.Temp {
		return a.City
	}
	if b.Temp > a.Temp {
		return b.City
	}
	return "одинаково"
}`,
      hint: "Сравни поля Temp двух структур через if, а вернуть нужно поле City. Не забудь про случай равенства.",
    },
    {
      id: "data-model-1-new-recipe",
      kind: "code",
      title: "Карточка рецепта",
      minutes: 8,
      description: "Функция NewRecipe собирает структуру Recipe из названия и времени готовки в минутах. Если название пустое или время меньше одной минуты, она возвращает пустой Recipe{} и ошибку.",
      starter: `package main

import "fmt"

type Recipe struct {
	Name    string
	Minutes int
}

func NewRecipe(name string, minutes int) (Recipe, error) {
	// твой код
	return Recipe{}, nil
}`,
      harness: `func main() {
	r, err := NewRecipe("Омлет", 10)
	fmt.Println(r.Name, r.Minutes, err != nil)
	r, err = NewRecipe("", 15)
	fmt.Println(r.Name, r.Minutes, err != nil)
	r, err = NewRecipe("Чай", 0)
	fmt.Println(r.Name, r.Minutes, err != nil)
	r, err = NewRecipe("Борщ", -40)
	fmt.Println(r.Name, r.Minutes, err != nil)
}`,
      referenceSolution: `package main

import "fmt"

type Recipe struct {
	Name    string
	Minutes int
}

func NewRecipe(name string, minutes int) (Recipe, error) {
	if name == "" {
		return Recipe{}, fmt.Errorf("пустое название")
	}
	if minutes < 1 {
		return Recipe{}, fmt.Errorf("время готовки должно быть больше нуля")
	}
	return Recipe{Name: name, Minutes: minutes}, nil
}`,
      hint: "Сначала проверь входные данные и при ошибке верни Recipe{} и fmt.Errorf(...). Если всё в порядке, собери значение так: Recipe{Name: name, Minutes: minutes}.",
    },
    {
      id: "data-model-1-q-exported",
      kind: "quiz",
      title: "Заглавная буква в поле",
      question: "В структуре есть поля Title и price. Чем они отличаются?",
      options: [
        "Ничем: регистр первой буквы в Go означает только договорённость о стиле",
        "*Title видно из других пакетов, а price доступно только внутри своего пакета",
        "Поле price нельзя менять после создания структуры",
      ],
      explanation: "В Go заглавная первая буква делает имя видимым за пределами пакета. Это правило компилятора. Менять после создания можно оба поля.",
    },
  ],

  "go-foundations-data-model-2": [
    { challenge: "sum-even" },
    {
      id: "data-model-2-warm-days",
      kind: "code",
      title: "Тёплые дни",
      minutes: 6,
      description: "Функция WarmDays получает температуры за несколько дней и порог. Она возвращает новый слайс только с теми температурами, которые строго выше порога, в исходном порядке.",
      starter: `package main

import "fmt"

func WarmDays(temps []int, limit int) []int {
	// твой код
	return nil
}`,
      harness: `func main() {
	fmt.Println(WarmDays([]int{12, 18, 21, 15, 25}, 17))
	fmt.Println(WarmDays([]int{5, 7, 3}, 10))
	fmt.Println(WarmDays([]int{}, 0))
	fmt.Println(len(WarmDays([]int{20, 20, 20}, 20)))
	fmt.Println(WarmDays([]int{-4, -1, -9}, -5))
}`,
      referenceSolution: `package main

import "fmt"

func WarmDays(temps []int, limit int) []int {
	var result []int
	for _, t := range temps {
		if t > limit {
			result = append(result, t)
		}
	}
	return result
}`,
      hint: "Заведи пустой слайс для результата и в цикле range добавляй в него подходящие значения через append. Результат append сохраняй обратно в ту же переменную.",
    },
    {
      id: "data-model-2-max-temp",
      kind: "code",
      title: "Самая высокая температура",
      minutes: 8,
      description: "Функция MaxTemp возвращает самую высокую температуру из слайса. Если измерений нет, она возвращает 0 и ошибку.",
      starter: `package main

import "fmt"

func MaxTemp(temps []int) (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	m, err := MaxTemp([]int{12, 18, 9, 21, 15})
	fmt.Println(m, err != nil)
	m, err = MaxTemp([]int{-5, -2, -9})
	fmt.Println(m, err != nil)
	m, err = MaxTemp([]int{7})
	fmt.Println(m, err != nil)
	m, err = MaxTemp([]int{})
	fmt.Println(m, err != nil)
}`,
      referenceSolution: `package main

import "fmt"

func MaxTemp(temps []int) (int, error) {
	if len(temps) == 0 {
		return 0, fmt.Errorf("нет измерений")
	}
	best := temps[0]
	for _, t := range temps {
		if t > best {
			best = t
		}
	}
	return best, nil
}`,
      hint: "Пустой слайс проверь через len. Начальное значение максимума возьми из первого элемента temps[0], а не 0: иначе при одних морозах ответ получится неверным.",
    },
    {
      id: "data-model-2-titles-by-author",
      kind: "code",
      title: "Книги одного автора",
      minutes: 8,
      description: "В библиотеке слайс книг, у каждой есть название и автор. Функция TitlesBy возвращает названия книг заданного автора в том порядке, в каком они стоят на полке.",
      starter: `package main

import "fmt"

type Book struct {
	Title  string
	Author string
}

func TitlesBy(books []Book, author string) []string {
	// твой код
	return nil
}`,
      harness: `func main() {
	shelf := []Book{
		{Title: "Война и мир", Author: "Толстой"},
		{Title: "Белые ночи", Author: "Достоевский"},
		{Title: "Анна Каренина", Author: "Толстой"},
		{Title: "Идиот", Author: "Достоевский"},
		{Title: "Хаджи-Мурат", Author: "Толстой"},
	}
	fmt.Println(TitlesBy(shelf, "Толстой"))
	fmt.Println(TitlesBy(shelf, "Достоевский"))
	fmt.Println(len(TitlesBy(shelf, "Чехов")))
	fmt.Println(len(TitlesBy(nil, "Толстой")))
}`,
      referenceSolution: `package main

import "fmt"

type Book struct {
	Title  string
	Author string
}

func TitlesBy(books []Book, author string) []string {
	var titles []string
	for _, b := range books {
		if b.Author == author {
			titles = append(titles, b.Title)
		}
	}
	return titles
}`,
      hint: "Перебери слайс структур через range и сравни поле Author. В результат добавляй через append только поле Title.",
    },
    {
      id: "data-model-2-q-append",
      kind: "quiz",
      title: "Зачем присваивать append",
      question: "Почему пишут names = append(names, \"Оля\"), а не просто append(names, \"Оля\")?",
      options: [
        "*append возвращает слайс, который может указывать на новый, больший массив, и этот результат нужно сохранить",
        "Так принято для читаемости, а слайс names меняется и без присваивания",
        "Без присваивания append добавит элемент в начало слайса, а не в конец",
      ],
      explanation: "Если в старом массиве не хватает места, append выделяет новый и возвращает слайс на него. Без присваивания этот результат теряется. Go даже не скомпилирует программу, где результат append не используется.",
    },
  ],

  "go-foundations-data-model-3": [
    { challenge: "word-frequency" },
    {
      id: "data-model-3-menu-price",
      kind: "code",
      title: "Цена из меню",
      minutes: 6,
      description: "Меню кафе хранится в map: название блюда и цена. Функция PriceOf возвращает цену блюда, а если такого блюда в меню нет, то 0 и ошибку. Учти, что бесплатное блюдо с ценой 0 в меню есть.",
      starter: `package main

import "fmt"

func PriceOf(menu map[string]int, dish string) (int, error) {
	// твой код
	return 0, nil
}`,
      harness: `func main() {
	menu := map[string]int{
		"чай":  120,
		"кофе": 180,
		"вода": 0,
	}
	p, err := PriceOf(menu, "кофе")
	fmt.Println(p, err != nil)
	p, err = PriceOf(menu, "вода")
	fmt.Println(p, err != nil)
	p, err = PriceOf(menu, "пицца")
	fmt.Println(p, err != nil)
	p, err = PriceOf(map[string]int{}, "чай")
	fmt.Println(p, err != nil)
}`,
      referenceSolution: `package main

import "fmt"

func PriceOf(menu map[string]int, dish string) (int, error) {
	price, ok := menu[dish]
	if !ok {
		return 0, fmt.Errorf("блюда %s нет в меню", dish)
	}
	return price, nil
}`,
      hint: "Проверка «цена равна 0» здесь не подходит: у воды цена тоже 0. Нужна форма value, ok из урока.",
    },
    {
      id: "data-model-3-restock",
      kind: "code",
      title: "Остатки после поставки",
      minutes: 10,
      description: "Склад магазина хранит остатки в map «товар → количество», поставка устроена так же. Функция Restock возвращает новую map с остатками после поставки: количества одинаковых товаров складываются, новые товары добавляются.",
      starter: `package main

import (
	"fmt"
	"sort"
)

func Restock(stock, delivery map[string]int) map[string]int {
	result := make(map[string]int)
	// твой код
	return result
}`,
      harness: `func main() {
	results := []map[string]int{
		Restock(
			map[string]int{"молоко": 4, "хлеб": 10},
			map[string]int{"молоко": 20, "сыр": 6},
		),
		Restock(map[string]int{"яблоки": 7}, map[string]int{}),
		Restock(map[string]int{}, map[string]int{"кефир": 3}),
	}
	for _, m := range results {
		keys := make([]string, 0, len(m))
		for k := range m {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			fmt.Println(k, m[k])
		}
		fmt.Println("---")
	}
}`,
      referenceSolution: `package main

import (
	"fmt"
	"sort"
)

func Restock(stock, delivery map[string]int) map[string]int {
	result := make(map[string]int)
	for name, qty := range stock {
		result[name] = qty
	}
	for name, qty := range delivery {
		result[name] += qty
	}
	return result
}`,
      hint: "Сначала перенеси в result всё из stock, потом пройди по delivery через range. Отсутствующий ключ даёт 0, поэтому result[name] += qty работает и для нового товара.",
    },
    {
      id: "data-model-3-q-missing-key",
      kind: "quiz",
      title: "Ключа нет",
      question: "stock := map[string]int{\"хлеб\": 10}. Что вернёт stock[\"сыр\"]?",
      options: [
        "Программа упадёт с паникой: такого ключа нет",
        "*0: это нулевое значение для int, ошибки не будет",
        "nil, потому что значение не найдено",
      ],
      explanation: "Чтение отсутствующего ключа не паникует, а возвращает нулевое значение типа. Поэтому «ключа нет» и «значение 0» без формы value, ok не различить.",
    },
  ],

  "go-foundations-data-model-4": [
    { challenge: "rename-task" },
    {
      id: "data-model-4-double",
      kind: "code",
      title: "Удвоить по адресу",
      minutes: 4,
      description: "Функция Double получает указатель на число и удваивает само число, на которое он указывает. Ничего возвращать не нужно.",
      starter: `package main

import "fmt"

func Double(n *int) {
	// твой код
}`,
      harness: `func main() {
	a := 7
	Double(&a)
	fmt.Println(a)
	b := 0
	Double(&b)
	fmt.Println(b)
	c := -3
	Double(&c)
	Double(&c)
	fmt.Println(c)
}`,
      referenceSolution: `package main

import "fmt"

func Double(n *int) {
	*n = *n * 2
}`,
      hint: "Значение по адресу читают и записывают через звёздочку: *n. Запись n = ... меняет только локальную переменную с адресом, само число останется прежним.",
    },
    {
      id: "data-model-4-swap-shelves",
      kind: "code",
      title: "Поменять книги местами",
      minutes: 6,
      description: "На двух полках стоит по книге. Функция Swap получает указатели на две строки и меняет их значения местами.",
      starter: `package main

import "fmt"

func Swap(a, b *string) {
	// твой код
}`,
      harness: `func main() {
	left, right := "Онегин", "Обломов"
	Swap(&left, &right)
	fmt.Println(left, "|", right)
	Swap(&left, &right)
	fmt.Println(left, "|", right)
	x, y := "Ревизор", ""
	Swap(&x, &y)
	fmt.Println(x == "", y)
}`,
      referenceSolution: `package main

import "fmt"

func Swap(a, b *string) {
	tmp := *a
	*a = *b
	*b = tmp
}`,
      hint: "Сохрани значение по первому адресу во временную переменную, иначе оно потеряется при первом же присваивании.",
    },
    {
      id: "data-model-4-discount",
      kind: "code",
      title: "Скидка на заказ",
      minutes: 8,
      description: "Функция ApplyDiscount получает указатель на заказ и процент скидки и меняет цену заказа: новая цена = цена − цена × процент / 100 (целочисленно). Если процент меньше 0 или больше 100, цена не меняется и функция возвращает ошибку.",
      starter: `package main

import "fmt"

type Order struct {
	Dish  string
	Price int
}

func ApplyDiscount(o *Order, percent int) error {
	// твой код
	return nil
}`,
      harness: `func main() {
	o := Order{Dish: "Пицца", Price: 500}
	err := ApplyDiscount(&o, 10)
	fmt.Println(o.Price, err != nil)
	err = ApplyDiscount(&o, 120)
	fmt.Println(o.Price, err != nil)
	err = ApplyDiscount(&o, -5)
	fmt.Println(o.Price, err != nil)
	err = ApplyDiscount(&o, 0)
	fmt.Println(o.Price, err != nil)
	soup := Order{Dish: "Суп", Price: 333}
	err = ApplyDiscount(&soup, 50)
	fmt.Println(soup.Price, err != nil)
	err = ApplyDiscount(&soup, 100)
	fmt.Println(soup.Price, err != nil)
}`,
      referenceSolution: `package main

import "fmt"

type Order struct {
	Dish  string
	Price int
}

func ApplyDiscount(o *Order, percent int) error {
	if percent < 0 || percent > 100 {
		return fmt.Errorf("неверный процент скидки: %d", percent)
	}
	o.Price = o.Price - o.Price*percent/100
	return nil
}`,
      hint: "Сначала проверь процент и при ошибке сразу верни fmt.Errorf(...), ничего не трогая. Поле меняется через указатель так же, как у обычной структуры: o.Price = ...",
    },
    {
      id: "data-model-4-q-copy",
      kind: "quiz",
      title: "Копия или оригинал",
      question: "func setYear(b Book) { b.Year = 2000 }. Какой будет book.Year после вызова setYear(book), если до вызова было 1869?",
      options: [
        "2000, потому что функция поменяла поле",
        "*1869, потому что функция получила копию структуры",
        "Программа не скомпилируется: поля структуры в функции менять нельзя",
      ],
      explanation: "Структура передаётся по значению, и функция меняет свою копию. Чтобы изменить оригинал, нужна сигнатура setYear(b *Book) и вызов setYear(&book).",
    },
  ],

  "go-foundations-data-model-5": [
    { challenge: "counter-methods" },
    {
      id: "data-model-5-room-area",
      kind: "code",
      title: "Площадь комнаты",
      minutes: 4,
      description: "У комнаты есть ширина и длина в метрах. Допиши два метода с value receiver: Area возвращает площадь, а Perimeter возвращает периметр.",
      starter: `package main

import "fmt"

type Room struct {
	Width  int
	Length int
}

func (r Room) Area() int {
	// твой код
	return 0
}

func (r Room) Perimeter() int {
	// твой код
	return 0
}`,
      harness: `func main() {
	kitchen := Room{Width: 3, Length: 4}
	fmt.Println(kitchen.Area(), kitchen.Perimeter())
	hall := Room{Width: 2, Length: 7}
	fmt.Println(hall.Area(), hall.Perimeter())
	empty := Room{}
	fmt.Println(empty.Area(), empty.Perimeter())
}`,
      referenceSolution: `package main

import "fmt"

type Room struct {
	Width  int
	Length int
}

func (r Room) Area() int {
	return r.Width * r.Length
}

func (r Room) Perimeter() int {
	return 2 * (r.Width + r.Length)
}`,
      hint: "Внутри метода поля доступны через получатель: r.Width и r.Length.",
    },
    {
      id: "data-model-5-thermostat-fix",
      kind: "code",
      title: "Термостат не греет",
      minutes: 6,
      description: "Метод Raise должен поднимать целевую температуру термостата на step градусов, но не выше 30. Сейчас после вызова ничего не меняется. Найди причину и исправь, логику внутри метода трогать не нужно.",
      starter: `package main

import "fmt"

type Thermostat struct {
	Target int
}

func (t Thermostat) Raise(step int) {
	t.Target += step
	if t.Target > 30 {
		t.Target = 30
	}
}`,
      harness: `func main() {
	t := Thermostat{Target: 20}
	t.Raise(3)
	fmt.Println(t.Target)
	t.Raise(10)
	fmt.Println(t.Target)
	t.Raise(1)
	fmt.Println(t.Target)
}`,
      referenceSolution: `package main

import "fmt"

type Thermostat struct {
	Target int
}

func (t *Thermostat) Raise(step int) {
	t.Target += step
	if t.Target > 30 {
		t.Target = 30
	}
}`,
      hint: "Посмотри на получатель метода: с чем он работает, с самим термостатом или с его копией?",
    },
    {
      id: "data-model-5-hall-tickets",
      kind: "code",
      title: "Билеты в зал",
      minutes: 10,
      description: "В зале Seats мест, из них продано Sold. Метод Free возвращает число свободных мест. Метод Sell продаёт n билетов и возвращает ошибку, если n меньше 1 или свободных мест не хватает; при ошибке продажа не происходит.",
      starter: `package main

import "fmt"

type Hall struct {
	Seats int
	Sold  int
}

func (h Hall) Free() int {
	// твой код
	return 0
}

func (h *Hall) Sell(n int) error {
	// твой код
	return nil
}`,
      harness: `func main() {
	h := Hall{Seats: 10}
	fmt.Println(h.Free())
	err := h.Sell(4)
	fmt.Println(h.Free(), err != nil)
	err = h.Sell(7)
	fmt.Println(h.Free(), err != nil)
	err = h.Sell(0)
	fmt.Println(h.Free(), err != nil)
	err = h.Sell(-2)
	fmt.Println(h.Free(), err != nil)
	err = h.Sell(6)
	fmt.Println(h.Free(), err != nil)
	err = h.Sell(1)
	fmt.Println(h.Free(), err != nil)
}`,
      referenceSolution: `package main

import "fmt"

type Hall struct {
	Seats int
	Sold  int
}

func (h Hall) Free() int {
	return h.Seats - h.Sold
}

func (h *Hall) Sell(n int) error {
	if n < 1 {
		return fmt.Errorf("нужно продать хотя бы один билет")
	}
	if n > h.Free() {
		return fmt.Errorf("свободных мест только %d", h.Free())
	}
	h.Sold += n
	return nil
}`,
      hint: "Free только читает поля, поэтому у него value receiver. В Sell сначала все проверки с ранним return, и только потом h.Sold += n. Внутри Sell можно вызвать h.Free().",
    },
  ],
};
