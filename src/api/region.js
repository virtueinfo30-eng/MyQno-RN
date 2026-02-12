import apiClient from './client';
import { ENDPOINTS } from './config';

export const getCountries = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COUNTRIES);
    console.log('Countries Response:', response.data);
    if (response.data && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Failed to load countries' };
    }
  } catch (error) {
    console.error('Get Countries Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
};

export const getStates = async countryId => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.STATES}/${countryId}`);
    console.log('States Response:', response.data);
    if (response.data && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Failed to load states' };
    }
  } catch (error) {
    console.error('Get States Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
};

export const getCities = async stateId => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.CITIES}/${stateId}`);
    console.log('Cities Response:', response.data);
    if (response.data && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Failed to load cities' };
    }
  } catch (error) {
    console.error('Get Cities Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
};

// Aliases for consumption in ProfileScreen
export const fetchCountries = getCountries;
export const fetchStates = getStates;
export const fetchCities = getCities;
