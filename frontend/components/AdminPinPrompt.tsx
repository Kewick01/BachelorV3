// AdminPinPrompt.tsx - Popup-komponent for å bekrefte at brukeren er admin.
// Brukes for å beskytte sensitive handlinger som oppretting, redigering og sletting av medlemmer, samt legge til oppgaver.
// Sjekker om den innskrevne PIN-koden stemmer med den som er lagret i Firebase.
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";  // For bakgrunnsgradient.
import auth from "@react-native-firebase/auth";             // Henter ID-token.

// Props som forventes.
type Props = {
  visible: boolean;       // Modalen skal vises
  onSuccess: () => void;  // Ved gyldig PIN.
  onCancel: () => void;   // Ved avbrudd.
};

// Hovedkomponent.
export default function AdminPinPrompt({ visible, onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState(""); // Inputfelt for PIN.

  // Sjekker PIN mot backend.
  const handleConfirm = async () => {
    try {
      const token = await auth().currentUser?.getIdToken(true); // Henter ID-token fra Firebase.
      if (!token) throw new Error("Ingen innlogget bruker");

      const response = await fetch(
        "http://<DIN_IP_ELLER_HOST>:3000/verify-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,   // Autentifisering.
          },
          body: JSON.stringify({ pin }),        // Her sendes PIN som ble skrevet inn.
        });

      const data = await response.json();  
      if (response.ok) {
        onSuccess();                           // Kaller tilbake skjerm, basert på hvor PIN skal navigeres.
      } else {
        Alert.alert("Feil", "Ugyldig PIN. Prøv igjen.");
      }
    } catch (err) {
      Alert.alert("Feil", "Ugyldig PIN. Prøv igjen.");
    } finally {
      setPin(""); // Tømmer felt.
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <LinearGradient colors={["#fcdada", "#c7ecfa"]} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🔒 Admin PIN</Text>

          {/* Inputfelt for PIN */}
          <TextInput
            placeholder="4-sifret admin PIN"
            placeholderTextColor="#999"
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            maxLength={4}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Knapp for bekreftelse */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Bekreft</Text>
          </TouchableOpacity>

          {/* Knapp for avbrytelse */}
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "monospace",
    color: "#b71c1c",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontFamily: "monospace",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#b71c1c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "monospace",
  },
});
