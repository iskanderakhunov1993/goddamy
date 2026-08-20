export const goChallenges = [
  {
    id: "sum-even",
    title: "Сумма чётных чисел",
    category: "Слайсы",
    level: "Лёгкая",
    minutes: 8,
    description: "Напишите функцию, которая складывает только чётные значения слайса.",
    starter: `package main

import "fmt"

func SumEven(nums []int) int {
	// ваш код
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
    hint: "Используйте range и проверку n % 2 == 0, накапливая сумму в отдельной переменной.",
  },
  {
    id: "word-frequency",
    title: "Частотный словарь",
    category: "Map",
    level: "Лёгкая",
    minutes: 12,
    description: "Посчитайте, сколько раз каждое слово встретилось в сообщении пользователя.",
    starter: `package main

import (
	"fmt"
	"sort"
)

func WordFrequency(words []string) map[string]int {
	result := make(map[string]int)
	// ваш код
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
    description: "Найдите задачу в слайсе структур и измените её статус.",
    starter: `package main

import (
	"errors"
	"fmt"
)

type Task struct {
	ID     int
	Status string
}

func SetStatus(tasks []Task, id int, status string) error {
	// ваш код
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
    hint: "Итерируйтесь по индексу (for i := range tasks), если хотите изменить элемент слайса на месте.",
  },
  {
    id: "expense-total",
    title: "Отчёт по категориям",
    category: "Map",
    level: "Средняя",
    minutes: 18,
    description: "Соберите суммы расходов по категориям для еженедельного отчёта.",
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
	// ваш код
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
    hint: "Сначала создайте map через make, затем накапливайте totals[it.Category] += it.Amount.",
  },
  {
    id: "safe-parse",
    title: "Безопасный разбор команды",
    category: "Ошибки",
    level: "Средняя",
    minutes: 16,
    description: "Проверьте пользовательскую команду и верните понятную ошибку вместо panic.",
    starter: `package main

import (
	"errors"
	"fmt"
	"strings"
)

func ParseCommand(input string) (string, error) {
	// ваш код
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
    hint: "Обрежьте пробелы через strings.TrimSpace и опишите пустой ввод через errors.New.",
  },
  {
    id: "json-backup",
    title: "JSON-резервная копия",
    category: "JSON",
    level: "Средняя",
    minutes: 20,
    description: "Сериализуйте список задач и корректно сообщите о повреждённом файле.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

func LoadTasks(data []byte) ([]string, error) {
	// ваш код
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
    hint: "Используйте json.Unmarshal(data, &tasks) и оборачивайте ошибку через fmt.Errorf с %w.",
  },
  {
    id: "http-status",
    title: "HTTP-ответ для API",
    category: "HTTP",
    level: "Средняя",
    minutes: 18,
    description: "Верните JSON-ответ и правильный статус для создания расхода.",
    starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func CreateExpense(w http.ResponseWriter, r *http.Request) {
	// ваш код
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
    hint: "Для созданного ресурса используйте w.WriteHeader(http.StatusCreated) — это 201.",
  },
  {
    id: "worker-pool",
    title: "Мини worker pool",
    category: "Конкурентность",
    level: "Сложная",
    minutes: 28,
    description: "Распределите обработку ссылок между несколькими воркерами.",
    starter: `package main

import (
	"fmt"
	"strings"
	"sync"
)

func Process(jobs []string, workers int) []string {
	// ваш код
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
    hint: "Пишите результат по индексу results[i] — тогда порядок не зависит от того, какой воркер каким job'ом занялся.",
  },
  {
    id: "request-timeout",
    title: "Таймаут внешнего запроса",
    category: "Context",
    level: "Сложная",
    minutes: 24,
    description: "Добавьте deadline к операции, чтобы сервис не зависал на внешнем API.",
    starter: `package main

import (
	"context"
	"fmt"
	"time"
)

func Fetch(ctx context.Context, url string) error {
	// ваш код
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
    hint: "Создайте дочерний контекст через context.WithTimeout, не забудьте defer cancel(), и слушайте ctx.Done() в select.",
  },
];

export const getGoChallenge = (id) => goChallenges.find((item) => item.id === id) || goChallenges[0];
