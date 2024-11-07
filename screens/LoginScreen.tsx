import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4 justify-center">
      <Text className="text-2xl text-center mb-4">Welcome to Fishing Contest</Text>
      
      <TextInput
        className="bg-white p-4 rounded mb-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="bg-white p-4 rounded mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded mb-2"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold">Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-green-600 p-4 rounded"
        onPress={() => navigation.navigate('Register')}
      >
        <Text className="text-white text-center font-bold">Register</Text>
      </TouchableOpacity>
    </View>
  );
}