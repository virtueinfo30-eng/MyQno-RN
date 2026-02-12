import apiClient from './client';
import { ENDPOINTS } from './config';

export const addFeedback = async (companyId, rating, comment, userTokenId) => {
  try {
    const formData = new FormData();
    formData.append('company_id', companyId);
    formData.append('rating', rating.toString());
    formData.append('comment', comment);
    formData.append('user_token_id', userTokenId);

    const response = await apiClient.post(ENDPOINTS.FEEDBACK_USER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.type === 'success') {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to submit feedback',
      };
    }
  } catch (error) {
    console.error('Add Feedback Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred',
    };
  }
};

// fetchUserProfile removed as it is exported from ./profile.js

export const shareUserToken = async (userId, userTokenId, contacts) => {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('user_token_id', userTokenId);

    // Format: "YYYY-MM-DD HH:mm:ss" - using current time
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').slice(0, 19);
    formData.append('shared_datetime', formattedDate);

    // contacts should be an array of { mobile: "...", fullname: "..." }
    formData.append('share_to', JSON.stringify(contacts));

    const response = await apiClient.post(
      ENDPOINTS.SHARE_USER_TOKEN,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (response.data && response.data.type === 'success') {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to share token',
      };
    }
  } catch (error) {
    console.error('Share User Token Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred',
    };
  }
};

export const registerUser = async ({
  firstName,
  lastName,
  mobile,
  email,
  countryId,
  latitude = 0.0,
  longitude = 0.0,
}) => {
  try {
    const params = new URLSearchParams();
    params.append('first_name', firstName);
    params.append('last_name', lastName);
    params.append('mobile_number', mobile);
    params.append('email_id', email);
    params.append('cmb_country', countryId);
    params.append('latitude', latitude);
    params.append('longitude', longitude);
    params.append('device_token', 'dummy_device_token'); // TODO: Replace with actual FCM token if needed
    params.append('device_type', 'android');

    const response = await apiClient.post(
      ENDPOINTS.REGISTER_USER,
      params.toString(),
    );

    if (
      response.data &&
      response.data.found &&
      response.data.type === 'success'
    ) {
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
    console.error('Register User Error:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Network request failed',
    };
  }
};
