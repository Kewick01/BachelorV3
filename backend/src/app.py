# app.py - Hovedfilen for hele Flask-applikasjonen. Fungerer som inngangspunktet for backend.
# Initierer Flask, aktiverer CORS og registrerer alle blueprint-moduler.

import os                                # Brukes for å hente inn miljøvariabler.
from flask import Flask, redirect        # Flask-rammeverk og redirect-funksjon.
from flask_cors import CORS              # Tillater cross-origin-request fra frontend.

# Import av blueprint-moduler som definerer forskjellige API-ruter.
from login import login
from logout import logout
from register import register
from admin import admin
from purchase import purchase

# Oppretter Flask-applikasjon.
app = Flask(__name__)

# Aktiverer CORS for at frontend kan kommunisere med backend.
# Cookies og headers sendes med gjennom supports_credentials=True.
CORS(app, supports_credentials=True)

# Setter en hemmelig nøkkel til Flask og bruker "default_secret_key" hvis miljøvariabel ikke finnes.
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_secret_key")

# Registrerer blueprint for kjøpsrutene i butikken.
app.register_blueprint(purchase)

# Registrerer resten av rutemodulene.
app.register_blueprint(login)
app.register_blueprint(logout) 
app.register_blueprint(register)
app.register_blueprint(admin)

# Standardrute som videresender til login.
@app.route('/')
def index():
    return redirect('/login')

# Kjører Flask-applikasjonen lokalt på port 3000.
# Bruker 0.0.0.0 for å kunne nås fra f.eks mobilen.
if __name__== '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 3000)), debug=True)
    