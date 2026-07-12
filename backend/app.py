import random

import io
import qrcode
from flask import send_file
import string
from datetime import datetime, timedelta
from cloudinary.uploader import upload
import cloudinary_config
# from flask_mail import Mail, Message
import os
# import sib_api_v3_sdk
# from sib_api_v3_sdk.rest import ApiException
# from datetime import datetime
import jwt
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
# app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
# app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT"))
# app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS") == "True"
# app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
# app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
# mail = Mail(app)

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

def send_email(to_email, subject, body):
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = os.getenv("BREVO_API_KEY")

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    sender = sib_api_v3_sdk.SendSmtpEmailSender(
        name="CampusConnect",
        email="campusevent40@gmail.com"
    )

    recipient = [
        sib_api_v3_sdk.SendSmtpEmailTo(email=to_email)
    ]

    email = sib_api_v3_sdk.SendSmtpEmail(
        sender=sender,
        to=recipient,
        subject=subject,
        text_content=body,
    )

    try:
        response = api_instance.send_transac_email(email)
        print(response)
    except ApiException as e:
        print(e.body)
        raise

CORS(app)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client["campus_events"]
users_col = db["users"]
events_col = db["events"]
regs_col = db["registrations"]
ratings_col = db.ratings
categories_col = db["categories"]

DEFAULT_CATEGORIES = ["Tech", "Sports", "Cultural", "Workshop", "Seminar"]
# Stores users who haven't verified their email yet
pending_signups = {}




    


# ---------- helpers ----------
def generate_registration_id():
    while True:
        reg_id = "CE-" + str(datetime.now().year) + "-" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )

        if not regs_col.find_one({"registration_id": reg_id}):
            return reg_id
        

def make_token(user):
    payload = {
        "user_id": str(user["_id"]),
        "role": user["role"],
        "exp": datetime.now() + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        data = decode_token()
        if not data:
            return jsonify({"error": "Missing or invalid token"}), 401
        request.user_id = data["user_id"]
        request.role = data["role"]
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = decode_token()
            if not data:
                return jsonify({"error": "Missing or invalid token"}), 401
            if data["role"] not in roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            request.user_id = data["user_id"]
            request.role = data["role"]
            return f(*args, **kwargs)
        return decorated
    return wrapper


def serialize(doc):
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc.pop("password", None)
    return doc


def get_user_or_404(user_id):
    try:
        return users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def send_delete_account_otp(email, otp):
    body = f"""
Hello,

You requested to permanently delete your CampusConnect account.

Your OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this, simply ignore this email.

CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Delete Account OTP",
        body,
    )



def send_registration_approval_email(email, name, event_title):
    body = f"""
Hello {name},

Good news!

Your registration for:

{event_title}

has been approved by the organizer.

You can now log in to CampusConnect and download your QR ticket.

See you at the event!

CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Registration Approved",
        body,
    )



def send_account_removal_email(email, name, reason):
    body = f"""
Hello {name},

Your CampusConnect account has been removed by an administrator.

Reason:
{reason}

If you believe this was a mistake, please contact the administrator.

Regards,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Account Removed",
        body,
    )


def send_event_cancelled_email(
    email,
    name,
    event_title,
    venue,
    date_time,
    reason,
):
    body = f"""
Hello {name},

We regret to inform you that the following event has been cancelled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Event:
{event_title}

Venue:
{venue}

Date & Time:
{date_time}

Reason:
{reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you had already registered, no further action is required.

We apologize for the inconvenience.

Regards,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Event Cancelled",
        body,
    )
def send_otp_email(email, otp):
    body = f"""
Hello,

Welcome to CampusConnect!

Your email verification code is:

{otp}

This code will expire in 5 minutes.

If you did not create this account, you can ignore this email.

Thanks,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect Email Verification",
        body,
    )

def send_rejection_email(email, name, reason):
    body = f"""
Hello {name},

Your organizer application has been rejected.

Reason:
{reason}

Please correct the issue and register again.

Thank you,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Organizer Application Rejected",
        body,
    )

def send_registration_rejection_email(email, name, event_title, reason):
    body = f"""
Hello {name},

Your registration for:

{event_title}

has been rejected by the organizer.

Reason:
{reason}

If you believe this is incorrect, please contact the event organizer.

CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Registration Rejected",
        body,
    )    

def send_waitlist_email(
    email,
    name,
    event_title,
    venue,
    date_time,
    registration_id,
    status,
):
    body = f"""
Hello {name},

You have been approved by the organizer and waitlisted.
You will receive an email if you are cleared from the waitlist.

Event:
{event_title}

Venue:
{venue}

Date & Time:
{date_time}

Registration ID:
{registration_id}

Current Status:
Waitlisted

Thank you,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Event Waitlisted",
        body,
    )






def send_registration_email(
    email,
    name,
    event_title,
    venue,
    date_time,
    registration_id,
    status,
):
    body = f"""
Hello {name},

Your registration request has been submitted successfully.

Event:
{event_title}

Venue:
{venue}

Date & Time:
{date_time}

Registration ID:
{registration_id}

Current Status:
Pending Organizer Approval

Your request will be reviewed by the event organizer after verifying your college ID.

You will receive another email once your registration is approved or rejected.

Thank you,
CampusConnect Team
"""

    send_email(
        email,
        "CampusConnect - Event Registration Confirmation",
        body,
    )


    
