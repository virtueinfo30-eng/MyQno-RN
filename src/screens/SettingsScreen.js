import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const [locationUpdates, setLocationUpdates] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const locationPref = await AsyncStorage.getItem('locationUpdates');
      const notificationPref = await AsyncStorage.getItem('notifications');

      if (locationPref !== null) {
        setLocationUpdates(locationPref === 'true');
      }
      if (notificationPref !== null) {
        setNotifications(notificationPref === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLocationToggle = async value => {
    setLocationUpdates(value);
    await AsyncStorage.setItem('locationUpdates', value.toString());
  };

  const handleNotificationToggle = async value => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications', value.toString());
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all cached data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: () => {
          Alert.alert('Success', 'Cache cleared successfully');
        },
      },
    ]);
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ label, value, onPress, showArrow = false }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingValue}>
        {typeof value === 'string' && (
          <Text style={styles.valueText}>{value}</Text>
        )}
        {typeof value === 'boolean' && <Switch value={value} disabled />}
        {showArrow && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({ label, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ccc', true: theme.colors.primary }}
        thumbColor={value ? theme.colors.white : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Preferences */}
      <SettingSection title="Preferences">
        <SettingToggle
          label="Location Updates"
          value={locationUpdates}
          onValueChange={handleLocationToggle}
        />
        <SettingToggle
          label="Push Notifications"
          value={notifications}
          onValueChange={handleNotificationToggle}
        />
      </SettingSection>

      {/* App Information */}
      <SettingSection title="App Information">
        <SettingRow label="Version" value="1.0.0" />
        <SettingRow label="Build" value="100" />
      </SettingSection>

      {/* Data & Storage */}
      <SettingSection title="Data & Storage">
        <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
          <Text style={styles.settingLabel}>Clear Cache</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </SettingSection>

      {/* About */}
      <SettingSection title="About">
        <SettingRow label="Terms of Service" showArrow />
        <SettingRow label="Privacy Policy" showArrow />
        <SettingRow label="Help & Support" showArrow />
      </SettingSection>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>MyQno - Queue Management System</Text>
        <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  sectionTitle: {
    fontSize: theme.fontSize.small,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.s,
  },
  arrow: {
    fontSize: theme.fontSize.xlarge,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  logoutContainer: {
    padding: theme.spacing.l,
    marginTop: theme.spacing.l,
  },
  logoutButton: {
    backgroundColor: theme.colors.error || '#F44336',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.l,
  },
  footerText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  footerSubtext: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
});
