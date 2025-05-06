from flask import Blueprint, url_for, redirect, flash
from flask_login import LoginManager, login_required, logout_user

logout = Blueprint('logout', __name__, template_folder='../frontend')
login_manager= LoginManager()


@logout.route('/logout')
@login_required
def show():
    logout_user()
    flash('Du er logget ut!', 'info')
    return redirect(url_for('login.show')+ 'Du er logget ut!')