# ---------- auth ----------

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    print(data)

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    roll_number = data.get("roll_number", "").strip()
    college = data.get("college", "").strip()
    name = data.get("name", "").strip()
    role = data.get("role", "student")
    
    if role not in ("student", "organizer"):
        return jsonify({"error": "Role must be student or organizer"}), 400
    
    if role == "student":
     if not college:
        return jsonify({"error": "College is required"}), 400

     if not roll_number:
        return jsonify({"error": "Roll number is required"}), 400

    if not email or not password or not name:
      return jsonify({"error": "Name, email and password required"}), 400

    profile_photo = data.get("profile_photo", "")
    college_id = data.get("college_id", "")

    if not profile_photo:
      return jsonify({"error": "Profile photo is required"}), 400

    if not college_id:
        return jsonify({"error": "College ID is required"}), 400

    existing = users_col.find_one({"email": email})

    if role == "student":
     existing_roll = users_col.find_one({
        "college": college,
        "roll_number": roll_number
     })

     if existing_roll:
        return jsonify({
            "error": "Roll number already exists"
        }), 409

     pending_roll = next(
    (
        p for p in pending_signups.values()
        if p.get("college") == college
        and p.get("roll_number") == roll_number
    ),
        None,
)

     if pending_roll:
        return jsonify({
            "error": "Roll number already exists"
        }), 409

     if existing:
      if existing.get("email_verified", False):
        return jsonify({"error": "Account already exists"}), 409

      # Delete old unverified account
      users_col.delete_one({"_id": existing["_id"]})

    # otp = str(random.randint(100000, 999999))

    # user = {
    #     "email": email,
    #     "name": name,
    #     "password": generate_password_hash(
    #         password,
    #         method="pbkdf2:sha256"
    #     ),

    #     "role": role,

    #     "profile_photo": data.get("profile_photo", ""),
    #     "college_id": data.get("college_id", ""),

    #     "id_verified": False,

    #     "approved": True if role == "student" else False,

    #     "email_verified": False,
    #     "email_otp": otp,
    #     "otp_expiry": datetime.datetime.utcnow() + timedelta(minutes=5),

    #     "created_at": datetime.datetime.utcnow(),
    # }

    otp = str(random.randint(100000, 999999))

    pending_signups[email] = {
        "email": email,
        "name": name,
        "password": generate_password_hash(
            password,
            method="pbkdf2:sha256"
        ),
        "role": role,
        "college": college,
        "roll_number": roll_number,

        "profile_photo": profile_photo,
        "college_id": college_id,

        "id_verified": False,
        "approved": True if role == "student" else False,

        "otp": otp,
        "otp_expiry": datetime.now() + timedelta(minutes=5),
    }

    print("OTP:", otp)
    send_otp_email(email, otp)

    return jsonify({
    "message": "OTP sent successfully. Please verify your email."
}), 200


@app.route("/api/events/<event_id>/rate", methods=["POST"])
@role_required("student")
def rate_event(event_id):

    data = request.get_json() or {}

    try:
        rating = int(data.get("rating"))
    except:
        return jsonify({"error": "Invalid rating"}), 400

    feedback = data.get("feedback", "").strip()

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    event = events_col.find_one({"_id": ObjectId(event_id)})

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if event["status"] != "completed":
        return jsonify({"error": "Ratings are allowed only after event completion"}), 400

    reg = regs_col.find_one({
        "event_id": event_id,
        "user_id": request.user_id,
        "attended": True,
    })

    if not reg:
        return jsonify({
            "error": "Only attendees can rate this event."
        }), 403

    existing = ratings_col.find_one({
        "event_id": event_id,
        "user_id": request.user_id,
    })

    if existing:
        return jsonify({
            "error": "You have already rated this event."
        }), 409

    ratings_col.insert_one({
        "event_id": event_id,
        "user_id": request.user_id,
        "user_name": get_user_or_404(request.user_id)["name"],
        "rating": rating,
        "feedback": feedback,
        "created_at": datetime.now(),
    })

    return jsonify({
        "message": "Thank you for your feedback!"
    })



