"""
Run this once to create an admin account.

Admins are not allowed to sign up through the normal signup page.

Usage:
    python3 create_admin.py
"""

import os
import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client["campus_events"]
users_col = db["users"]

email = input("Admin email: ").strip().lower()
name = input("Admin name: ").strip()
password = input("Admin password: ").strip()

if users_col.find_one({"email": email}):
    print("❌ A user with that email already exists.")
    exit()

admin = {
    "email": email,
    "name": name,
    "password": generate_password_hash(
        password,
        method="pbkdf2:sha256"
    ),

    "role": "admin",

    # Admin is automatically trusted
    "approved": True,
    "id_verified": True,
    "email_verified": True,

    # Optional profile fields
    "profile_photo": "",
    "college_id": "",

    "created_at": datetime.datetime.utcnow(),
}

users_col.insert_one(admin)

print("\n✅ Admin account created successfully!")
print(f"Email: {email}")
print("You can now log in from the normal login page.")