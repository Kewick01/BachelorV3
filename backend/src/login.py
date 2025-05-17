# login.py - Håndterer innlogging av brukere via epost. 
# Kan argumenteres for at den kun henter brukerinfo, så "login" kan være et litt misvisende navn, men vi valgte å beholde navnet for enkelhetemsskyld.
# Brukeren sendes til dette endepunktet fra frontend, og får tilbake data hvis e-posten finnes i Firebase og Firestore.

from flask import Blueprint, request, jsonify      # Flask-moduler for routing og HTTP-respons.
from firebase_config import db               # Importerer Firebase Authentication og Firestore-klient.
from firebase_admin import auth
from firebase_admin.auth import UserNotFoundError  # For å håndtere feil når bruker ikke finnes.

# Oppretter Flask Blueprint kalt "login".
login = Blueprint('login',__name__)

# Endepunkt: Brukes av frontend for å logge inn med e-post.
@login.route('/login', methods=['POST'])
def login_api():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password') # Passord blir ikke valdiert videre i funksjonen, kun e-post.
                                    # Dette feltet beholdes hovedsaklig av visuelle og praktiske grunner i frontend.
                               
    # Sjekker at begge feltene er fylt ut.
    if not email or not password:
        return jsonify({"error": "Fyll ut alle felt!"}), 400
    
    try:
         # Henter brukeren fra Firebare Authentication via e-posten.
         user = auth.get_user_by_email(email)

         # Sjekker om brukeren finnes i Firestore.
         user_ref = db.collection('users').document(user.uid).get()
         if not user_ref.exists:
                return jsonify({"error": "Bruker finnes ikke!"}), 404
         
         user_data = user_ref.to_dict()

         # Returnere info om brukeren til frontend.
         return jsonify({
                "message": "Bruker logget inn!",
                "uid": user.uid,
                "username": user_data['username'],
                "email": user.email,
         }), 200
    
    # Hvis Firebase Authentication ikke finner brukeren.
    except UserNotFoundError:
        return jsonify({"error": "Bruker finnes ikke!"}), 401
    
    # Returnerer en feilmedling.
    except Exception as e:
        return jsonify({"error": str(e)}), 500
