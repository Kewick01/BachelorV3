import firebase_admin
from firebase_admin import credentials, firestore, auth

cred = credentials.Certificate("/Users/joakimravnevand/Documents/GitHub/Bachelor/.devcontainer/backend/src/bachelor-app-15a59-firebase-adminsdk-fbsvc-982485945e.json")
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

# Kall funksjonen for å legge til data
add_user_data()

print("Data lagt til i Firestore!")