from flask import Flask, render_template, Blueprint, jsonify
from flask_login import login_required, current_user

home = Blueprint('home', __name__, template_folder='../frontend')

@home.route('/home')
@login_required
def show_home():
    user_info = {
        "username": current_user.username,
        "email": current_user.email
    }
    return jsonify({"message": "Velkommen til hjemmesiden!", "user": user_info})
