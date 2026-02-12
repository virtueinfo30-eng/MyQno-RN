import apiClient from './client';
import { ENDPOINTS } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerCompany = async formData => {
  try {
    // Convert to form data format
    const params = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      params.append(key, formData[key]);
    });

    const response = await apiClient.post(
      ENDPOINTS.REGISTER_COMPANY,
      params.toString(),
    );
    console.log('Register Response:', response.data);

    if (response.data && response.data.status === 'success') {
      // Store session data similar to login
      if (response.data.user_id) {
        await AsyncStorage.setItem('user_id', response.data.user_id.toString());
      }
      if (response.data.company_id) {
        await AsyncStorage.setItem(
          'company_id',
          response.data.company_id.toString(),
        );
      }

      return {
        success: true,
        message: response.data.message || 'Registration successful',
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('Register Error:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Network request failed',
    };
  }
};
