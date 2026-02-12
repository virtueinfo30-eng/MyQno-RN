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
import { getCountries, registerUser } from '../api';

export const SignupScreen = () => {
  const navigation = useNavigation();

  // User Section
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userCountryId, setUserCountryId] = useState('');
  const [userCountryName, setUserCountryName] = useState('');

  // Data Lists
  const [countries, setCountries] = useState([]);

  // Modal States
  const [showUserCountryModal, setShowUserCountryModal] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    const result = await getCountries();
    if (result.success) {
      setCountries(result.data);
    }
  };

  const handleSignup = async () => {
    // Basic validation
    if (
      !userMobile ||
      !userEmail ||
      !userFirstName ||
      !userLastName ||
      !userCountryId
    ) {
      Alert.alert('Error', 'Please fill all details');
      return;
    }

    setLoading(true);

    const result = await registerUser({
      firstName: userFirstName,
      lastName: userLastName,
      mobile: userMobile,
      email: userEmail,
      countryId: userCountryId,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', result.message, [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>User Registration</Text>

      <CustomInput
        label="First Name"
        placeholder="Enter First Name"
        value={userFirstName}
        onChangeText={setUserFirstName}
      />

      <CustomInput
        label="Last Name"
        placeholder="Enter Last Name"
        value={userLastName}
        onChangeText={setUserLastName}
      />

      <CustomInput
        label="Mobile Number"
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        value={userMobile}
        onChangeText={setUserMobile}
      />

      <CustomInput
        label="Email"
        placeholder="Enter Email"
        keyboardType="email-address"
        value={userEmail}
        onChangeText={setUserEmail}
      />

      <TouchableOpacity onPress={() => setShowUserCountryModal(true)}>
        <View pointerEvents="none">
          <CustomInput
            label="Country"
            placeholder="Select Country"
            value={userCountryName}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <CustomButton
        title="SIGN UP"
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
      />

      {/* Modals */}
      <SelectionModal
        visible={showUserCountryModal}
        title="Select Country"
        data={countries}
        onClose={() => setShowUserCountryModal(false)}
        onSelect={item => {
          setUserCountryId(item.country_id);
          setUserCountryName(item.country_name);
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
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});
