import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authInstance, db } from '../firebase';
import StickmanFigure from '../components/StickmanFigure';
import LinearGradient from 'react-native-linear-gradient';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<any>;

const availableColors = ['red', 'blue', 'green', 'yellow', 'orange', 'black', 'purple'];

export default function AdminScreen({ navigation }: Props) {
  const { members, addMember, deleteMember, updateMember, getCurrentAdminId } = useAppContext();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [editingColor, setEditingColor] = useState(availableColors[0]);

  const handleAdd = async () => {
  console.log("==> KJØRER handleAdd");
  console.log("Navn:", name);
  console.log("Kode:", code);
    if (name.trim() && code.length === 4) {
      try{
        const token = await authInstance.currentUser?.getIdToken();

        const response = await fetch('http://192.168.11.224:3000/create-member', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          code,
          color: selectedColor,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        console.log("Feil fra backend:", data);
      Alert.alert("Feil", data.error || "Klarte ikke legge til medlem.");
      return;
    }
        
    console.log("Medlem lagt til via backend:", data);

        const newMember = {
          id: data.id,
          name,
          code,
          money: 0,
          tasks: [],
          cosmetics: [],
          character: {
            type: "pinnefigur",
            color: selectedColor,
          },
        };

        addMember(newMember);
        setName("");
        setCode("");
        setSelectedColor(availableColors[0]);
        setShowAddForm(false);

        Alert.alert("Suksess!", "Medlem ble lagt til.");
      } catch (error) {
        console.error("Feil ved oppretting:", error);
        Alert.alert("Feil", "Noe gikk galt ved oppretting av medlem.");
      }
    } else {
      Alert.alert("Navn og 4-sifret kode er påkrevd");
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
                    styles.editColorCircle,
                    { backgroundColor: color },
                    editingColor === color && styles.selectedCircle,
                  ]}
                  onPress={() => setEditingColor(color)}
                />
              ))}
            </View>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <StickmanFigure color={editingColor} accessories={[]} />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Lagre endringer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 10 }]}
              onPress={() => setEditingMemberId(null)}
            >
              <Text style={styles.buttonText}>Avbryt</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.memberName}>{item.name}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingMemberId(item.id);
                  setEditingMemberName(item.name);
                  setEditingColor(item.character.color || availableColors[0]);
                }}
              >
                <Text style={{ color: 'blue' }}>✏️ Rediger</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
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
                    ]
                  )
                }
              >
                <Text style={{ color: 'red' }}>🗑️ Slett</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.gradient}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Adminpanel</Text>
            <Text style={styles.subtitle}>Medlemmer:</Text>
          </>
        }
        ListFooterComponent={
          <>
            {!showAddForm ? (
              <TouchableOpacity
                style={[styles.primaryButton, { marginVertical: 20 }]}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.buttonText}>➕ Legg til nytt medlem</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.memberItem}>
                <Text style={styles.subtitle}>➕ Legg til nytt medlem:</Text>
                <TextInput
                  placeholder="Navn"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <TextInput
                  placeholder="4-sifret kode til medlemmet"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <Text style={styles.subtitle}>🎨 Velg farge:</Text>
                <View style={styles.colorContainer}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedCircle,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <StickmanFigure color={selectedColor} accessories={[]} />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                  <Text style={styles.buttonText}>➕ Legg til</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { marginTop: 10 }]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.buttonText}>Avbryt</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.secondaryButton, { marginBottom: 30 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>⬅️ Tilbake til Dashboard</Text>
            </TouchableOpacity>
          </>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'monospace',
    color: '#b71c1c',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  memberItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  colorCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editColorCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: '#000',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  primaryButton: {
    backgroundColor: '#b71c1c',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#42a5f5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
