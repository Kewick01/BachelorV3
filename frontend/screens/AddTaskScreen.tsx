import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import LinearGradient from 'react-native-linear-gradient';
import { authInstance } from '../firebase';
import { useAppContext } from "../context/AppContext";


type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

export default function AddTaskScreen({ route, navigation}: Props) {
    const { memberId } = route.params;
    const { refreshMember } = useAppContext();
    const [ title, setTitle ] = useState('');
    const [price, setPrice] = useState('');

    const handleAddTask = async () => {
        const numericPrice = Number(price);

        if (!title.trim() || !price) {
            Alert.alert("Fyll ut alle feltene!");
            return;
        }

        if (isNaN(numericPrice) || numericPrice <= 0) {
            Alert.alert("Ugyldig beløp", "Belønningen må være et positivt tall.");
            return;
        }

    try {
        const token = await authInstance.currentUser?.getIdToken(true);
        if (!token) throw new Error("Mangler gyldig token");

        const response = await fetch(`http://192.168.11.224:3000/add-task/${memberId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                price: Number(price),
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            Alert.alert("Feil", data.error || "Klarte ikke legge til oppgave.");
            return;
        }

        Alert.alert("Oppgave lagt til!");
        await refreshMember(memberId);
        navigation.goBack();
      } catch (err) {
        console.error("Feil ved lagring", err);
        Alert.alert("Feil", "Noe gikk galt.");
      }
    };

    return (
        <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.container}>
            <Text style={styles.title}>🧹 Legg til ny oppgave</Text>
            <TextInput
            placeholder="Oppgavetittel"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            />
            <TextInput
            placeholder="Belønning i kr"
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleAddTask}>
                <Text style={styles.buttonText}>Legg til</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
    }

    const styles = StyleSheet.create({
        container: { flex: 1, padding: 20, justifyContent: 'center'},
        title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20},
        input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15, backgroundColor: '#fff'},
        button: { backgroundColor: '#b71c1c', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 10, alignItems: 'center'},
        buttonText: { color: '#fff', fontSize: 16},
    });
    

