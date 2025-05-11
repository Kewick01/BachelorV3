import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

const shopItems = [
  { id: '1', name: '🎩 Hatt', price: 3 },
  { id: '2', name: '🕶️ Solbriller', price: 5 },
  { id: '3', name: '👕 T-skjorte', price: 2 },
  { id: '4', name: '👖 Bukse', price: 4 },
  { id: '5', name: '🩳 Shorts', price: 6 },
  { id: '6', name: '👟 Sko', price: 3 },
];

export default function MemberDetailScreen({ route, navigation }: Props) {
  const { memberId } = route.params;
  const { members, updateMember } = useAppContext(); // Forutsetter at du har en updateMember-funksjon
  const member = members.find((m) => m.id === memberId);

  const [enteredCode, setEnteredCode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'shop'>('tasks');

  if (!member) {
    return (
      <View style={styles.center}>
        <Text>Medlem ikke funnet</Text>
      </View>
    );
  }

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Skriv inn 4-sifret kode for {member.name}</Text>
        <TextInput
          placeholder="Kode"
          value={enteredCode}
          onChangeText={setEnteredCode}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />
        <Button
          title="Lås opp"
          onPress={() => {
            if (enteredCode === member.code) {
              setAuthenticated(true);
            } else {
              Alert.alert('Feil kode');
            }
          }}
        />
        <Button title="Tilbake" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handlePurchase = (item: { id: string; name: string; price: number }) => {
    if (member.money >= item.price) {
      member.money -= item.price;
      member.cosmetics = [...(member.cosmetics || []), item.name];

      // Oppdater i context og ev. Firebase her:
      updateMember(member); // Du må ha denne implementert i AppContext

      // Eksempel på Firebase Firestore update (hvis ønskelig)
      // const memberRef = doc(firestore, 'members', member.id);
      // await updateDoc(memberRef, {
      //   money: member.money,
      //   cosmetics: member.cosmetics,
      // });

      Alert.alert(`Du kjøpte ${item.name}!`);
    } else {
      Alert.alert('Ikke nok penger!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{member.name}</Text>
      <Text style={styles.money}>💰 {member.money} kr</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('tasks')}>
          <Text style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}>Oppgaver</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('shop')}>
          <Text style={[styles.tab, activeTab === 'shop' && styles.activeTab]}>Butikk</Text>
        </TouchableOpacity>
      </View>

      {/* Innhold */}
      <View style={styles.tabContent}>
        {activeTab === 'tasks' ? (
          member.tasks.length > 0 ? (
            member.tasks.map((task) => (
              <Text key={task.id}>
                {task.title} - {task.completed ? '✅' : `${task.price} kr`}
              </Text>
            ))
          ) : (
            <Text>Ingen oppgaver enda.</Text>
          )
        ) : (
          <View style={styles.shopGrid}>
            {shopItems.map((item) => (
              <View key={item.id} style={styles.shopItem}>
                <Text style={styles.shopName}>{item.name}</Text>
                <Text style={styles.shopPrice}>{item.price} kr</Text>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handlePurchase(item)}
                >
                  <Text>Kjøp</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <Button title="Tilbake til Dashboard" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  money: { fontSize: 18, marginBottom: 10 },
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: { marginRight: 20, fontSize: 16 },
  activeTab: { fontWeight: 'bold', textDecorationLine: 'underline' },
  tabContent: { flex: 1 },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  shopName: { fontSize: 18 },
  shopPrice: { marginBottom: 5 },
  buyButton: {
    backgroundColor: '#aaffaa',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
