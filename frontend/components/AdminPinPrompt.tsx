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
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AdminPinPrompt({ visible, onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState("");

  const handleConfirm = async () => {
    try {
      const response = await axios.post(
        "http://10.0.0.8:3000/verify-pin",
        { pin },
        { withCredentials: true }
      );

      if (response.status === 200) {
        onSuccess();
      } else {
        Alert.alert("Feil", "Ugyldig PIN. Prøv igjen.");
      }
    } catch (err) {
      Alert.alert("Feil", "Ugyldig PIN. Prøv igjen.");
    } finally {
      setPin("");
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <LinearGradient colors={["#fcdada", "#c7ecfa"]} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🔒 Admin PIN</Text>
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

          <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Bekreft</Text>
          </TouchableOpacity>

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
