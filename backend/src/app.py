import os
from flask import Flask, redirect
from flask_login import LoginManager, UserMixin
from flask_cors import CORS
from azure.storage.blob import BlobServiceClient
from login import User
from firebase_config import db, auth
from login import login
from logout import logout
from register import register
from admin import admin
from purchase import purchase


app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_secret_key")

app.register_blueprint(purchase)

#Hvis vi vil koble til Azure Storage for filhåndtering
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
if AZURE_STORAGE_CONNECTION_STRING:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    print("Azure Storage er tilkoblet!")

login_manager = LoginManager()
login_manager.init_app(app)

app.register_blueprint(login)
app.register_blueprint(logout) 
app.register_blueprint(register)
app.register_blueprint(admin)

class User(UserMixin):
    def __init__(self, uid, username, email):
        self.id = uid
        self.username = username
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    """Henter bruker fra Firestore basert på UID"""
    user_ref = db.collection('users').document(user_id).get()
    if user_ref.exists:
        user_data = user_ref.to_dict()
        return User(user_data['uid'], user_data['username'], user_data['email'])
    return None

@app.route('/')
def index():
    return redirect('/login')

if __name__== '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 3000)), debug=True)
    