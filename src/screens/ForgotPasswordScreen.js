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
import { getCountries } from '../api';
import { forgotPassword } from '../api/auth';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();

  const [countryId, setCountryId] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countries, setCountries] = useState([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [mobile, setMobile] = useState('');
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

  const handleSubmit = async () => {
    if (!countryId) {
      Alert.alert('Error', 'Please select a country');
      return;
    }
    if (!mobile) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(countryId, mobile);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success',
        result.message || 'Password reset instructions sent to your mobile.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } else {
      Alert.alert(
        'Error',
        result.message || 'Failed to reset password. Please try again.',
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered mobile number to receive password reset
        instructions.
      </Text>

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
        value={mobile}
        onChangeText={setMobile}
      />

      <CustomButton
        title="SUBMIT"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      />

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backLink}
      >
        <Text style={styles.backLinkText}>Back to Login</Text>
      </TouchableOpacity>

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
  title: {
    fontSize: theme.fontSize.large || 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.medium || 14,
    color: theme.colors.textSecondary || '#666',
    marginBottom: theme.spacing.l,
    lineHeight: 20,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
  backLink: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  backLinkText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.medium,
    textDecorationLine: 'underline',
  },
});
