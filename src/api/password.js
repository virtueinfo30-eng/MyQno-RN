import apiClient from './client';
import { ENDPOINTS } from './config';

export const changePassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'New password and confirm password do not match',
      };
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
      };
    }

    const params = new URLSearchParams();
    params.append('old_password', oldPassword);
    params.append('new_password', newPassword);
    params.append('confirm_password', confirmPassword);

    const response = await apiClient.post(
      ENDPOINTS.CHANGE_PASSWORD,
      params.toString(),
    );

    if (response.data && response.data.type === 'SUCCESS') {
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to change password',
      };
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred',
    };
  }
};
