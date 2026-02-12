import apiClient from './client';
import { ENDPOINTS } from './config';

export const searchCompanies = async searchParams => {
  try {
    const {
      category,
      latitude,
      longitude,
      searchText = '',
      distance = '25',
      date,
      persons = '1',
    } = searchParams;

    const params = new URLSearchParams();
    params.append('category', category || '0');
    params.append('latitude', latitude || '0');
    params.append('longitude', longitude || '0');
    params.append('search_text', searchText);
    params.append('user_distance', distance);
    params.append('qdate', date);
    params.append('persons', persons);

    const response = await apiClient.post(
      ENDPOINTS.SEARCH_COMPANIES,
      params.toString(),
    );
    console.log('Search Response:', response.data);

    if (response.data && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'No results found' };
    }
  } catch (error) {
    console.error('Search Error:', error);
    return {
      success: false,
      message: error.message || 'Search failed',
    };
  }
};
