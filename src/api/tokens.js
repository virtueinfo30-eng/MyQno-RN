import apiClient from './client';
import { ENDPOINTS } from './config';

export const fetchMyTokens = async (
  userId,
  tokenId = '-1',
  fromDate = '-1',
  uptoDate = '-1',
) => {
  try {
    // Native uses: api/user/fetchusertokens/{user_id}/{token_id}/{from_date}/{upto_date}
    const url = `${ENDPOINTS.FETCH_MY_TOKENS}/${userId}/${tokenId}/${fromDate}/${uptoDate}`;
    console.log('Fetch Tokens URL:', url);
    const response = await apiClient.get(url);

    console.log('Fetch Tokens Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        data: response.data.listMyTokenInfo || [],
        showRDFlag: response.data.showRDFlag,
        showADFlag: response.data.showADFlag,
      };
    } else {
      return { success: false, message: 'No tokens found', data: [] };
    }
  } catch (error) {
    console.error('Fetch Tokens Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch tokens',
      data: [],
    };
  }
};

export const cancelToken = async tokenId => {
  try {
    const url = `api/user/canceltoken/${tokenId}/C`;

    const response = await apiClient.get(url);
    console.log('Cancel Token Response:', response.data);

    if (
      response.data &&
      response.data.found &&
      response.data.type === 'success'
    ) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to cancel token',
      };
    }
  } catch (error) {
    console.error('Cancel Token Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel token',
    };
  }
};
