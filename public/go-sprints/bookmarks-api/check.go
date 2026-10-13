//go:build ignore

// Проверка проекта «Bookmarks API» курса Godemy (спринт «Первый HTTP-сервер»).
//
// Запуск из папки твоего проекта:
//
//	go run check.go
//
// или с путём к проекту:
//
//	go run check.go ../bookmarks-api
//
// Скрипт собирает твой сервер, запускает его на свободном порту (порт
// передаётся в переменной окружения PORT) и отправляет настоящие HTTP-запросы
// по контракту спринта:
//
//	GET    /health            200 {"status":"ok"}
//	POST   /bookmarks         201 созданная закладка
//	GET    /bookmarks         200 массив закладок
//	GET    /bookmarks/{id}    200 одна закладка
//	PUT    /bookmarks/{id}    200 изменённая закладка
//	DELETE /bookmarks/{id}    204 без тела
//
// Закладка: {"id": 1, "url": "https://go.dev", "title": "Go", "created_at": "2026-01-02T15:04:05Z"}.
// Ошибка: {"error": "понятный текст"} и код 400, 404 или 405.
// Тексты ошибок могут быть любыми. Данные хранятся в памяти.
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

const startCheck = "Сервер слушает порт из PORT"

var steps = []string{
	"",
	"Сервер запускается",
	"Создание и список",
	"Одна закладка: чтение, изменение, удаление",
	"Ошибки",
	"Надёжность",
	"Качество",
}

type result struct {
	step int
	name string
	ok   bool
	why  string
}

var (
	results  []result
	base     string
	client   = &http.Client{Timeout: 5 * time.Second}
	exited   = make(chan struct{})
	serverUp bool
	raceOn   bool
	logs     bytes.Buffer
)

func check(step int, name string, ok bool, why string) {
	results = append(results, result{step, name, ok, why})
}

type reply struct {
	code   int
	body   string
	ctype  string
	failed string
}

func call(method, path, body string) reply {
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	req, err := http.NewRequest(method, base+path, reader)
	if err != nil {
		return reply{failed: err.Error()}
	}
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := client.Do(req)
	if err != nil {
		return reply{failed: "запрос не выполнен: " + err.Error()}
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	return reply{code: resp.StatusCode, body: string(data), ctype: resp.Header.Get("Content-Type")}
}

func (r reply) describe() string {
	if r.failed != "" {
		return r.failed
	}
	body := strings.TrimSpace(r.body)
	if len(body) > 300 {
		body = body[:300] + "…"
	}
	return fmt.Sprintf("получен код %d, тело: %s", r.code, body)
}

func (r reply) isJSON() bool {
	return strings.HasPrefix(r.ctype, "application/json")
}

type bookmark struct {
	ID        int    `json:"id"`
	URL       string `json:"url"`
	Title     string `json:"title"`
	CreatedAt string `json:"created_at"`
}

func asBookmark(r reply) (bookmark, bool) {
	var b bookmark
	if json.Unmarshal([]byte(r.body), &b) != nil {
		return b, false
	}
	return b, true
}

func asList(r reply) ([]bookmark, bool) {
	trimmed := strings.TrimSpace(r.body)
	if !strings.HasPrefix(trimmed, "[") {
		return nil, false
	}
	var list []bookmark
	if json.Unmarshal([]byte(trimmed), &list) != nil {
		return nil, false
	}
	return list, true
}

func errorText(r reply) string {
	var e struct {
		Error string `json:"error"`
	}
	if json.Unmarshal([]byte(r.body), &e) != nil {
		return ""
	}
	return e.Error
}

func alive() bool {
	select {
	case <-exited:
		return false
	default:
	}
	return call("GET", "/health", "").code == http.StatusOK
}

func freePort() (int, error) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
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
	bin := filepath.Join(tmp, "app")
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

	// Сборка с детектором гонок находит одновременный доступ к данным, даже
	// если в этот раз он ничего не сломал. На некоторых системах ей нужен
	// компилятор C; если его нет, сервер запускается из обычной сборки.
	raceBin := filepath.Join(tmp, "app-race")
	if runtime.GOOS == "windows" {
		raceBin += ".exe"
	}
	raceBuild := exec.Command("go", "build", "-race", "-o", raceBin, ".")
	raceBuild.Dir = project
	if err := raceBuild.Run(); err == nil {
		bin, raceOn = raceBin, true
	}

	port, err := freePort()
	if err != nil {
		fmt.Println("Не удалось найти свободный порт:", err)
		os.Exit(2)
	}
	base = fmt.Sprintf("http://127.0.0.1:%d", port)

	server := exec.Command(bin)
	server.Dir = tmp
	server.Env = append(os.Environ(), fmt.Sprintf("PORT=%d", port))
	server.Stdout = &logs
	server.Stderr = &logs
	if err := server.Start(); err != nil {
		fmt.Println("Не удалось запустить сервер:", err)
		os.Exit(2)
	}
	go func() {
		server.Wait()
		close(exited)
	}()
	defer server.Process.Kill()

	// Шаг 1: сервер поднимается и отвечает на /health.
	started := false
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) && !started {
		select {
		case <-exited:
			deadline = time.Now()
		default:
			if call("GET", "/health", "").code != 0 {
				started = true
			} else {
				time.Sleep(100 * time.Millisecond)
			}
		}
	}
	why := fmt.Sprintf("сервер не ответил на %s/health за 5 секунд. Он должен слушать порт из переменной окружения PORT и не завершаться.", base)
	if out := strings.TrimSpace(logs.String()); out != "" {
		why += "\nВывод программы:\n" + out
	}
	check(1, startCheck, started, why)

	serverUp = started
	network()

	quality(project)
	report()
}

