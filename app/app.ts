import { Application } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';

firebase().initializeApp().then(() => {
    console.log("Firebase initialized");
}).catch(error => {
    console.error("Firebase init error:", error);
});

Application.run({ moduleName: 'app-root' });