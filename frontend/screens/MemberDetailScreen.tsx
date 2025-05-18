// MemberDetailScreen.tsx - Skjerm for detaljert visning av hvert enkelt medlem.
// Krever PIN-kode knyttet til medlemmet og ikke admin for tilgang. Viser oppgaver og butikk, hvor medlemmet kan kjøpe tilbehør.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';       // Henter inn data fra AppProvider fra AppContext.
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';               // Definerer parametere for navigasjon.
import LinearGradient from 'react-native-linear-gradient';
import { authInstance } from '../firebase';                  // Firebase auth brukt til token.
import StickmanFigure from '../components/StickmanFigure';   // Komponent for å vise figuren.
import { useEffect } from 'react';
import AdminPinPrompt from '../components/AdminPinPrompt';   // For å bekrefte adminhandlinger.

type Props = NativeStackScreenProps<RootStackParamList, 'MemberDetail'>;

// Tilgjengelige varer i butikken.
const shopItems = [
  { id: '1', name: '🎩 Hatt', price: 3 },
  { id: '2', name: '🕶️ Briller', price: 5 },
  { id: '3', name: '👕T-skjorte', price: 2 },
  { id: '4', name: '👖 Bukse', price: 4 },
  { id: '5', name: '🩳 Shorts', price: 6 },
  { id: '6', name: '👟 Sko', price: 3 },
];

