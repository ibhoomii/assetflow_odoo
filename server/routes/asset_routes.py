from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Asset

asset_bp = Blueprint("asset_bp", __name__)

# Get all assets
@asset_bp.route("/assets", methods=["GET"])
def get_assets():
    assets = Asset.query.all()

    return jsonify([
        {
            "id": asset.id,
            "name": asset.name,
            "category": asset.category,
            "status": asset.status
        }
        for asset in assets
    ])


# Create asset
@asset_bp.route("/assets", methods=["POST"])
def add_asset():

    data = request.json

    asset = Asset(
        name=data["name"],
        category=data["category"],
        status=data["status"]
    )

    db.session.add(asset)
    db.session.commit()

    return jsonify({"message": "Asset Added Successfully"})