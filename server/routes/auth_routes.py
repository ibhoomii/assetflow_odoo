from flask import Blueprint, request, jsonify
from database.db import db
from database.models import User
import bcrypt

# Create Blueprint FIRST
auth_bp = Blueprint("auth_bp", __name__)


# ---------------- Register ---------------- #

@auth_bp.route("/auth/register", methods=["POST"])
def register():

    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed = bcrypt.hashpw(
        data["password"].encode(),
        bcrypt.gensalt()
    ).decode()

    user = User(
        full_name=data["fullName"],
        email=data["email"],
        password=hashed,
        phone=data["phone"],
        department=data["department"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration Successful"})


# ---------------- Login ---------------- #

@auth_bp.route("/auth/login", methods=["POST"])
def login():

    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if not bcrypt.checkpw(
        data["password"].encode(),
        user.password.encode()
    ):
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login Successful",
        "token": "dummy-token",
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "department": user.department
        }
    })