import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const { setLoggedIn } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlelogin = async () => {
    try {
      const response = await fetch('http://192.168.11.224:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Feil', data.error || 'Innlogging feilet.');
        return;
      }

      Alert.alert('Suksess!', `Velkommen! ${data.username}`);
      setLoggedIn(true);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Feil', 'Noe gikk galt. Vennligst prøv igjen.');
    }
  };

  return (
    <LinearGradient
      colors={['#fcdada', '#c7ecfa']}
      style={styles.container}
    >
      <Text style={styles.title}>🎮 Velkommen tilbake!</Text>
      <Text style={styles.subtitle}>Logg inn og gjør husarbeid gøy!</Text>

      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.loginButton} onPress={handlelogin}>
        <Text style={styles.buttonText}>🔥 LOGG INN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>🆕 REGISTRER DEG</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
  loginButton: {
    width: '90%',
    backgroundColor: '#b71c1c',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    width: '90%',
    backgroundColor: '#42a5f5',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
