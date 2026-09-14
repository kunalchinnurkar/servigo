"""Populate the database with a service catalog and a few demo accounts so
the app is immediately browsable. Safe to call every startup - it only
inserts what's missing."""

from datetime import datetime, timezone

from werkzeug.security import generate_password_hash

SERVICE_CATALOG = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "AC Repair",
    "Appliance Repair",
    "Home Cleaning",
    "Pest Control",
]

# Roughly spread around Pune, Maharashtra so a demo customer sees a realistic mix.
DEMO_PROVIDERS = [
    dict(name="Ramesh Kadam", email="ramesh.plumber@servigo.demo", phone="9800000001",
         services=["Plumber"], address_text="Kothrud, Pune",
         location={"lat": 18.5074, "lng": 73.8077}, available=True,
         bio="15 years fixing leaks, borewells and bathroom fittings."),
    dict(name="Sunita More", email="sunita.electric@servigo.demo", phone="9800000002",
         services=["Electrician"], address_text="Deccan, Pune",
         location={"lat": 18.5158, "lng": 73.8412}, available=True,
         bio="Licensed electrician, wiring and appliance installation."),
    dict(name="Vikas Pawar", email="vikas.carpenter@servigo.demo", phone="9800000003",
         services=["Carpenter", "Painter"], address_text="Karve Nagar, Pune",
         location={"lat": 18.4894, "lng": 73.8151}, available=True,
         bio="Furniture repair, modular fittings and interior painting."),
    dict(name="Ashok Jadhav", email="ashok.ac@servigo.demo", phone="9800000004",
         services=["AC Repair", "Appliance Repair"], address_text="Shivajinagar, Pune",
         location={"lat": 18.5304, "lng": 73.8478}, available=False,
         bio="AC servicing, fridge and washing machine repair."),
    dict(name="Meena Shinde", email="meena.clean@servigo.demo", phone="9800000005",
         services=["Home Cleaning", "Pest Control"], address_text="Hadapsar, Pune",
         location={"lat": 18.5089, "lng": 73.9260}, available=True,
         bio="Deep cleaning and pest control for homes and small offices."),
    dict(name="Ganesh Bhosale", email="ganesh.plumber2@servigo.demo", phone="9800000006",
         services=["Plumber", "Electrician"], address_text="Hinjawadi, Pune",
         location={"lat": 18.5908, "lng": 73.7392}, available=True,
         bio="Quick response plumbing and basic electrical fixes."),
]

DEMO_CUSTOMER = dict(
    name="Aditi Sharma", email="customer@servigo.demo", phone="9911111111",
)

DEMO_PASSWORD = "password123"


def run_seed(db):
    if db.services.count_documents({}) == 0:
        db.services.insert_many([{"name": s} for s in SERVICE_CATALOG])

    if db.users.count_documents({"email": DEMO_CUSTOMER["email"]}) == 0:
        db.users.insert_one({
            **DEMO_CUSTOMER,
            "password_hash": generate_password_hash(DEMO_PASSWORD),
            "role": "customer",
            "created_at": datetime.now(timezone.utc),
        })

    for p in DEMO_PROVIDERS:
        if db.users.count_documents({"email": p["email"]}) > 0:
            continue
        user_result = db.users.insert_one({
            "name": p["name"],
            "email": p["email"],
            "phone": p["phone"],
            "password_hash": generate_password_hash(DEMO_PASSWORD),
            "role": "provider",
            "created_at": datetime.now(timezone.utc),
        })
        db.provider_profiles.insert_one({
            "user_id": user_result.inserted_id,
            "services": p["services"],
            "bio": p["bio"],
            "location": p["location"],
            "address_text": p["address_text"],
            "available": p["available"],
            "rating_sum": 12,
            "rating_count": 3,
            "created_at": datetime.now(timezone.utc),
        })

    print(f"[seed] {db.services.count_documents({})} services, "
          f"{db.provider_profiles.count_documents({})} providers, "
          f"demo login: {DEMO_CUSTOMER['email']} / {DEMO_PASSWORD} "
          f"(providers: ramesh.plumber@servigo.demo etc, same password)")
