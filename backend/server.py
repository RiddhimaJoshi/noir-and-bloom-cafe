"""NOIR & BLOOM — Luxury Café Backend (FastAPI + MongoDB + Stripe)."""
import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from starlette.middleware.cors import CORSMiddleware

#from emergentintegrations.payments.stripe.checkout import (
    #StripeCheckout,
   # CheckoutSessionRequest,
   # CheckoutStatusResponse,
#)

# ------------- Setup -------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ.get("JWT_SECRET", "dev_secret_change_me")
JWT_ALG = "HS256"
JWT_EXPIRE_HOURS = 24 * 7

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@noirandbloom.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "NoirBloom2026")

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

app = FastAPI(title="NOIR & BLOOM API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ------------- Utils -------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(payload: Dict[str, Any]) -> str:
    payload = {**payload, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not creds:
        raise HTTPException(401, "Missing token")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return payload


def clean(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc is None:
        return doc
    doc.pop("_id", None)
    return doc


# ------------- Models -------------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str
    price: float
    description: str
    ingredients: List[str] = []
    allergens: List[str] = []
    calories: Optional[int] = None
    dietary: List[str] = []  # vegetarian, vegan, gluten-free, spicy
    image: str
    gallery: List[str] = []
    video: Optional[str] = None
    featured: bool = False
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class ProductIn(BaseModel):
    name: str
    slug: Optional[str] = None
    category: str
    price: float
    description: str
    ingredients: List[str] = []
    allergens: List[str] = []
    calories: Optional[int] = None
    dietary: List[str] = []
    image: str
    gallery: List[str] = []
    video: Optional[str] = None
    featured: bool = False
    active: bool = True


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=50)


class CheckoutRequest(BaseModel):
    items: List[CartItem]
    customer: Dict[str, Any]
    delivery: Dict[str, Any]
    coupon: Optional[str] = None
    origin_url: str


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str


class ReservationIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date: str
    time: str
    guests: int
    occasion: Optional[str] = None
    notes: Optional[str] = None


class NewsletterIn(BaseModel):
    email: EmailStr


class AdminLogin(BaseModel):
    email: str
    password: str


class OrderStatusUpdate(BaseModel):
    status: str


# ------------- Seed data -------------
SEED_PRODUCTS = [
    {"name": "Espresso Noir", "category": "coffee", "price": 5.50,
     "description": "A single origin Ethiopian pull — dense crema, notes of dark cocoa and blackberry.",
     "ingredients": ["Single-origin Arabica", "Filtered water"], "allergens": [], "calories": 5,
     "dietary": ["vegan", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=1200&q=85",
     "featured": True},
    {"name": "Velvet Mocha", "category": "coffee", "price": 7.80,
     "description": "House espresso layered with 70% Valrhona chocolate and steamed cream.",
     "ingredients": ["Espresso", "Valrhona 70%", "Whole milk", "Cream"], "allergens": ["milk"], "calories": 340,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1200&q=85",
     "featured": True},
    {"name": "Caramel Cloud Latte", "category": "coffee", "price": 7.20,
     "description": "Salted caramel infused espresso topped with an ethereal cloud of vanilla foam.",
     "ingredients": ["Espresso", "Salted caramel", "Milk", "Vanilla"], "allergens": ["milk"], "calories": 290,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=85"},
    {"name": "Midnight Cold Brew", "category": "cold_drinks", "price": 6.50,
     "description": "18-hour steeped cold brew, finished with an oak-aged vanilla tincture.",
     "ingredients": ["Cold brew concentrate", "Oak vanilla", "Filtered water"], "allergens": [], "calories": 15,
     "dietary": ["vegan", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=85",
     "featured": True},
    {"name": "Strawberry Basil Fizz", "category": "cold_drinks", "price": 8.00,
     "description": "Wild strawberry, garden basil, sparkling water — a botanical refresher.",
     "ingredients": ["Wild strawberry", "Fresh basil", "Sparkling water", "Cane sugar"], "allergens": [], "calories": 120,
     "dietary": ["vegan", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&q=85"},
    {"name": "Truffle Mushroom Brioche", "category": "brunch", "price": 18.00,
     "description": "Warm brioche folded with wild mushrooms, black truffle and 24-month comté.",
     "ingredients": ["Brioche", "Wild mushrooms", "Black truffle", "Comté"],
     "allergens": ["gluten", "milk", "egg"], "calories": 620,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=1200&q=85",
     "featured": True},
    {"name": "Burrata Sunrise", "category": "brunch", "price": 22.00,
     "description": "Puglian burrata, heirloom tomato confit, saffron oil, focaccia toast.",
     "ingredients": ["Burrata", "Heirloom tomato", "Saffron", "Focaccia"],
     "allergens": ["milk", "gluten"], "calories": 540,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=1200&q=85"},
    {"name": "Dark Chocolate Torte", "category": "desserts", "price": 12.50,
     "description": "Flourless 72% Guanaja torte with smoked sea salt and crème anglaise.",
     "ingredients": ["Guanaja 72%", "Butter", "Eggs", "Sea salt"], "allergens": ["milk", "egg"], "calories": 480,
     "dietary": ["vegetarian", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&q=85",
     "featured": True},
    {"name": "Pistachio Paris-Brest", "category": "desserts", "price": 11.00,
     "description": "Choux ring filled with Bronte pistachio praline crème and gold leaf.",
     "ingredients": ["Choux pastry", "Bronte pistachio", "Cream"], "allergens": ["gluten", "milk", "egg", "nuts"], "calories": 520,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&q=85"},
    {"name": "Vanilla Bean Crème Brûlée", "category": "desserts", "price": 10.50,
     "description": "Madagascar vanilla custard beneath a torched sugar crown.",
     "ingredients": ["Madagascar vanilla", "Cream", "Egg yolk", "Cane sugar"],
     "allergens": ["milk", "egg"], "calories": 420,
     "dietary": ["vegetarian", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=1200&q=85"},
    {"name": "Noir Signature Flight", "category": "signature", "price": 32.00,
     "description": "A curated tasting flight — three single origins, three desserts, one unforgettable hour.",
     "ingredients": ["Curator's selection"], "allergens": ["milk", "gluten", "nuts"], "calories": 780,
     "dietary": ["vegetarian"],
     "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=85",
     "featured": True},
    {"name": "Golden Hour Affogato", "category": "signature", "price": 14.00,
     "description": "Toasted honeycomb gelato drowned in a double shot of Espresso Noir.",
     "ingredients": ["Gelato", "Honeycomb", "Espresso"], "allergens": ["milk", "egg"], "calories": 380,
     "dietary": ["vegetarian", "gluten-free"],
     "image": "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=1200&q=85"},
]


async def seed_db():
    # Admin
    if not await db.admins.find_one({"email": ADMIN_EMAIL}):
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password": hash_password(ADMIN_PASSWORD),
            "created_at": now_iso(),
        })
    # Products
    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            slug = p["name"].lower().replace(" ", "-").replace("é", "e").replace("û", "u")
            doc = Product(**p, slug=slug).model_dump()
            await db.products.insert_one(doc)
    # Coupons
    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([
            {"code": "NOIR10", "type": "percent", "value": 10, "active": True},
            {"code": "BLOOM20", "type": "percent", "value": 20, "active": True},
        ])


@app.on_event("startup")
async def on_startup():
    await seed_db()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ------------- Public: Products -------------
@api_router.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None,
                        dietary: Optional[str] = None, search: Optional[str] = None):
    q: Dict[str, Any] = {"active": True}
    if category and category != "all":
        q["category"] = category
    if featured is not None:
        q["featured"] = featured
    if dietary:
        q["dietary"] = {"$in": [dietary]}
    if search:
        q["name"] = {"$regex": search, "$options": "i"}
    docs = await db.products.find(q, {"_id": 0}).to_list(500)
    return docs


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api_router.get("/categories")
async def categories():
    return [
        {"key": "coffee", "name": "Coffee"},
        {"key": "brunch", "name": "Brunch"},
        {"key": "desserts", "name": "Desserts"},
        {"key": "cold_drinks", "name": "Cold Drinks"},
        {"key": "signature", "name": "Signature Specials"},
    ]


# ------------- Auth (Admin) -------------
@api_router.post("/auth/admin/login")
async def admin_login(body: AdminLogin):
    admin = await db.admins.find_one({"email": body.email})
    if not admin or not verify_password(body.password, admin["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token({"sub": admin["id"], "email": admin["email"], "role": "admin"})
    return {"token": token, "email": admin["email"]}


@api_router.get("/auth/me")
async def me(payload=Depends(require_admin)):
    return {"email": payload.get("email"), "role": payload.get("role")}


# ------------- Admin: Products CRUD -------------
@api_router.post("/admin/products")
async def create_product(body: ProductIn, _=Depends(require_admin)):
    data = body.model_dump()
    data["slug"] = (body.slug or body.name).lower().replace(" ", "-")
    doc = Product(**data).model_dump()
    await db.products.insert_one(doc)
    return clean(doc)


@api_router.put("/admin/products/{pid}")
async def update_product(pid: str, body: ProductIn, _=Depends(require_admin)):
    upd = body.model_dump(exclude_unset=True)
    r = await db.products.update_one({"id": pid}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return await db.products.find_one({"id": pid}, {"_id": 0})


@api_router.delete("/admin/products/{pid}")
async def delete_product(pid: str, _=Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ------------- Orders & Checkout (Stripe) -------------
def calc_totals(items_with_price: List[Dict[str, Any]], coupon: Optional[Dict] = None) -> Dict[str, float]:
    subtotal = sum(i["price"] * i["quantity"] for i in items_with_price)
    tax = round(subtotal * 0.08, 2)
    delivery = 4.50 if subtotal < 40 else 0.0
    discount = 0.0
    if coupon and coupon.get("active"):
        if coupon["type"] == "percent":
            discount = round(subtotal * coupon["value"] / 100, 2)
    total = round(subtotal + tax + delivery - discount, 2)
    return {"subtotal": round(subtotal, 2), "tax": tax, "delivery": delivery,
            "discount": discount, "total": total}


@api_router.post("/cart/totals")
async def cart_totals(body: Dict[str, Any]):
    ids = [i["product_id"] for i in body.get("items", [])]
    prods = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(200)
    price_map = {p["id"]: p for p in prods}
    line = []
    for it in body.get("items", []):
        p = price_map.get(it["product_id"])
        if not p:
            continue
        line.append({"product_id": p["id"], "name": p["name"], "price": p["price"],
                     "quantity": it["quantity"], "image": p["image"]})
    coupon = None
    code = body.get("coupon")
    if code:
        coupon = await db.coupons.find_one({"code": code.upper(), "active": True}, {"_id": 0})
    totals = calc_totals(line, coupon)
    return {"lines": line, "totals": totals, "coupon": coupon}


@api_router.post("/coupons/validate")
async def validate_coupon(body: Dict[str, str]):
    c = await db.coupons.find_one({"code": body.get("code", "").upper(), "active": True}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Invalid coupon")
    return c


@api_router.post("/checkout/session")
async def create_checkout(body: CheckoutRequest, request: Request):
    # Recompute totals server-side
    ids = [i.product_id for i in body.items]
    prods = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(200)
    pmap = {p["id"]: p for p in prods}
    if not prods:
        raise HTTPException(400, "No valid items")
    line = []
    for it in body.items:
        p = pmap.get(it.product_id)
        if not p:
            continue
        line.append({"product_id": p["id"], "name": p["name"], "price": p["price"],
                     "quantity": it.quantity, "image": p["image"]})
    coupon = None
    if body.coupon:
        coupon = await db.coupons.find_one({"code": body.coupon.upper(), "active": True}, {"_id": 0})
    totals = calc_totals(line, coupon)

    # Create order
    order_number = f"NOIR-{str(uuid.uuid4())[:8].upper()}"
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "order_number": order_number,
        "items": line,
        "totals": totals,
        "customer": body.customer,
        "delivery": body.delivery,
        "coupon": body.coupon,
        "status": "pending",
        "payment_status": "pending",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.orders.insert_one(order_doc)

    # Stripe checkout via emergentintegrations
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    success_url = f"{body.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{body.origin_url}/payment/cancel"
    req = CheckoutSessionRequest(
        amount=float(totals["total"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "order_number": order_number,
                  "customer_email": body.customer.get("email", "")},
    )
    session = await stripe_checkout.create_checkout_session(req)

    # Store payment tx
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "order_id": order_id,
        "order_number": order_number,
        "amount": float(totals["total"]),
        "currency": "usd",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    })
    await db.orders.update_one({"id": order_id}, {"$set": {"stripe_session_id": session.session_id}})

    return {"checkout_url": session.url, "session_id": session.session_id,
            "order_id": order_id, "order_number": order_number}


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str, request: Request):
    rec = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    if rec.get("payment_status") != "paid":
        try:
            host_url = str(request.base_url)
            webhook_url = f"{host_url}api/webhook/stripe"
            sc = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
            status_resp: CheckoutStatusResponse = await sc.get_checkout_status(session_id)
            if status_resp.payment_status == "paid" or status_resp.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid",
                              "updated_at": now_iso()}},
                )
                await db.orders.update_one(
                    {"stripe_session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "confirmed", "payment_status": "paid",
                              "updated_at": now_iso()}},
                )
                rec = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except Exception as e:
            logging.exception("stripe status err: %s", e)
    return {"session_id": rec["session_id"], "status": rec["status"],
            "payment_status": rec["payment_status"], "order_number": rec.get("order_number")}


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    try:
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        sc = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        resp = await sc.handle_webhook(body, sig)
    except Exception as e:
        logging.exception("webhook error: %s", e)
        raise HTTPException(400, "invalid webhook")
    session_id = resp.session_id
    if resp.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": "paid", "updated_at": now_iso()}},
        )
        await db.orders.update_one(
            {"stripe_session_id": session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "confirmed", "payment_status": "paid", "updated_at": now_iso()}},
        )
    return {"status": "ok"}


# ------------- Order tracking -------------
@api_router.get("/orders/{order_number}")
async def get_order(order_number: str):
    doc = await db.orders.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    return doc


# ------------- Admin: Orders -------------
@api_router.get("/admin/orders")
async def admin_orders(_=Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, body: OrderStatusUpdate, _=Depends(require_admin)):
    allowed = ["pending", "payment_processing", "confirmed", "preparing", "ready",
               "out_for_delivery", "completed", "cancelled"]
    if body.status not in allowed:
        raise HTTPException(400, "Invalid status")
    r = await db.orders.update_one({"id": order_id}, {"$set": {"status": body.status, "updated_at": now_iso()}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ------------- Admin: Analytics -------------
@api_router.get("/admin/stats")
async def admin_stats(_=Depends(require_admin)):
    today = datetime.now(timezone.utc).date().isoformat()
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(5000)
    paid = [o for o in all_orders if o.get("payment_status") == "paid"]
    today_orders = [o for o in all_orders if o["created_at"].startswith(today)]
    today_paid = [o for o in today_orders if o.get("payment_status") == "paid"]
    total_rev = sum(o["totals"]["total"] for o in paid)
    today_rev = sum(o["totals"]["total"] for o in today_paid)
    pending = [o for o in all_orders if o["status"] in ("pending", "confirmed", "preparing", "ready")]
    completed = [o for o in all_orders if o["status"] == "completed"]
    avg = round(total_rev / len(paid), 2) if paid else 0
    # top products
    counts: Dict[str, int] = {}
    revenue_by_prod: Dict[str, float] = {}
    for o in paid:
        for it in o.get("items", []):
            counts[it["name"]] = counts.get(it["name"], 0) + it["quantity"]
            revenue_by_prod[it["name"]] = revenue_by_prod.get(it["name"], 0) + it["price"] * it["quantity"]
    top = sorted(
        [{"name": k, "quantity": v, "revenue": round(revenue_by_prod.get(k, 0), 2)} for k, v in counts.items()],
        key=lambda x: x["quantity"], reverse=True)[:5]
    # revenue timeline (last 7 days)
    timeline = []
    for i in range(6, -1, -1):
        d = (datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat()
        r = sum(o["totals"]["total"] for o in paid if o["created_at"].startswith(d))
        c = sum(1 for o in paid if o["created_at"].startswith(d))
        timeline.append({"date": d[5:], "revenue": round(r, 2), "orders": c})
    return {
        "total_revenue": round(total_rev, 2),
        "today_revenue": round(today_rev, 2),
        "total_orders": len(all_orders),
        "today_orders": len(today_orders),
        "pending_orders": len(pending),
        "completed_orders": len(completed),
        "avg_order_value": avg,
        "top_products": top,
        "timeline": timeline,
    }


# ------------- Contact / Reservations / Newsletter -------------
@api_router.post("/contact")
async def create_contact(body: ContactIn):
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": now_iso()}
    await db.contacts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/admin/contacts")
async def list_contacts(_=Depends(require_admin)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.post("/reservations")
async def create_reservation(body: ReservationIn):
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "status": "pending", "created_at": now_iso()}
    await db.reservations.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/admin/reservations")
async def list_reservations(_=Depends(require_admin)):
    return await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.post("/newsletter")
async def newsletter(body: NewsletterIn):
    await db.newsletter.update_one(
        {"email": body.email},
        {"$set": {"email": body.email, "created_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}


# ------------- Locations -------------
@api_router.get("/locations")
async def locations():
    return [
        {"id": "paris", "city": "Paris", "address": "12 Rue de Rivoli, 75004 Paris",
         "hours": "07:00 — 23:00", "phone": "+33 1 42 88 44 12"},
        {"id": "tokyo", "city": "Tokyo", "address": "3-6-1 Roppongi, Minato City, Tokyo",
         "hours": "08:00 — 24:00", "phone": "+81 3 6408 5522"},
        {"id": "newyork", "city": "New York", "address": "48 Prince Street, SoHo, NY 10012",
         "hours": "06:30 — 22:30", "phone": "+1 212 555 0142"},
        {"id": "dubai", "city": "Dubai", "address": "DIFC Gate Village 8, Dubai",
         "hours": "08:00 — 01:00", "phone": "+971 4 555 8814"},
    ]


@api_router.get("/")
async def root():
    return {"service": "NOIR & BLOOM API", "status": "online"}


# ------------- Include & CORS -------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
