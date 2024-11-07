import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { getAuth } from '@nativescript/firebase-auth';

export class LoginViewModel extends Observable {
    private _email: string = "";
    private _password: string = "";

    constructor() {
        super();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    async onLogin() {
        try {
            const auth = getAuth();
            const userCredential = await auth.signInWithEmailAndPassword(this.email, this.password);
            if (userCredential) {
                const frame = require('@nativescript/core').Frame;
                frame.topmost().navigate({
                    moduleName: 'pages/home/home-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    }

    onRegister() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate('pages/register/register-page');
    }
}