import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, GeoPoint } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function NewCatchScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [fishType, setFishType] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('Getting location...');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLocationText(`Location: ${location.coords.latitude}, ${location.coords.longitude}`);
    })();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image || !fishType || !length || !weight || !location) {
      Alert.alert('Error', 'Please fill all fields and take a photo');
      return;
    }

    try {
      // Upload image
      const storage = getStorage();
      const response = await fetch(image);
      const blob = await response.blob();
      const imageRef = ref(storage, `catches/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      const photoUrl = await getDownloadURL(imageRef);

      // Save catch data
      const db = getFirestore();
      const auth = getAuth();
      await addDoc(collection(db, 'catches'), {
        userId: auth.currentUser.uid,
        fishType,
        length: parseFloat(length),
        weight: parseFloat(weight),
        location: new GeoPoint(
          location.coords.latitude,
          location.coords.longitude
        ),
        photoUrl,
        timestamp: new Date()
      });

      Alert.alert('Success', 'Catch submitted successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {image && (
          <Image
            source={{ uri: image }}
            className="w-full h-48 mb-4 rounded"
            resizeMode="cover"
          />
        )}

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded mb-4"
          onPress={takePhoto}
        >
          <Text className="text-white text-center font-bold">Take Photo</Text>
        </TouchableOpacity>

        <TextInput
          className="bg-white p-4 rounded mb-2"
          placeholder="Fish Species"
          value={fishType}
          onChangeText={setFishType}
        />

        <TextInput
          className="bg-white p-4 rounded mb-2"
          placeholder="Length (cm)"
          value={length}
          onChangeText={setLength}
          keyboardType="numeric"
        />

        <TextInput
          className="bg-white p-4 rounded mb-4"
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text className="mb-4">{locationText}</Text>

        <TouchableOpacity
          className="bg-green-600 p-4 rounded"
          onPress={handleSubmit}
          disabled={!image || !fishType || !length || !weight || !location}
        >
          <Text className="text-white text-center font-bold">Submit Catch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}