@app.route("/api/auth/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    # Check pending signup
    pending = pending_signups.get(email)

    if not pending:
        return jsonify({"error": "No pending signup found"}), 404

    if pending["otp"] != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    if pending["otp_expiry"] < datetime.now():
        del pending_signups[email]
        return jsonify({"error": "OTP has expired"}), 400

    # Create user in MongoDB only after successful verification
    user = {
        "email": pending["email"],
        "name": pending["name"],
        "password": pending["password"],
        "role": pending["role"],
        "college": pending.get("college", ""),
        "roll_number": pending["roll_number"],
        "profile_photo": pending["profile_photo"],
        "college_id": pending["college_id"],

        "id_verified": False,
        "approved": pending["approved"],

        "email_verified": True,

        "created_at": datetime.now(),
    }

    result = users_col.insert_one(user)
    user["_id"] = result.inserted_id

    # Remove from temporary storage
    del pending_signups[email]

    token = make_token(user)

    return jsonify({
        "message": "Email verified successfully.",
        "token": token,
        "user": serialize(user)
    })


@app.route("/api/auth/resend-otp", methods=["POST"])
def resend_otp():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    pending = pending_signups.get(email)

    if not pending:
        return jsonify({
            "error": "No pending signup found"
        }), 404

    otp = str(random.randint(100000, 999999))

    pending["otp"] = otp
    pending["otp_expiry"] = datetime.now() + timedelta(minutes=5)

    send_otp_email(email, otp)

    return jsonify({
        "message": "OTP sent successfully."
    })


@app.route("/api/account/send-delete-otp", methods=["POST"])
@token_required
def send_delete_account_otp_route():

    user = get_user_or_404(request.user_id)

    otp = str(random.randint(100000, 999999))

    users_col.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "delete_otp": otp,
                "delete_otp_expiry": datetime.now() + timedelta(minutes=5),
            }
        }
    )

    try:
        send_delete_account_otp(
            user["email"],
            otp,
        )
    except Exception as e:
        print("Delete OTP email failed:", e)
        return jsonify({
            "error": "Failed to send OTP"
        }), 500

    return jsonify({
        "message": "OTP sent successfully."
    })

@app.route("/api/account/delete", methods=["POST"])
@token_required
def delete_account():

    data = request.get_json() or {}

    otp = data.get("otp", "").strip()

    user = get_user_or_404(request.user_id)

    if (
        user.get("delete_otp") != otp
        or datetime.now() > user.get("delete_otp_expiry")
    ):
        return jsonify({
            "error": "Invalid or expired OTP."
        }), 400

    # Delete organizer data
    if user["role"] == "organizer":

        organizer_events = list(
            events_col.find({
                "organizer_id": request.user_id
            })
        )

        for event in organizer_events:
            regs_col.delete_many({
                "event_id": str(event["_id"])
            })

        events_col.delete_many({
            "organizer_id": request.user_id
        })

    # Delete student data
    elif user["role"] == "student":

        regs_col.delete_many({
            "user_id": request.user_id
        })

        ratings_col.delete_many({
            "user_id": request.user_id
        })

    users_col.delete_one({
        "_id": user["_id"]
    })

    return jsonify({
        "message": "Account deleted successfully."
    })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "")

    user = users_col.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    if role and user["role"] != role:
        return jsonify({
            "error": f"This account is registered as a {user['role']}. Please use the correct login page."
        }), 403

    if user["role"] != "admin" and not user.get("email_verified", False):
        return jsonify({
            "error": "Please verify your email before logging in."
        }), 403

    token = make_token(user)

    return jsonify({
        "token": token,
        "user": serialize(user)
    })


@app.route("/api/auth/me", methods=["GET"])
@token_required
def me():
    user = get_user_or_404(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize(user))


# ---------- categories ----------

@app.route("/api/categories", methods=["GET"])
def get_categories():
    cats = list(categories_col.find({}))
    if not cats:
        categories_col.insert_many([{"name": c} for c in DEFAULT_CATEGORIES])
        cats = list(categories_col.find({}))
    return jsonify([c["name"] for c in cats])


@app.route("/api/admin/categories", methods=["POST"])
@role_required("admin")
def add_category():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Category name required"}), 400
    if categories_col.find_one({"name": name}):
        return jsonify({"error": "Category already exists"}), 409
    categories_col.insert_one({"name": name})
    return jsonify({"message": "Category added"}), 201


# ---------- events ----------

@app.route("/api/events", methods=["GET"])
def list_events():
    query = {}
    category = request.args.get("category")
    college = request.args.get("college")
    venue = request.args.get("venue")
    status = request.args.get("status")
    organizer_id = request.args.get("organizer_id")
    search = request.args.get("search")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if category:
        query["category"] = category
    if college:
      query["college"] = college

    if venue:
        query["venue"] = {"$regex": venue, "$options": "i"}
    if status:
        query["status"] = status
    if organizer_id:
        query["organizer_id"] = organizer_id
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if date_from or date_to:
        date_query = {}
    if date_from:
            date_query["$gte"] = date_from
    if date_to:
        date_query["$lte"] = date_to
        query["date_time"] = date_query

    events = list(events_col.find(query).sort("date_time", 1))
    now = datetime.now()

    for e in events:

     deadline = datetime.fromisoformat(e["registration_deadline"])

     print("Deadline:", deadline)
     print("Now:", now)
     print("Deadline <= Now:", deadline <= now)

     if (
      e["status"] == "open"
      and deadline <= now
       ):
      events_col.update_one(
        {"_id": e["_id"]},
        {"$set": {"status": "closed"}}
      )
      e["status"] = "closed"

     count = regs_col.count_documents({
        "event_id": str(e["_id"]),
        "status": "registered"
     })

     e["registered_count"] = count

    return jsonify([serialize(e) for e in events])


