// Тренажёр курса «Kubernetes и Kafka». Кластера в браузере нет, поэтому задачи
// тренируют ровно ту логику, которую делают Kubernetes и Kafka: разбор
// манифестов (YAML читается настоящим PyYAML), правила планировщика, выбор
// партиции, распределение партиций по потребителям, коммит офсета.
// Принимается решение, чей вывод harness совпал с выводом эталона.

const raw = String.raw;

export const k8sChallenges = [
  {
    id: "missing-limits", title: "Контейнеры без лимитов", category: "Kubernetes", level: "Лёгкая", minutes: 8,
    description: "Контейнер без `resources.limits` может съесть всю память узла. Напишите `containers_without_limits(manifest)`: она принимает разобранный манифест Deployment (словарь) и возвращает отсортированный список имён контейнеров, у которых нет ни `limits.cpu`, ни `limits.memory`.",
    starter: raw`def containers_without_limits(manifest):
    return []`,
    harness: raw`import yaml
doc = yaml.safe_load("""
apiVersion: apps/v1
kind: Deployment
metadata: {name: shop}
spec:
  template:
    spec:
      containers:
        - name: web
          image: shop/web:1.2
          resources:
            requests: {cpu: 100m, memory: 128Mi}
            limits: {cpu: 500m, memory: 256Mi}
        - name: sidecar
          image: shop/log:1.0
        - name: cache
          image: redis:7
          resources:
            requests: {cpu: 50m}
""")
print(containers_without_limits(doc))`,
    referenceSolution: raw`def containers_without_limits(manifest):
    result = []
    for c in manifest["spec"]["template"]["spec"]["containers"]:
        limits = (c.get("resources") or {}).get("limits") or {}
        if "cpu" not in limits and "memory" not in limits:
            result.append(c["name"])
    return sorted(result)`,
    hint: "Контейнеры лежат в `manifest['spec']['template']['spec']['containers']`. Поля `resources` или `limits` могут отсутствовать, поэтому берите их через `.get(..., {})`.",
    explain: "Без `limits` контейнер не ограничен: утечка памяти в одном поде может вызвать нехватку памяти на всём узле. Поэтому в кластерах часто включают политику, которая отклоняет такие манифесты. Ваша функция делает ровно такую проверку.",
  },
  {
    id: "service-selector", title: "Какие поды выберет Service", category: "Kubernetes", level: "Лёгкая", minutes: 8,
    description: "Service находит поды по меткам. Напишите `selected_pods(selector, pods)`: `selector` — словарь меток сервиса, `pods` — словарь `имя пода → метки`. Верните отсортированный список имён подов, у которых есть **все** пары из селектора. Пустой селектор не выбирает ничего.",
    starter: raw`def selected_pods(selector, pods):
    return []`,
    harness: raw`pods = {
    "web-1": {"app": "web", "tier": "front", "version": "v1"},
    "web-2": {"app": "web", "tier": "front", "version": "v2"},
    "api-1": {"app": "api", "tier": "back"},
    "web-old": {"app": "web", "tier": "legacy"},
}
print(selected_pods({"app": "web"}, pods))
print(selected_pods({"app": "web", "tier": "front"}, pods))
print(selected_pods({"app": "web", "version": "v2"}, pods))
print(selected_pods({"app": "db"}, pods))
print(selected_pods({}, pods))`,
    referenceSolution: raw`def selected_pods(selector, pods):
    if not selector:
        return []
    return sorted(name for name, labels in pods.items()
                  if all(labels.get(k) == v for k, v in selector.items()))`,
    hint: "Под подходит, если для каждой пары `ключ: значение` из селектора у пода те же метки. Метод `all(...)` поможет.",
    explain: "Так и работает связь Service → поды: никаких ссылок по имени, только совпадение меток. Поэтому опечатка в метке — самая частая причина сервиса «без эндпоинтов».",
  },
  {
    id: "rolling-update", title: "Границы rolling update", category: "Kubernetes", level: "Средняя", minutes: 12,
    description: "При обновлении Deployment ограничен двумя числами. Напишите `rolling_bounds(replicas, max_surge, max_unavailable)`, она возвращает пару `(макс_подов_всего, мин_доступных)`. Значения бывают целыми (`2`) или процентами (`\"25%\"`). `maxSurge` в процентах **округляется вверх**, `maxUnavailable` — **вниз**.",
    starter: raw`def rolling_bounds(replicas, max_surge, max_unavailable):
    return (replicas, replicas)`,
    harness: raw`print(rolling_bounds(4, "25%", "25%"))
print(rolling_bounds(10, "25%", "25%"))
print(rolling_bounds(3, 1, 0))
print(rolling_bounds(5, "50%", 1))
print(rolling_bounds(2, "25%", "25%"))`,
    referenceSolution: raw`import math

def _value(v, replicas, up):
    if isinstance(v, str) and v.endswith("%"):
        x = replicas * int(v[:-1]) / 100
        return math.ceil(x) if up else math.floor(x)
    return int(v)

def rolling_bounds(replicas, max_surge, max_unavailable):
    surge = _value(max_surge, replicas, True)
    unavailable = _value(max_unavailable, replicas, False)
    return (replicas + surge, replicas - unavailable)`,
    hint: "Проценты считаются от `replicas`. `math.ceil` — вверх, `math.floor` — вниз. Всего подов: `replicas + surge`, доступных минимум: `replicas - unavailable`.",
    explain: "При 4 репликах и значениях по умолчанию 25%/25% Kubernetes создаёт 1 лишний под (максимум 5) и разрешает выключить 1 (минимум 3). Округление в разные стороны гарантирует, что обновление всегда может двигаться, но не убивает всё сразу.",
  },
  {
    id: "read-secret", title: "Secret — это не шифрование", category: "Kubernetes", level: "Лёгкая", minutes: 8,
    description: "В манифесте `Secret` значения лежат в `data` в кодировке base64. Напишите `read_secret(manifest)`: верните словарь `ключ → расшифрованная строка (utf-8)`. Заодно увидите, почему доступ к секретам нужно ограничивать правами (RBAC).",
    starter: raw`def read_secret(manifest):
    return {}`,
    harness: raw`import yaml
doc = yaml.safe_load("""
apiVersion: v1
kind: Secret
metadata: {name: db-credentials}
type: Opaque
data:
  username: c2hvcF9hcHA=
  password: czNjcjN0LXBhc3M=
""")
result = read_secret(doc)
for key in sorted(result):
    print(key, "=", result[key])`,
    referenceSolution: raw`import base64

def read_secret(manifest):
    return {k: base64.b64decode(v).decode("utf-8") for k, v in manifest["data"].items()}`,
    hint: "Модуль `base64`: `base64.b64decode(value).decode('utf-8')`.",
    explain: "Расшифровка — одна строка без ключа. Base64 — это кодировка, а не защита: любой, кто может прочитать Secret, видит пароль. Настоящая защита — права доступа, шифрование etcd и внешние хранилища секретов.",
  },
  {
    id: "probe-timeline", title: "Когда сработает проба", category: "Kubernetes", level: "Средняя", minutes: 12,
    description: "Kubelet опрашивает контейнер и считает неудачи подряд. Напишите `first_action(results, failure_threshold)`: `results` — список результатов проб (`True` — успех), верните номер пробы (с 1), на которой сработает действие, то есть когда подряд накопилось `failure_threshold` неудач. Если не накопилось — `None`. Успех обнуляет счётчик.",
    starter: raw`def first_action(results, failure_threshold):
    return None`,
    harness: raw`print(first_action([True, True, False, False, False, True], 3))
print(first_action([False, True, False, True, False, True], 2))
print(first_action([False, False, True, False, False], 2))
print(first_action([True] * 5, 3))
print(first_action([False] * 5, 1))`,
    referenceSolution: raw`def first_action(results, failure_threshold):
    streak = 0
    for number, ok in enumerate(results, start=1):
        streak = 0 if ok else streak + 1
        if streak >= failure_threshold:
            return number
    return None`,
    hint: "Идите по списку со счётчиком подряд идущих неудач. Успех сбрасывает счётчик в 0. `enumerate(results, start=1)` даёт номера с единицы.",
    explain: "Именно так liveness-проба решает, что контейнер завис и его пора перезапустить, а readiness — что поду пока нельзя слать трафик. `failureThreshold` защищает от перезапуска из-за одной случайной ошибки.",
  },
  {
    id: "schedule-pod", title: "Куда планировщик поставит под", category: "Kubernetes", level: "Средняя", minutes: 14,
    description: "Планировщик смотрит на **requests**, а не на реальное потребление. Напишите `pick_node(nodes, request)`: `nodes` — список словарей `{name, cpu_free, mem_free}` (милли-ядра и МиБ), `request` — `{cpu, mem}`. Верните имя подходящего узла с **наибольшим остатком памяти после размещения**; при равенстве — по имени. Нет подходящих — `None`.",
    starter: raw`def pick_node(nodes, request):
    return None`,
    harness: raw`nodes = [
    {"name": "node-a", "cpu_free": 500, "mem_free": 1024},
    {"name": "node-b", "cpu_free": 2000, "mem_free": 512},
    {"name": "node-c", "cpu_free": 1500, "mem_free": 4096},
    {"name": "node-d", "cpu_free": 1500, "mem_free": 4096},
]
print(pick_node(nodes, {"cpu": 400, "mem": 512}))
print(pick_node(nodes, {"cpu": 1800, "mem": 256}))
print(pick_node(nodes, {"cpu": 600, "mem": 1000}))
print(pick_node(nodes, {"cpu": 3000, "mem": 100}))`,
    referenceSolution: raw`def pick_node(nodes, request):
    fits = [n for n in nodes if n["cpu_free"] >= request["cpu"] and n["mem_free"] >= request["mem"]]
    if not fits:
        return None
    best = max(fits, key=lambda n: (n["mem_free"] - request["mem"], -ord(n["name"][-1])))
    return best["name"]`,
    hint: "Сначала отфильтруйте узлы, где хватает и CPU, и памяти. Затем выберите максимум по `mem_free - request['mem']`; для равных остатков возьмите узел с меньшим именем.",
    explain: "Если ни один узел не подходит, под остаётся в `Pending` с событием `Insufficient cpu/memory`. Заметьте: планировщик не смотрит на фактическую нагрузку, поэтому завышенные requests оставляют кластер «полным» при пустых узлах.",
  },
  {
    id: "partition-key", title: "Ключ и партиция", category: "Kafka", level: "Лёгкая", minutes: 10,
    description: "Kafka кладёт сообщение в партицию по ключу: один и тот же ключ — всегда одна партиция. Напишите `partition_for(key, partitions)`, которая возвращает номер от `0` до `partitions - 1`. Подойдёт любая детерминированная хеш-функция (не встроенный `hash()` — он меняется между запусками).",
    starter: raw`def partition_for(key, partitions):
    return 0`,
    harness: raw`keys = ["order-1", "order-2", "order-3", "user-42", "user-7", "cart-9"]
n = 4
first = {k: partition_for(k, n) for k in keys}
second = {k: partition_for(k, n) for k in keys}
print("в диапазоне:", all(0 <= p < n for p in first.values()))
print("ключ -> та же партиция:", first == second)
many = {partition_for("key-%d" % i, n) for i in range(200)}
print("используются все партиции:", many == set(range(n)))`,
    referenceSolution: raw`import zlib

def partition_for(key, partitions):
    return zlib.crc32(key.encode("utf-8")) % partitions`,
    hint: "`zlib.crc32(key.encode('utf-8')) % partitions` — детерминированный хеш по модулю числа партиций.",
    explain: "Настоящий Kafka использует murmur2, но идея та же: хеш ключа по модулю числа партиций. Отсюда важное следствие: если увеличить число партиций, ключи «переедут» в другие партиции, и порядок для старых ключей нарушится.",
  },
  {
    id: "partition-order", title: "Порядок только внутри партиции", category: "Kafka", level: "Средняя", minutes: 12,
    description: "Напишите `produce(messages, partitions, part)`: `messages` — список пар `(key, value)` в порядке отправки, `part(key, n)` — функция выбора партиции. Верните список из `partitions` списков: в каждой — значения сообщений своей партиции в порядке поступления.",
    starter: raw`def produce(messages, partitions, part):
    return []`,
    harness: raw`def part(key, n):
    return sum(ord(c) for c in key) % n

messages = [("a", "a1"), ("b", "b1"), ("a", "a2"), ("c", "c1"), ("b", "b2"), ("a", "a3")]
log = produce(messages, 3, part)
for i, p in enumerate(log):
    print("partition", i, p)
print("все a подряд и по порядку:", [v for p in log for v in p if v.startswith("a")] == ["a1", "a2", "a3"])`,
    referenceSolution: raw`def produce(messages, partitions, part):
    log = [[] for _ in range(partitions)]
    for key, value in messages:
        log[part(key, partitions)].append(value)
    return log`,
    hint: "Создайте список пустых списков по числу партиций и добавляйте каждое значение в список, номер которого вернула `part(key, partitions)`.",
    explain: "Сообщения одного ключа лежат в одной партиции и читаются по порядку. А вот порядок между разными партициями не определён. Если нужна последовательность событий одного заказа, делайте `order_id` ключом.",
  },
  {
    id: "group-assign", title: "Группа потребителей", category: "Kafka", level: "Средняя", minutes: 14,
    description: "В группе каждая партиция читается **не более чем одним** потребителем. Напишите `assign(partitions, consumers)`: `partitions` — число партиций, `consumers` — список имён. Раздайте партиции по кругу в порядке имён и верните словарь `имя → список партиций` (лишние потребители получают пустой список).",
    starter: raw`def assign(partitions, consumers):
    return {}`,
    harness: raw`for p, group in [(6, ["c", "a", "b"]), (6, ["a", "b"]), (3, ["a", "b", "c", "d", "e"]), (4, ["solo"])]:
    result = assign(p, group)
    print(p, "партиций:", {k: result[k] for k in sorted(result)})`,
    referenceSolution: raw`def assign(partitions, consumers):
    names = sorted(consumers)
    result = {name: [] for name in names}
    for p in range(partitions):
        result[names[p % len(names)]].append(p)
    return result`,
    hint: "Отсортируйте имена и раздавайте партицию `p` потребителю с индексом `p % len(names)`.",
    explain: "Потребителей больше, чем партиций, — лишние простаивают. Поэтому число партиций определяет максимальный параллелизм группы. Когда потребитель падает, Kafka перераспределяет (ребалансирует) партиции между оставшимися.",
  },
  {
    id: "consumer-lag", title: "Лаг потребителя", category: "Kafka", level: "Лёгкая", minutes: 8,
    description: "Лаг — главная метрика здоровья потребителя. Напишите `lag(end_offsets, committed)`: оба аргумента — словари `партиция → офсет`. Верните пару `(лаг по партициям, общий лаг)`. Если для партиции нет коммита, считайте коммит равным `0`.",
    starter: raw`def lag(end_offsets, committed):
    return ({}, 0)`,
    harness: raw`end = {0: 120, 1: 80, 2: 300}
print(lag(end, {0: 120, 1: 75, 2: 100}))
print(lag(end, {0: 100}))
print(lag({0: 5}, {0: 5}))`,
    referenceSolution: raw`def lag(end_offsets, committed):
    per = {p: end - committed.get(p, 0) for p, end in sorted(end_offsets.items())}
    return (per, sum(per.values()))`,
    hint: "Лаг партиции — это `конец_лога - закоммиченный_офсет`. Недостающий коммит берите через `committed.get(p, 0)`.",
    explain: "Растущий лаг значит, что потребители не успевают за производителями: добавьте потребителей (не больше числа партиций) или ускорьте обработку. Именно эту цифру показывают мониторинг и автоскейлеры вроде KEDA.",
  },
  {
    id: "commit-after", title: "Коммит после обработки", category: "Kafka", level: "Сложная", minutes: 18,
    description: "Напишите `run(log, state, handler)`: читайте `log` начиная с `state['committed']`, для каждого сообщения вызывайте `handler(message)`, и **только после успешной обработки** увеличивайте `state['committed']` на единицу. Если обработчик упал, исключение должно пройти наружу, а офсет остаться на этом сообщении.",
    starter: raw`def run(log, state, handler):
    for message in log[state["committed"]:]:
        state["committed"] += 1
        handler(message)`,
    harness: raw`log = ["m0", "m1", "m2", "m3"]
seen = []
crashed = {"done": False}

def handler(message):
    seen.append(message)
    if message == "m2" and not crashed["done"]:
        crashed["done"] = True
        raise RuntimeError("упали на m2")

state = {"committed": 0}
try:
    run(log, state, handler)
except RuntimeError as error:
    print("ошибка:", error, "| офсет:", state["committed"])
run(log, state, handler)
print("обработано:", seen)
print("итоговый офсет:", state["committed"])`,
    referenceSolution: raw`def run(log, state, handler):
    for message in log[state["committed"]:]:
        handler(message)
        state["committed"] += 1`,
    hint: "Поменяйте местами две строки: сначала `handler(message)`, потом увеличение офсета.",
    explain: "Это at-least-once: после падения `m2` обработалось дважды, но не потерялось. Если коммитить до обработки (at-most-once), сообщение при падении теряется навсегда. Поэтому обработчики делают идемпотентными — следующая задача.",
  },
  {
    id: "idempotent-handler", title: "Идемпотентный обработчик", category: "Kafka", level: "Сложная", minutes: 16,
    description: "При at-least-once одно событие может прийти дважды. Напишите `apply(event, state)`: событие — `{id, amount}`, `state` — `{balance, seen}` (`seen` — множество уже учтённых `id`). Если `id` уже был, ничего не меняйте и верните `False`; иначе добавьте `amount` к `balance`, запомните `id` и верните `True`.",
    starter: raw`def apply(event, state):
    state["balance"] += event["amount"]
    return True`,
    harness: raw`state = {"balance": 0, "seen": set()}
events = [
    {"id": "e1", "amount": 100},
    {"id": "e2", "amount": 50},
    {"id": "e1", "amount": 100},
    {"id": "e3", "amount": -30},
    {"id": "e2", "amount": 50},
]
print([apply(e, state) for e in events])
print("баланс:", state["balance"], "| уникальных:", len(state["seen"]))`,
    referenceSolution: raw`def apply(event, state):
    if event["id"] in state["seen"]:
        return False
    state["balance"] += event["amount"]
    state["seen"].add(event["id"])
    return True`,
    hint: "Проверьте `event['id'] in state['seen']` до изменения баланса.",
    explain: "Дубликаты в at-least-once неизбежны, поэтому результат обработки не должен зависеть от числа повторов. На практике `seen` хранят в базе в той же транзакции, что и изменение данных, либо используют уникальный ключ записи.",
  },
];

export const getK8sChallenge = (id) => k8sChallenges.find((item) => item.id === id) || k8sChallenges[0];
