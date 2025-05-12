import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid + npm install --save-dev @types/uuid
import { db, authInstance} from '../firebase';
import StickmanFigure from '../components/StickmanFigure'; // Importer din komponent for pinnefigur


type Props = NativeStackScreenProps<any>;

const availableColors = ['red', 'blue', 'green', 'yellow', 'orange', 'black', 'pink', 'purple'];

export default function AdminScreen({ navigation }: Props) {
  const { members, addMember, deleteMember, updateMember, getCurrentAdminId } = useAppContext();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [editingColor, setEditingColor] = useState(availableColors[0]);

  const handleAdd = async () => {
    if (name.trim() && code.length === 4) {
      const currentAdminId = getCurrentAdminId(); // Hent adminId fra den nåværende brukeren
      if (!currentAdminId) {
        Alert.alert('Ingen admin ID funnet. Vennligst logg inn som admin.');
        return;
      }

      const newMemberData = {
        name,
        code,
        money: 0,
        tasks: [],
        character: {
          type: 'pinnefigur',
          color: selectedColor,
        },
        adminId: currentAdminId, // Legg til adminId her
      };

      try {
        const docRef = await db.collection('members').add(newMemberData);

        const newMember = {
          id: docRef.id,
          ...newMemberData,
        };
        addMember(newMember);
        setName('');
        setCode('');
        setSelectedColor(availableColors[0]);
      } catch (error) {
        console.error('Feil ved å legge til medlem:', error);
        Alert.alert('Noe gikk galt. Vennligst prøv igjen.');
      }
    } else {
      Alert.alert('Navn og 4-sifret kode er påkrevd');
    }
  };

  const handleUpdate = () => {
    if (!editingMemberId) return;

    const member = members.find((m) => m.id === editingMemberId);
    if (!member) return;

    const updatedMember = {
      ...member,
      name: editingMemberName,
      character: {
        ...(member.character ?? {}),
        color: editingColor,
      },
    };

    updateMember(updatedMember);
    setEditingMemberId(null);

  };

  const renderMember = ({ item }: any) => {
    const isEditing = editingMemberId === item.id;

    return (
    <View style={styles.memberItem}>
    {isEditing ? (
    <>
       <TextInput
    value={editingMemberName}
    onChangeText={setEditingMemberName}
    style={styles.input}
    />
    <View style={styles.colorContainer}>
      {availableColors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorCircle,
            { backgroundColor: color },
            editingColor === color && styles.selectedCircle,
          ]}
          onPress={() => setEditingColor(color)}
        />
      ))}
    </View>

    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <StickmanFigure color={editingColor} />
    </View>

    <Button title="Lagre endringer" onPress={handleUpdate} />
    <Button
      title="Avbryt"
      color="gray"
      onPress={() => setEditingMemberId(null)}
      />
      </>
    ) : (
      <>
    <Text style={styles.memberName}>{item.name}</Text>
    <View style ={{ flexDirection: 'row' }}>
      <TouchableOpacity
      onPress={() => {
        setEditingMemberId(item.id);
        setEditingMemberName(item.name);
        setEditingColor(item.character.color || availableColors[0]);
      }}
      style={styles.editButton}
      >
        <Text style={{ color: 'blue' }}>Rediger</Text>
      </TouchableOpacity>

  <TouchableOpacity onPress={() => 
    Alert.alert(
      'Bekreft Sletting',
      `Er du sikker på at du vil slette ${item.name}?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: () => deleteMember(item.id),
        },
      ])
  }
    style={styles.deleteButton}
  >
    <Text style={{ color: 'red' }}>Slett</Text>
  </TouchableOpacity>
  </View>
  </>
    )}
    </View>
    );
  };


  return (
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ gap: 10 }}
        ListHeaderComponent={
          <>
          <Text style={styles.title}>Adminpanel</Text>
          <Text style={styles.subtitle}>Medlemmer:</Text>
          </>
        }
        ListFooterComponent={
        <>
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

        <View style = {{ alignItems: 'center', marginVertical: 20 }}>
         <StickmanFigure color={selectedColor} />
        </View>

      <Button title="Legg til" onPress={handleAdd} />


      <View style={{ marginTop: 20 }}>
        <Button title="Tilbake til Dashboard" onPress={() => navigation.goBack()} />
      </View>
      </>
      }
      />
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
  deleteButton: {
    marginTop: 5,
    marginLeft: 5,
    padding: 5,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    alignItems: 'center',
  },
  editButton: {
    marginTop: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: '#d1ecf1',
    borderRadius: 5,
    alignItems: 'center',
  },
});