@app.route("/api/events/<event_id>", methods=["GET"])
def get_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if (
        event["status"] == "open"
        and datetime.fromisoformat(event["registration_deadline"]) <= datetime.now()
    ):
        events_col.update_one(
            {"_id": event["_id"]},
            {"$set": {"status": "closed"}}
        )
        event["status"] = "closed"

    event["registered_count"] = regs_col.count_documents({
        "event_id": event_id,
        "status": "registered"
    })

    # ⭐ ADD THIS BLOCK
    ratings = list(ratings_col.find({
        "event_id": event_id
    }))

    event["rating_count"] = len(ratings)

    if ratings:
        event["average_rating"] = round(
            sum(r["rating"] for r in ratings) / len(ratings),
            1
        )
    else:
        event["average_rating"] = 0

    event["reviews"] = [
        {
            "name": r["user_name"],
            "rating": r["rating"],
            "feedback": r["feedback"],
        }
        for r in ratings
    ]
    # ⭐ END OF BLOCK

    return jsonify(serialize(event))


@app.route("/api/events", methods=["POST"])
@role_required("organizer")

def create_event():
    user = get_user_or_404(request.user_id)
    if request.role == "organizer" and not user.get("approved"):
        return jsonify({"error": "Your organizer account is pending admin approval"}), 403

    data = request.get_json() or {}
    required = ["title", "description", "college" , "venue", "date_time", "category", "max_participants", "registration_deadline"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        max_participants = int(data["max_participants"])
        if max_participants < 1:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "max_participants must be a positive number"}), 400
    
    event_time = datetime.fromisoformat(data["date_time"])

    hour = event_time.hour

    if hour < 7 or hour >= 18:
     return jsonify({
        "error": "Events can only be scheduled between 7:00 AM and 6:00 PM."
    }), 400
    event_date = data["date_time"][:10]   # YYYY-MM-DD

    existing_events = events_col.find({
        "venue": data["venue"].strip()
    })

    for event in existing_events:
        if event["date_time"][:10] == event_date:
            return jsonify({
                "error": "This venue is already booked on the selected date."
            }), 409


    event = {
        "title": data["title"].strip(),
        "description": data["description"].strip(),
        "venue": data["venue"].strip(),
        "date_time": data["date_time"],
        "category": data["category"],
        "max_participants": max_participants,
        "registration_deadline": data["registration_deadline"],
        "status": "open",
        "poster_url": data.get("poster_url", ""),
        "organizer_id": request.user_id,
        "organizer_name": user["name"],
        # "college": user.get("college", ""),
        "college": data["college"].strip(),
        "created_at": datetime.now(),
    }
    result = events_col.insert_one(event)
    event["_id"] = result.inserted_id
    return jsonify(serialize(event)), 201


@app.route("/api/events/<event_id>", methods=["PUT"])
@role_required("organizer")
def update_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if request.role == "organizer" and event["organizer_id"] != request.user_id:
        return jsonify({"error": "You can only edit your own events"}), 403
    
    data = request.get_json() or {}
    allowed = ["title", "description", "venue", "date_time", "category",
               "max_participants", "registration_deadline", "status", "poster_url"]
    update_fields = {k: data[k] for k in allowed if k in data}
    if "max_participants" in update_fields:
        try:
            update_fields["max_participants"] = int(update_fields["max_participants"])
        except (TypeError, ValueError):
            return jsonify({"error": "max_participants must be a number"}), 400
    if "venue" in update_fields or "date_time" in update_fields:

     new_venue = update_fields.get("venue", event["venue"])
     new_datetime = update_fields.get("date_time", event["date_time"])
     event_time = datetime.fromisoformat(new_datetime)

    hour = event_time.hour

    if hour < 7 or hour >= 18:
     return jsonify({
        "error": "Events can only be scheduled between 7:00 AM and 6:00 PM."
       }), 400

    event_date = new_datetime[:10]

    existing_events = events_col.find({
        "venue": new_venue,
        "_id": {"$ne": ObjectId(event_id)}
     })

    for existing in existing_events:
        if existing["date_time"][:10] == event_date:
            return jsonify({
                "error": "This venue is already booked on the selected date."
            }), 409
     
    events_col.update_one({"_id": ObjectId(event_id)}, {"$set": update_fields})
    return jsonify({"message": "Event updated"})


@app.route("/api/events/<event_id>/complete", methods=["POST"])
@role_required("organizer")
def complete_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if event["organizer_id"] != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    events_col.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": {"status": "completed"}}
    )

    return jsonify({"message": "Event marked as completed"})


