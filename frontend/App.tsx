import { enableScreens } from 'react-native-screens';
enableScreens();

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { AppProvider } from './context/AppContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import AddTaskScreen from './screens/AddTaskScreen';

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
          {/* Andre skjermer legges til her etter hvert */}
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
