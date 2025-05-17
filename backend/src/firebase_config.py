# firebase_config.py - Konfigurerer tilkoblingen til Firebase-tjenester.

import firebase_admin                              # Hovedbibilotek for Firebase Admin SDK.
import os                                          # For å jobbe med filer og miljøvariabler.
from firebase_admin import credentials, firestore  # Import av relevante moduler.

# Henter mappen der prosjektet ligger lokalt.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Setter sti til serviceAccountKey.json som brukes for å autentifisere mot Firebase.
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, 'serviceAccountKey.json')

# Initierer Firebase Admin SDK kun en gang for å unngå dobbel initiering.
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

# Lager en NoSQL databse i Firebase.
db = firestore.client()
