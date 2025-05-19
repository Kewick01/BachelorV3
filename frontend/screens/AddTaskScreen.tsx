// AddTaskScreen.tsx - Skjerm hvor admin kan tildele ny oppgave til et spesifikt medlem.
// Krever at brukeren er logget inn og sender deretter token til backend for autentifisering.
// Navigeres til via Admin-skjermen med medlemId som parameter.

import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';               // Typing for navigasjon.
import LinearGradient from 'react-native-linear-gradient';   // For bakgrunnsgradient.
import { authInstance } from '../firebase';                  // Firebase for å hente ID-token.
import { useAppContext } from "../context/AppContext";       // For å oppdatere medlemmet etter oppgaven er lagt til.


type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

export default function AddTaskScreen({ route, navigation}: Props) {
    const { memberId } = route.params;           // Henter medlem-ID fra navigasjonsrute. 
    const { refreshMember } = useAppContext();   // Funksjon for å oppdatere data etter lagring.
    const [ title, setTitle ] = useState('');    // Oppgavens tittel.
    const [price, setPrice] = useState('');      // Belønningen i kr, men input regnes som tekst.

    // Legger til oppgave.
    const handleAddTask = async () => {
        const numericPrice = Number(price);      // Konverterer inputen til tall her.

        // Validering knyttet til inputen.
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

        // Sender POST-forespørsel til backend.
        const response = await fetch(`http://<DIN_IP_ELLER_HOST>:3000/add-task/${memberId}`, {
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
        await refreshMember(memberId);          // Oppdaterer medlemsdata lokalt.
        navigation.goBack();
      } catch (err) {
        console.error("Feil ved lagring", err);
        Alert.alert("Feil", "Noe gikk galt.");
      }
    };

    return (
        <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.container}>
            <Text style={styles.title}>🧹 Legg til ny oppgave</Text>

            {/* Inputfelt for navn på oppgaven */}
            <TextInput
            placeholder="Oppgavetittel"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            />
            {/* Inputfelt for belønningen for oppgaven */}
            <TextInput
            placeholder="Belønning i kr"
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            style={styles.input}
            />
            {/* Knapp for lagring */}
            <TouchableOpacity style={styles.button} onPress={handleAddTask}>
                <Text style={styles.buttonText}>Legg til</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
    }

    // Stil for skjermen.
    const styles = StyleSheet.create({
        container: { flex: 1, padding: 20, justifyContent: 'center'},
        title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20},
        input: { borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15, backgroundColor: '#fff'},
        button: { backgroundColor: '#b71c1c', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 10, alignItems: 'center'},
        buttonText: { color: '#fff', fontSize: 16},
    });
    

