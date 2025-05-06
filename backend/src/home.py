
from flask import Flask, Blueprint, jsonify
from flask_login import login_required, current_user

home = Blueprint('home', __name__)

@home.route('/home')
@login_required
def show_home():
    user_info = {
        "username": current_user.username,
        "email": current_user.email
    }
    return jsonify({"message": "Velkommen til hjemmesiden!", "user": user_info})
