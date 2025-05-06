import { enableScreens } from 'react-native-screens';
enableScreens();

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';

const Stack = createNativeStackNavigator();

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
          {/* Andre skjermer legges til her etter hvert */}
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
