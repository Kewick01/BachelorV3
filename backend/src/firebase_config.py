import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

SERVICE_ACCOUNT_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Legge til data programmatisk i Firestore
def add_user_data():
    # Opprett dokumentreferanse til samlingen "users"
    doc_ref = db.collection("users").document("user1")  # ID for dokumentet er "user1"
    
    # Legge til data i dokumentet
    doc_ref.set({
        "name": "Joakim",
        "email": "joakim@example.com",
        "age": 22
    })

if __name__ == "__main__":
# Kall funksjonen for å legge til data
    add_user_data()
    print("Data lagt til i Firestore!")
