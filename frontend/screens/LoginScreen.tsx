// LoginScreen.tsx - Skjerm for innlogging av brukere via e-post og passord.
// Bruker Firebase Authentication til å logge inn, og setter innlogget status i AppContext.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../context/AppContext';                   // Henter inn data fra AppProvider fra AppContext.
import { NativeStackScreenProps } from '@react-navigation/native-stack'; 
import LinearGradient from 'react-native-linear-gradient';               // For bakgrunnsgradient.
import auth from '@react-native-firebase/auth';                          // Firebase Auth-modul.

type Props = NativeStackScreenProps<any>;  // Navigation-prop via React Navigation.

export default function LoginScreen({ navigation }: Props) {
  const { setLoggedIn } = useAppContext();         // Setter innloggingsstatus.
  const [email, setEmail] = useState('');          // Brukerens e-post.
  const [password, setPassword] = useState('');    // Brukerens passord.

  // Funksjonen som kjører når brukeren trykker på "Logg inn".
  const handlelogin = async () => {
    if (!email || !password) {
      Alert.alert('Feil', 'Fyll ut både e-post og passord')
      return;
    }

    try {

      // Logger inn med Firebase Authentication.
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Henter token knyttet til Id.
      const idToken = await user.getIdToken(true);
      console.log('Bruker logget inn med uid', user.uid);
      console.log('Token (kortet for sikkerhet):', idToken.substring(0,20), '...');
      

      // Setter status og navigerer til Dashboard.
      Alert.alert('Suksess!', `Velkommen! ${user.email}`);
      setLoggedIn(true);


      navigation.replace('Dashboard'); // Her navigeres det til Dashboard.
    } catch (error) {
      Alert.alert('Feil E-mail eller passord!'); // Status for feil.
    }
  };

  return (
    <LinearGradient
      colors={['#fcdada', '#c7ecfa']}
      style={styles.container}
    >
      <Text style={styles.title}>🎮 Velkommen tilbake!</Text>
      <Text style={styles.subtitle}>Logg inn og gjør husarbeid gøy!</Text>

      {/* Inputfelt for E-post */}
      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#999"
      />

      {/* Inputfelt for passord */}
      <TextInput
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      {/* Kanpp for logg inn */}
      <TouchableOpacity style={styles.loginButton} onPress={handlelogin}>
        <Text style={styles.buttonText}>🔥 LOGG INN</Text>
      </TouchableOpacity>

      {/* Navigasjon til registeringsskjermen */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        
        <Text style={styles.buttonText}>🆕 REGISTRER DEG</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Stiler for komponenten.
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
