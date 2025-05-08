import re
from flask import Blueprint, request, jsonify
from firebase_config import auth, db
import firebase_admin
from firebase_admin.auth import EmailAlreadyExistsError

register = Blueprint('register',__name__, template_folder='../frontend')

def is_valid_phone(phone):
        return re.match(r'^\+\d{7,15}$', phone) is not None

@register.route('/register', methods=['POST'])
def register_api():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')

        if not username or not email or not password:
                return jsonify({"error": "Fyll ut alle felt!"}), 400
        try:
                user = auth.create_user(
                    email=email,
                    password=password,
                    display_name=username,
                    phone_number=phone if phone else None
                )
                db.collection("users").document(user.uid).set({

                        'username': username,
                        'email': email,
                        'uid': user.uid,
                        'phone': phone
                    })
                
                return jsonify({"message":"Bruker opprettet!", "uid": user.uid}), 201
        
        except EmailAlreadyExistsError:
                return jsonify({"error": "Bruker eller email eksisterer allerede!"}), 409
        except Exception as e:
                print("Feil i register_api:", e)
                return jsonify({"error": str(e)}), 500
           


