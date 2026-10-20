export const goChallenges = [
  {
    id: "greeting",
    title: "Приветствие",
    category: "Основы",
    level: "Лёгкая",
    minutes: 5,
    description: "Напиши функцию, которая возвращает приветствие по имени: для имени «Анна» получится «Привет, Анна!».",
    starter: `package main

import "fmt"

func Greeting(name string) string {
	// твой код
	return ""
}`,
    harness: `func main() {
	fmt.Println(Greeting("Анна"))
	fmt.Println(Greeting("Go"))
}`,
    referenceSolution: `package main

import "fmt"

func Greeting(name string) string {
	return "Привет, " + name + "!"
}`,
    hint: "Строки складываются оператором +. Не забудь запятую с пробелом и восклицательный знак.",
  },
  {
    id: "seconds",
    title: "Сколько секунд",
    category: "Основы",
    level: "Лёгкая",
    minutes: 6,
    description: "Переведи время в секунды: функция получает часы и минуты и возвращает общее число секунд.",
    starter: `package main

import "fmt"

func Seconds(hours, minutes int) int {
	// твой код
	return 0
}`,
    harness: `func main() {
	fmt.Println(Seconds(1, 0))
	fmt.Println(Seconds(0, 15))
	fmt.Println(Seconds(2, 30))
}`,
    referenceSolution: `package main

import "fmt"

func Seconds(hours, minutes int) int {
	total := hours*3600 + minutes*60
	return total
}`,
    hint: "В часе 3600 секунд, в минуте 60. Посчитай обе части и сложи в одной переменной.",
  },
  {
    id: "grade",
    title: "Оценка по баллам",
    category: "Условия",
    level: "Лёгкая",
    minutes: 8,
    description: "Верни оценку по числу баллов: от 90 — «отлично», от 70 — «хорошо», от 50 — «зачёт», меньше — «незачёт».",
    starter: `package main

import "fmt"

func Grade(score int) string {
	// твой код
	return ""
}`,
    harness: `func main() {
	fmt.Println(Grade(95))
	fmt.Println(Grade(90))
	fmt.Println(Grade(71))
	fmt.Println(Grade(50))
	fmt.Println(Grade(12))
}`,
    referenceSolution: `package main

import "fmt"

func Grade(score int) string {
	switch {
	case score >= 90:
		return "отлично"
	case score >= 70:
		return "хорошо"
	case score >= 50:
		return "зачёт"
	default:
		return "незачёт"
	}
}`,
    hint: "Проверяй условия сверху вниз, от большего порога к меньшему: подойдёт цепочка if / else if или switch без выражения.",
  },
  {
    id: "factorial",
    title: "Факториал",
    category: "Циклы",
    level: "Лёгкая",
    minutes: 8,
    description: "Посчитай факториал числа: произведение всех целых от 1 до n. Факториал нуля равен 1.",
    starter: `package main

import "fmt"

func Factorial(n int) int {
	// твой код
	return 0
}`,
    harness: `func main() {
	fmt.Println(Factorial(0))
	fmt.Println(Factorial(1))
	fmt.Println(Factorial(5))
	fmt.Println(Factorial(10))
}`,
    referenceSolution: `package main

import "fmt"

func Factorial(n int) int {
	result := 1
	for i := 2; i <= n; i++ {
		result *= i
	}
	return result
}`,
    hint: "Начни с result := 1 и в цикле for умножай его на числа от 2 до n. Для нуля цикл не выполнится ни разу.",
  },
  {
    id: "book-card",
    title: "Карточка книги",
    category: "Структуры",
    level: "Лёгкая",
    minutes: 8,
    description: "Опиши книгу одной строкой: для книги «Идиот» 1869 года функция возвращает «Идиот (1869)».",
    starter: `package main

import "fmt"

type Book struct {
	Title string
	Year  int
}

func Describe(b Book) string {
	// твой код
	return ""
}`,
    harness: `func main() {
	fmt.Println(Describe(Book{Title: "Идиот", Year: 1869}))
	fmt.Println(Describe(Book{Title: "Мастер и Маргарита", Year: 1967}))
}`,
    referenceSolution: `package main

import "fmt"

type Book struct {
	Title string
	Year  int
}

func Describe(b Book) string {
	return fmt.Sprintf("%s (%d)", b.Title, b.Year)
}`,
    hint: "К полям структуры обращаются через точку: b.Title и b.Year. Строку удобно собрать через fmt.Sprintf с %s и %d.",
  },
  {
    id: "rename-task",
    title: "Переименовать задачу",
    category: "Указатели",
    level: "Лёгкая",
    minutes: 10,
    description: "Функция получает указатель на задачу и меняет её название. После вызова у исходной задачи должно быть новое название.",
    starter: `package main

import "fmt"

type Task struct {
	ID    int
	Title string
}

func Rename(t *Task, title string) {
	// твой код
}`,
    harness: `func main() {
	task := Task{ID: 1, Title: "Черновик"}
	Rename(&task, "Купить билеты")
	fmt.Println(task.ID, task.Title)
	Rename(&task, "Сдать отчёт")
	fmt.Println(task.ID, task.Title)
}`,
    referenceSolution: `package main

import "fmt"

type Task struct {
	ID    int
	Title string
}

func Rename(t *Task, title string) {
	t.Title = title
}`,
    hint: "Через указатель поле меняется так же, как у обычной структуры: t.Title = title. Go сам разыменует указатель.",
  },
  {
    id: "counter-methods",
    title: "Счётчик с методами",
    category: "Методы",
    level: "Лёгкая",
    minutes: 10,
    description: "Допиши два метода счётчика: Inc увеличивает значение на единицу, Value возвращает текущее значение.",
    starter: `package main

import "fmt"

type Counter struct {
	value int
}

func (c *Counter) Inc() {
	// твой код
}

func (c *Counter) Value() int {
	// твой код
	return 0
}`,
    harness: `func main() {
	counter := Counter{}
	fmt.Println(counter.Value())
	counter.Inc()
	counter.Inc()
	counter.Inc()
	fmt.Println(counter.Value())
}`,
    referenceSolution: `package main

import "fmt"

type Counter struct {
	value int
}

func (c *Counter) Inc() {
	c.value++
}

func (c *Counter) Value() int {
	return c.value
}`,
    hint: "У методов указательный получатель (c *Counter), поэтому c.value++ меняет сам счётчик, а не его копию.",
  },
  {
    id: "sum-even",
    title: "Сумма чётных чисел",
    category: "Слайсы",
    level: "Лёгкая",
    minutes: 8,
    description: "Напиши функцию, которая складывает только чётные значения слайса.",
    starter: `package main

import "fmt"

func SumEven(nums []int) int {
	// твой код
	return 0
}`,
    harness: `func main() {
	fmt.Println(SumEven([]int{1, 2, 3, 4, 5, 6}))
	fmt.Println(SumEven([]int{}))
	fmt.Println(SumEven([]int{1, 3, 5}))
}`,
    referenceSolution: `package main

import "fmt"

func SumEven(nums []int) int {
	sum := 0
	for _, n := range nums {
		if n%2 == 0 {
			sum += n
		}
	}
	return sum
}`,
    hint: "Используй range и проверку n % 2 == 0, накапливая сумму в отдельной переменной.",
  },
  {
    id: "word-frequency",
    title: "Частотный словарь",
    category: "Map",
    level: "Лёгкая",
    minutes: 12,
    description: "Посчитай, сколько раз каждое слово встретилось в сообщении пользователя.",
    starter: `package main

import (
	"fmt"
	"sort"
)

func WordFrequency(words []string) map[string]int {
	result := make(map[string]int)
	// твой код
	return result
}`,
    harness: `func main() {
	freq := WordFrequency([]string{"go", "go", "sql", "go", "qa"})
	keys := make([]string, 0, len(freq))
	for k := range freq {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Println(k, freq[k])
	}
}`,
    referenceSolution: `package main

import (
	"fmt"
	"sort"
)

func WordFrequency(words []string) map[string]int {
	result := make(map[string]int)
	for _, w := range words {
		result[w]++
	}
	return result
}`,
    hint: "Map удобно использовать как счётчик: result[w]++ увеличивает значение по ключу.",
  },
  {
    id: "task-status",
    title: "Статус задачи по ID",
    category: "Структуры",
    level: "Лёгкая",
    minutes: 14,
    description: "Найди задачу в слайсе структур и измени её статус.",
    starter: `package main

import "fmt"

type Task struct {
	ID     int
	Status string
}

func SetStatus(tasks []Task, id int, status string) error {
	// твой код
	return nil
}`,
    harness: `func main() {
	tasks := []Task{{ID: 1, Status: "open"}, {ID: 2, Status: "open"}}
	err := SetStatus(tasks, 2, "done")
	fmt.Println(err)
	fmt.Println(tasks[0].Status, tasks[1].Status)
	err2 := SetStatus(tasks, 99, "done")
	fmt.Println(err2)
}`,
    referenceSolution: `package main

import (
	"errors"
	"fmt"
)

type Task struct {
	ID     int
	Status string
}

func SetStatus(tasks []Task, id int, status string) error {
	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Status = status
			return nil
		}
	}
	return errors.New("task not found")
}`,
    hint: "Итерируйся по индексу (for i := range tasks), если хочешь изменить элемент слайса на месте. Пакет errors добавь в import самостоятельно.",
  },
  {
    id: "expense-total",
    title: "Отчёт по категориям",
    category: "Map",
    level: "Средняя",
    minutes: 18,
    description: "Собери суммы расходов по категориям для еженедельного отчёта.",
    starter: `package main

import (
	"fmt"
	"sort"
)

type Expense struct {
	Category string
	Amount   int
}

func Totals(items []Expense) map[string]int {
	// твой код
	return nil
}`,
    harness: `func main() {
	items := []Expense{{"Еда", 1200}, {"Транспорт", 300}, {"Еда", 800}}
	totals := Totals(items)
	keys := make([]string, 0, len(totals))
	for k := range totals {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Println(k, totals[k])
	}
}`,
    referenceSolution: `package main

import (
	"fmt"
	"sort"
)

type Expense struct {
	Category string
	Amount   int
}

func Totals(items []Expense) map[string]int {
	totals := make(map[string]int)
	for _, it := range items {
		totals[it.Category] += it.Amount
	}
	return totals
}`,
    hint: "Сначала создай map через make, затем накапливай totals[it.Category] += it.Amount.",
  },
  {
    id: "safe-parse",
    title: "Безопасный разбор команды",
    category: "Ошибки",
    level: "Средняя",
    minutes: 16,
    description: "Проверь пользовательскую команду и верни понятную ошибку вместо panic.",
    starter: `package main

import "fmt"

func ParseCommand(input string) (string, error) {
	// твой код
	return "", nil
}`,
    harness: `func main() {
	v, err := ParseCommand("  status  ")
	fmt.Println(v, err)
	v2, err2 := ParseCommand("   ")
	fmt.Println(v2, err2)
}`,
    referenceSolution: `package main

import (
	"errors"
	"fmt"
	"strings"
)

func ParseCommand(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return "", errors.New("empty command")
	}
	return trimmed, nil
}`,
    hint: "Обрежь пробелы через strings.TrimSpace и опиши пустой ввод через errors.New. Пакеты errors, strings добавь в import самостоятельно.",
  },
  {
    id: "json-backup",
    title: "JSON-резервная копия",
    category: "JSON",
    level: "Средняя",
    minutes: 20,
    description: "Сериализуй список задач и корректно сообщи о повреждённом файле.",
    starter: `package main

import "fmt"

func LoadTasks(data []byte) ([]string, error) {
	// твой код
	return nil, nil
}`,
    harness: `func main() {
	tasks, err := LoadTasks([]byte(\`["a","b","c"]\`))
	fmt.Println(tasks, err)
	_, err2 := LoadTasks([]byte("not json"))
	fmt.Println(err2 != nil)
}`,
    referenceSolution: `package main

import (
	"encoding/json"
	"fmt"
)

func LoadTasks(data []byte) ([]string, error) {
	var tasks []string
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, fmt.Errorf("corrupted file: %w", err)
	}
	return tasks, nil
}`,
    hint: "Используй json.Unmarshal(data, &tasks) и оборачивай ошибку через fmt.Errorf с %w. Пакет encoding/json добавь в import самостоятельно.",
  },
  {
    id: "http-status",
    title: "HTTP-ответ для API",
    category: "HTTP",
    level: "Средняя",
    minutes: 18,
    description: "Верни JSON-ответ и правильный статус для создания расхода.",
    starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func CreateExpense(w http.ResponseWriter, r *http.Request) {
	// твой код
}`,
    harness: `func main() {
	req := httptest.NewRequest(http.MethodPost, "/expenses", nil)
	rec := httptest.NewRecorder()
	CreateExpense(rec, req)
	fmt.Println(rec.Code)
	fmt.Println(rec.Body.String())
}`,
    referenceSolution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func CreateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(\`{"status":"created"}\`))
}`,
    hint: "Для созданного ресурса используй w.WriteHeader(http.StatusCreated) — это 201.",
  },
  {
    id: "worker-pool",
    title: "Мини worker pool",
    category: "Конкурентность",
    level: "Сложная",
    minutes: 28,
    description: "Распредели обработку ссылок между несколькими воркерами.",
    starter: `package main

import "fmt"

func Process(jobs []string, workers int) []string {
	// твой код
	return nil
}`,
    harness: `func main() {
	out := Process([]string{"go", "sql", "qa"}, 2)
	fmt.Println(out)
}`,
    referenceSolution: `package main

import (
	"fmt"
	"strings"
	"sync"
)

func Process(jobs []string, workers int) []string {
	results := make([]string, len(jobs))
	jobCh := make(chan int)
	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range jobCh {
				results[i] = strings.ToUpper(jobs[i])
			}
		}()
	}
	for i := range jobs {
		jobCh <- i
	}
	close(jobCh)
	wg.Wait()
	return results
}`,
    hint: "Пиши результат по индексу results[i] — тогда порядок не зависит от того, какой воркер каким job'ом занялся. Пакеты strings, sync добавь в import самостоятельно.",
  },
  {
    id: "request-timeout",
    title: "Таймаут внешнего запроса",
    category: "Context",
    level: "Сложная",
    minutes: 24,
    description: "Добавь deadline к операции, чтобы сервис не зависал на внешнем API.",
    starter: `package main

import (
	"context"
	"fmt"
)

func Fetch(ctx context.Context, url string) error {
	// твой код
	return nil
}`,
    harness: `func main() {
	err := Fetch(context.Background(), "https://example.com")
	fmt.Println(err)
}`,
    referenceSolution: `package main

import (
	"context"
	"fmt"
	"time"
)

func Fetch(ctx context.Context, url string) error {
	ctx, cancel := context.WithTimeout(ctx, 50*time.Millisecond)
	defer cancel()
	select {
	case <-time.After(200 * time.Millisecond):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}`,
    hint: "Создай дочерний контекст через context.WithTimeout, не забудь defer cancel(), и слушай ctx.Done() в select. Пакет time добавь в import самостоятельно.",
  },
];

export const getGoChallenge = (id) => goChallenges.find((item) => item.id === id) || goChallenges[0];
