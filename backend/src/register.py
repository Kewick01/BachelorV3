
from flask import Blueprint, url_for, render_template, redirect, request
from firebase_config import auth, db

register = Blueprint('register',__name__, template_folder='../frontend')

@register.route('/register', methods=['GET', 'POST'])
def show():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm-password']

        if username and email and password and confirm_password:
            if password == confirm_password:
                try:
                    user = auth.create_user(
                        email=email,
                        password=password,
                        display_name=username
                    )

                    user_ref = db.collection('users').document(user.uid)
                    user_ref.set({
                        'username': username,
                        'email': email,
                        'uid': user.uid
                    })

                    return redirect(url_for('login.show')+ 'Bruker opprettet!')
                
                except auth.EmailAlreadyExistsError:
                    return redirect(url_for('register.show')+ 'Error, bruker eller email eksiterer allerede!')
            else:
                return redirect(url_for('register.show')+ 'Fyll ut alle felt!')
            
        return render_template('register.html')


