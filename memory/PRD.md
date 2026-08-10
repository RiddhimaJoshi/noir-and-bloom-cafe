# NOIR & BLOOM — Luxury International Café (Production-Ready Full-Stack)

## Original Problem Statement
Build a COMPLETE, PREMIUM, PRODUCTION-READY FULL-STACK website for a luxury international café and dessert brand — NOIR & BLOOM. Full functional backend + immersive frontend (cinematic hero, 3D, scroll experience, product showcase, cart, checkout with Stripe, order tracking, admin dashboard, contact/reservations).

## Tech Stack (as built)
- Frontend: React 19 + Tailwind + Framer Motion + @react-three/fiber@9 + Lenis smooth scroll + Sonner + Recharts
- Backend: FastAPI + Motor (Mongo async) + JWT (bcrypt) + emergentintegrations Stripe (Flow B)
- Database: MongoDB (products, orders, payment_transactions, admins, contacts, reservations, coupons, newsletter)
- Payment: Stripe via emergentintegrations, STRIPE_API_KEY=sk_test_emergent (test card 4242 4242 4242 4242)
- Fonts: Cormorant Garamond (serif) + Manrope (sans)

## User Personas
1. Guest browsing menu → add to cart → checkout → track order
2. Admin managing products, orders, contacts, reservations, viewing revenue analytics

## Implemented (Aug 2026)
### Backend (/app/backend/server.py)
- GET/POST /api/products, /api/products/{slug}, /api/categories
- POST/PUT/DELETE /api/admin/products (JWT-guarded, fixed slug bug)
- POST /api/cart/totals (server-side price calc)
- POST /api/coupons/validate (NOIR10, BLOOM20)
- POST /api/checkout/session (creates Stripe session + order + payment_transaction)
- GET /api/payments/status/{session_id} (polling + inline Stripe fallback)
- POST /api/webhook/stripe (idempotent payment_status guard)
- GET /api/orders/{order_number}, /api/admin/orders, PUT /api/admin/orders/{id}/status
- GET /api/admin/stats (revenue, top products, 7-day timeline)
- POST /api/contact, /api/reservations, /api/newsletter
- GET /api/admin/contacts, /api/admin/reservations
- GET /api/locations (Paris, Tokyo, New York, Dubai)
- POST /api/auth/admin/login (JWT), GET /api/auth/me
- Auto-seed on startup: 1 admin + 12 luxury products (Espresso Noir, Velvet Mocha, Truffle Brioche, Burrata Sunrise, Dark Chocolate Torte, Pistachio Paris-Brest, Vanilla Bean Crème Brûlée, Strawberry Basil Fizz, Midnight Cold Brew, Noir Signature Flight, Golden Hour Affogato, Caramel Cloud Latte) + 2 coupons

### Frontend (/app/frontend/src)
- Pages (public): Home (cinematic 3D hero + marquee + editorial sections), Menu (filters/search/sort), ProductDetails, Cart, Checkout, Payment success/cancel, OrderTracking (5-stage timeline), About/Story, Locations, Contact, Events/Reservations
- Pages (admin): Login, Dashboard (charts), Products (CRUD modal), Orders (status dropdown), Contacts, Reservations
- Components: Navigation (glass on scroll, mobile drawer), Footer (newsletter + socials), CustomCursor, HeroCanvas (raw fiber floating beans + gold particles)
- CartContext (localStorage persistence)
- Lenis smooth scroll, prefers-reduced-motion respected, grain overlay, custom cursor

## Verified (Testing Agent — iteration_2)
- Backend: 27/27 pytest tests pass (100%)
- Frontend: hero 3D renders (React 19 + @react-three/fiber@9), no runtime errors, all e2e flows work (menu, product, cart, admin, checkout redirect to real Stripe URL)

## Environment
- backend/.env: MONGO_URL, DB_NAME, CORS_ORIGINS, STRIPE_API_KEY=sk_test_emergent, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
- Admin: admin@noirandbloom.com / NoirBloom2026 (see /app/memory/test_credentials.md)

## Prioritized Backlog (Post-MVP)
- P1: Email confirmations (Resend) on order paid + reservation received
- P1: Real product image uploads via object storage
- P2: Customer accounts (order history)
- P2: Real-time order updates via WebSocket / SSE
- P2: Content-manageable About page from admin
- P3: SEO sitemap.xml generation, structured data (Restaurant schema)
