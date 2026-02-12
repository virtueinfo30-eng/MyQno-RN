import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for user_session (the key used in auth.js)
      const userSession = await AsyncStorage.getItem('user_session');

      setTimeout(() => {
        if (userSession) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking auth:', error);
      setTimeout(() => {
        navigation.replace('Auth');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ic_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
