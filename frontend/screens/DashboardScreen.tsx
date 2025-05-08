import React from 'react';
import { View, Text, StyleSheet, Button, FlatList, Switch, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function DashboardScreen({ navigation }: Props) {
  const { isAdmin, toggleAdmin, members } = useAppContext();

  const handleLogout = async () => {
    try {
      await axios.post('http://192.168.11.224:3000/logout', {}, { withCredentials: true });
      Alert.alert('Du er logget ut!');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Feil', 'Noe gikk galt under utlogging. Vennligst prøv igjen.');
    }
  };

  const renderEmpty = () => {
    if (isAdmin) return null;
    return (
      <Text style={styles.emptyText}>
        Ingen medlemmer ennå. Gå til admin-modus for å legge til medlemmer.
      </Text>
    );
  };
  
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

      <View style={styles.content}>
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
        <View style={styles.buttonSpacing}>
        <Button
          title="Gå til Admin-verktøy"
          onPress={() => navigation.navigate('Admin')}
          color="#1E90FF"
        />
        </View>
      )}
</View>

    <View style={styles.logoutContainer}>
  <Button title="Logg ut" onPress={handleLogout} color="#FF6347" />
  </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between', },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 50,},
  list: { gap: 10, flexGrow: 1,},
  memberBubble: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  memberName: { fontSize: 16 },
  level: { fontSize: 12, color: '#888' },
  logoutContainer: {
    marginTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonSpacing: {
    marginTop: 20,
  },
  
});
