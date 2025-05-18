// App.tsx - Hovedfilen for hele React-Native applikasjonen.
// Her settes opp navigasjonen mellom de ulike skjermene og kontekst gjøres tilgjengelig.
// Det brukes React Navigation og Context API.

import { enableScreens } from 'react-native-screens';
enableScreens(); // Opptimaliserer minnebruk.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Hovedcontainer for navigasjonen.
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack-navigasjon.
import type { RootStackParamList } from './types'; // Definerer typer for rutene.
import { AppProvider } from './context/AppContext'; 

// Importerer skjermene i appen.
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import AddTaskScreen from './screens/AddTaskScreen';

// Hovedfunksjonen som render hele appen.
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login"> 
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
