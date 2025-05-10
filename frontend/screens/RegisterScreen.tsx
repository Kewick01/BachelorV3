import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');

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
        headers: { 'Content-Type': 'application/json' },
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
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
    }
  };

  return (
    <LinearGradient
      colors={['#fcdada', '#c7ecfa']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🧑‍🚀 Registrering!</Text>
        <Text style={styles.subtitle}>Lag en konto for å administrere hjemmet!</Text>

        <TextInput
          placeholder="Brukernavn"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Mobilnummer (+47...)"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="E-post"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Passord"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Admin PIN (4 siffer)"
          value={adminPin}
          onChangeText={setAdminPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>🚀 REGISTRER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          <Text style={styles.backText}>⬅️ Gå tilbake til innlogging</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#b71c1c',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  registerButton: {
    backgroundColor: '#d32f2f',
    padding: 14,
    width: '90%',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: '#000',
    fontSize: 14,
  },
});
