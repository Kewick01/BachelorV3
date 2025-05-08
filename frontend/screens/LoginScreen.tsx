import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
        Alert.alert('Feil', data.error || 'innlogging feilet.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Logg inn</Text>
      <TextInput placeholder="E-post" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Passord" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Logg inn" onPress={handlelogin} /> 
      <Button title="Registrer deg" onPress={() => navigation.navigate('Register')} />
      </View>
  );
  }

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});
