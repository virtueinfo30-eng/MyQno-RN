import axios from 'axios';
import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal config to match CURL exactly
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  // withCredentials: true, // Disabled manual cookie handling for now
  headers: {
    Authorization: API_CONFIG.HEADERS.AUTHORIZATION,
    'Http-App-Name': 'android', // Hardcoded lower case to match CURL
    'Content-Type': 'application/x-www-form-urlencoded', // Essential for some endpoints
  },
});

apiClient.interceptors.request.use(
  async config => {
    try {
      console.log('🚀 [client.js] Intercepting Request...');
      const userSession = await AsyncStorage.getItem('user_session');

      if (userSession) {
        const session = JSON.parse(userSession);
        console.log('📝 [client.js] Using Session Data:', session);

        // Dynamic headers from session matching native BaseActivity.java
        const safeHeader = value => (value ? String(value) : '');

        config.headers['Logged-User-Id'] = safeHeader(session.logged_user_id);
        config.headers['Logged-User-Type'] = safeHeader(
          session.logged_user_type,
        );
        config.headers['Logged-User-Level'] = safeHeader(
          session.logged_user_level,
        );
        config.headers['Logged-Company-Id'] = safeHeader(
          session.logged_company_id,
        );
        config.headers['Logged-Location-Id'] = safeHeader(
          session.logged_company_locations_id,
        ); // Note: mapping location_id
        config.headers['Logged-Queue-Id'] = safeHeader(
          session.logged_queue_master_id,
        ); // Note: mapping queue_id
        config.headers['Logged-User-Group'] = safeHeader(
          session.logged_user_group,
        );
        config.headers['Logged-Mobile'] = safeHeader(session.logged_mobile);

        // Use user_master_id if available, fallback to logged_user_id
        const masterId = session.user_master_id || session.logged_user_id;
        config.headers['User-Master-Id'] = safeHeader(masterId);

        // App Type
        config.headers['Http-App-Type'] = 'user'; // Hardcoded 'user' for now, matching config

        // Native app does NOT send Device-Token in headers, so we remove it.

        // Cookie handling
        const storedCookie = await AsyncStorage.getItem('user_cookie');
        if (storedCookie) {
          config.headers.Cookie = storedCookie;
          console.log('🍪 [client.js] Using Stored Cookie');
        } else {
          console.warn('⚠️ [client.js] No stored cookie found!');
        }

        console.log(
          '📦 [client.js] Final Headers (Session Active):',
          config.headers,
        );
      } else {
        console.log('⚠️ [client.js] No Session - Skipping Session Headers');
      }

      console.log(
        '🚀 [client.js] Request Headers:',
        JSON.stringify(config.headers, null, 2),
      );
      console.log('🔗 [client.js] Request URL:', config.baseURL + config.url);
      console.log('🔗 [client.js] Request Method:', config.method);
      console.log('📤 [client.js] Request Data:', config.data);

      // Parse and log URLSearchParams if it's a string
      if (typeof config.data === 'string' && config.data.includes('=')) {
        const params = new URLSearchParams(config.data);
        const paramsObj = {};
        for (const [key, value] of params.entries()) {
          paramsObj[key] = value;
        }
        console.log(
          '📋 [client.js] Parsed Request Params:',
          JSON.stringify(paramsObj, null, 2),
        );
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    console.log('✅ [client.js] Response Status:', response.status);
    console.log(
      '✅ [client.js] Response Data:',
      JSON.stringify(response.data, null, 2),
    );
    return response;
  },
  error => {
    console.error('❌ [client.js] Response Error:', error.response?.status);
    console.error(
      '❌ [client.js] Error Data:',
      JSON.stringify(error.response?.data, null, 2),
    );
    return Promise.reject(error);
  },
);

export default apiClient;
