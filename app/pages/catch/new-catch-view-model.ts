import { Observable } from '@nativescript/core';
import { Camera } from '@nativescript/camera';
import { Geolocation } from '@nativescript/geolocation';
import { firebase } from '@nativescript/firebase-core';
import { getStorage, ref, uploadBytes } from '@nativescript/firebase-storage';
import { getFirestore } from '@nativescript/firebase-firestore';

export class NewCatchViewModel extends Observable {
    private _photoSource: string = "";
    private _fishType: string = "";
    private _length: string = "";
    private _weight: string = "";
    private _location: any = null;
    private _locationText: string = "Getting location...";

    constructor() {
        super();
        this.requestPermissions();
        this.getCurrentLocation();
    }

    async requestPermissions() {
        await Camera.requestPermissions();
        await Geolocation.enableLocationRequest();
    }

    async getCurrentLocation() {
        try {
            const location = await Geolocation.getCurrentLocation({
                desiredAccuracy: 3,
                maximumAge: 5000,
                timeout: 10000
            });
            this._location = location;
            this.locationText = `Location: ${location.latitude}, ${location.longitude}`;
        } catch (error) {
            console.error('Location error:', error);
            this.locationText = "Could not get location";
        }
    }

    async onTakePhoto() {
        try {
            const image = await Camera.takePicture({
                width: 1024,
                height: 1024,
                keepAspectRatio: true,
                saveToGallery: false
            });
            this.photoSource = image.android || image.ios;
        } catch (error) {
            console.error('Camera error:', error);
            alert('Failed to take photo');
        }
    }

    async onSubmitCatch() {
        if (!this.canSubmit) return;

        try {
            // Upload photo
            const storage = getStorage();
            const photoRef = ref(storage, `catches/${Date.now()}.jpg`);
            await uploadBytes(photoRef, this.photoSource);
            const photoUrl = await photoRef.getDownloadURL();

            // Save catch data
            const db = getFirestore();
            const catchRef = db.collection('catches').doc();
            await catchRef.set({
                userId: firebase.auth().currentUser.uid,
                fishType: this.fishType,
                length: parseFloat(this.length),
                weight: parseFloat(this.weight),
                location: this._location ? 
                    new firebase.firestore.GeoPoint(
                        this._location.latitude, 
                        this._location.longitude
                    ) : null,
                photoUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Catch submitted successfully!');
            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit catch');
        }
    }

    // Getters and setters
    get photoSource(): string { return this._photoSource; }
    set photoSource(value: string) {
        if (this._photoSource !== value) {
            this._photoSource = value;
            this.notifyPropertyChange('photoSource', value);
            this.notifyPropertyChange('canSubmit', this.canSubmit);
        }
    }

    get fishType(): string { return this._fishType; }
    set fishType(value: string) {
        if (this._fishType !== value) {
            this._fishType = value;
            this.notifyPropertyChange('fishType', value);
            this.notifyPropertyChange('canSubmit', this.canSubmit);
        }
    }

    get length(): string { return this._length; }
    set length(value: string) {
        if (this._length !== value) {
            this._length = value;
            this.notifyPropertyChange('length', value);
            this.notifyPropertyChange('canSubmit', this.canSubmit);
        }
    }

    get weight(): string { return this._weight; }
    set weight(value: string) {
        if (this._weight !== value) {
            this._weight = value;
            this.notifyPropertyChange('weight', value);
            this.notifyPropertyChange('canSubmit', this.canSubmit);
        }
    }

    get locationText(): string { return this._locationText; }
    set locationText(value: string) {
        if (this._locationText !== value) {
            this._locationText = value;
            this.notifyPropertyChange('locationText', value);
        }
    }

    get canSubmit(): boolean {
        return Boolean(
            this.photoSource &&
            this.fishType &&
            this.length &&
            this.weight &&
            this._location
        );
    }
}