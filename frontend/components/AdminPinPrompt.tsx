import React, { useState} from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal } from "react-native";
import axios from "axios";

type Props = {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AdminPinPrompt({ visible, onSuccess, onCancel }: Props) {
    const[pin, setPin] = useState('');

    const handleConfirm = async () => {
        try {
            const response = await axios.post('http://192.168.11.224:3000/verify-pin', {
                pin
            }, { withCredentials: true });

            if (response.status === 200) {
                onSuccess();
            } else {
                Alert.alert('Feil', 'Ugyldig PIN. Prøv igjen.');
            }
        } catch (err) {
            Alert.alert('Feil', 'Noe gikk galt. Vennligst prøv igjen.');
        } finally
        {
            setPin('');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Admin PIN</Text>
                    <TextInput
                        placeholder="Skriv inn admin PIN"
                        value={pin}
                        onChangeText={setPin}
                        secureTextEntry
                        maxLength={4}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <View style={styles.button}>
                    <Button title="Bekreft" onPress={handleConfirm} />
                    <Button title="Avbryt" onPress={onCancel} color="red" />
                </View>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
        width: "80%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    button:{
      flexDirection:'row',
      justifyContent:'space-between',
      width:'100%'
    }
});