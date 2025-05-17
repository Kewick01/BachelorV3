# register.py - Registrerer en ny bruker via e-post, passord, telefonnummer og admin-PIN.
# Brukeren opprettes først i Firebase Authentication, deretter lagres tilleggsdata i Firestore. 
# Validerer e-post og telefonnummer før opprettelse.

import re                                                # Brukes til regex-validering av e-post og telefon. Passer på at de følger bestemte mønstre.
from flask import Blueprint, request, jsonify            # Flask-moduler for routing og HTTP-respons.
from firebase_config import db                           # Firebase Admin SDK-klienter for auth og Firestore.
from firebase_admin import auth
from firebase_admin.auth import EmailAlreadyExistsError  # Egen feilklasse fra Firebase knyttet opp mot eksisterende e-post.

# Oppretter et Blueprint for registrering.
register = Blueprint('register',__name__, template_folder='../frontend')

# Funksjon: Sjekker om e-post har gyldig format. 
def is_valid_email(email):
        return re.match(r'^[^@]+@[^@]+\.[^@]+$', email) is not None

# Funksjon: Sjekker om telefonnummer har gyldig format.
def is_valid_phone(phone):
        return re.match(r'^\+\d{7,15}$', phone) is not None

# Endepunkt: Oppretter ny bruker.
@register.route('/register', methods=['POST'])
def register_api():
        data = request.get_json()        # Henter JSON-data sendt fra klienten.

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        admin_pin = data.get('admin_pin')

        # Sjekker at nødvendige felter er fyllt ut.
        if not username or not email or not password or not admin_pin:
                return jsonify({"error": "Fyll ut alle felt!"}), 400
        
        # Valdierer e-post med regex.
        if not is_valid_email(email):
                return jsonify({"error": "Ugyldig e-postadresse!"}), 400
        
        # Valdierer formatet til telefonnummeret, hvis det er sendt inn.
        if phone and not is_valid_phone(phone):
                return jsonify({"error": "Telefonnummer må være format +4712345678"}), 400
        
        try:
                # Bygger parametre til Firebase Auth-brukeropprettelse
                kwargs = {
                    "email": email,
                    "password": password,
                    "display_name": username
                }
                if phone:
                        kwargs["phone_number"] = phone
                
                # Oppretter bruker i Firebase Authentication.
                user = auth.create_user(**kwargs)

                # Lagrer brukerdata i Firestore.
                db.collection("users").document(user.uid).set({

                        'username': username,
                        'email': email,
                        'uid': user.uid,
                        'phone': phone,
                        'admin_pin': admin_pin
                    })
                
                return jsonify({"message":"Bruker opprettet!", "uid": user.uid}), 201
        
        # Håndterer spesifikk feil: E-post finnes allerede.
        except EmailAlreadyExistsError:
                return jsonify({"error": "Bruker eller email eksisterer allerede!"}), 409
        # Håndterer generell feil.
        except Exception as e:
                print("Feil i register_api:", e)
                return jsonify({"error": str(e)}), 500
           