@app.route("/api/events/<event_id>", methods=["DELETE"])
@role_required("organizer", "admin")
def delete_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    # 👇 ADD THESE LINES HERE
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()

    if not reason:
        return jsonify({
            "error": "Cancellation reason is required."
        }), 400

    if request.role == "organizer" and event["organizer_id"] != request.user_id:
        return jsonify({"error": "You can only delete your own events"}), 403

    if event["status"] == "completed":
        return jsonify({
            "error": "Completed events cannot be deleted."
        }), 400

        # Find everyone registered for this event
    registrations = list(
    regs_col.find({
        "event_id": event_id,
        "status": {
            "$in": [
                "pending_verification",
                "registered",
                "waitlisted",
            ]
        },
    })
)

    # Send cancellation email to each student
    for reg in registrations:
     user = users_col.find_one({
        "_id": ObjectId(reg["user_id"])
    })

     if not user:
        continue

     try:
        send_event_cancelled_email(
            user["email"],
            user["name"],
            event["title"],
            event["venue"],
            event["date_time"],
            reason,
        )
     except Exception as e:
        print(f"Failed to send cancellation email to {user['email']}: {e}")

    # Delete registrations
    regs_col.delete_many({
    "event_id": event_id
})

    # Delete event
    events_col.delete_one({
    "_id": ObjectId(event_id)
})

    return jsonify({"message": "Event deleted"})


# ---------- registrations (with waitlist) ----------
@app.route("/api/registrations/<registration_id>/qr", methods=["GET"])
@token_required
def registration_qr(registration_id):

    reg = regs_col.find_one({
        "registration_id": registration_id
    })

    if not reg:
        return jsonify({"error": "Registration not found"}), 404

    # Registration must be approved
    if reg["status"] != "registered":
        return jsonify({
            "error": "Your registration is awaiting organizer approval."
        }), 403

    # Only the owner, organizer of the event, or admin can access
    if request.role == "student" and reg["user_id"] != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    if request.role == "organizer":
        event = events_col.find_one({
            "_id": ObjectId(reg["event_id"])
        })

        if not event or event["organizer_id"] != request.user_id:
            return jsonify({"error": "Unauthorized"}), 403

    qr = qrcode.make(reg["registration_id"])

    img = io.BytesIO()
    qr.save(img, format="PNG")
    img.seek(0)

    return send_file(
        img,
        mimetype="image/png"
    )

@app.route("/api/events/<event_id>/register", methods=["POST"])
@role_required("student")
def register_for_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if event["status"] != "open":   
        return jsonify({"error": "Registration is closed for this event"}), 400
    
    
    # Remove any previous rejected registration so the student can apply again
    regs_col.delete_many({
     "event_id": event_id,
     "user_id": request.user_id,
     "status": "rejected",
     })
    

    existing = regs_col.find_one({
    "event_id": event_id,
    "user_id": request.user_id,
    "status": {
        "$in": [
            "pending_verification",
            "registered",
            "waitlisted",
        ]
    },
})
    if existing:
        return jsonify({"error": "Already registered or waitlisted"}), 409

    # confirmed_count = regs_col.count_documents({"event_id": event_id, "status": "registered"})
    # status = "registered" if confirmed_count < event["max_participants"] else "waitlisted"
    status = "pending_verification"
    user = users_col.find_one({
    "_id": ObjectId(request.user_id)
     })
    reg = {
    "registration_id": generate_registration_id(),
    

    "event_id": event_id,
    "user_id": request.user_id,

    "status": status,
    "attended": False,

    "registered_at": datetime.now(),
}
    
    result = regs_col.insert_one(reg)
    reg["_id"] = result.inserted_id

    try:
     print("Registration email function called")

     send_registration_email(
        email=user["email"],
        name=user["name"],
        event_title=event["title"],
        venue=event["venue"],
        date_time=event["date_time"],
        registration_id=reg["registration_id"],
        status=status,
     )

     print("Registration email sent successfully")

    except Exception as e:
      print("Registration email failed:", e)

    return jsonify(serialize(reg)), 201


@app.route("/api/events/<event_id>/approve-registration", methods=["POST"])
@role_required("organizer")
def approve_registration(event_id):

    data = request.get_json() or {}

    registration_id = data.get("registration_id")

    if not registration_id:
        return jsonify({"error": "Registration ID is required"}), 400

    # Check event
    try:
        event = events_col.find_one({
            "_id": ObjectId(event_id)
        })
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Organizer can only manage their own events
    if event["organizer_id"] != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    # Check registration
    try:
        reg = regs_col.find_one({
            "_id": ObjectId(registration_id)
        })
    except Exception:
        return jsonify({"error": "Invalid registration id"}), 400

    if not reg:
        return jsonify({"error": "Registration not found"}), 404

    # Registration must belong to this event
    if reg["event_id"] != event_id:
        return jsonify({
            "error": "Registration does not belong to this event"
        }), 400

    # Already processed?
    if reg["status"] != "pending_verification":
        return jsonify({
            "error": "Registration has already been processed"
        }), 400

    confirmed = regs_col.count_documents({
        "event_id": event_id,
        "status": "registered"
    })

    if confirmed >= event["max_participants"]:
        new_status = "waitlisted"
    else:
        new_status = "registered"

    regs_col.update_one(
        {"_id": reg["_id"]},
        {
            "$set": {
                "status": new_status
            }
        }
    )

    # Send approval email
    user = get_user_or_404(reg["user_id"])

    try:
     if new_status == "registered":
        send_registration_approval_email(
            user["email"],
            user["name"],
            event["title"],
        )
     else:
        send_waitlist_email(
            user["email"],
            user["name"],
            event["title"],
        )
    except Exception as e:
      print("Email failed:", e)

    return jsonify({
        "message": f"Student {new_status} successfully"
    })


