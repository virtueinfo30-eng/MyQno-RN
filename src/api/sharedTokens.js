import apiClient from './client';
import { ENDPOINTS } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchSharedTokens = async () => {
  try {
    const userSession = await AsyncStorage.getItem('user_session');
    if (!userSession) {
      return { success: false, data: [], message: 'User not logged in' };
    }

    const userData = JSON.parse(userSession);
    console.log('Shared tokens - User session data:', userData);

    const params = new URLSearchParams();
    params.append('user_id', userData.logged_user_id); // Native sends logged_user_id as user_id

    console.log('Shared tokens - Sending params:', params.toString());

    const response = await apiClient.post(
      ENDPOINTS.FETCH_SHARED_TOKENS,
      params.toString(),
    );
    console.log('Fetch Shared Tokens Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        data: response.data.listSharedTokenInfo || [],
      };
    }

    return { success: false, data: [], message: response.data?.message };
  } catch (error) {
    console.error('Fetch Shared Tokens Error:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch shared tokens',
    };
  }
};

export const cancelSharedToken = async userTokenSharedId => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    // Replace placeholders in URL
    let url = ENDPOINTS.CANCEL_SHARED_TOKEN;
    // Note: The endpoint in config might need adjustment if it has placeholders,
    // or we append params if it's a GET request with query params?
    // Native code: URLs.CancelSharedToken.replace("{user_id}", ...).replace("{user_token_shared_id}", ...)
    // Let's assume the config endpoint has placeholders: api/user/cancelsharedtoken/{user_id}/{user_token_shared_id}

    // Check if config endpoint has placeholders, if not we might need to adjust config or this logic.
    // Based on previous step, I defined it as 'api/user/cancelsharedtoken' which might be wrong if it needs placeholders.
    // Native code uses: api/user/cancelsharedtoken/{user_id}/{user_token_shared_id}
    // Let's double check config I wrote.
    // I wrote: CANCEL_SHARED_TOKEN: 'api/user/cancelsharedtoken',
    // I should probably fix the config to include placeholders or handle it here.

    // Let's assume I fix the config in next step or use string manipulation here.
    // Correct URL construction:
    const finalUrl = `api/user/cancelsharedtoken/${userId}/${userTokenSharedId}`;

    const response = await apiClient.get(finalUrl);
    console.log('Cancel Shared Token Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        message: response.data.message || 'Shared token cancelled successfully',
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to cancel shared token',
    };
  } catch (error) {
    console.error('Cancel Shared Token Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel shared token',
    };
  }
};
