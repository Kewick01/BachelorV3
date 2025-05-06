import React from 'react';
import { View, Text, StyleSheet, Button, FlatList, Switch, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function DashboardScreen({ navigation }: Props) {
  const { isAdmin, toggleAdmin, members } = useAppContext();

  const renderEmpty = () => (
    <Text style={styles.emptyText}>
      {isAdmin
        ? 'Ingen medlemmer ennå. Trykk på "Legg til medlem" for å starte.'
        : 'Gå til admin-modus for å legge til medlemmer.'}
    </Text>
  );

  const renderMember = ({ item }: any) => (
    <TouchableOpacity
      style={styles.memberBubble}
      onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}
    >
      <Text style={styles.memberName}>{item.name}</Text>
      <Text style={styles.level}>Level 1</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Switch value={isAdmin} onValueChange={toggleAdmin} />
        <Text>{isAdmin ? 'Admin-modus' : 'Bruker-modus'}</Text>
      </View>

      {members.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={styles.list}
        />
      )}

      {isAdmin && (
        <Button
          title="Gå til Admin-verktøy"
          onPress={() => navigation.navigate('Admin')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 50 },
  list: { gap: 10 },
  memberBubble: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  memberName: { fontSize: 16 },
  level: { fontSize: 12, color: '#888' },
});
