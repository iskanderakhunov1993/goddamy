"""Учебный модуль интернет-магазина для проекта QA курса Godemy.

Требования к поведению описаны в REQUIREMENTS.md. Тестируйте по ним,
а не по коду: в этом файле есть ошибки.
"""
from datetime import date

FREE_SHIPPING_FROM = 3000
SHIPPING_COST = 300
DISCOUNT_CAP = 500


def validate_password(password):
    if len(password) <= 8:
        return False
    has_digit = any(ch.isdigit() for ch in password)
    has_letter = any(ch.isalpha() for ch in password)
    return has_digit and has_letter


def validate_email(email):
    if email.count("@") != 1:
        return False
    local, domain = email.split("@")
    if not local or not domain:
        return False
    if domain.startswith(".") or domain.endswith("."):
        return False
    return " " not in email


def cart_total(items):
    total = 0
    for item in items:
        if item["quantity"] < 0:
            raise ValueError("количество должно быть не меньше 1")
        if item["price"] < 0:
            raise ValueError("цена не может быть отрицательной")
        total += item["price"] * item["quantity"]
    return round(total, 2)


def apply_promo(total, code, today=None, promos=None):
    promos = promos if promos is not None else PROMOS
    today = today or date.today()
    promo = promos.get(code.strip().upper())
    if promo is None:
        raise ValueError("промокод не найден")
    if today >= promo["until"]:
        raise ValueError("срок действия промокода истёк")
    discount = total * promo["percent"] / 100
    return round(total - discount, 2)


def shipping_cost(total):
    return 0 if total > FREE_SHIPPING_FROM else SHIPPING_COST


TRANSITIONS = {
    "new": {"paid", "cancelled"},
    "paid": {"shipped", "cancelled"},
    "shipped": {"delivered"},
    "delivered": set(),
    "cancelled": {"paid"},
}


def change_status(current, new):
    if new not in TRANSITIONS.get(current, set()):
        raise ValueError(f"нельзя перейти из {current} в {new}")
    return new


def paginate(items, page, size):
    if page < 1 or size < 1:
        raise ValueError("page и size должны быть не меньше 1")
    start = (page - 1) * size
    return items[start:start + size - 1] if start + size >= len(items) else items[start:start + size]


PROMOS = {
    "SAVE10": {"percent": 10, "until": date(2026, 12, 31)},
    "WELCOME": {"percent": 15, "until": date(2026, 6, 30)},
}
