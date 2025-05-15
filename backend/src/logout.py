from flask import Blueprint, jsonify

logout = Blueprint('logout', __name__)

@logout.route('/logout', methods=['POST'])
def logout_api():
    return jsonify({"message": "Du er logget ut!"}), 200