export default function MemberDetailScreen({ route, navigation }: Props) {
  const { memberId } = route.params;
  // Henter funksjoner og medlemsdata.
  const { refreshMember } = useAppContext();
  const { members, updateMember, completeTask } = useAppContext();
  const member = members.find((m) => m.id === memberId);
  // Lokale states.
  const [enteredCode, setEnteredCode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'shop'>('tasks');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<string |null>(null);

  // Henter den oppdaterte informasjonen om medlem når skjermen åpnes.
  useEffect(() => {
    refreshMember(memberId);
  }, [memberId]);

  // Viser til fallback hvis medlemmet ikke finnes.
  if (!memberId || !member) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Medlem ikke funnet</Text>
      </View>
    );
  }

  const equipped = member.equippedCosmetics || [];

  // Logikken for kjøp knyttet til de kosmetiske elementene i butikken.
  const handlePurchase = async (item: { id: string; name: string; price: number}) => {
    try {
      console.log("Kjører handlePurchase", item);

      const token = await authInstance.currentUser?.getIdToken(true);
      if (!token) {
        Alert.alert("Ingen token funnet!");
        return;
      }

      const res = await fetch("http://<DIN-IP-ELLER-HOST>:3000/purchase", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item: item,
          memberId: member.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.error || "Kjøpet feilet.");
        return;
        };

      Alert.alert(`Du kjøpte ${item.name} for ${item.price} kr!`);
      await refreshMember(memberId);
    } catch (error) {
      console.error('Feil ved kjøp:', error);
      Alert.alert('Feil', 'Noe gikk galt med kjøpet.');
    }
  };

  // Brukeren kan ta av og på de kosmetiske elementene.
  const toggleEquip = (itemId: string) => {
    const current = member.equippedCosmetics || [];
    const updated = current.includes(itemId)
    ? current.filter((id) => id !== itemId)
    : [...current, itemId];

    const memberCopy = JSON.parse(JSON.stringify(member));
    const updatedMember = {
      ...memberCopy,
      equippedCosmetics: updated,
    };
    updateMember(updatedMember, true);
  };

  // Brukeren kan selge de kosmetiske elementene og få pengene tilbake.
  const handleSell = (itemId: string) => {
    const price = shopItems.find(i => i.id === itemId)?.price || 0;
    const updatedCosmetics = (member.cosmetics || []).filter((id) => id !== itemId);
    const updatedEquipped = (member.equippedCosmetics || []).filter((id) => id !== itemId);
    const updatedMoney = member.money + price;

    const memberCopy = JSON.parse(JSON.stringify(member));
    const updatedMember = {
      ...memberCopy,
      cosmetics: updatedCosmetics,
      equippedCosmetics: updatedEquipped,
      money: updatedMoney,
    };
    updateMember(updatedMember, true);
    Alert.alert("Varen ble solgt!");
  };

  // Hvis bruker ikke har tastet rikitg PIN ennå, så vil en PIN-input komme opp.
  if (!authenticated) {
    return (
      <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.gradient}>
        <View style={styles.container}>
          <Text style={styles.title}>🔒 Skriv inn 4-sifret kode for {member.name}</Text>
          <TextInput
            placeholder="Kode"
            value={enteredCode}
            onChangeText={setEnteredCode}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={() => {
            if (enteredCode === member.code) {
              setAuthenticated(true);
            } else {
              Alert.alert('Feil kode');
            }
          }}>
            <Text style={styles.buttonText}>Lås opp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Innhold når medlemmet har låst opp sin bruker.
  return (
    <LinearGradient colors={['#fcdada', '#c7ecfa']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{member.name}</Text>
          <Text style={styles.subtitle}>💰 {member.money} kr</Text>

          {/* Tegner karakteren med utstyret */}
          <StickmanFigure
          color={member.character.color}
          accessories={member.equippedCosmetics || []}
          />

          {/* Veksler mellom oppgaver og butikk */}
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setActiveTab('tasks')}>
              <Text style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}>📋 Oppgaver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('shop')}>
              <Text style={[styles.tab, activeTab === 'shop' && styles.activeTab]}>🛍️ Butikk</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'tasks' ? (
              // Viser oppgaver
              member.tasks.length > 0 ? (
                member.tasks.map((task) => (
                  <View key={task.id} style={{ marginBottom: 8}}>
                  <Text style={styles.taskText}>
                    {task.title} - {task.completed === true ? '✅' : `${task.price} kr`}
                  </Text>
                  {!task.completed && (
                    <TouchableOpacity
                    onPress={() => {
                      setTaskToComplete(task.id);
                      setShowPinPrompt(true);
                    }}
                    style={[styles.buyButton, { backgroundColor: '#aed581', marginTop: 5}]}
                    >
                      <Text style={styles.buyText}>Fullført</Text>
                    </TouchableOpacity>
                  )}
                  </View>
                ))
              ) : (
                <Text style={styles.taskText}>Tomt for oppgaver.</Text>
              )
            ) : (
              // Viser butikkvarer.
              <View style={styles.shopGrid}>
                {shopItems.map((item) => {
                  const ownsItem = member.cosmetics?.includes(item.id);
                  const isEquipped = equipped.includes(item.id);

                  return (
                  <View key={item.id} style={styles.shopItem}>
                    <Text style={styles.shopName}>{item.name}</Text>
                    <Text style={styles.shopPrice}>{item.price} kr</Text>

                    {!ownsItem ? (
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => handlePurchase(item)}
                    >
                      <Text style={styles.buyText}>Kjøp</Text>
                    </TouchableOpacity>
                    ) : (
                      <>
                      <TouchableOpacity
                      style={[styles.buyButton, { backgroundColor: '#90caf9', marginBottom: 4}]}
                      onPress={() => toggleEquip(item.id)}
                      >
                        <Text style= {styles.buyText}>{isEquipped ? 'Ta av' : 'Ta på'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                      style={[styles.buyButton, { backgroundColor: '#e57373'}]}
                      onPress={() => handleSell(item.id)}
                      >
                        <Text style={styles.buyText}>Selg</Text>
                      </TouchableOpacity>
                      </>
                    )}
                  </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Krever bekreftelse før en oppgave kan fullføres, dette er da admin-PIN */}
        <AdminPinPrompt
        visible={showPinPrompt}
        onCancel={() => {
          setTaskToComplete(null);
          setShowPinPrompt(false);
        }}
        onSuccess={async () => {
          if (taskToComplete) {
            await completeTask(member.id, taskToComplete);
          }
          setTaskToComplete(null);
          setShowPinPrompt(false);
        }}
        />


    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#444',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#b71c1c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#42a5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
  },
  tab: {
    fontSize: 16,
    fontFamily: 'monospace',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#90caf9',
    color: '#000',
    fontWeight: 'bold',
  },
  tabContent: {
    width: '100%',
  },
  taskText: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
  width: '48%',
  backgroundColor: '#fff',
  padding: 10,
  marginBottom: 12,
  borderRadius: 10,
  elevation: 2,
  alignItems: 'center',
},
  shopName: {
    fontSize: 22,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  shopPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  buyButton: {
    backgroundColor: '#a5d6a7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buyText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
