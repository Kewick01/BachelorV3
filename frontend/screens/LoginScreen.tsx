import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const { setLoggedIn } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logg inn</Text>
      <TextInput placeholder="Brukernavn" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Passord" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Logg inn" onPress={() => {setLoggedIn(true); 
      navigation.replace('Dashboard');
  }}
/>
      <Button title="Registrer deg" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
});
