# admin.py - Denne file inneholder alle rutene for administrative funksjoner for applikasjonen.
# Dette gjelder autentifisering, oppretting, sletting, oppdatering og visning av meldemmene.
# Den bruker Firebase som database og er koblet til frontend gjennom et API-kall.
# Importerer nødvendige moduler og funksjoner.
from flask import Blueprint, request, jsonify # Flask-moduler for routing og HTTP-respons.
from firebase_config import db                # Firebase Firestore-klienten.
from firebase_admin import firestore          # Firebase-admin for spesielle operasjoner.
from auth import verify_firebase_token        # Funksjon for å verifisere JWT-token fra Firebase.
import uuid                                   # Genererer ulike ID-er.

# Oppretter et Flask Blueprint for for å gruppere admin-relaterte routes.
admin = Blueprint('admin', __name__)

# Funksjon for å hente UID fra token i header.
# UID blir returnert hvis token er gydlig, ellers blir det en feilmedling.
def get_uid_from_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '') 
    if not token:
        return None, jsonify({"error": "Manglende token"}), 401 
    
    try:
        decoded = verify_firebase_token(token) # Dekoder token og henter brukerinfo. 
        print(" Firebase UID:", decoded["uid"]) # Debug-utskrift av UID. 
        return decoded["uid"], None, None # Returnerer UID og ingen feil.
    except Exception as e:
        print("Token verifisereing feilet:", e) # Logger eventuelle feil.
        return None, jsonify({"error": "Ugyldig token"}), 401 # Returnerer feil ved ugyldig token.

# Endepunkt: Verifiserer at admin-PIN stemmer med det som er lagert i databasen.
@admin.route('/verify-pin', methods=['POST'])
def verify_admin_pin():
    uid, error, code = get_uid_from_token()
    if error: return error, code

    data = request.get_json()
    pin = data.get('pin')

    if not pin:
        return jsonify({"error": "PIN er påkrevd!"}), 400
    
    user_doc = db.collection('users').document(uid).get()
    if not user_doc.exists:
        return jsonify({"error": "Bruker ikke funnet!"}), 404
    
    user_data = user_doc.to_dict()
    stored_pin = user_data.get('admin_pin')

    if stored_pin == pin:
        return jsonify({"message": "PIN er gyldig!"}), 200
    else:
        return jsonify({"error": "Ugyldig PIN!"}), 401

# Endepunkt: Oppretter et nytt medlem knyttet til admin som er logget inn.     
@admin.route('/create-member', methods=['POST'])
def create_member():
    uid, error, code = get_uid_from_token()
    if error: return error, code

    data = request.get_json()
    name = data.get('name')
    code = data.get('code')
    color = data.get('color')

    if not name or not code or not color:
        return jsonify({"error": "Alle felt er påkrevd!"}), 400
        
    try:
            member_data = {
                "name": name,
                "code": code,
                "money": 0,
                "tasks": [],
                "character": {
                    "type": "pinnefigur", # Dette er en standard karaktertype som gjelder alle medlemmer.
                    "color": color,
            },
            "adminId": uid
            }

            doc_ref = db.collection('members').document() # Her opprettes et nytt dokument med en tilfeldig ID.
            doc_ref.set(member_data)

            return jsonify({"message": "Medlem opprettet!", "member_id": doc_ref.id}), 201
    except Exception as e:
            return jsonify({"error": str(e)}), 500

