//go:build ignore

// Проверка проекта Task Tracker курса Godemy.
//
// Запуск из папки вашего проекта:
//
//	go run check.go
//
// или с путём к проекту:
//
//	go run check.go ../task-tracker
//
// Скрипт собирает ваше приложение во временную папку, запускает его
// в отдельной пустой папке и проверяет поведение по контракту курса:
//
//	add "<название>"          добавить задачу
//	list                      показать задачи
//	update <id> "<название>"  переименовать задачу
//	done <id>                 отметить выполненной
//	delete <id>               удалить задачу
//
// Задачи хранятся в tasks.json в текущей папке: массив объектов
// {"id": 1, "title": "...", "done": false}. Ошибки (неизвестная команда,
// неверный или несуществующий id) завершают программу с ненулевым кодом
// и без panic. Текст вывода может быть любым.
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

type task struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

type result struct {
	sprint int
	name   string
	ok     bool
	why    string
}

var (
	results []result
	bin     string
	work    string
)

func check(sprint int, name string, ok bool, why string) {
	results = append(results, result{sprint, name, ok, why})
}

type runOut struct {
	code   int
	output string
}

func run(args ...string) runOut {
	cmd := exec.Command(bin, args...)
	cmd.Dir = work
	out, err := cmd.CombinedOutput()
	code := 0
	if err != nil {
		if exit, ok := err.(*exec.ExitError); ok {
			code = exit.ExitCode()
		} else {
			code = -1
		}
	}
	return runOut{code, string(out)}
}

func panicked(r runOut) bool {
	return strings.Contains(r.output, "panic:") || strings.Contains(r.output, "goroutine 1 [")
}

func load() ([]task, error) {
	data, err := os.ReadFile(filepath.Join(work, "tasks.json"))
	if err != nil {
		return nil, err
	}
	var tasks []task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, fmt.Errorf("tasks.json не разбирается как массив задач: %v", err)
	}
	return tasks, nil
}

func reset() {
	os.Remove(filepath.Join(work, "tasks.json"))
}

func byID(tasks []task, id int) *task {
	for i := range tasks {
		if tasks[i].ID == id {
			return &tasks[i]
		}
	}
	return nil
}