@app.route("/api/events/<event_id>/reject-registration", methods=["POST"])
@role_required("organizer")
def reject_registration(event_id):

    data = request.get_json() or {}

    registration_id = data.get("registration_id")
    reason = data.get("reason", "").strip()

    if not registration_id:
        return jsonify({"error": "Registration ID is required"}), 400

    if not reason:
        return jsonify({"error": "Rejection reason is required"}), 400

    # Check event
    try:
        event = events_col.find_one({
            "_id": ObjectId(event_id)
        })
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Organizer can only manage their own events
    if event["organizer_id"] != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    # Check registration
    try:
        reg = regs_col.find_one({
            "_id": ObjectId(registration_id)
        })
    except Exception:
        return jsonify({"error": "Invalid registration id"}), 400

    if not reg:
        return jsonify({"error": "Registration not found"}), 404

    # Must belong to this event
    if reg["event_id"] != event_id:
        return jsonify({"error": "Registration does not belong to this event"}), 400

    # Already processed?
    if reg["status"] != "pending_verification":
        return jsonify({"error": "Registration has already been processed"}), 400

    # Reject registration
    regs_col.update_one(
        {"_id": reg["_id"]},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": reason,
            }
        }
    )

    # Send rejection email
    user = get_user_or_404(reg["user_id"])

    try:
        send_registration_rejection_email(
            user["email"],
            user["name"],
            event["title"],
            reason,
        )
    except Exception as e:
        print("Registration rejection email failed:", e)

    return jsonify({
        "message": "Registration rejected successfully"
    })

@app.route("/api/events/<event_id>/cancel", methods=["POST"])
@role_required("student")
def cancel_registration(event_id):

    # Get event
    try:
        event = events_col.find_one({
            "_id": ObjectId(event_id)
        })
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    reg = regs_col.find_one({
        "event_id": event_id,
        "user_id": request.user_id,
        "status": {
            "$in": [
                "registered",
                "waitlisted",
                "pending_verification"
            ]
        },
    })

    if not reg:
        return jsonify({
            "error": "No active registration found"
        }), 404

    # Cannot cancel after attendance
    if reg["attended"]:
        return jsonify({
            "error": "You cannot cancel after your attendance has been marked."
        }), 400

    # Cannot cancel if registrations are closed or event completed
    if event["status"] != "open":
        return jsonify({
            "error": "Cancellation is no longer allowed."
        }), 400

    was_confirmed = reg["status"] == "registered"

    # Delete registration
    regs_col.delete_one({
        "_id": reg["_id"]
    })

    # Promote first waitlisted student
    # Promote first waitlisted student
    if was_confirmed:
     next_waitlisted = regs_col.find_one(
        {
            "event_id": event_id,
            "status": "waitlisted"
        },
        sort=[("registered_at", 1)]
       )

     if next_waitlisted:
       regs_col.update_one(
            {"_id": next_waitlisted["_id"]},
           {"$set": {"status": "registered"}}
       )

       promoted_user = get_user_or_404(next_waitlisted["user_id"])

       try:
            send_registration_approval_email(
              promoted_user["email"],
              promoted_user["name"],
                event["title"],
             )
       except Exception as e:
             print("Promotion email failed:", e)
    return jsonify({
    "message": "Registration cancelled successfully."
}), 200


@app.route("/api/registrations/me", methods=["GET"])
@role_required("student")
def my_registrations():

    regs = list(
        regs_col.find({
            "user_id": request.user_id,
            "status": {
                "$in": [
                    "pending_verification",
                    "registered",
                    "waitlisted",
                    "rejected",
                    "cancelled",
                ]
            },
        })
    )

    result = []

    for r in regs:
        event = events_col.find_one({
    "_id": ObjectId(r["event_id"])
     })

        if event:

    # Hide attended or completed events from "My Registrations"
           if r.get("attended") or event.get("status") == "completed":
            continue

           item = serialize(r)
           item["event"] = serialize(event)
       
           item["rejection_reason"] = r.get(
               "rejection_reason",
                ""
           )

           result.append(item)

    return jsonify(result)


@app.route("/api/registrations/history", methods=["GET"])
@role_required("student")
def my_attendance_history():
    regs = list(regs_col.find({"user_id": request.user_id, "attended": True}))
    result = []
    for r in regs:
        event = events_col.find_one({"_id": ObjectId(r["event_id"])})
        if event:
            item = serialize(r)
            item["event"] = serialize(event)
            result.append(item)
    return jsonify(result)


