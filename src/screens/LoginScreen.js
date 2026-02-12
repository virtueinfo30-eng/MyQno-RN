import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { CustomInput, CustomButton, SelectionModal } from '../components';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { loginUser, getCountries } from '../api';
import Icon from '@react-native-vector-icons/fontawesome';

export const LoginScreen = () => {
  const navigation = useNavigation();

  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countries, setCountries] = useState([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    const result = await getCountries();
    console.log('Countries Result:', result);
    if (result.success) {
      setCountries(result.data);
      // Optional: Set default country if needed
    } else {
      console.log('Failed to load countries');
    }
  };

  const handleLogin = async () => {
    if (!countryId) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    // Hardcoded location as requested
    const latitude = '21.1702';
    const longitude = '72.8311';
    const result = await loginUser(
      countryId,
      username,
      password,
      latitude,
      longitude,
    );
    setLoading(false);
    console.log('Login Result:', result);
    if (result.success) {
      navigation.replace('Main');
    } else {
      console.log('Login Failed:', result);
      Alert.alert('Login Failed', result.message);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => setShowCountryModal(true)}>
        <View pointerEvents="none">
          <CustomInput
            label="Country"
            placeholder="Select Country"
            value={countryName}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <CustomInput
        label="Mobile Number"
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        value={username}
        onChangeText={setUsername}
      />
      <CustomInput
        label="Password"
        placeholder="Enter Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        rightIcon={
          <Icon
            name={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            color="gray"
          />
        }
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <Text style={styles.forgotPassword} onPress={handleForgotPassword}>
        Forgot Password?
      </Text>

      <CustomButton
        title="LOGIN"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      />

      <SelectionModal
        visible={showCountryModal}
        title="Select Country"
        data={countries}
        onClose={() => setShowCountryModal(false)}
        onSelect={item => {
          setCountryId(item.country_id);
          setCountryName(item.country_name);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.white,
    flexGrow: 1,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
  forgotPassword: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.l,
    fontSize: theme.fontSize.medium,
    textDecorationLine: 'underline',
  },
});