func network() {
	// Шаг 1.
	r := call("GET", "/health", "")
	var health struct {
		Status string `json:"status"`
	}
	json.Unmarshal([]byte(r.body), &health)
	check(1, "GET /health отвечает 200 и {\"status\":\"ok\"}", r.code == 200 && health.Status == "ok", r.describe())
	check(1, "Ответ помечен как JSON (Content-Type: application/json)", r.isJSON(), "получен Content-Type: "+r.ctype)

	// Шаг 2: создание и список.
	r = call("GET", "/bookmarks", "")
	list, isList := asList(r)
	check(2, "Пустой список — это [] с кодом 200, а не null", r.code == 200 && isList && len(list) == 0, r.describe())

	r = call("POST", "/bookmarks", `{"url":"https://go.dev","title":"Go"}`)
	first, ok := asBookmark(r)
	check(2, "POST /bookmarks создаёт закладку и отвечает 201", r.code == 201 && ok && first.ID > 0, r.describe())
	check(2, "В ответе те же url и title, что в запросе", first.URL == "https://go.dev" && first.Title == "Go", r.describe())
	_, timeErr := time.Parse(time.RFC3339, first.CreatedAt)
	check(2, "created_at — время в формате RFC 3339", timeErr == nil, "получено created_at: \""+first.CreatedAt+"\". В Go time.Time в JSON уже выглядит так.")
	check(2, "Ответ на POST помечен как JSON", r.isJSON(), "получен Content-Type: "+r.ctype)

	r = call("POST", "/bookmarks", `{"url":"https://pkg.go.dev/net/http","title":"Документация net/http"}`)
	second, _ := asBookmark(r)
	check(2, "У каждой закладки свой id, id растут", r.code == 201 && second.ID > first.ID, fmt.Sprintf("первая закладка получила id %d, вторая — %d", first.ID, second.ID))

	r = call("GET", "/bookmarks", "")
	list, isList = asList(r)
	inOrder := isList && len(list) == 2 && list[0].ID == first.ID && list[1].ID == second.ID
	check(2, "GET /bookmarks возвращает закладки в порядке создания", r.code == 200 && inOrder, r.describe())

	// Шаг 3: одна закладка.
	r = call("GET", fmt.Sprintf("/bookmarks/%d", first.ID), "")
	got, _ := asBookmark(r)
	check(3, "GET /bookmarks/{id} возвращает нужную закладку", r.code == 200 && got.ID == first.ID && got.Title == "Go", r.describe())

	r = call("PUT", fmt.Sprintf("/bookmarks/%d", first.ID), `{"url":"https://go.dev/doc","title":"Документация Go"}`)
	updated, _ := asBookmark(r)
	check(3, "PUT /bookmarks/{id} меняет закладку и отвечает 200", r.code == 200 && updated.Title == "Документация Go" && updated.URL == "https://go.dev/doc", r.describe())
	check(3, "После PUT id и created_at остались прежними", updated.ID > 0 && updated.ID == first.ID && updated.CreatedAt == first.CreatedAt, fmt.Sprintf("было id %d и created_at %s, стало id %d и created_at %s", first.ID, first.CreatedAt, updated.ID, updated.CreatedAt))
	r = call("GET", fmt.Sprintf("/bookmarks/%d", first.ID), "")
	got, _ = asBookmark(r)
	check(3, "Изменение видно при следующем GET", got.Title == "Документация Go", r.describe())

	r = call("DELETE", fmt.Sprintf("/bookmarks/%d", first.ID), "")
	check(3, "DELETE /bookmarks/{id} отвечает 204 без тела", r.code == 204 && strings.TrimSpace(r.body) == "", r.describe())
	r = call("GET", fmt.Sprintf("/bookmarks/%d", first.ID), "")
	check(3, "Удалённая закладка больше не находится (404)", r.code == 404, r.describe())
	r = call("GET", "/bookmarks", "")
	list, _ = asList(r)
	check(3, "Удаление не трогает соседние закладки", len(list) == 1 && list[0].ID == second.ID, r.describe())
	r = call("POST", "/bookmarks", `{"url":"https://go.dev/blog","title":"Блог Go"}`)
	third, _ := asBookmark(r)
	check(3, "id удалённой закладки не выдаётся повторно", r.code == 201 && third.ID > second.ID, fmt.Sprintf("после удаления id %d новая закладка получила id %d", first.ID, third.ID))

	// Шаг 4: ошибки.
	before, _ := asList(call("GET", "/bookmarks", ""))
	r = call("POST", "/bookmarks", `это не JSON`)
	check(4, "Тело не JSON — код 400", r.code == 400, r.describe())
	check(4, "Ошибка приходит как JSON {\"error\": \"...\"}", r.isJSON() && errorText(r) != "", r.describe()+", Content-Type: "+r.ctype)
	r = call("POST", "/bookmarks", `{"url":"https://go.dev","title":"   "}`)
	check(4, "Пустой title — код 400", r.code == 400, r.describe())
	r = call("POST", "/bookmarks", `{"url":"go.dev","title":"Go"}`)
	check(4, "url без http:// или https:// — код 400", r.code == 400, r.describe())
	after, listed := asList(call("GET", "/bookmarks", ""))
	check(4, "Неверные запросы ничего не создают", listed && len(after) == len(before), fmt.Sprintf("до неверных запросов закладок было %d, после — %d", len(before), len(after)))
	r = call("GET", "/bookmarks/999999", "")
	check(4, "Несуществующий id — код 404 и JSON с error", r.code == 404 && errorText(r) != "", r.describe())
	r = call("GET", "/bookmarks/abc", "")
	check(4, "id не число — код 400", r.code == 400, r.describe())
	r = call("PUT", "/bookmarks/999999", `{"url":"https://go.dev","title":"Go"}`)
	check(4, "PUT несуществующей закладки — 404", r.code == 404, r.describe())
	r = call("PUT", fmt.Sprintf("/bookmarks/%d", second.ID), `{"url":"https://go.dev","title":""}`)
	kept, _ := asBookmark(call("GET", fmt.Sprintf("/bookmarks/%d", second.ID), ""))
	check(4, "PUT с пустым title — 400, закладка не меняется", r.code == 400 && kept.Title == second.Title, r.describe()+fmt.Sprintf("; title после запроса: %q", kept.Title))
	r = call("DELETE", "/bookmarks/999999", "")
	check(4, "DELETE несуществующей закладки — 404", r.code == 404, r.describe())
	r = call("PATCH", "/bookmarks", `{}`)
	check(4, "Неподдерживаемый метод — код 405", r.code == 405, r.describe())
	check(4, "После ошибочных запросов сервер продолжает работать", alive(), "сервер перестал отвечать на /health")

	// Шаг 5: надёжность.
	before, _ = asList(call("GET", "/bookmarks", ""))
	const parallel = 100
	codes := make([]int, parallel)
	ids := make([]int, parallel)
	var wg sync.WaitGroup
	for i := 0; i < parallel; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			resp := call("POST", "/bookmarks", fmt.Sprintf(`{"url":"https://example.com/%d","title":"Страница %d"}`, i, i))
			b, _ := asBookmark(resp)
			codes[i], ids[i] = resp.code, b.ID
		}(i)
	}
	wg.Wait()
	created := 0
	unique := map[int]bool{}
	for i := range codes {
		if codes[i] == 201 {
			created++
		}
		unique[ids[i]] = true
	}
	check(5, "100 одновременных POST — все получили 201", created == parallel, fmt.Sprintf("201 получили только %d запросов из %d", created, parallel))
	check(5, "У одновременно созданных закладок нет одинаковых id", len(unique) == parallel, fmt.Sprintf("разных id получилось %d из %d — доступ к данным нужно защитить sync.Mutex", len(unique), parallel))
	after, _ = asList(call("GET", "/bookmarks", ""))
	check(5, "Ни одна закладка не потерялась", len(after) == len(before)+parallel, fmt.Sprintf("ожидалось %d закладок, в списке %d", len(before)+parallel, len(after)))
	if raceOn {
		raced := strings.Contains(logs.String(), "WARNING: DATA RACE")
		check(5, "Детектор гонок не нашёл одновременного доступа к данным", serverUp && !raced, "несколько запросов читают и меняют одни данные без защиты. Закрой доступ к ним sync.Mutex.")
	}
	check(5, "Сервер пережил нагрузку", alive(), "сервер упал или перестал отвечать — посмотри его вывод, частая причина: fatal error: concurrent map writes")
}

