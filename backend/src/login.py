import os
from flask import Blueprint, url_for, render_template, redirect, request
from flask_login import LoginManager, login_user, UserMixin
from firebase_config import auth, db

login = Blueprint('login',__name__,template_folder='../frontend')
login_manager = LoginManager()
login_manager.init_app(login)

class User(UserMixin):
    def __init__(self, uid, username, email):
        self.id = uid
        self.username = username
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    user_ref = db.collection('users').document(user_id).get()
    if user_ref.exists:
        user_data = user_ref.to.dict()
        return User(user_data['uid'], user_data['username'], user_data['email'])
    return None

@login.route('/login', methods=['GET', 'POST'])
def show():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        try:

            user = auth.get_user_by_email(email)

            user_ref = db.collection('users').document(user.uid).get()
            if user_ref.exists:
                user_data = user_ref.to_dict()
                user_obj = User(user.uid, user_data['username'], user.email)
                login_user(user_obj)
                return redirect(url_for('home.show'))
            else:
                return redirect(url_for('login.show')+ 'Fant ikke bruker!')
        except firebase_admin.auth.UserNotFoundError:
            return redirect(url_for('login.show')+ 'Feil epost eller passord')
        
    return render_template('login.html')  
