import apiClient from './client';
import { ENDPOINTS, API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (
  countryId,
  username,
  password,
  latitude,
  longitude,
) => {
  try {
    const params = new URLSearchParams();
    params.append('country_id', countryId);
    params.append('username', username);
    params.append('password', password);
    params.append('app_type', API_CONFIG.HEADERS.HTTP_APP_TYPE_USER);
    params.append('device_type', 'android');
    params.append('device_token', 'TODO_GET_FCM_TOKEN');
    params.append('latitude', latitude);
    params.append('longitude', longitude);

    const response = await apiClient.post(ENDPOINTS.LOGIN, params.toString());
    console.log('🚀 [auth.js] Login Response Status:', response.status);
    console.log(
      '🚀 [auth.js] Login Response Headers Keys:',
      Object.keys(response.headers),
    );
    console.log(
      '🚀 [auth.js] Login Response Headers:',
      JSON.stringify(response.headers, null, 2),
    );

    // Axios lowercases headers, so 'set-cookie' should be the key
    const setCookieHeader =
      response.headers['set-cookie'] || response.headers['Set-Cookie'];
    console.log('🍪 [auth.js] Raw Set-Cookie Header:', setCookieHeader);
    // Check for nested structure first (as per user JSON)
    let sessionData = null;
    let success = false;
    let message = 'Login Failed.';

    // Debug the structure
    console.log('🔍 [auth.js] Checking Response Structure...');
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('✅ [auth.js] Detected Nested Structure (data.data.data)');
      // Check success type in the middle layer
      if (response.data.type === 'SUCCESS') {
        sessionData = response.data.data[0];
        // Merge profile details from second element if available
        if (response.data.data.length > 1) {
          const profileDetails = response.data.data[1];
          console.log('✨ [auth.js] Merging Profile Details into Session');
          sessionData = { ...sessionData, ...profileDetails };
        }
        success = true;
      } else {
        message = response.data.message || message;
      }
    } else if (
      response.data?.type === 'SUCCESS' &&
      Array.isArray(response.data.data)
    ) {
      console.log('✅ [auth.js] Detected Flat Structure (data.data)');
      sessionData = response.data.data[0];
      // Merge profile details from second element if available
      if (response.data.data.length > 1) {
        const profileDetails = response.data.data[1];
        console.log('✨ [auth.js] Merging Profile Details into Session');
        sessionData = { ...sessionData, ...profileDetails };
      }
      success = true;
    } else {
      console.log('❌ [auth.js] Unknown Structure');
      if (response.data && response.data.message) {
        message = response.data.message;
      }
    }

    if (success && sessionData) {
      // Save user session - but override user type/level like native app does
      sessionData.logged_user_type = 'U';
      sessionData.logged_user_level = '99';
      sessionData.logged_user_group = 'U';

      // Manually save cookie
      if (setCookieHeader) {
        let cookieString = '';
        if (Array.isArray(setCookieHeader)) {
          cookieString = setCookieHeader.join('; ');
        } else {
          cookieString = String(setCookieHeader);
        }
        await AsyncStorage.setItem('user_cookie', cookieString);
        console.log('✅ [auth.js] Saved Cookie to AsyncStorage:', cookieString);
      } else {
        console.warn(
          '⚠️ [auth.js] No Set-Cookie header found in login response!',
        );
      }

      // Save device token if available
      if (sessionData.device_token) {
        await AsyncStorage.setItem('deviceToken', sessionData.device_token);
        console.log(
          '✅ [auth.js] Saved Device Token:',
          sessionData.device_token,
        );
      } else {
        console.log('⚠️ [auth.js] No device_token in session data');
      }

      // Ensure logged_user_id is set (sometimes it comes as user_id)
      if (!sessionData.logged_user_id && sessionData.user_id) {
        sessionData.logged_user_id = sessionData.user_id;
      }
      if (!sessionData.user_master_id && sessionData.user_id) {
        sessionData.user_master_id = sessionData.user_id;
      }

      await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));
      return { success: true, data: response.data };
    } else {
      console.log('Login Failed:', response);
      return {
        success: false,
        message: message,
      };
    }
  } catch (error) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
};
