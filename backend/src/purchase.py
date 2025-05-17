# purchase.py - Endepunkt for å kjøpe kosmetiske gjenstander for et medlem.
# Trekker fra penger, oppdaterer medlemmet med nye kosmetiske elementer og returnerer den nye saldoen etter kjøp.
# Brukeren må være autentisert og må ha tilgang til det gjeldene medlemmet.

from flask import Blueprint, request, jsonify   # Flask-moduler for routing og HTTP-respons.
from firebase_config import db                  # Firestore-klient.
from auth import verify_firebase_token          # Funksjon for å validere token til brukeren.

# Oppretter et Blueprint for purchase. 
purchase = Blueprint('purchase', __name__)

# Endepunkt: Brukes når det kjøpes noe i butikken.
@purchase.route('/purchase', methods=['POST'])
def purchase_item():
    try:
        # Henter og verifiserer token fra Authorization-header.
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Manglende token!"}), 401
        
        decoded_token = verify_firebase_token(token)
        uid = decoded_token["uid"]

        # Leser data fra frontend og forventer memberId og item.
        data = request.get_json()
        item = data.get('item')
        member_id = data.get('memberId')

        # Sjekker at begge felt er sendt inn.
        if not token or not item:
            return jsonify({"error": "Token og vare er påkrevd!"}), 401
        
        # Sikrer at prisen blir behandlet som flyttall.
        item["price"] = float(item["price"])
        
        # Henter medlemmet fra Firestore.
        member_ref = db.collection('members').document(member_id)
        member_doc = member_ref.get()

        if not member_doc.exists:
            return jsonify({"error": "Bruker finnes ikke!"}), 404
        
        member = member_doc.to_dict()

        # Sjekker at admin eier medlemmet.
        if member.get("adminId") !=uid:
            return jsonify({"error": "Ingen tilgang til dette medlemmet"}), 403

        # Sjekker om medlemmet har nok penger.
        if member["money"] < item["price"]:
            return jsonify({"error": "Ikke nok penger!"}), 400
        
        # Trekker fra penger og legger til den kosmetiske gjenstanden som ble kjøpt.
        new_money = member["money"] - item["price"]
        new_cosmetics = list(set(member.get("cosmetics", []) + [item["id"]]))

        # Oppdaterer Firestore med ny saldo og kosmetikk.
        db.collection('members').document(member_doc.id).update({
            "money": new_money,
            "cosmetics": new_cosmetics
        })

        return jsonify({
            "message": "Vare kjøpt!",
            "new_money": new_money,
            "new_cosmetics": new_cosmetics
        }), 200
    
    # Håndterer generelle feil.
    except Exception as e:
        print(f"Kjøp feilet!: {e}")
        return jsonify({"error": str(e)}), 500



