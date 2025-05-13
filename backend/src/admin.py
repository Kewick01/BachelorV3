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
    
@admin.route('/create-member', methods=['POST'])
@login_required
def create_member():
        data = request.get_json()
        name = data.get('name')
        code = data.get('code')
        color = data.get('color')

        if not name or not code or not color:
            return jsonify({"error": "Alle felt er påkrevd!"}), 400
        
        try:
            member_data = {
                "name": name,
                "code": code,
                "money": 0,
                "tasks": [],
                "character": {
                    "type": "pinnefigur",
                    "color": color,
            },
            "adminId": current_user.id
            }

            doc_ref = db.collection('members').document()
            doc_ref.set(member_data)

            return jsonify({"message": "Medlem opprettet!", "member_id": doc_ref.id}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
@admin.route('/delete-member/<member_id>', methods=['DELETE'])
@login_required
def delete_member(member_id):
    try:
        member_ref = db.collection('members').document(member_id)
        doc = member_ref.get()

        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        
        if doc.to_dict().get("adminId") != current_user.id:
            return jsonify({"error": "Ingen tilgang til å slette dette medlemmet."}), 403
        
        member_ref.delete()
        return jsonify({"message": "Medlem slettet!"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin.route('/members', methods=['GET'])
@login_required
def get_members():
    try: 
        snapshot = db.collection('members').where('adminId', '==', current_user.id).stream()
        members = []

        for doc in snapshot:
            data = doc.to_dict()
            data['id'] = doc.id
            members.append(data)

        return jsonify(members), 200
    
    except Exception as e:
       return jsonify({"error": str(e)}), 500
    

@admin.route('/update-member/<member_id>', methods=['PUT'])
@login_required
def update_member(member_id):
    try:
        data = request.get_json()
        name = data.get('name')
        color = data.get('color')   

        if not name or not color:
            return jsonify({"error": "Alle felt er påkrevd!"}), 400

        member_ref = db.collection('members').document(member_id)

        doc = member_ref.get()
        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        if doc.to_dict().get("adminId") != current_user.id:
            return jsonify({"error": "Ingen tilgang!"}), 403
        
        member_ref.update({
            "name": name,
            "character.color": color
        })

        return jsonify ({"message": "Medlem oppdatert!"}), 200
    
    except Exception as e:
        return jsonify({"Error": str(e)}), 500




    
        
