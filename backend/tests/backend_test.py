"""NOIR & BLOOM Backend API pytest suite."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@noirandbloom.com"
ADMIN_PASSWORD = "NoirBloom2026"


@pytest.fixture(scope="session")
def s():
    ses = requests.Session()
    ses.headers.update({"Content-Type": "application/json"})
    return ses


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/admin/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_s(admin_token):
    ses = requests.Session()
    ses.headers.update({"Content-Type": "application/json",
                        "Authorization": f"Bearer {admin_token}"})
    return ses


# ---------- Public / Products ----------
class TestProducts:
    def test_root(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "online"

    def test_list_products(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 12
        assert "_id" not in data[0]
        assert {"id", "name", "slug", "price", "category"}.issubset(data[0].keys())

    def test_featured(self, s):
        r = s.get(f"{API}/products", params={"featured": "true"})
        assert r.status_code == 200
        data = r.json()
        assert all(p["featured"] for p in data)
        assert len(data) >= 1

    def test_category_filter(self, s):
        r = s.get(f"{API}/products", params={"category": "coffee"})
        assert r.status_code == 200
        assert all(p["category"] == "coffee" for p in r.json())

    def test_search(self, s):
        r = s.get(f"{API}/products", params={"search": "espresso"})
        assert r.status_code == 200
        assert any("espresso" in p["name"].lower() for p in r.json())

    def test_dietary(self, s):
        r = s.get(f"{API}/products", params={"dietary": "vegan"})
        assert r.status_code == 200
        assert all("vegan" in p["dietary"] for p in r.json())

    def test_product_by_slug(self, s):
        r = s.get(f"{API}/products")
        slug = r.json()[0]["slug"]
        r2 = s.get(f"{API}/products/{slug}")
        assert r2.status_code == 200
        assert r2.json()["slug"] == slug

    def test_product_404(self, s):
        r = s.get(f"{API}/products/nonexistent-xyz")
        assert r.status_code == 404

    def test_categories(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        assert len(r.json()) == 5


# ---------- Cart / Coupons ----------
class TestCart:
    def test_cart_totals(self, s):
        prods = s.get(f"{API}/products").json()
        payload = {"items": [{"product_id": prods[0]["id"], "quantity": 2}]}
        r = s.post(f"{API}/cart/totals", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["totals"]["subtotal"] == round(prods[0]["price"] * 2, 2)
        assert data["totals"]["total"] > 0

    def test_coupon_noir10(self, s):
        prods = s.get(f"{API}/products").json()
        payload = {"items": [{"product_id": prods[0]["id"], "quantity": 2}],
                   "coupon": "NOIR10"}
        r = s.post(f"{API}/cart/totals", json=payload)
        assert r.status_code == 200
        data = r.json()
        expected_discount = round(prods[0]["price"] * 2 * 0.10, 2)
        assert data["totals"]["discount"] == expected_discount

    def test_coupon_bloom20(self, s):
        prods = s.get(f"{API}/products").json()
        payload = {"items": [{"product_id": prods[0]["id"], "quantity": 3}],
                   "coupon": "BLOOM20"}
        r = s.post(f"{API}/cart/totals", json=payload)
        data = r.json()
        expected = round(prods[0]["price"] * 3 * 0.20, 2)
        assert data["totals"]["discount"] == expected

    def test_coupon_invalid(self, s):
        r = s.post(f"{API}/coupons/validate", json={"code": "NOPE"})
        assert r.status_code == 404


# ---------- Checkout ----------
class TestCheckout:
    def test_create_session(self, s):
        prods = s.get(f"{API}/products").json()
        payload = {
            "items": [{"product_id": prods[0]["id"], "quantity": 1}],
            "customer": {"name": "TEST User", "email": "test@example.com", "phone": "+1234567890"},
            "delivery": {"type": "pickup"},
            "coupon": None,
            "origin_url": BASE_URL,
        }
        r = s.post(f"{API}/checkout/session", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["checkout_url"].startswith("http")
        assert d["order_number"].startswith("NOIR-")
        assert "session_id" in d
        # Order should be retrievable
        r2 = s.get(f"{API}/orders/{d['order_number']}")
        assert r2.status_code == 200
        assert r2.json()["order_number"] == d["order_number"]
        # Payment status
        r3 = s.get(f"{API}/payments/status/{d['session_id']}")
        assert r3.status_code == 200
        assert r3.json()["payment_status"] in ("pending", "paid")


# ---------- Contact / Reservations / Newsletter ----------
class TestForms:
    def test_contact(self, s):
        r = s.post(f"{API}/contact", json={
            "name": "TEST", "email": "t@t.com", "message": "hi"})
        assert r.status_code == 200 and r.json()["ok"]

    def test_reservation(self, s):
        r = s.post(f"{API}/reservations", json={
            "name": "TEST", "email": "t@t.com", "phone": "555",
            "date": "2026-02-01", "time": "19:00", "guests": 2})
        assert r.status_code == 200 and r.json()["ok"]

    def test_newsletter(self, s):
        r = s.post(f"{API}/newsletter", json={"email": f"test_{uuid.uuid4().hex[:6]}@x.com"})
        assert r.status_code == 200 and r.json()["ok"]

    def test_locations(self, s):
        r = s.get(f"{API}/locations")
        assert r.status_code == 200
        assert len(r.json()) == 4


# ---------- Auth / Admin ----------
class TestAuth:
    def test_admin_login_wrong(self, s):
        r = s.post(f"{API}/auth/admin/login",
                   json={"email": ADMIN_EMAIL, "password": "wrongpw"})
        assert r.status_code == 401

    def test_admin_login_ok(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_me(self, admin_s):
        r = admin_s.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_admin_endpoints_require_auth(self, s):
        for path in ["/admin/orders", "/admin/contacts", "/admin/reservations", "/admin/stats"]:
            r = s.get(f"{API}{path}")
            assert r.status_code == 401, f"{path} did not require auth"


class TestAdmin:
    def test_stats(self, admin_s):
        r = admin_s.get(f"{API}/admin/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_revenue", "today_revenue", "total_orders",
                  "top_products", "timeline"):
            assert k in d
        assert len(d["timeline"]) == 7

    def test_orders_list(self, admin_s):
        r = admin_s.get(f"{API}/admin/orders")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contacts_list(self, admin_s):
        r = admin_s.get(f"{API}/admin/contacts")
        assert r.status_code == 200

    def test_reservations_list(self, admin_s):
        r = admin_s.get(f"{API}/admin/reservations")
        assert r.status_code == 200

    def test_product_crud(self, admin_s):
        # Create
        payload = {"name": "TEST_Product", "category": "coffee", "price": 9.99,
                   "description": "test", "image": "https://example.com/x.jpg"}
        r = admin_s.post(f"{API}/admin/products", json=payload)
        assert r.status_code == 200, r.text
        prod = r.json()
        pid = prod["id"]
        assert "_id" not in prod
        # Verify listed
        r2 = admin_s.get(f"{API}/products")
        assert any(p["id"] == pid for p in r2.json())
        # Update
        payload_u = {**payload, "name": "TEST_Updated", "price": 12.50}
        r3 = admin_s.put(f"{API}/admin/products/{pid}", json=payload_u)
        assert r3.status_code == 200
        assert r3.json()["name"] == "TEST_Updated"
        assert r3.json()["price"] == 12.50
        # Delete
        r4 = admin_s.delete(f"{API}/admin/products/{pid}")
        assert r4.status_code == 200
        # Verify gone
        r5 = admin_s.get(f"{API}/products")
        assert not any(p["id"] == pid for p in r5.json())
