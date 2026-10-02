// Модуль 1 «Основы Kubernetes». Короткая теория, каждый урок заканчивается задачей.

const yaml = (code) => ({ type: "code", language: "yaml", code });

export const k8sBasics = {
  id: "k8s-basics",
  title: "Основы Kubernetes",
  phase: "ТЕОРИЯ",
  summary: "Pod, Deployment, Service, конфигурация, пробы и ресурсы: всё, что нужно, чтобы читать и писать манифесты.",
  topics: [
    {
      id: "objects",
      title: "Объекты и манифесты",
      lessons: [
        {
          title: "Зачем нужен Kubernetes",
          summary: "Что он делает за вас и чем отличается от «запустить контейнер на сервере».",
          objectives: ["Объяснить, какую задачу решает оркестратор", "Назвать основные части кластера"],
          blocks: [
            { type: "heading", level: 2, text: "Проблема одного контейнера" },
            { type: "paragraph", text: "Контейнер на одном сервере — это просто. Сложности начинаются, когда сервисов десятки, а серверов несколько: кто-то должен решать, **где** запустить каждый контейнер, **перезапускать** упавшие, **раскатывать** новую версию без простоя и **находить** друг друга по адресам, которые постоянно меняются. Эту работу берёт на себя Kubernetes (его часто сокращают до K8s)." },
            { type: "image", src: "/lessons/k8s-architecture.svg", alt: "Схема кластера: control plane и рабочие узлы", caption: "Кластер: управляющая часть и рабочие узлы" },
            { type: "heading", level: 2, text: "Из чего состоит кластер" },
            { type: "list", items: [
              "**Control plane** — мозг кластера: `kube-apiserver` (единственная точка входа, через неё идёт всё), `etcd` (хранилище состояния), `scheduler` (выбирает узел для пода), `controller-manager` (следит, чтобы факт совпадал с желаемым).",
              "**Узлы (nodes)** — машины, где работают контейнеры: `kubelet` (запускает поды и проверяет их), контейнерный runtime и `kube-proxy` (сетевые правила для сервисов).",
            ] },
            { type: "callout", tone: "info", title: "Главная идея", text: "Вы не говорите Kubernetes «запусти контейнер». Вы описываете **желаемое состояние** («хочу 3 копии этого приложения»), а контроллеры постоянно сравнивают его с реальным и исправляют расхождения." },
            { type: "task", title: "Сделай сам", text: "Своими словами опиши, что произойдёт, если один из трёх запущенных подов вашего приложения упадёт. Кто это заметит и что сделает?", checklist: ["Назвал контроллер, который заметит расхождение", "Описал, что создаётся новый под, а не «чинится» старый"] },
          ],
        },
        {
          title: "Pod и Deployment",
          summary: "Минимальная единица запуска и объект, который ею управляет.",
          objectives: ["Прочитать манифест Deployment", "Понять связь Deployment → ReplicaSet → Pod"],
          blocks: [
            { type: "heading", level: 2, text: "Pod" },
            { type: "paragraph", text: "**Pod** — один или несколько контейнеров, которые всегда запускаются вместе на одном узле и делят сеть (один IP) и тома. Обычно в поде один основной контейнер; дополнительные (sidecar) помогают ему: собирают логи, терминируют TLS." },
            { type: "paragraph", text: "Поды **смертны**: упавший под не воскресает, а заменяется новым с другим IP. Поэтому напрямую поды почти не создают." },
            { type: "heading", level: 2, text: "Deployment" },
            { type: "paragraph", text: "**Deployment** описывает, какой под и сколько копий нужно, и умеет обновлять версию. Он создаёт `ReplicaSet`, а тот — сами поды. Метки (`labels`) связывают всё воедино: `selector` Deployment ищет поды с нужной меткой." },
            yaml("apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: orders-api\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: orders-api\n  template:\n    metadata:\n      labels:\n        app: orders-api\n    spec:\n      containers:\n        - name: api\n          image: example/orders-api:1.0\n          ports:\n            - containerPort: 8080"),
            { type: "callout", tone: "warning", title: "Частая ошибка", text: "Метки в `selector.matchLabels` и в `template.metadata.labels` должны совпадать. Если разойдутся, Kubernetes отклонит манифест." },
            { type: "task", title: "Сделай сам", text: "Измени в манифесте выше количество реплик и имя образа. Затем скажи, какие строки менять нельзя, не изменив и другие (подсказка: метки).", checklist: ["Поменял `replicas`", "Объяснил, почему `selector` и метки шаблона должны совпадать"] },
          ],
        },
      ],
    },
    {
      id: "networking",
      title: "Сеть и конфигурация",
      lessons: [
        {
          title: "Service: стабильный адрес",
          summary: "Как приложения находят друг друга, если поды постоянно меняются.",
          objectives: ["Объяснить роль Service и селектора", "Выбрать тип Service"],
          blocks: [
            { type: "paragraph", text: "У каждого пода свой IP, и он меняется при каждом пересоздании. **Service** даёт группе подов постоянное имя и адрес и распределяет запросы между живыми подами. Поды выбираются по меткам из `selector`." },
            yaml("apiVersion: v1\nkind: Service\nmetadata:\n  name: orders-api\nspec:\n  selector:\n    app: orders-api\n  ports:\n    - port: 80\n      targetPort: 8080"),
            { type: "list", items: [
              "`ClusterIP` (по умолчанию) — доступен только внутри кластера, по имени `orders-api`.",
              "`NodePort` — открывает порт на каждом узле.",
              "`LoadBalancer` — просит у облака внешний балансировщик.",
              "Headless (`clusterIP: None`) — без балансировки, DNS отдаёт IP каждого пода. Нужен для StatefulSet, например Kafka.",
            ] },
            { type: "callout", tone: "info", title: "Если сервис «не работает»", text: "Сначала проверьте, что у него есть эндпоинты (`kubectl get endpoints orders-api`). Пусто — значит, метки селектора не совпали ни с одним готовым подом." },
            { type: "task", title: "Сделай сам", text: "Реши в тренажёре задачу «Какие поды выберет Service» — в ней ровно та логика, по которой Service ищет поды.", checklist: ["Решил задачу в тренажёре"] },
          ],
        },
        {
          title: "ConfigMap и Secret",
          summary: "Как вынести настройки из образа и что на самом деле защищает Secret.",
          objectives: ["Передать конфигурацию в контейнер", "Знать ограничения Secret"],
          blocks: [
            { type: "paragraph", text: "Образ должен быть одинаковым в разработке и в продакшене, а различаются только настройки. Их выносят в **ConfigMap** (обычные значения) и **Secret** (пароли, токены) и подключают к контейнеру переменными окружения или файлами." },
            yaml("env:\n  - name: DB_HOST\n    valueFrom:\n      configMapKeyRef: { name: app-config, key: db_host }\n  - name: DB_PASSWORD\n    valueFrom:\n      secretKeyRef: { name: db-credentials, key: password }"),
            { type: "callout", tone: "warning", title: "Secret ≠ шифрование", text: "Значения в Secret лежат в кодировке base64, а в etcd по умолчанию хранятся незашифрованными. Это лишь отдельный объект с отдельными правами. Защищают секреты правами доступа (RBAC), шифрованием etcd и внешними хранилищами." },
            { type: "task", title: "Сделай сам", text: "Реши в тренажёре «Secret — это не шифрование» и убедись, что base64 расшифровывается без всякого ключа.", checklist: ["Решил задачу в тренажёре"] },
          ],
        },
      ],
    },
    {
      id: "reliability",
      title: "Надёжность и ресурсы",
      lessons: [
        {
          title: "Пробы: liveness и readiness",
          summary: "Как Kubernetes узнаёт, что приложение живо и готово принимать трафик.",
          objectives: ["Различать liveness и readiness", "Настроить пороги"],
          blocks: [
            { type: "list", items: [
              "**liveness** — «приложение живо?». Провал → kubelet **перезапускает контейнер**. Для зависших процессов.",
              "**readiness** — «готово принимать запросы?». Провал → под **убирают из эндпоинтов Service**, но не перезапускают. Для прогрева и временной недоступности зависимостей.",
              "**startup** — даёт медленному приложению время запуститься, пока другие пробы отключены.",
            ] },
            yaml("livenessProbe:\n  httpGet: { path: /healthz, port: 8080 }\n  periodSeconds: 10\n  failureThreshold: 3\nreadinessProbe:\n  httpGet: { path: /ready, port: 8080 }\n  periodSeconds: 5"),
            { type: "callout", tone: "warning", title: "Не проверяйте зависимости в liveness", text: "Если liveness падает из-за недоступной базы, Kubernetes перезапустит все поды разом, и вы получите каскадный сбой. Внешние зависимости проверяйте в readiness." },
            { type: "task", title: "Сделай сам", text: "Реши в тренажёре «Когда сработает проба» и объясни, зачем нужен `failureThreshold` больше единицы.", checklist: ["Решил задачу в тренажёре", "Объяснил, зачем порог"] },
          ],
        },
        {
          title: "Requests, limits и обновления",
          summary: "Как Kubernetes делит ресурсы и обновляет приложение без простоя.",
          objectives: ["Отличить requests от limits", "Понимать rolling update"],
          blocks: [
            { type: "list", items: [
              "**requests** — сколько ресурсов под гарантированно получит; по ним **планировщик** выбирает узел.",
              "**limits** — потолок. Превысил CPU — тебя притормозят (throttling). Превысил память — контейнер убьют (`OOMKilled`).",
            ] },
            yaml("resources:\n  requests: { cpu: 100m, memory: 128Mi }\n  limits:   { cpu: 500m, memory: 256Mi }"),
            { type: "paragraph", text: "**Rolling update** заменяет поды постепенно. Скорость задают `maxSurge` (сколько лишних подов можно создать) и `maxUnavailable` (сколько можно выключить). По умолчанию оба — 25%: `maxSurge` округляется вверх, `maxUnavailable` — вниз. Если новая версия не проходит readiness, обновление останавливается, а старые поды продолжают работать." },
            { type: "task", title: "Сделай сам", text: "Реши три задачи тренажёра: «Контейнеры без лимитов», «Границы rolling update» и «Куда планировщик поставит под».", checklist: ["Контейнеры без лимитов", "Границы rolling update", "Куда планировщик поставит под"] },
          ],
        },
      ],
    },
  ],
};
