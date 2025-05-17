# auth.py - Modul som håndterer autentifisering via Firebase Admin SDK.
# Inkluderer initialisering og funksjon for å verifisere ID-tokens.
import firebase_admin                         #Hovedbibilotek for Firebase Admin SDK.
from firebase_admin import credentials, auth  # Importerer verktøy for autentifisering og nøkkelhåndtering.
import os                                     # For å jobbe med filer og miljøvariabler.

# Sjekker om Firebase allerede er initialisert for å unngå dobbel initialisering.
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Funksjon for å verifisere Firebase-token fra Authorization-headeren.
# Returnerer tokenet eller gir ValueError hvis den ikke er gydlig.
def verify_firebase_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Ugyldig token: {e}")