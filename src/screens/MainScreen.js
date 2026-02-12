import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MainScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Auth');
  };

  const MenuItem = ({ title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyQno</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Welcome to MyQno!</Text>

        <View style={styles.menuContainer}>
          <MenuItem title="Search" onPress={() => {}} />
          <MenuItem title="My Tokens" onPress={() => {}} />
          <MenuItem title="My Wallet" onPress={() => {}} />
          <MenuItem title="Places Visited" onPress={() => {}} />
          <MenuItem title="Profile" onPress={() => {}} />
          <MenuItem title="Settings" onPress={() => {}} />
          <MenuItem title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.l,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  content: {
    padding: theme.spacing.l,
  },
  welcomeText: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  menuContainer: {
    gap: theme.spacing.m,
  },
  menuItem: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
});
