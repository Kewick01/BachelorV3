import re
from flask import Blueprint, request, jsonify
from firebase_config import auth, db
from firebase_admin.auth import EmailAlreadyExistsError

register = Blueprint('register',__name__, template_folder='../frontend')

def is_valid_email(email):
        return re.match(r'^[^@]+@[^@]+\.[^@]+$', email) is not None

def is_valid_phone(phone):
        return re.match(r'^\+\d{7,15}$', phone) is not None

@register.route('/register', methods=['POST'])
def register_api():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        admin_pin = data.get('admin_pin')

        if not username or not email or not password or not admin_pin:
                return jsonify({"error": "Fyll ut alle felt!"}), 400
        
        if not is_valid_email(email):
                return jsonify({"error": "Ugyldig e-postadresse!"}), 400
        
        if phone and not is_valid_phone(phone):
                return jsonify({"error": "Telefonnummer må være format +4712345678"}), 400
        
        try:
                kwargs = {
                    "email": email,
                    "password": password,
                    "display_name": username
                }
                if phone:
                        kwargs["phone_number"] = phone

                user = auth.create_user(**kwargs)

                db.collection("users").document(user.uid).set({

                        'username': username,
                        'email': email,
                        'uid': user.uid,
                        'phone': phone,
                        'admin_pin': admin_pin
                    })
                
                return jsonify({"message":"Bruker opprettet!", "uid": user.uid}), 201
        
        except EmailAlreadyExistsError:
                return jsonify({"error": "Bruker eller email eksisterer allerede!"}), 409
        except Exception as e:
                print("Feil i register_api:", e)
                return jsonify({"error": str(e)}), 500
           