# Endepunkt: Sletter et medlem som tilhører innlogget admin.        
@admin.route('/delete-member/<member_id>', methods=['DELETE'])
def delete_member(member_id):
    uid, error, code = get_uid_from_token()
    if error: return error, code

    try:
        member_ref = db.collection('members').document(member_id)
        doc = member_ref.get()

        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        
        if doc.to_dict().get("adminId") != uid:
            return jsonify({"error": "Ingen tilgang til å slette dette medlemmet."}), 403
        
        member_ref.delete()
        return jsonify({"message": "Medlem slettet!"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endepunkt: Henter alle medlemmene som tilhører innlogget admin.    
@admin.route('/members', methods=['GET'])
def get_members():
    uid, error, code = get_uid_from_token()
    if error: return error, code

    try: 
        snapshot = db.collection('members').where('adminId', '==', uid).stream()
        members = []

        for doc in snapshot:
            data = doc.to_dict()
            data['id'] = doc.id # Legger til ID til dokumentet i resultatet.
            members.append(data)

        return jsonify(members), 200
    
    except Exception as e:
       return jsonify({"error": str(e)}), 500
    

# Endepunkt: Oppdaterer informasjon om et spesifikt medlem.
@admin.route('/update-member/<member_id>', methods=['PUT'])
def update_member(member_id):
    uid, error, code = get_uid_from_token()
    if error: return error, code

    try:
        data = request.get_json()
        allowed_fields = ['name', 'money', 'character', 'cosmetics', 'equippedCosmetics', 'tasks' ]
        member_ref = db.collection('members').document(member_id)

        doc = member_ref.get()
        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        if doc.to_dict().get("adminId") != uid:
            return jsonify({"error": "Ingen tilgang!"}), 403
        
        update_data = {}
        
        # Egen håndtering for character-feltet.
        if 'color' in data:
            update_data["character.color"] = data['color']
        if 'character' in data and isinstance(data['character'], dict):
            for key, value in data['character'].items():
                update_data[f"character.{key}"] = value
        
        # De andre feltene i oppdateringen.
        for field in allowed_fields:
            if field in data and field != 'character':
                update_data[field] = data[field]

        if not update_data:
            return jsonify({"error": "Ingen gydlige felter å oppdatere."}), 400
        
        member_ref.update(update_data)

        return jsonify ({"message": "Medlem oppdatert!"}), 200
    
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

# Endepunkt: Legger til en ny oppgave knyttet til et medlem.    
@admin.route('/add-task/<member_id>', methods=['POST'])
def add_task(member_id):
    uid, error, code = get_uid_from_token()
    if error: return error, code

    data = request.get_json()
    title = data.get('title')
    price = data.get('price')

    if not title or price is None:
        return jsonify({"error": "Tittel og pris er påkrevd"}), 400
    
    member_ref = db.collection('members').document(member_id)
    doc = member_ref.get()
    if not doc.exists:
        return jsonify({"error": "Medlem ikke funnet!"}),404
    if doc.to_dict().get("adminId") != uid:
        return jsonify({"error": "Ingen tilgang!"}), 403
    
    new_task = {
        "id": str(uuid.uuid4()), # Dette er en unik ID for hver oppgave som opprettes.
        "title": title,
        "price": price,
        "completed": False
    }
    
    # Her brukes ArrayUnion for å legge til en ny oppgave uten at den overskiver allerede eksisterende oppgaver.
    member_ref.update({
        "tasks": firestore.ArrayUnion([new_task])
    })

    return jsonify({"message": "Oppgave lagt til!"}), 200

# Endepunkt: Henter informasjon for et spesifikt medlem.
@admin.route('/member/<member_id>', methods=['GET'])
def get_member(member_id):
    uid, error, code = get_uid_from_token()
    if error: return error, code

    try:
        doc = db.collection('members').document(member_id).get()
        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        
        data = doc.to_dict()

        if data.get("adminId") != uid:
            return jsonify({"error": "Ingen tilgang!"}), 403
        
        return jsonify(data), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Endepunkt: Markerer en oppgave som fullført og øker saldoen til medlemmet.
@admin.route('/complete-task/<member_id>/<task_id>', methods=['POST'])
def complete_task(member_id, task_id):
    uid, error, code = get_uid_from_token()
    if error: return error, code

    try:
        member_ref = db.collection('members').document(member_id)
        doc = member_ref.get()
        if not doc.exists:
            return jsonify({"error": "Medlem ikke funnet!"}), 404
        
        member = doc.to_dict()
        if member.get("adminId") != uid:
            return jsonify({"error": "Ingen tilgang!"}), 403
            
        tasks = member.get("tasks", [])
        updated_tasks = []
        added_money = 0
        
        # Går gjennom de ulike oppgavene som finnes og markerer riktig oppgave som fullført.
        for task in tasks:
            if task["id"] == task_id and not task.get("completed"):
                task["completed"] = True
                added_money = task["price"]
            updated_tasks.append(task)

        new_money = member.get("money", 0) + added_money

        member_ref.update({
            "tasks": updated_tasks,
            "money": new_money
        })

        return jsonify({
            "message": "Oppgave fullført!",
            "UpdatedMember": {
                "tasks": updated_tasks,
                "money": new_money
            }
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500




    
        
