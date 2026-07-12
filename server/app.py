from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from database.models import Asset, User
from routes.auth_routes import auth_bp
from routes.asset_routes import asset_bp
from database.db import db
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
app.register_blueprint(auth_bp)
app.register_blueprint(asset_bp)
@app.route("/")
def home():
    return {"message": "AssetFlow Backend Connected"}


with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)