import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SearchScreen } from '../screens/SearchScreen';
import { MyTokensScreen } from '../screens/MyTokensScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { PlacesVisitedScreen } from '../screens/PlacesVisitedScreen';
import { SharedTokensScreen } from '../screens/SharedTokensScreen';
import { ReferScreen } from '../screens/ReferScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

// Custom Drawer Content
const CustomDrawerContent = props => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_session');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUserInfo(userData);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Auth');
  };

  const MenuItem = ({ icon, label, onPress, isActive }) => (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text
        style={[styles.menuItemText, isActive && styles.menuItemTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.profileInfo}
          onPress={() => {
            console.log('Navigating to Profile (Edit Mode)');
            props.navigation.navigate('Profile');
          }}
        >
          <View style={styles.profileImageContainer}>
            {userInfo?.user_pic ? (
              <Image
                source={{ uri: userInfo.user_pic }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {userInfo?.user_full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>
              {userInfo?.user_full_name || 'User'}
            </Text>
            <Text style={styles.profilePhone}>
              {userInfo?.user_mobile || ''}
            </Text>
            <Text style={styles.profileRole}>User</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.qrCodeButton}
          onPress={() => props.navigation.navigate('ScanQRCode')}
        >
          <Text style={styles.qrCodeIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* User Account Section */}
      <SectionHeader title="User Account" />
      <MenuItem
        icon="🏠"
        label="Take Token"
        onPress={() => props.navigation.navigate('Search')}
        isActive={props.state.index === 0}
      />
      <MenuItem
        icon="📷"
        label="Scan QR Code"
        onPress={() => props.navigation.navigate('ScanQRCode')}
        isActive={false}
      />
      <MenuItem
        icon="💰"
        label="My Tokens"
        onPress={() => props.navigation.navigate('MyTokens')}
        isActive={props.state.index === 1}
      />
      <MenuItem
        icon="❤️"
        label="Places Visited"
        onPress={() => props.navigation.navigate('PlacesVisited')}
        isActive={props.state.index === 4}
      />
      <MenuItem
        icon="📢"
        label="Refer"
        onPress={() => props.navigation.navigate('Refer')}
        isActive={false}
      />
      <MenuItem
        icon="📄"
        label="Invoices"
        onPress={() => props.navigation.navigate('Wallet')}
        isActive={props.state.index === 3}
      />

      {/* General Section */}
      <SectionHeader title="General" />
      <MenuItem
        icon="🔑"
        label="Change Password"
        onPress={() => props.navigation.navigate('ChangePassword')}
        isActive={false}
      />
      <MenuItem
        icon="⚙️"
        label="Settings"
        onPress={() => props.navigation.navigate('Settings')}
        isActive={props.state.index === 5}
      />
      <MenuItem icon="🚪" label="Logout" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
};

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#2c2c2c',
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Search"
        component={SearchScreen}
        options={({ navigation }) => ({
          title: 'Search',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerQRButton}
              onPress={() => navigation.navigate('ScanQRCode')}
            >
              <Text style={styles.headerQRIcon}>📷</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="MyTokens"
        component={MyTokensScreen}
        options={{ title: 'My Tokens' }}
      />
      <Drawer.Screen
        name="SharedTokens"
        component={SharedTokensScreen}
        options={{ title: 'Shared Tokens' }}
      />
      <Drawer.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'My Wallet' }}
      />
      <Drawer.Screen
        name="PlacesVisited"
        component={PlacesVisitedScreen}
        options={{ title: 'Places Visited' }}
      />
      <Drawer.Screen
        name="Refer"
        component={ReferScreen}
        options={{ title: 'Refer Friends' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Drawer.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#3a3a3a',
    padding: theme.spacing.l,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  profileImageContainer: {
    marginRight: theme.spacing.m,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  profileTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: theme.fontSize.small,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: theme.fontSize.small,
    color: theme.colors.white,
    opacity: 0.8,
  },
  qrCodeButton: {
    padding: theme.spacing.s,
  },
  qrCodeIcon: {
    fontSize: 24,
  },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.l,
  },
  sectionHeaderText: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: '#999',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: theme.colors.primary,
    borderLeftColor: theme.colors.white,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing.m,
    width: 24,
  },
  menuItemText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.white,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  headerQRButton: {
    marginRight: theme.spacing.m,
    padding: theme.spacing.s,
  },
  headerQRIcon: {
    fontSize: 24,
    color: theme.colors.white,
  },
});
