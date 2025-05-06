from flask import Blueprint, jsonify
from flask_login import LoginManager, login_required, logout_user

logout = Blueprint('logout', __name__)

@logout.route('/logout', methods=['POST'])
@login_required
def logout_api():
    logout_user()
    return jsonify({"message": "Du er logget ut!"}), 200
