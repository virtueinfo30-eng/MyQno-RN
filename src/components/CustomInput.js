import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';

export const CustomInput = ({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  onRightIconPress,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textHint}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.s,
  },
  inputError: {
    borderBottomColor: theme.colors.error,
  },
  leftIconContainer: {
    marginRight: theme.spacing.s,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.s,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  errorText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
