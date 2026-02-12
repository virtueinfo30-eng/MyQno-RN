import apiClient from './client';

export const referFriends = async contacts => {
  try {
    const referToData = contacts.map(contact => ({
      mobile: contact.phone || contact.phoneNumbers?.[0]?.number || '',
      full_name: contact.displayName || contact.givenName || '',
      status: '',
    }));

    const params = new URLSearchParams();
    params.append('refer_to', JSON.stringify(referToData));

    const response = await apiClient.post(
      'api/user/refer/0',
      params.toString(),
    );
    console.log('Refer Friends Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        message: response.data.message || 'Referrals sent successfully',
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to send referrals',
    };
  } catch (error) {
    console.error('Refer Friends Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send referrals',
    };
  }
};
