import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async() => {
    try {
      const response = await fetch('https://192.168.11.224:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });
      const data = await response.json();
      if (!response.ok) { 
        Alert.alert('Feil', data.console.error || 'Noe gikk galt. Prøv igjen.');
        return;
      }

      Alert.alert('Suksess', 'Brukeren er registrert!');
      navigation.navigate('LoginScreen');
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
      <Button title="Registrer" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});
