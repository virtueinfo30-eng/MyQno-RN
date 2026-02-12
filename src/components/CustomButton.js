import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';

export const CustomButton = ({
  title,
  loading,
  variant = 'primary',
  style,
  disabled,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.textHint;
    if (variant === 'primary') return theme.colors.primary;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return theme.colors.white;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.textPrimary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    fontSize: theme.fontSize.large,
    fontWeight: '600',
  },
});
