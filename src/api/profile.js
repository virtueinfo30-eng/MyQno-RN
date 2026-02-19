import apiClient from './client';
import { ENDPOINTS } from './config';

export const fetchUserProfile = async userId => {
  try {
    const url = `${ENDPOINTS.FETCH_USER_PROFILE}/${userId}`;

    const response = await apiClient.get(url);
    console.log('Fetch Profile Response:', response.data);

    if (response.data && response.data.found) {
      // Extract user data from nested structure
      const userData = response.data.user;
      if (userData) {
        // Get the first user object (it's wrapped in an object with user_id as key)
        const userKey = Object.keys(userData)[0];
        const userInfo = userData[userKey];

        return {
          success: true,
          data: userInfo,
        };
      }
    }

    return { success: false, message: 'Profile not found', data: null };
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch profile',
      data: null,
    };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const url = `${ENDPOINTS.UPDATE_USER_PROFILE}/${userId}`;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('first_name', profileData.first_name || '');
    formData.append('middle_name', profileData.middle_name || '');
    formData.append('last_name', profileData.last_name || '');
    formData.append('mobile_number', profileData.mobile_number || '');
    formData.append('email_id', profileData.email_id || '');
    formData.append('address', profileData.address || '');
    formData.append('country_id', profileData.country_id || '');
    formData.append('state_id', profileData.state_id || '');
    formData.append('city_id', profileData.city_id || '');
    formData.append('gender', profileData.gender || 'M');
    formData.append('birth_date', profileData.birth_date || '');
    formData.append('latitude', profileData.latitude || '0');
    formData.append('longitude', profileData.longitude || '0');
    formData.append('device_token', profileData.device_token || '');
    formData.append('device_type', 'android');

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Update Profile Response:', response.data);

    if (
      response.data &&
      response.data.found &&
      response.data.type === 'success'
    ) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.listLoginInfo,
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to update profile',
      data: null,
    };
  } catch (error) {
    console.error('Update Profile Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update profile',
      data: null,
    };
  }
};

export const updateProfilePicture = async (
  userId,
  imageFile,
  remove = false,
) => {
  try {
    const url = ENDPOINTS.UPDATE_PROFILE_PIC;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('remove', remove ? '1' : '0');

    if (!remove && imageFile) {
      formData.append('fileToUpload', {
        uri: imageFile.uri,
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'profile.jpg',
      });
    }

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Update Profile Picture Response:', response.data);

    if (response.data && response.data.type === 'success') {
      return {
        success: true,
        message: response.data.message,
        profilePic: response.data.profilePic,
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to update profile picture',
    };
  } catch (error) {
    console.error('Update Profile Picture Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update profile picture',
    };
  }
};

export const checkDuplicateMobile = async (
  mobileNo,
  dupeFor = 'U',
  ctryId = '0',
  compId = '0',
  compLocId = '0',
  queId = '0',
) => {
  try {
    const url = `${ENDPOINTS.CHECK_DUPLICATE_MOBILE}/${mobileNo}/${dupeFor}/${ctryId}/${compId}/${compLocId}/${queId}`;

    const response = await apiClient.get(url);
    console.log('Check Duplicate Mobile Response:', response.data);

    return {
      success: response.data.code !== '1',
      isDuplicate: response.data.code === '1',
      message: response.data.message,
      otpRequired: response.data.otp_required === '1',
    };
  } catch (error) {
    console.error('Check Duplicate Mobile Error:', error);
    return {
      success: false,
      isDuplicate: false,
      message: error.message || 'Failed to check mobile number',
      otpRequired: false,
    };
  }
};

export const generateOTP = async (
  mobile,
  otpFor = 'U',
  countryId = '0',
  compId = '0',
  compLocId = '0',
  queId = '0',
) => {
  try {
    const url = `${ENDPOINTS.GENERATE_OTP}/${mobile}/${otpFor}/${countryId}/${compId}/${compLocId}/${queId}`;

    const response = await apiClient.get(url);
    console.log('Generate OTP Response:', response.data);

    if (
      response.data &&
      (response.data.found || response.data.type === 'success')
    ) {
      return {
        success: true,
        message: response.data.message,
        otp: response.data.OTP,
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to generate OTP',
    };
  } catch (error) {
    console.error('Generate OTP Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate OTP',
    };
  }
};

export const confirmOTP = async (
  mobile,
  otpFor = 'U',
  countryId,
  userId,
  otp,
) => {
  try {
    const url = `${ENDPOINTS.CONFIRM_OTP}/${mobile}/${otpFor}/${countryId}/${userId}/${otp}`;

    const response = await apiClient.get(url);
    console.log('Confirm OTP Response:', response.data);

    if (
      response.data &&
      response.data.found &&
      response.data.type === 'success'
    ) {
      return {
        success: true,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Invalid OTP',
    };
  } catch (error) {
    console.error('Confirm OTP Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
};

/**
 * Import device contacts to the server.
 * Matches native: api/user/importcontacts/{imported_by_user_id}
 * contacts: [{mobile_number: "...", full_name: "..."}]
 */
export const importContacts = async (userId, contacts) => {
  try {
    const url = `${ENDPOINTS.IMPORT_CONTACTS}/${userId}`;
    const formData = new FormData();
    formData.append('contacts', JSON.stringify(contacts));

    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Import Contacts Response:', response.data);

    if (
      response.data &&
      (response.data.found || response.data.type === 'success')
    ) {
      return { success: true, message: response.data.message };
    }
    return {
      success: false,
      message: response.data?.message || 'Failed to import contacts',
    };
  } catch (error) {
    console.error('Import Contacts Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to import contacts',
    };
  }
};
