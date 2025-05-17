# logout.py - Håndterer logout-kall fra klienten.
# Selve utloggingen skjer i frontend som Firebase håndterer.
# Dette endepunktet brukes som et "bekreftelsessignal" mellom app og backend.

from flask import Blueprint, jsonify # Flask-verktøy for ruter og JSON-respons.

# Oppretter et Blueprint for logout.
logout = Blueprint('logout', __name__)

# Endepunkt: Kalles fra frontend når brukeren logger ut.
@logout.route('/logout', methods=['POST'])
def logout_api():
    # Returnerer en bekreftelse at det faktisk skjer en logout.
    return jsonify({"message": "Du er logget ut!"}), 200