func main() {
	project := "."
	if len(os.Args) > 1 {
		project = os.Args[1]
	}
	project, _ = filepath.Abs(project)

	tmp, err := os.MkdirTemp("", "godemy-check-")
	if err != nil {
		fmt.Println("Не удалось создать временную папку:", err)
		os.Exit(2)
	}
	defer os.RemoveAll(tmp)
	work = filepath.Join(tmp, "run")
	os.Mkdir(work, 0o755)
	bin = filepath.Join(tmp, "app")
	if runtime.GOOS == "windows" {
		bin += ".exe"
	}

	fmt.Println("Проверяю проект:", project)
	build := exec.Command("go", "build", "-o", bin, ".")
	build.Dir = project
	if out, err := build.CombinedOutput(); err != nil {
		fmt.Println("\n✗ Проект не собирается (go build .):")
		fmt.Println(string(out))
		os.Exit(1)
	}
	check(1, "Проект собирается (go build .)", true, "")

	// Спринт 1: добавление и список.
	reset()
	r := run("list")
	check(1, "list на пустом списке не падает", r.code == 0 && !panicked(r), "код выхода "+fmt.Sprint(r.code)+"\n"+r.output)
	a := run("add", "Купить молоко")
	b := run("add", "Написать тесты")
	tasks, err := load()
	switch {
	case a.code != 0 || b.code != 0:
		check(1, "add добавляет задачи", false, "add завершился с ошибкой:\n"+a.output+b.output)
		check(1, "У задач уникальные ID", false, "задачи не добавились")
	case err != nil:
		check(1, "add добавляет задачи", false, "после add нет корректного tasks.json: "+err.Error())
		check(1, "У задач уникальные ID", false, "задачи не добавились")
	default:
		ok := len(tasks) == 2 && tasks[0].Title == "Купить молоко" && tasks[1].Title == "Написать тесты" && !tasks[0].Done
		check(1, "add добавляет задачи", ok, fmt.Sprintf("ожидались 2 невыполненные задачи с этими названиями, в tasks.json: %+v", tasks))
		check(1, "У задач уникальные ID", len(tasks) == 2 && tasks[0].ID != tasks[1].ID && tasks[0].ID > 0, fmt.Sprintf("ID: %+v", tasks))
	}
	r = run("list")
	check(1, "list показывает добавленные задачи", r.code == 0 && strings.Contains(r.output, "Купить молоко") && strings.Contains(r.output, "Написать тесты"), "в выводе list нет названий задач:\n"+r.output)
	r = run("add")
	check(1, "add без названия — ошибка, а не пустая задача", r.code != 0 && !panicked(r), "ожидался ненулевой код выхода без panic, получено "+fmt.Sprint(r.code)+"\n"+r.output)
	r = run("fly")
	check(1, "Неизвестная команда — понятная ошибка", r.code != 0 && !panicked(r), "ожидался ненулевой код выхода без panic, получено "+fmt.Sprint(r.code))

	// Спринт 2: управление по ID.
	reset()
	run("add", "Первая")
	run("add", "Вторая")
	run("add", "Третья")
	tasks, _ = load()
	if len(tasks) != 3 {
		for _, name := range []string{"update меняет название по ID", "done отмечает задачу выполненной", "delete удаляет только нужную задачу", "ID не повторяются после удаления", "Ошибка для: done 999", "Ошибка для: delete 999", "Ошибка для: update 999 x", "Ошибка для: done abc", "Ошибка для: done"} {
			check(2, name, false, "не удалось подготовить три задачи командой add")
		}
	} else {
		id1, id2, id3 := tasks[0].ID, tasks[1].ID, tasks[2].ID
		r = run("update", fmt.Sprint(id2), "Вторая, исправленная")
		tasks, _ = load()
		t := byID(tasks, id2)
		check(2, "update меняет название по ID", r.code == 0 && t != nil && t.Title == "Вторая, исправленная", r.output)
		r = run("done", fmt.Sprint(id1))
		tasks, _ = load()
		t = byID(tasks, id1)
		check(2, "done отмечает задачу выполненной", r.code == 0 && t != nil && t.Done && !byID(tasks, id3).Done, r.output)
		r = run("delete", fmt.Sprint(id2))
		tasks, _ = load()
		ok := r.code == 0 && len(tasks) == 2 && byID(tasks, id2) == nil && byID(tasks, id1) != nil && byID(tasks, id3) != nil && byID(tasks, id3).Title == "Третья"
		check(2, "delete удаляет только нужную задачу", ok, fmt.Sprintf("после delete %d в tasks.json: %+v", id2, tasks))
		run("add", "Четвёртая")
		tasks, _ = load()
		ids := map[int]bool{}
		for _, x := range tasks {
			ids[x.ID] = true
		}
		check(2, "ID не повторяются после удаления", len(ids) == len(tasks) && len(tasks) == 3, fmt.Sprintf("у задач совпадают ID: %+v", tasks))
		for _, args := range [][]string{{"done", "999"}, {"delete", "999"}, {"update", "999", "x"}, {"done", "abc"}, {"done"}} {
			r = run(args...)
			check(2, "Ошибка для: "+strings.Join(args, " "), r.code != 0 && !panicked(r), "ожидался ненулевой код выхода без panic, получено "+fmt.Sprint(r.code)+"\n"+r.output)
		}
	}

	// Спринт 3: хранение.
	reset()
	run("add", "Пережить перезапуск")
	data, err := os.ReadFile(filepath.Join(work, "tasks.json"))
	check(3, "Данные сохраняются в tasks.json", err == nil && strings.Contains(string(data), "Пережить перезапуск"), "файл tasks.json не найден или пуст")
	r = run("list")
	check(3, "Новый запуск видит сохранённые задачи", strings.Contains(r.output, "Пережить перезапуск"), r.output)
	check(3, "JSON читаемый (с отступами)", strings.Contains(string(data), "\n  "), "используйте json.MarshalIndent")
	os.WriteFile(filepath.Join(work, "tasks.json"), []byte("{это не json"), 0o644)
	r = run("list")
	check(3, "Повреждённый tasks.json — ошибка без panic", r.code != 0 && !panicked(r), "ожидался ненулевой код выхода и понятное сообщение, получено "+fmt.Sprint(r.code)+"\n"+r.output)
	after, _ := os.ReadFile(filepath.Join(work, "tasks.json"))
	r = run("add", "x")
	after2, _ := os.ReadFile(filepath.Join(work, "tasks.json"))
	check(3, "Повреждённый файл не перезаписывается молча", string(after) == "{это не json" && string(after2) == "{это не json" && r.code != 0, "команды поверх повреждённого tasks.json не должны стирать данные пользователя")
	entries, _ := os.ReadDir(work)
	leftover := ""
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".tmp") {
			leftover = e.Name()
		}
	}
	check(3, "Не остаётся временных .tmp файлов", leftover == "", "в папке остался "+leftover)

	// Спринт 4: качество и релиз.
	test := exec.Command("go", "test", "./...")
	test.Dir = project
	out, err := test.CombinedOutput()
	hasTests := !strings.Contains(string(out), "no test files") || strings.Contains(string(out), "ok ")
	check(4, "go test ./... проходит", err == nil && hasTests, string(out))
	fmtOut, _ := exec.Command("gofmt", "-l", project).CombinedOutput()
	check(4, "Код отформатирован (gofmt -l пусто)", strings.TrimSpace(string(fmtOut)) == "", "не отформатированы:\n"+string(fmtOut))
	readme, err := os.ReadFile(filepath.Join(project, "README.md"))
	check(4, "README.md описывает команды", err == nil && strings.Contains(string(readme), "add") && strings.Contains(string(readme), "list"), "README.md отсутствует или не упоминает add и list")
	gi, _ := os.ReadFile(filepath.Join(project, ".gitignore"))
	check(4, "tasks.json в .gitignore", strings.Contains(string(gi), "tasks.json"), "добавьте tasks.json в .gitignore")

	// Отчёт.
	passed := 0
	for sprint := 1; sprint <= 4; sprint++ {
		fmt.Printf("\nСпринт %d\n", sprint)
		for _, res := range results {
			if res.sprint != sprint {
				continue
			}
			if res.ok {
				passed++
				fmt.Println("  ✓", res.name)
			} else {
				fmt.Println("  ✗", res.name)
				for _, line := range strings.Split(strings.TrimSpace(res.why), "\n") {
					if line != "" {
						fmt.Println("      ", line)
					}
				}
			}
		}
	}
	fmt.Printf("\nИтог: %d из %d проверок\n", passed, len(results))
	if passed != len(results) {
		os.Exit(1)
	}
}
