import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { changePassword } from '../api';
import { useNavigation } from '@react-navigation/native';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      newErrors.newPassword =
        'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await changePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success',
        result.message || 'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrors({});
              // Navigate back
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      Alert.alert('Error', result.message || 'Failed to change password');
    }
  };

  const PasswordToggle = ({ visible, onToggle }) => (
    <TouchableOpacity onPress={onToggle} style={styles.eyeIcon}>
      <Text style={styles.eyeIconText}>{visible ? '👁️' : '👁️‍🗨️'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Please enter your current password and choose a new password
        </Text>
      </View>

      <View style={styles.form}>
        <CustomInput
          label="Current Password"
          placeholder="Enter current password"
          value={oldPassword}
          onChangeText={text => {
            setOldPassword(text);
            if (errors.oldPassword) {
              setErrors({ ...errors, oldPassword: null });
            }
          }}
          secureTextEntry={!showOldPassword}
          error={errors.oldPassword}
          rightIcon={
            <PasswordToggle
              visible={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
            />
          }
          autoCapitalize="none"
        />

        <CustomInput
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={text => {
            setNewPassword(text);
            if (errors.newPassword) {
              setErrors({ ...errors, newPassword: null });
            }
          }}
          secureTextEntry={!showNewPassword}
          error={errors.newPassword}
          rightIcon={
            <PasswordToggle
              visible={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
            />
          }
          autoCapitalize="none"
        />

        <CustomInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: null });
            }
          }}
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
          rightIcon={
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          autoCapitalize="none"
        />

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirementItem}>
            • At least 6 characters long
          </Text>
          <Text style={styles.requirementItem}>
            • Different from your current password
          </Text>
        </View>

        <CustomButton
          title="Change Password"
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />

        <CustomButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.l,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  eyeIconText: {
    fontSize: 20,
  },
  passwordRequirements: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.l,
  },
  requirementsTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.s,
  },
  requirementItem: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  submitButton: {
    marginBottom: theme.spacing.m,
  },
});
