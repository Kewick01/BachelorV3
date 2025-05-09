from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from firebase_config import db

admin = Blueprint('admin', __name__)

@admin.route('/verify-pin', methods=['POST'])
@login_required
def verify_admin_pin():
    data = request.get_json()
    pin = data.get('pin')

    if not pin:
        return jsonify({"error": "PIN er påkrevd!"}), 400
    
    user_doc = db.collection('users').document(current_user.id).get()
    if not user_doc.exists:
        return jsonify({"error": "Bruker ikke funnet!"}), 404
    
    user_data = user_doc.to_dict()
    stored_pin = user_data.get('admin_pin')

    if stored_pin == pin:
        return jsonify({"message": "PIN er gyldig!"}), 200
    else:
        return jsonify({"error": "Ugyldig PIN!"}), 401
