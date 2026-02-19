import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { ConfirmTokenScreen } from '../screens/ConfirmTokenScreen';
import { MapScreen } from '../screens/MapScreen';
import { ScanQRCodeScreen } from '../screens/ScanQRCodeScreen';
import { AuthNavigator } from './AuthNavigator';
import { DrawerNavigator } from './DrawerNavigator';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ContactSelectionScreen } from '../screens/ContactSelectionScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = ({ navigationRef }) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen
          name="ConfirmToken"
          component={ConfirmTokenScreen}
          options={{ headerShown: true, title: 'Get Token' }}
        />
        <Stack.Screen
          name="ScanQRCode"
          component={ScanQRCodeScreen}
          options={{ headerShown: true, title: 'Scan QR Code' }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: true, title: 'Forgot Password' }}
        />
        <Stack.Screen
          name="ContactSelection"
          component={ContactSelectionScreen}
          options={{ headerShown: true, title: 'Select Contacts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
