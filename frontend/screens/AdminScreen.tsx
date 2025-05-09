import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid + npm install --save-dev @types/uuid

type Props = NativeStackScreenProps<any>;

const availableColors = ['red', 'blue', 'green', 'yellow', 'orange', 'black', 'pink', 'purple'];

export default function AdminScreen({ navigation }: Props) {
  const { members, addMember } = useAppContext();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);

  const handleAdd = () => {
    if (name.trim() && code.length === 4) {
      addMember({
        id: uuidv4(),
        name,
        code,
        money: 0,
        tasks: [],
        character: {
          type: 'pinnefigur',
          color: selectedColor,
        },
      });
      setName('');
      setCode('');
    } else {
      alert('Navn og 4-sifret kode er påkrevd');
    }
  };

  const renderMember = ({ item }: any) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => {
        // Senere: Naviger til oppgavebehandling
        alert(`Klikket på ${item.name}`);
      }}
    >
      <Text style={styles.memberName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adminpanel</Text>

      <Text style={styles.subtitle}>Medlemmer:</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ gap: 10 }}
      />

      <Text style={styles.subtitle}>Legg til nytt medlem:</Text>
      <TextInput
        placeholder="Navn"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="4-sifret kode"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={4}
        style={styles.input}
      />
      <Text style={styles.subtitle}>Velg farge på karakteren din:</Text>
      <View style={styles.colorContainer}>
        {availableColors.map((color) =>(
          <TouchableOpacity
          key = {color}
          style={[
            styles.colorCircle,
            {backgroundColor: color },
            selectedColor === color && styles.selectedCircle,
          ]}
          onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
      <Button title="Legg til" onPress={handleAdd} />

      <View style={{ marginTop: 20 }}>
        <Button title="Tilbake til Dashboard" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  memberItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  memberName: {
    fontSize: 16,
  },
  colorContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    gap: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: 'black',
  },
});