@app.route("/api/events/<event_id>/registrations", methods=["GET"])
@role_required("organizer", "admin")
def event_registrations(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if request.role == "organizer" and event["organizer_id"] != request.user_id:
        return jsonify({"error": "You can only view your own event's registrations"}), 403

    # regs = list(regs_col.find({"event_id": event_id, "status": {"$in": ["registered", "waitlisted"]}}))
    regs = list(regs_col.find({
    "event_id": event_id,
    "status": {
        "$in": [
            "pending_verification",
            "registered",
            "waitlisted",
        ]
    }
     }))
    result = []
    for r in regs:
        user = get_user_or_404(r["user_id"])
        item = serialize(r)

        item["student_name"] = user["name"] if user else "Unknown"
        item["student_email"] = user["email"] if user else ""
        item["college"] = user.get("college", "")
        item["roll_number"] = user.get("roll_number", "")
        item["college_id"] = user.get("college_id", "")

        result.append(item)
    return jsonify(result)


@app.route("/api/events/<event_id>/attendance", methods=["POST"])
@role_required("organizer", "admin")
def mark_attendance(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})

        from datetime import datetime
        event_time = event["date_time"]

        if isinstance(event_time, str):
            event_time = datetime.fromisoformat(event_time)

        if datetime.now() < event_time:
            return jsonify({
                "error": "Attendance can only be marked after the event starts."
            }), 400
        
        if event["status"] == "completed":
          return jsonify({
           "error": "This event has already been completed. QR tickets are no longer valid."
             }), 400
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400
    if not event:
        return jsonify({"error": "Event not found"}), 404
    if request.role == "organizer" and event["organizer_id"] != request.user_id:
        return jsonify({"error": "You can only manage your own event's attendance"}), 403

    data = request.get_json() or {}

    registration_id = data.get("registration_id")

    attended = bool(data.get("attended", True))

    # print("Scanned registration:", registration_id),
    reg = regs_col.find_one({
    "registration_id": registration_id,
    "event_id": event_id,
    "status": "registered",
     })
    # print(reg)
    
    if not reg:
     return jsonify({"error": "Invalid ticket"}), 404

    if reg.get("attended"):
     return jsonify({
        "error": "You cannot cancel after attendance has been marked."
    }), 400

    result = regs_col.update_one(
     {"_id": reg["_id"]},
     {
        "$set": {
            "attended": attended
        }
     },)

    user = users_col.find_one({"_id": ObjectId(reg["user_id"])})

    return jsonify({
    "message": "Attendance marked successfully",
    "student": user["name"],
    "registration_id": reg["registration_id"],
})


# ---------- dashboards ----------

@app.route("/api/dashboard/student", methods=["GET"])
@role_required("student")
def student_dashboard():
    registered_count = regs_col.count_documents({"user_id": request.user_id, "status": "registered"})
    waitlisted_count = regs_col.count_documents({"user_id": request.user_id, "status": "waitlisted"})
    attended_count = regs_col.count_documents({"user_id": request.user_id, "attended": True})
    return jsonify({
        "registered_count": registered_count,
        "waitlisted_count": waitlisted_count,
        "attended_count": attended_count,
    })


@app.route("/api/dashboard/organizer", methods=["GET"])
@role_required("organizer", "admin")
def organizer_dashboard():
    my_events = list(events_col.find({"organizer_id": request.user_id}))
    event_ids = [str(e["_id"]) for e in my_events]

    total_participants = regs_col.count_documents({"event_id": {"$in": event_ids}, "status": "registered"})

    popular = None
    if my_events:
        counts = [(e, regs_col.count_documents({"event_id": str(e["_id"]), "status": "registered"})) for e in my_events]
        top = max(counts, key=lambda x: x[1], default=(None, 0))
        if top[0]:
            popular = {"title": top[0]["title"], "registered_count": top[1]}

    now = datetime.now().isoformat()
    upcoming = sum(1 for e in my_events if e["date_time"] >= now)

    return jsonify({
        "total_events": len(my_events),
        "upcoming_events": upcoming,
        "total_participants": total_participants,
        "most_popular_event": popular,
    })


@app.route("/api/dashboard/admin", methods=["GET"])
@role_required("admin")
def admin_dashboard():
    total_users = users_col.count_documents({})
    total_students = users_col.count_documents({"role": "student"})
    total_organizers = users_col.count_documents({"role": "organizer"})
    total_admins = users_col.count_documents({"role": "admin"})
    pending_organizers = users_col.count_documents({"role": "organizer", "approved": False})
    
    total_events = events_col.count_documents({})
    total_registrations = regs_col.count_documents({"status": "registered"})

    events_list = list(events_col.find({}))
    by_category = {}
    by_month = {}
    for e in events_list:
        count = regs_col.count_documents({"event_id": str(e["_id"]), "status": "registered"})
        cat = e.get("category", "Uncategorized")
        by_category[cat] = by_category.get(cat, 0) + count
        month = str(e.get("date_time", ""))[:7]
        by_month[month] = by_month.get(month, 0) + count

    return jsonify({
        "total_users": total_users,
        "total_students": total_students,
        "total_organizers": total_organizers,
        "total_admins": total_admins,
        "pending_organizers": pending_organizers,
        "total_events": total_events,
        "total_registrations": total_registrations,
        "by_category": [{"category": k, "count": v} for k, v in by_category.items()],
        "by_month": [{"month": m, "count": c} for m, c in sorted(by_month.items())],
    })


