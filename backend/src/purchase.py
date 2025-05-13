from flask import Blueprint, request, jsonify
from firebase_config import db
from login import verify_firebase_token

purchase = Blueprint('purchase', __name__)

@purchase.route('/purchase', methods=['POST'])
def purchase_item():
    try:
        data = request.get_json()
        token = data.get('token')
        item = data.get('item')

        if not token or not item:
            return jsonify({"error": "Token og vare er påkrevd!"}), 400
        
        decoded_token = verify_firebase_token(token)
        uid = decoded_token["uid"]

        member_query = db.collection('members').where('adminId', '==', uid).limit(1).stream()
        member_doc = next(member_query, None)

        if not member_doc:
            return jsonify({"error": "Bruker finnes ikke!"}), 404
        
        member = member_doc.to_dict()

        if member["money"] < item["price"]:
            return jsonify({"error": "Ikke nok penger!"}), 400
        
        new_money = member["money"] - item["price"]
        new_cosmetics = list(set(member.get("cosmetics", []) + [item["id"]]))

        db.collection('members').document(member_doc.id).update({
            "money": new_money,
            "cosmetics": new_cosmetics
        })

        return jsonify({
            "message": "Vare kjøpt!",
            "new_money": new_money,
            "new_cosmetics": new_cosmetics
        }), 200
    
    except Exception as e:
        print(f"Kjøp feilet!: {e}")
        return jsonify({"error": str(e)}), 500