func quality(project string) {
	vet := exec.Command("go", "vet", "./...")
	vet.Dir = project
	out, err := vet.CombinedOutput()
	check(6, "go vet ./... без замечаний", err == nil, string(out))

	test := exec.Command("go", "test", "./...")
	test.Dir = project
	out, err = test.CombinedOutput()
	hasTests := strings.Contains(string(out), "ok ")
	check(6, "Есть тесты, и go test ./... проходит", err == nil && hasTests, "нужен хотя бы один тест хэндлера (httptest).\n"+string(out))

	fmtOut, _ := exec.Command("gofmt", "-l", project).CombinedOutput()
	check(6, "Код отформатирован (gofmt -l пусто)", strings.TrimSpace(string(fmtOut)) == "", "не отформатированы:\n"+string(fmtOut))

	readme, err := os.ReadFile(filepath.Join(project, "README.md"))
	text := string(readme)
	check(6, "README.md объясняет запуск и маршруты", err == nil && strings.Contains(text, "go run") && strings.Contains(text, "PORT") && strings.Contains(text, "/bookmarks"), "в README.md должны быть команда запуска (go run), переменная PORT и маршруты /bookmarks")

	_, err = os.Stat(filepath.Join(project, ".github", "workflows", "godemy-check.yml"))
	check(6, "В репозитории есть .github/workflows/godemy-check.yml", err == nil, "скачай файл со страницы спринта: он запускает эту же проверку на GitHub при каждом push")
}

func report() {
	passed := 0
	for step := 1; step < len(steps); step++ {
		fmt.Printf("\nШаг %d. %s\n", step, steps[step])
		for _, res := range results {
			if res.step != step {
				continue
			}
			if res.ok {
				passed++
				fmt.Println("  ✓", res.name)
				continue
			}
			fmt.Println("  ✗", res.name)
			if !serverUp && res.step < 6 && res.name != startCheck {
				continue // причина одна и уже названа: сервер не запустился
			}
			for _, line := range strings.Split(strings.TrimSpace(res.why), "\n") {
				if line != "" {
					fmt.Println("      ", line)
				}
			}
		}
	}
	fmt.Printf("\nИтог: %d из %d проверок\n", passed, len(results))
	if !raceOn {
		fmt.Println("Детектор гонок на этой системе недоступен, эта проверка пропущена. На GitHub она выполнится.")
	}
	if passed != len(results) {
		os.Exit(1)
	}
	fmt.Println("Всё готово. Сделай push и вставь ссылку на репозиторий на странице спринта.")
}
