// Спринт «Первый HTTP-сервер»: теория перед проектом Bookmarks API.
// Каждый пример на Go перед публикацией запущен локально (go run / go test) и в Go Playground.
// Примеры показывают приём на другой предметной области и не решают задачу спринта.
export const sprintBookmarksApi = {
  "sprint-bookmarks-api-http-1": {
    summary: "Из чего состоят HTTP-запрос и ответ и как посмотреть на них своими глазами.",
    objectives: [
      "Назвать части запроса: метод, путь, заголовки, тело",
      "Назвать части ответа: код, заголовки, тело",
      "Отправить запрос через curl и прочитать ответ"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Ты открываешь в приложении список закладок. В этот момент телефон отправляет по сети короткий текст — **запрос**. Программа на другом конце, **сервер**, читает его и отправляет текст обратно — **ответ**. Правила, по которым составлены оба текста, называются HTTP.\n\nВ этом спринте ты пишешь ту сторону, которая отвечает."
      },
      {
        type: "image",
        src: "/lessons/http-request-response.svg",
        alt: "Клиент отправляет запрос POST /books, сервер возвращает ответ 201 Created",
        caption: "Один обмен: запрос от клиента и ответ сервера. Оба — обычный текст."
      },
      {
        type: "heading",
        level: 2,
        text: "Из чего состоит запрос"
      },
      {
        type: "list",
        items: [
          "**Метод** — что сделать: `GET` получить, `POST` создать.",
          "**Путь** — с чем это сделать: `/books`.",
          "**Заголовки** — служебные пометки. `Content-Type: application/json` говорит: в теле лежит JSON.",
          "**Тело** — сами данные. У `GET` его обычно нет."
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Из чего состоит ответ"
      },
      {
        type: "list",
        items: [
          "**Код** — трёхзначное число: получилось или нет.",
          "**Заголовки** — те же пометки, только от сервера.",
          "**Тело** — результат или описание ошибки."
        ]
      },
      {
        type: "paragraph",
        text: "Запусти пример. Он печатает запрос и ответ в том виде, в каком они идут по сети."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"net/http/httputil\"\n\t\"strings\"\n)\n\nfunc main() {\n\t// Запрос: клиент просит сервер библиотеки добавить книгу.\n\tbody := strings.NewReader(`{\"title\":\"Мастер и Маргарита\"}`)\n\treq, _ := http.NewRequest(\"POST\", \"http://library.example/books\", body)\n\treq.Header.Set(\"Content-Type\", \"application/json\")\n\n\traw, _ := httputil.DumpRequestOut(req, true)\n\tfmt.Println(\"--- ЗАПРОС ---\")\n\tfmt.Println(strings.ReplaceAll(string(raw), \"\\r\", \"\"))\n\n\t// Ответ: сервер сообщает, что книга создана.\n\trec := httptest.NewRecorder()\n\trec.Header().Set(\"Content-Type\", \"application/json\")\n\trec.WriteHeader(http.StatusCreated)\n\trec.WriteString(`{\"id\":1,\"title\":\"Мастер и Маргарита\"}`)\n\n\traw, _ = httputil.DumpResponse(rec.Result(), true)\n\tfmt.Println(\"\\n--- ОТВЕТ ---\")\n\tfmt.Println(strings.ReplaceAll(string(raw), \"\\r\", \"\"))\n}"
      },
      {
        type: "callout",
        tone: "tip",
        title: "Пустая строка — это граница",
        text: "Заголовки от тела отделяет пустая строка. По ней сервер понимает, где закончились пометки и начались данные."
      },
      {
        type: "heading",
        level: 2,
        text: "Посмотри на настоящий запрос"
      },
      {
        type: "paragraph",
        text: "HTTP-клиент у тебя уже есть — это `curl` в терминале. Флаг `-v` показывает обе стороны обмена: строки с `>` ушли на сервер, строки с `<` пришли обратно."
      },
      {
        type: "code",
        language: "bash",
        code: "curl -v https://go.dev/"
      },
      {
        type: "task",
        title: "Прочитай живой ответ",
        text: "Выполни команду выше и найди в выводе три вещи.",
        checklist: [
          "Строка с методом и путём: начинается с `> GET`",
          "Код ответа: строка, которая начинается с `< HTTP`",
          "Заголовок `content-type` в ответе"
        ]
      },
      {
        type: "link",
        text: "MDN: обзор протокола HTTP",
        url: "https://developer.mozilla.org/ru/docs/Web/HTTP/Overview"
      },
      {
        type: "quiz",
        question: "Как сервер понимает, где в запросе закончились заголовки и началось тело?",
        options: [
          "По слову BODY",
          "*По пустой строке",
          "По точке с запятой"
        ],
        explanation: "После последнего заголовка идёт пустая строка, за ней — тело."
      }
    ]
  },
  "sprint-bookmarks-api-http-2": {
    summary: "Четыре метода и семь кодов ответа, которых хватает для большинства API.",
    objectives: [
      "Выбрать метод для чтения, создания, изменения и удаления",
      "Отличить ошибку клиента от ошибки сервера по первой цифре кода",
      "Назвать код для каждого ответа в проекте спринта"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Метод и код ответа — общий словарь клиента и сервера. Мобильному приложению, которое получило `404`, не нужно читать текст ошибки: и так понятно, что такой записи нет. Поэтому коды выбирают по правилам."
      },
      {
        type: "heading",
        level: 2,
        text: "Методы"
      },
      {
        type: "list",
        items: [
          "`GET` — прочитать. Ничего не меняет, поэтому его можно повторять сколько угодно.",
          "`POST` — создать новую запись. Повторный запрос создаст вторую.",
          "`PUT` — заменить запись целиком.",
          "`DELETE` — удалить."
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Коды"
      },
      {
        type: "paragraph",
        text: "Главное говорит первая цифра: `2xx` — получилось, `4xx` — ошибся клиент, `5xx` — сломался сервер. У каждого кода есть стандартное название, и Go его знает:"
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n)\n\nfunc main() {\n\tcodes := []int{200, 201, 204, 400, 404, 405, 500}\n\tfor _, code := range codes {\n\t\tfmt.Println(code, http.StatusText(code))\n\t}\n}"
      },
      {
        type: "list",
        items: [
          "`200 OK` — получилось, в теле лежит результат.",
          "`201 Created` — запись создана.",
          "`204 No Content` — получилось, тела нет. Так отвечают на удаление.",
          "`400 Bad Request` — запрос составлен неверно: не JSON, пустое обязательное поле.",
          "`404 Not Found` — такой записи или такого пути нет.",
          "`405 Method Not Allowed` — путь есть, но этот метод для него не предусмотрен.",
          "`500 Internal Server Error` — ошибка в коде сервера."
        ]
      },
      {
        type: "callout",
        tone: "warning",
        title: "Не отвечай 200 на всё",
        text: "Ответ `200` с текстом «ошибка» в теле ломает клиента: он смотрит на код и считает, что всё получилось. Код должен говорить правду."
      },
      {
        type: "link",
        text: "MDN: коды ответа HTTP",
        url: "https://developer.mozilla.org/ru/docs/Web/HTTP/Status"
      },
      {
        type: "quiz",
        question: "Клиент прислал POST с пустым названием. Какой код вернуть?",
        options: [
          "404 Not Found",
          "*400 Bad Request",
          "500 Internal Server Error"
        ],
        explanation: "Ошибся клиент: запрос нельзя выполнить в таком виде. Это 400. Код 500 означал бы ошибку в самом сервере."
      }
    ]
  },
  "sprint-bookmarks-api-http-3": {
    summary: "Что такое контракт API и как Go превращает структуры в JSON и обратно.",
    objectives: [
      "Объяснить, зачем клиенту и серверу нужен контракт",
      "Превратить структуру в JSON и JSON в структуру",
      "Отличить отсутствующее поле от сломанного JSON"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Мобильное приложение и сервер пишут разные люди, часто на разных языках. Чтобы программы поняли друг друга, команды заранее договариваются о **контракте**: какие есть пути, что присылать и что придёт в ответ. Данные передают в JSON — текстовом формате, который читает любой язык."
      },
      {
        type: "heading",
        level: 2,
        text: "Как выглядит контракт"
      },
      {
        type: "paragraph",
        text: "Вот часть контракта сервиса библиотеки. В задаче спринта тимлид пришлёт такой же, только для твоего сервиса."
      },
      {
        type: "code",
        language: "text",
        code: "POST /books\n  запрос:  {\"title\": \"Идиот\", \"author\": \"Фёдор Достоевский\"}\n  ответ:   201 {\"id\": 2, \"title\": \"Идиот\", \"author\": \"Фёдор Достоевский\"}\n  ошибка:  400 {\"error\": \"title не может быть пустым\"}\n\nGET /books/{id}\n  ответ:   200 {\"id\": 2, \"title\": \"Идиот\", \"author\": \"Фёдор Достоевский\"}\n  ошибка:  404 {\"error\": \"книга не найдена\"}"
      },
      {
        type: "paragraph",
        text: "Контракт — это обещание. Если в нём написано `created_at`, поле нельзя назвать `createdAt`: клиент его не найдёт."
      },
      {
        type: "heading",
        level: 2,
        text: "JSON в Go"
      },
      {
        type: "paragraph",
        text: "Имена полей в JSON задают теги структуры — они уже были в теме про файлы и JSON. `json.Marshal` делает из структуры JSON, `json.Unmarshal` — структуру из JSON."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n)\n\ntype Book struct {\n\tID     int    `json:\"id\"`\n\tTitle  string `json:\"title\"`\n\tAuthor string `json:\"author\"`\n}\n\nfunc main() {\n\t// Из Go в JSON: так сервер готовит ответ.\n\tbook := Book{ID: 1, Title: \"Мастер и Маргарита\", Author: \"Михаил Булгаков\"}\n\tout, _ := json.Marshal(book)\n\tfmt.Println(string(out))\n\n\t// Из JSON в Go: так сервер читает тело запроса.\n\tvar in Book\n\terr := json.Unmarshal([]byte(`{\"title\":\"Идиот\",\"author\":\"Фёдор Достоевский\"}`), &in)\n\tfmt.Println(in.Title, \"|\", in.Author, \"| id:\", in.ID, \"| ошибка:\", err)\n\n\t// Сломанный JSON — это ошибка, а не пустая книга.\n\terr = json.Unmarshal([]byte(`{\"title\": \"Идиот\"`), &in)\n\tfmt.Println(\"ошибка:\", err)\n}"
      },
      {
        type: "paragraph",
        text: "Посмотри на вторую строку вывода. В JSON не было `id`, и поле получило нулевое значение `0` без всякой ошибки. Отсутствующие поля Go молча пропускает, поэтому обязательные поля сервер проверяет отдельно.\n\nСломанный JSON — другое дело: это ошибка, и на неё сервер отвечает `400`."
      },
      {
        type: "link",
        text: "Блог Go: JSON and Go",
        url: "https://go.dev/blog/json"
      },
      {
        type: "quiz",
        question: "В запросе пришёл JSON {\"title\":\"Идиот\"}, а в структуре есть ещё поле Author. Что будет после Unmarshal?",
        options: [
          "*Author останется пустой строкой, ошибки не будет",
          "Unmarshal вернёт ошибку",
          "Программа завершится с panic"
        ],
        explanation: "Отсутствующее поле получает нулевое значение. Если поле обязательное, проверь его после разбора."
      }
    ]
  },
  "sprint-bookmarks-api-server-1": {
    summary: "Хэндлер, маршрутизатор и ListenAndServe: минимальный сервер из стандартной библиотеки.",
    objectives: [
      "Написать хэндлер и объяснить два его аргумента",
      "Запустить сервер на своём компьютере",
      "Отправить серверу запрос через curl"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "В Go для HTTP-сервера не нужен фреймворк. Пакет `net/http` из стандартной библиотеки умеет всё, что понадобится в этом спринте, и на нём же работают большие сервисы."
      },
      {
        type: "heading",
        level: 2,
        text: "Хэндлер"
      },
      {
        type: "paragraph",
        text: "**Хэндлер** — функция, которая отвечает на запрос. У неё всегда два аргумента: `r *http.Request` — что прислал клиент (метод, путь, заголовки, тело), и `w http.ResponseWriter` — куда писать ответ."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n)\n\n// Хэндлер: получает запрос r и пишет ответ в w.\nfunc ping(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintln(w, \"pong\")\n}\n\nfunc main() {\n\t// В браузере сервер слушать порт не может, поэтому вызываем хэндлер\n\t// напрямую: httptest подставляет запрос и записывает ответ.\n\treq := httptest.NewRequest(\"GET\", \"/ping\", nil)\n\trec := httptest.NewRecorder()\n\n\tping(rec, req)\n\n\tfmt.Println(\"код:\", rec.Code)\n\tfmt.Print(\"тело: \", rec.Body.String())\n}"
      },
      {
        type: "callout",
        tone: "info",
        title: "Почему пример без сети",
        text: "Код в уроках выполняется в песочнице, где нельзя слушать порт. Пакет `httptest` вызывает хэндлер напрямую. Так же ты будешь писать тесты в конце спринта."
      },
      {
        type: "heading",
        level: 2,
        text: "Настоящий сервер"
      },
      {
        type: "paragraph",
        text: "Чтобы хэндлер отвечал по сети, нужны ещё две вещи. **Маршрутизатор** `http.NewServeMux()` решает, какой хэндлер вызвать для какого пути. `http.ListenAndServe` занимает порт и ждёт запросы, пока программу не остановят."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"log\"\n\t\"net/http\"\n)\n\nfunc ping(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintln(w, \"pong\")\n}\n\nfunc main() {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /ping\", ping)\n\n\tlog.Println(\"слушаю на :8080\")\n\tlog.Fatal(http.ListenAndServe(\":8080\", mux))\n}",
        run: false
      },
      {
        type: "task",
        title: "Запусти сервер у себя",
        text: "Создай папку `ping-server`, выполни в ней `go mod init ping-server`, сохрани код выше в `main.go` и запусти `go run .`. Сервер займёт терминал, поэтому запросы отправляй из второго.",
        checklist: [
          "`go run .` печатает «слушаю на :8080»",
          "`curl localhost:8080/ping` отвечает `pong`",
          "`curl -i localhost:8080/other` показывает код 404",
          "Сервер остановлен сочетанием Ctrl+C"
        ]
      },
      {
        type: "callout",
        tone: "warning",
        title: "Ошибка address already in use",
        text: "Сообщение `bind: address already in use` при запуске означает, что порт 8080 занят. Чаще всего его держит прошлый запуск этого же сервера: найди тот терминал и нажми Ctrl+C."
      },
      {
        type: "link",
        text: "Документация пакета net/http",
        url: "https://pkg.go.dev/net/http"
      },
      {
        type: "quiz",
        question: "Что делает http.ListenAndServe?",
        options: [
          "Отправляет один запрос и завершается",
          "*Занимает порт и обрабатывает запросы, пока программу не остановят",
          "Проверяет код на ошибки перед запуском"
        ],
        explanation: "Функция не возвращает управление, пока сервер работает. Поэтому всё, что должно выполниться до старта, пишут выше неё."
      }
    ]
  },
  "sprint-bookmarks-api-server-2": {
    summary: "Как ServeMux выбирает хэндлер по методу и пути и достаёт id из адреса.",
    objectives: [
      "Записать маршрут с методом и параметром пути",
      "Достать параметр через r.PathValue",
      "Объяснить, когда сервер сам отвечает 404 и 405"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "В API один путь обслуживает несколько действий: `GET /books/7` читает книгу, `DELETE /books/7` её удаляет. Начиная с Go 1.22 метод и параметры пути записывают прямо в шаблоне маршрута."
      },
      {
        type: "image",
        src: "/lessons/http-handler-flow.svg",
        alt: "Запрос проходит через маршрутизатор к хэндлеру, хэндлер обращается к хранилищу и пишет ответ",
        caption: "Путь запроса внутри сервера: маршрутизатор выбирает хэндлер, хэндлер работает с данными и отвечает."
      },
      {
        type: "list",
        items: [
          "`\"GET /books\"` — только метод GET и только этот путь.",
          "`\"GET /books/{id}\"` — на месте `{id}` может стоять любой один кусок пути. Значение достают через `r.PathValue(\"id\")`.",
          "Путь совпал, а метод нет — маршрутизатор сам отвечает `405`.",
          "Не совпало ничего — он сам отвечает `404`."
        ]
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strings\"\n)\n\nfunc main() {\n\tmux := http.NewServeMux()\n\n\tmux.HandleFunc(\"GET /books\", func(w http.ResponseWriter, r *http.Request) {\n\t\tfmt.Fprint(w, \"список книг\")\n\t})\n\tmux.HandleFunc(\"GET /books/{id}\", func(w http.ResponseWriter, r *http.Request) {\n\t\tfmt.Fprint(w, \"книга номер \", r.PathValue(\"id\"))\n\t})\n\n\trequests := [][2]string{\n\t\t{\"GET\", \"/books\"},\n\t\t{\"GET\", \"/books/7\"},\n\t\t{\"DELETE\", \"/books/7\"}, // путь есть, метода нет\n\t\t{\"GET\", \"/magazines\"},  // такого пути нет\n\t}\n\tfor _, rq := range requests {\n\t\trec := httptest.NewRecorder()\n\t\tmux.ServeHTTP(rec, httptest.NewRequest(rq[0], rq[1], nil))\n\t\tfmt.Printf(\"%-6s %-11s -> %d %s\\n\", rq[0], rq[1], rec.Code, strings.TrimSpace(rec.Body.String()))\n\t}\n}"
      },
      {
        type: "paragraph",
        text: "`r.PathValue(\"id\")` всегда возвращает строку. Запрос `GET /books/abc` тоже попадёт в этот хэндлер, поэтому строку превращают в число через `strconv.Atoi` и проверяют ошибку. Не число — это ошибка клиента, код `400`."
      },
      {
        type: "callout",
        tone: "tip",
        title: "Проверь версию Go",
        text: "Маршруты с методом работают начиная с Go 1.22. Команда `go version` покажет установленную версию, а в файле `go.mod` должна стоять строка `go 1.22` или новее — со старой версией в `go.mod` такие маршруты не сработают."
      },
      {
        type: "link",
        text: "Блог Go: Routing Enhancements for Go 1.22",
        url: "https://go.dev/blog/routing-enhancements"
      },
      {
        type: "quiz",
        question: "На сервере есть только маршрут \"GET /books/{id}\". Что получит клиент на DELETE /books/7?",
        options: [
          "404 Not Found",
          "*405 Method Not Allowed",
          "200 OK"
        ],
        explanation: "Путь совпал, метод — нет. Маршрутизатор отвечает 405 без твоего участия."
      }
    ]
  },
  "sprint-bookmarks-api-server-3": {
    summary: "Прочитать тело запроса, собрать ответ и не перепутать порядок: заголовок, код, тело.",
    objectives: [
      "Прочитать JSON из тела запроса в структуру",
      "Отправить JSON-ответ с правильным заголовком и кодом",
      "Вернуть пустой список как [], а не null"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Почти каждый хэндлер API делает три шага: читает JSON из запроса, работает с данными и пишет JSON в ответ. Запись ответа повторяется в каждом хэндлере, поэтому её выносят в одну функцию."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strings\"\n)\n\ntype Order struct {\n\tID   int    `json:\"id\"`\n\tItem string `json:\"item\"`\n\tQty  int    `json:\"qty\"`\n}\n\n// writeJSON — одна функция на весь сервис: заголовок, код, тело.\nfunc writeJSON(w http.ResponseWriter, status int, v any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(v)\n}\n\nfunc createOrder(w http.ResponseWriter, r *http.Request) {\n\tvar order Order\n\tif err := json.NewDecoder(r.Body).Decode(&order); err != nil {\n\t\twriteJSON(w, http.StatusBadRequest, map[string]string{\"error\": \"тело запроса должно быть JSON\"})\n\t\treturn\n\t}\n\torder.ID = 1\n\twriteJSON(w, http.StatusCreated, order)\n}\n\nfunc main() {\n\treq := httptest.NewRequest(\"POST\", \"/orders\", strings.NewReader(`{\"item\":\"чай\",\"qty\":2}`))\n\trec := httptest.NewRecorder()\n\n\tcreateOrder(rec, req)\n\n\tfmt.Println(\"код:\", rec.Code)\n\tfmt.Println(\"Content-Type:\", rec.Header().Get(\"Content-Type\"))\n\tfmt.Print(\"тело: \", rec.Body.String())\n}"
      },
      {
        type: "heading",
        level: 2,
        text: "Порядок записи ответа"
      },
      {
        type: "list",
        items: [
          "Сначала заголовки: `w.Header().Set(...)`.",
          "Потом код: `w.WriteHeader(201)`.",
          "Потом тело."
        ]
      },
      {
        type: "paragraph",
        text: "После `WriteHeader` заголовки уже отправлены клиенту, изменить их нельзя. Если `WriteHeader` не вызвать совсем, при первой записи тела Go поставит код `200`."
      },
      {
        type: "heading",
        level: 2,
        text: "Пустой список"
      },
      {
        type: "paragraph",
        text: "Клиент ждёт массив и собирается пройтись по нему циклом. Если вместо `[]` придёт `null`, часть клиентов на этом упадёт. В Go разница в одной строке:"
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n)\n\nfunc main() {\n\tvar empty []string         // nil-слайс\n\tready := make([]string, 0) // пустой, но не nil\n\n\ta, _ := json.Marshal(empty)\n\tb, _ := json.Marshal(ready)\n\tfmt.Println(string(a))\n\tfmt.Println(string(b))\n}"
      },
      {
        type: "callout",
        tone: "tip",
        title: "Как получить [] всегда",
        text: "Создавай список через `make([]Order, 0)` или возвращай из хранилища копию, созданную через `make`. Тогда в JSON всегда будет массив."
      },
      {
        type: "link",
        text: "Документация пакета encoding/json",
        url: "https://pkg.go.dev/encoding/json"
      },
      {
        type: "quiz",
        question: "Хэндлер вызывает w.WriteHeader(201), а следующей строкой w.Header().Set(\"Content-Type\", \"application/json\"). Что получит клиент?",
        options: [
          "*Код 201 без этого заголовка: после WriteHeader менять заголовки поздно",
          "Код 201 и заголовок Content-Type",
          "Ошибку компиляции"
        ],
        explanation: "Заголовки уходят клиенту в момент WriteHeader. Всё, что задано позже, в ответ не попадёт."
      }
    ]
  },
  "sprint-bookmarks-api-server-4": {
    summary: "Проверка входных данных и понятные ошибки в одном формате.",
    objectives: [
      "Проверить входные данные до того, как их сохранять",
      "Вернуть ошибку в едином JSON-формате",
      "Выбрать между кодами 400 и 404"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Сервер не выбирает, что ему пришлют. Пустые поля, обычный текст вместо JSON, id, которого нет, — всё это придёт в первый же день. Хороший сервис на каждый такой запрос отвечает понятно и продолжает работать."
      },
      {
        type: "heading",
        level: 2,
        text: "Ранний выход"
      },
      {
        type: "paragraph",
        text: "Каждую проверку записывают одинаково: условие, ответ с ошибкой, `return`. Без `return` хэндлер пойдёт дальше и допишет в ответ что-нибудь ещё."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"strings\"\n)\n\ntype Order struct {\n\tItem string `json:\"item\"`\n\tQty  int    `json:\"qty\"`\n}\n\nfunc writeJSON(w http.ResponseWriter, status int, v any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(v)\n}\n\n// Все ошибки сервиса выглядят одинаково: {\"error\": \"...\"}.\nfunc writeError(w http.ResponseWriter, status int, msg string) {\n\twriteJSON(w, status, map[string]string{\"error\": msg})\n}\n\nfunc createOrder(w http.ResponseWriter, r *http.Request) {\n\tvar order Order\n\tif err := json.NewDecoder(r.Body).Decode(&order); err != nil {\n\t\twriteError(w, http.StatusBadRequest, \"тело запроса должно быть JSON\")\n\t\treturn\n\t}\n\tif strings.TrimSpace(order.Item) == \"\" {\n\t\twriteError(w, http.StatusBadRequest, \"item не может быть пустым\")\n\t\treturn\n\t}\n\tif order.Qty < 1 {\n\t\twriteError(w, http.StatusBadRequest, \"qty должно быть не меньше 1\")\n\t\treturn\n\t}\n\twriteJSON(w, http.StatusCreated, order)\n}\n\nfunc main() {\n\tbodies := []string{\n\t\t`{\"item\":\"чай\",\"qty\":2}`,\n\t\t`{\"item\":\"чай\",\"qty\":0}`,\n\t\t`{\"item\":\"  \",\"qty\":1}`,\n\t\t`чай, две штуки`,\n\t}\n\tfor _, body := range bodies {\n\t\trec := httptest.NewRecorder()\n\t\tcreateOrder(rec, httptest.NewRequest(\"POST\", \"/orders\", strings.NewReader(body)))\n\t\tfmt.Printf(\"%d %s\", rec.Code, rec.Body.String())\n\t}\n}"
      },
      {
        type: "heading",
        level: 2,
        text: "Какой код выбрать"
      },
      {
        type: "list",
        items: [
          "`400` — запрос нельзя выполнить в таком виде: сломанный JSON, пустое обязательное поле, id не число.",
          "`404` — запрос составлен верно, но записи с таким id нет.",
          "`500` — ошибка на стороне сервера. В этом спринте их быть не должно: всё, что может прислать клиент, проверяется заранее."
        ]
      },
      {
        type: "callout",
        tone: "warning",
        title: "Не показывай внутренности",
        text: "Не отправляй клиенту текст, который вернула библиотека, например `err.Error()` от разбора JSON. Клиенту он не поможет, а об устройстве сервера расскажет лишнее. Напиши своё короткое сообщение."
      },
      {
        type: "quiz",
        question: "Клиент запросил GET /orders/15, а заказа с id 15 нет. Какой код вернуть?",
        options: [
          "400 Bad Request",
          "*404 Not Found",
          "500 Internal Server Error"
        ],
        explanation: "Запрос составлен верно, просто такой записи нет. Это 404."
      }
    ]
  },
  "sprint-bookmarks-api-server-5": {
    summary: "Почему запросы мешают друг другу и как защитить общие данные.",
    objectives: [
      "Объяснить, почему хэндлеры выполняются одновременно",
      "Защитить общие данные мьютексом",
      "Найти гонку командой go run -race"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Каждый запрос Go обрабатывает в отдельной горутине. Два клиента, которые нажали «сохранить» в одну и ту же секунду, запускают твой хэндлер дважды и параллельно.\n\nПока хэндлеры не трогают ничего общего, это незаметно. Но у сервиса в памяти лежит один список на всех, и его читают и меняют все запросы сразу."
      },
      {
        type: "image",
        src: "/lessons/mutex-requests.svg",
        alt: "Два запроса одновременно обращаются к общему списку; мьютекс пропускает их по одному",
        caption: "Без замка два запроса меняют данные одновременно. С мьютексом второй ждёт, пока закончит первый."
      },
      {
        type: "heading",
        level: 2,
        text: "Что идёт не так"
      },
      {
        type: "paragraph",
        text: "Операция `count++` состоит из трёх шагов: прочитать, прибавить, записать. Два запроса читают одно и то же число 5 и оба записывают 6 — одно увеличение потерялось.\n\nС `map` хуже: при одновременной записи Go останавливает всю программу с сообщением `fatal error: concurrent map writes`."
      },
      {
        type: "heading",
        level: 2,
        text: "Мьютекс"
      },
      {
        type: "paragraph",
        text: "`sync.Mutex` — это замок. `Lock()` закрывает его, и вторая горутина на своём `Lock()` ждёт, пока первая не вызовет `Unlock()`. Данные и замок кладут в одну структуру, а работают с данными только через её методы."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"sync\"\n)\n\n// Counter хранит число и замок, который пускает к нему по одному.\ntype Counter struct {\n\tmu    sync.Mutex\n\tvalue int\n}\n\nfunc (c *Counter) Inc() {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\tc.value++\n}\n\nfunc (c *Counter) Value() int {\n\tc.mu.Lock()\n\tdefer c.mu.Unlock()\n\treturn c.value\n}\n\nfunc main() {\n\tcounter := &Counter{}\n\n\t// 1000 горутин — как 1000 запросов, пришедших одновременно.\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 1000; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tcounter.Inc()\n\t\t}()\n\t}\n\twg.Wait()\n\n\tfmt.Println(\"посчитано:\", counter.Value())\n}"
      },
      {
        type: "callout",
        tone: "tip",
        title: "defer сразу после Lock",
        text: "Пиши `defer c.mu.Unlock()` следующей строкой после `Lock()`. Тогда замок откроется при любом выходе из метода, даже если в середине появится ранний `return`."
      },
      {
        type: "heading",
        level: 2,
        text: "Как найти гонку"
      },
      {
        type: "paragraph",
        text: "Гонка может не проявляться сотни запусков подряд. У Go есть детектор: во время работы программы он следит за доступом к памяти и печатает `WARNING: DATA RACE` с номерами строк."
      },
      {
        type: "code",
        language: "bash",
        code: "go run -race .\ngo test -race ./..."
      },
      {
        type: "paragraph",
        text: "Проверка спринта собирает твой сервер с этим детектором и отправляет сто запросов одновременно."
      },
      {
        type: "task",
        title: "Убедись на своём компьютере",
        text: "Сохрани пример со счётчиком в `main.go`, убери из метода `Inc` обе строки с `mu` и запусти программу несколько раз. Потом запусти её с флагом `-race`.",
        checklist: [
          "Без мьютекса результат бывает меньше 1000",
          "`go run -race .` печатает `WARNING: DATA RACE`",
          "С мьютексом результат всегда 1000, детектор молчит"
        ]
      },
      {
        type: "link",
        text: "Документация Go: Data Race Detector",
        url: "https://go.dev/doc/articles/race_detector"
      },
      {
        type: "quiz",
        question: "Что защищает мьютекс в сервисе, который хранит данные в памяти?",
        options: [
          "Сетевое соединение от обрыва",
          "*Общие данные от одновременного чтения и записи разными запросами",
          "JSON от ошибок разбора"
        ],
        explanation: "Запросы выполняются одновременно. Мьютекс пускает к общим данным по одному."
      }
    ]
  },
  "sprint-bookmarks-api-delivery-1": {
    summary: "Как проверить сервер тестом, не запуская его и не открывая порт.",
    objectives: [
      "Написать тест хэндлера с httptest.NewRecorder",
      "Проверить код и тело ответа",
      "Собрать несколько сценариев в табличный тест"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Проверить сервер руками через curl можно один раз. Повторять десять запросов после каждой правки никто не станет, и ошибка уедет в репозиторий. Тест делает те же запросы за долю секунды."
      },
      {
        type: "heading",
        level: 2,
        text: "Маршруты отдельно от запуска"
      },
      {
        type: "paragraph",
        text: "Чтобы сервер можно было тестировать, маршруты собирают в функции, которая возвращает `http.Handler`. В `main` его получает сервер, а в тесте — сам тест."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n)\n\nfunc ping(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprint(w, \"pong\")\n}\n\nfunc NewRouter() http.Handler {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /ping\", ping)\n\treturn mux\n}\n\nfunc main() {\n\thttp.ListenAndServe(\":8080\", NewRouter())\n}",
        run: false
      },
      {
        type: "heading",
        level: 2,
        text: "Тест"
      },
      {
        type: "paragraph",
        text: "`httptest.NewRequest` создаёт запрос, `httptest.NewRecorder` записывает ответ. Сеть и порт не участвуют, поэтому тесты быстрые и не мешают друг другу."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"net/http\"\n\t\"net/http/httptest\"\n\t\"testing\"\n)\n\nfunc TestPing(t *testing.T) {\n\trouter := NewRouter()\n\n\trec := httptest.NewRecorder()\n\trouter.ServeHTTP(rec, httptest.NewRequest(\"GET\", \"/ping\", nil))\n\n\tif rec.Code != http.StatusOK {\n\t\tt.Fatalf(\"код %d, ожидался 200\", rec.Code)\n\t}\n\tif rec.Body.String() != \"pong\" {\n\t\tt.Fatalf(\"тело %q, ожидалось pong\", rec.Body.String())\n\t}\n}\n\nfunc TestRoutes(t *testing.T) {\n\tcases := []struct {\n\t\tname   string\n\t\tmethod string\n\t\tpath   string\n\t\twant   int\n\t}{\n\t\t{\"обычный запрос\", \"GET\", \"/ping\", http.StatusOK},\n\t\t{\"чужой метод\", \"POST\", \"/ping\", http.StatusMethodNotAllowed},\n\t\t{\"нет такого пути\", \"GET\", \"/pong\", http.StatusNotFound},\n\t}\n\trouter := NewRouter()\n\tfor _, tc := range cases {\n\t\tt.Run(tc.name, func(t *testing.T) {\n\t\t\trec := httptest.NewRecorder()\n\t\t\trouter.ServeHTTP(rec, httptest.NewRequest(tc.method, tc.path, nil))\n\t\t\tif rec.Code != tc.want {\n\t\t\t\tt.Fatalf(\"код %d, ожидался %d\", rec.Code, tc.want)\n\t\t\t}\n\t\t})\n\t}\n}",
        run: false
      },
      {
        type: "code",
        language: "bash",
        code: "go test ./...\n# ok  \tping-server\t0.275s"
      },
      {
        type: "callout",
        tone: "tip",
        title: "Что тестировать в первую очередь",
        text: "Один тест на главный сценарий и по тесту на каждую ошибку из контракта: неверное тело, несуществующий id, чужой метод. Сценарии с ошибками ломаются чаще успешных."
      },
      {
        type: "link",
        text: "Документация пакета net/http/httptest",
        url: "https://pkg.go.dev/net/http/httptest"
      },
      {
        type: "quiz",
        question: "Зачем маршруты выносят в функцию NewRouter()?",
        options: [
          "*Чтобы тест получил тот же обработчик, что и сервер, без запуска на порту",
          "Чтобы сервер работал быстрее",
          "Этого требует компилятор"
        ],
        explanation: "Тест вызывает router.ServeHTTP напрямую. Если маршруты собраны внутри main, добраться до них из теста нельзя."
      }
    ]
  },
  "sprint-bookmarks-api-delivery-2": {
    summary: "Что отличает сервер «работает у меня» от сервера, который запускается где угодно.",
    objectives: [
      "Прочитать порт из переменной окружения",
      "Задать серверу таймаут",
      "Разложить код сервиса по файлам"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Порт `8080`, записанный в коде, подходит для твоего компьютера. На сервере компании, в контейнере и в автоматической проверке порт выдают снаружи. Общепринятый способ передать программе настройку — **переменная окружения**."
      },
      {
        type: "code",
        language: "go",
        code: "package main\n\nimport (\n\t\"log\"\n\t\"net/http\"\n\t\"os\"\n\t\"time\"\n)\n\nfunc main() {\n\t// Порт приходит снаружи: на твоём компьютере, на сервере и в проверке он разный.\n\tport := os.Getenv(\"PORT\")\n\tif port == \"\" {\n\t\tport = \"8080\"\n\t}\n\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /ping\", func(w http.ResponseWriter, r *http.Request) {\n\t\tw.Write([]byte(\"pong\"))\n\t})\n\n\tsrv := &http.Server{\n\t\tAddr:              \":\" + port,\n\t\tHandler:           mux,\n\t\tReadHeaderTimeout: 5 * time.Second, // не ждать медленного клиента вечно\n\t}\n\n\tlog.Printf(\"слушаю на :%s\", port)\n\tlog.Fatal(srv.ListenAndServe())\n}",
        run: false
      },
      {
        type: "code",
        language: "bash",
        code: "go run .                    # порт 8080\nPORT=9000 go run .          # порт 9000: macOS и Linux\n$env:PORT=9000; go run .    # порт 9000: PowerShell в Windows"
      },
      {
        type: "heading",
        level: 2,
        text: "Таймауты"
      },
      {
        type: "paragraph",
        text: "`http.ListenAndServe` без настроек ждёт клиента сколько угодно. Клиент, который открыл соединение и замолчал, держит его бесконечно. Тысяча таких клиентов — и сервер больше никого не принимает. Поэтому в рабочем коде создают `http.Server` и задают хотя бы `ReadHeaderTimeout`."
      },
      {
        type: "heading",
        level: 2,
        text: "Структура проекта"
      },
      {
        type: "paragraph",
        text: "Сервису такого размера хватает одного пакета и четырёх файлов:"
      },
      {
        type: "list",
        items: [
          "`main.go` — настройки и запуск сервера.",
          "`handlers.go` — маршруты и хэндлеры: читают запрос, вызывают хранилище, пишут ответ.",
          "`store.go` — данные и мьютекс. Про HTTP этот файл ничего не знает.",
          "`handlers_test.go` — тесты."
        ]
      },
      {
        type: "paragraph",
        text: "Граница проходит между HTTP и данными. Хранилище возвращает значение или ошибку, а код ответа выбирает хэндлер. Когда в одном из следующих спринтов память заменит PostgreSQL, переписывать придётся только `store.go`."
      },
      {
        type: "link",
        text: "Cloudflare: The complete guide to Go net/http timeouts",
        url: "https://blog.cloudflare.com/the-complete-guide-to-golang-net-http-timeouts/"
      },
      {
        type: "quiz",
        question: "Почему порт читают из переменной окружения, а не пишут числом в коде?",
        options: [
          "*В разных окружениях порт разный, и менять ради этого код не нужно",
          "Так сервер работает быстрее",
          "Число в коде не скомпилируется"
        ],
        explanation: "Один и тот же собранный файл запускают на компьютере разработчика, на сервере и в проверке. Настройки приходят снаружи."
      }
    ]
  },
  "sprint-bookmarks-api-delivery-3": {
    summary: "Что такое CI и как GitHub проверяет твой проект после каждого push.",
    objectives: [
      "Объяснить, что такое CI и зачем он команде",
      "Добавить в репозиторий файл workflow",
      "Найти результат проверки и прочитать лог ошибки"
    ],
    blocks: [
      {
        type: "paragraph",
        text: "«У меня работает» в команде не считается. У тебя может стоять другая версия Go, нужный файл мог не попасть в Git, а программа — работать только потому, что её запустили руками. Поэтому проверку выполняют на чистой машине и автоматически, после каждого push. Это называется **CI** — continuous integration, непрерывная интеграция."
      },
      {
        type: "image",
        src: "/lessons/sprint-ci-flow.svg",
        alt: "После push GitHub Actions запускает check.go на чистой машине и показывает результат; страница спринта читает его по ссылке",
        caption: "Путь проверки: push, запуск на машине GitHub, результат рядом с commit, сдача по ссылке."
      },
      {
        type: "heading",
        level: 2,
        text: "Workflow"
      },
      {
        type: "paragraph",
        text: "В GitHub этим занимается GitHub Actions. В папке `.github/workflows` лежит YAML-файл с инструкцией: когда запускаться и какие команды выполнить. Вот файл, который проверяет проект спринта:"
      },
      {
        type: "code",
        language: "yaml",
        code: "name: Godemy check\n\non:\n  push:\n\njobs:\n  check:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-go@v5\n        with:\n          go-version: stable\n      - run: go run check.go"
      },
      {
        type: "list",
        items: [
          "`on: push` — запускаться при каждом push.",
          "`runs-on: ubuntu-latest` — GitHub выдаёт чистую виртуальную машину с Linux.",
          "`actions/checkout` скачивает твой репозиторий, `actions/setup-go` ставит Go.",
          "`run: go run check.go` — та же команда, что и у тебя в терминале. Если она завершается с ошибкой, проверка красная."
        ]
      },
      {
        type: "heading",
        level: 2,
        text: "Где смотреть результат"
      },
      {
        type: "paragraph",
        text: "На странице репозитория рядом с последним commit появляется значок: жёлтый круг — проверка идёт, зелёная галочка — прошла, красный крест — нет. Все запуски собраны на вкладке **Actions**. Внутри запуска лежит полный вывод `check.go` с теми же ✓ и ✗."
      },
      {
        type: "callout",
        tone: "info",
        title: "Это бесплатно",
        text: "Для публичных репозиториев стандартные машины GitHub Actions бесплатны. Проекты курса лежат в публичных репозиториях."
      },
      {
        type: "task",
        title: "Добавь проверку в репозиторий",
        text: "Файл `godemy-check.yml` скачивается на странице спринта, в шаге «Сделай».",
        checklist: [
          "Файл лежит по пути `.github/workflows/godemy-check.yml`",
          "После push на вкладке Actions появился запуск «Godemy check»",
          "Лог запуска открыт, в нём найдена строка «Итог»"
        ]
      },
      {
        type: "link",
        text: "GitHub Docs: краткое руководство по GitHub Actions",
        url: "https://docs.github.com/ru/actions/writing-workflows/quickstart"
      },
      {
        type: "quiz",
        question: "Проверка на GitHub красная, а у тебя на компьютере go run check.go зелёный. Что проверить первым?",
        options: [
          "*Все ли файлы добавлены в commit и отправлены через push",
          "Перезагрузить компьютер",
          "Удалить файл workflow"
        ],
        explanation: "GitHub видит только то, что есть в репозитории. Самая частая причина — файл, который остался только на твоём компьютере."
      }
    ]
  }
};