# ---------- admin: user & event moderation ----------

@app.route("/api/admin/users", methods=["GET"])
@role_required("admin")
def admin_list_users():
    users = list(users_col.find({}))
    return jsonify([serialize(u) for u in users])

@app.route("/api/admin/users/<user_id>/reject", methods=["POST"])
@role_required("admin")
def reject_organizer(user_id):

    data = request.get_json() or {}
    reason = data.get("reason", "")

    user = users_col.find_one({
        "_id": ObjectId(user_id),
        "role": "organizer",
        "approved": False,
    })

    if not user:
        return jsonify({"error": "Pending organizer not found"}), 404

    try:
        send_rejection_email(
            user["email"],
            user["name"],
            reason,
        )
    except Exception as e:
        print("Rejection email failed:", e)

    users_col.delete_one({
        "_id": ObjectId(user_id)
    })

    return jsonify({
        "message": "Organizer rejected and removed."
    })

@app.route("/api/admin/users/<user_id>/approve", methods=["POST"])
@role_required("admin")
def approve_organizer(user_id):
    result = users_col.update_one(
        {
            "_id": ObjectId(user_id),
            "role": "organizer"
        },
        {
            "$set": {
                "approved": True
            },
            "$unset": {
                "rejection_reason": ""
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"error": "Organizer not found"}), 404

    return jsonify({"message": "Organizer approved"})

@app.route("/api/admin/users/<user_id>/verify-id", methods=["POST"])
@role_required("admin")
def verify_user_id(user_id):
    try:
        result = users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"id_verified": True}}
        )
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"message": "User ID verified successfully"})

@app.route("/api/admin/users/<user_id>/unverify-id", methods=["POST"])
@role_required("admin")
def unverify_user_id(user_id):
    try:
        result = users_col.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"id_verified": False}}
        )
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"message": "User ID marked as unverified"})

# @app.route("/api/admin/users/<user_id>/reject", methods=["POST"])
# @role_required("admin")
# def reject_organizer(user_id):
#     result = users_col.delete_one({"_id": ObjectId(user_id), "role": "organizer", "approved": False})
#     if result.deleted_count == 0:
#         return jsonify({"error": "Pending organizer not found"}), 404
#     return jsonify({"message": "Organizer rejected and removed"})


@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
@role_required("admin")
def admin_delete_user(user_id):
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()

    if not reason:
     return jsonify({
        "error": "Reason is required"
     }), 400

    try:
        user = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

#     # Send removal email
#     try:
#         msg = Message(
#             subject="CampusConnect - Account Removed",
#             recipients=[user["email"]],
#         )

#         msg.body = f"""
# Hello {user['name']},

# Your CampusConnect account has been removed by an administrator.

# Reason:
# {reason}

# If you believe this was a mistake, please contact the administrator or 
#  reply to this E-Mail.

# Thank you,
# CampusConnect Team
# """

#         mail.send(msg)

#     except Exception as e:
#         print("Removal email failed:", e)

    # Delete organizer's events and registrations
    if user["role"] == "organizer":

        organizer_events = list(
            events_col.find({
                "organizer_id": str(user["_id"])
            })
        )

        for event in organizer_events:
            regs_col.delete_many({
                "event_id": str(event["_id"])
            })

        events_col.delete_many({
            "organizer_id": str(user["_id"])
        })

    # Delete student's registrations
    elif user["role"] == "student":

        regs_col.delete_many({
            "user_id": str(user["_id"])
        })
    try:
     send_account_removal_email(
        user["email"],
        user["name"],
        reason,
    )
    except Exception as e:
     print("Removal email failed:", e)    

    users_col.delete_one({
        "_id": ObjectId(user_id)
    })

    return jsonify({
        "message": "User deleted successfully"
    })


@app.route("/api/admin/events/<event_id>", methods=["DELETE"])
@role_required("admin")
def admin_delete_event(event_id):
    try:
        event = events_col.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return jsonify({"error": "Invalid event id"}), 400

    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json() or {}
    reason = data.get("reason", "").strip()

    if not reason:
        return jsonify({
            "error": "Cancellation reason is required."
        }), 400

    if event["status"] == "completed":
        return jsonify({
            "error": "Completed events cannot be deleted."
        }), 400

    # Find everyone registered for this event
    registrations = list(
        regs_col.find({
            "event_id": event_id,
            "status": {
                "$in": [
                    "pending_verification",
                    "registered",
                    "waitlisted",
                ]
            },
        })
    )

    # Send cancellation email to each student
    for reg in registrations:
        user = users_col.find_one({
            "_id": ObjectId(reg["user_id"])
        })

        if not user:
            continue

        try:
            send_event_cancelled_email(
                user["email"],
                user["name"],
                event["title"],
                event["venue"],
                event["date_time"],
                reason,
            )
        except Exception as e:
            print(f"Failed to send cancellation email to {user['email']}: {e}")

    regs_col.delete_many({"event_id": event_id})

    events_col.delete_one({"_id": ObjectId(event_id)})

    return jsonify({"message": "Event deleted successfully"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000),