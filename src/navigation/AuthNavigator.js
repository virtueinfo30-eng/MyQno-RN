import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { theme } from '../theme';

const Tab = createMaterialTopTabNavigator();

export const AuthNavigator = () => {
  return (
    <View style={styles.container}>
      {/* Red Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/ic_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={{
          swipeEnabled: false,
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarActiveTintColor: theme.colors.white,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.white,
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.primary,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tab.Screen name="Sign In" component={LoginScreen} />
        <Tab.Screen name="Sign Up" component={SignupScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
});
