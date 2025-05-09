import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState(''); // For fremtidig admin-funksjonalitet

  const handleRegister = async () => {
    if (!username || !email || !password || !phone || !adminPin) {
      Alert.alert('Feil', 'Vennligst fyll ut alle feltene.');
      return;
    }

    if (phone && !/^\+\d{7,15}$/.test(phone)) {
      Alert.alert('Feil', 'Vennligst oppgi et gyldig telefonnummer med landskode.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Feil', 'Passordet må være minst 6 tegn langt.');
      return;
    }

    if (adminPin && adminPin.length !== 4) {
      Alert.alert('Feil', 'Admin PIN må være 4 siffer.');
      return;
    }

    try {
      const response = await fetch('http://192.168.11.224:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          phone,
          admin_pin: adminPin,
        }),
      });
      const data = await response.json();
      if (!response.ok) { 
        Alert.alert('Feil', data.error || 'Noe gikk galt. Prøv igjen.');
        return;
      }

      Alert.alert('Suksess', 'Brukeren er registrert!');
      console.log("Naviger til Login");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrer bruker</Text>
      <TextInput placeholder="Brukernavn" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Mobilnummer" value={phone} onChangeText={setPhone} style={styles.input} />
      <TextInput placeholder="E-post" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Passord" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Admin PIN (4 siffer)" value={adminPin} onChangeText={setAdminPin} keyboardType="numeric" maxLength={4} secureTextEntry style={styles.input} />
      <Button title="Registrer" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});
