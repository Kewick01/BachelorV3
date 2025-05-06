import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function MemberDetailScreen({ route, navigation }: Props) {
  const { memberId } = route.params;
  const { members } = useAppContext();
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
              alert('Feil kode');
            }
          }}
        />
        <Button title="Tilbake" onPress={() => navigation.goBack()} />
      </View>
    );
  }

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
          <Text>Butikken kommer snart 🛍️</Text>
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
});
