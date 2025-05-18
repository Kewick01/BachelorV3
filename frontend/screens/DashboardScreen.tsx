// DashboardScreen.tsx - Hovedskjerm for innloggede brukere.
// Viser oversikt over alle medlemmer som er knyttet til admin-bruker. Disse vises som en pinnefigur i et rom.
// Gir tilgang til AdminScreen via admin-PIN og en logout.
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useAppContext } from '../context/AppContext';                     // Henter inn data fra AppProvider fra AppContext.
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';                 // For bakgrunnsgradient.
import StickmanFigure from '../components/StickmanFigure';                 // Komponent for visning av pinnefiguren.
import AdminPinPrompt from '../components/AdminPinPrompt';                 // Pop-up fro Admin PIN.
import auth from '@react-native-firebase/auth';                            // For utlogging.

// Definerer faste posisjoner hvor figurer kan plasseres.
const predefinedPositions = [
  { top: 80, left: 30 },
  { top: 80, left: 200 },
  { top: 240, left: 60 },
  { top: 240, left: 230 },
  { top: 400, left: 40 },
  { top: 400, left: 210 },
];

type Props = NativeStackScreenProps<any>;

export default function DashboardScreen({ navigation }: Props) {
  const { members } = useAppContext();                       // Henter medlemmer.
  const [showPinPrompt, setShowPinPrompt] = useState(false); // Styrer syneligheten for PIN-popup.

  // Logger ut brukeren.
  const handleLogout = async () => {
    try {
      await auth().signOut();
      Alert.alert('Du er logget ut!');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Feil', 'Noe gikk galt under utlogging. Vennligst prøv igjen.');
    }
  };

  // Viser PIN-prompt for admin-tilgang.
  const requestAdminAccess = () => {
    setShowPinPrompt(true);
  };

  // Tegner en pinnefigur med animasjon og trykkbarhet.
  const renderMember = ({ item, index }: any) => {
    if (!item.id) {
      console.warn("Medlem mangler ID:", item)
    }
    const scale = new Animated.Value(1); // Skalering for animasjon.
    const position = predefinedPositions[index % predefinedPositions.length]; // Velger en posisjon.

    return (
      <Animated.View
        style={[
          styles.stickmanWrapper,
          position,
          { transform: [{ scale }] },
        ]}
        key={item.id}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={() => Animated.spring(scale, { toValue: 1.15, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
          onPress={() => {
            console.log("Navigerer til Memberdetail med medlem:", item);
            navigation.navigate('MemberDetail', { memberId: item.id });
          }}
        >
          <Text style={styles.nameTag}>{item.name}</Text>
          <StickmanFigure color={item.character.color || 'gray'} 
          accessories={item.equippedCosmetics || []}/>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.container}>
      {/* Topptekst og logout */}
      <View style={styles.topBar}>
        <Text style={styles.title}>🏠 Hjemmelobby</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>🚪 Logg ut</Text>
        </TouchableOpacity>
      </View>

      {/* Midten - tegner alle medlemmer */}
      <View style={styles.floor}>
        {members.length > 0 ? (
          members.map((member, index) => renderMember({ item: member, index }))
        ) : (
          <Text style={styles.emptyText}>Ingen medlemmer ennå. Trykk på knappen under for å legge til.</Text>
        )}
      </View>

      {/* Admin-knapp - fører til adminskjerm etter PIN */}
      <TouchableOpacity style={styles.adminButton} onPress={requestAdminAccess}>
        <Text style={styles.buttonText}>⚙️ Gå til Admin-verktøy</Text>
      </TouchableOpacity>

       {/* PIN-popup for å åpne AdminScreen */}
      <AdminPinPrompt
        visible={showPinPrompt}
        onCancel={() => setShowPinPrompt(false)}
        onSuccess={() => {
          setShowPinPrompt(false);
          navigation.navigate('Admin');
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'monospace',
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#c62828',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  floor: {
    flex: 1,
    position: 'relative',
    paddingBottom: 60,
    paddingTop: 20,
  },
  stickmanWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  nameTag: {
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontFamily: 'monospace',
    color: '#555',
  },
  adminButton: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
