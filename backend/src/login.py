from flask import Blueprint, request, jsonify
from firebase_config import auth, db
from firebase_admin.auth import UserNotFoundError 

login = Blueprint('login',__name__)


@login.route('/login', methods=['POST'])
def login_api():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Fyll ut alle felt!"}), 400

    try:
         user = auth.get_user_by_email(email)

         user_ref = db.collection('users').document(user.uid).get()
         if not user_ref.exists:
                return jsonify({"error": "Bruker finnes ikke!"}), 404
         
         user_data = user_ref.to_dict()

         return jsonify({
                "message": "Bruker logget inn!",
                "uid": user.uid,
                "username": user_data['username'],
                "email": user.email,
         }), 200
    
    except UserNotFoundError:
        return jsonify({"error": "Bruker finnes ikke!"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
