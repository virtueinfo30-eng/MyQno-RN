import apiClient from './client';
import { ENDPOINTS } from './config';

export const getCompanyCategories = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COMPANY_CATEGORIES);
    if (
      response.data &&
      response.data.found &&
      Array.isArray(response.data.categories)
    ) {
      return { success: true, data: response.data.categories };
    } else {
      return { success: false, message: 'Failed to load categories' };
    }
  } catch (error) {
    console.error('Get Company Categories Error:', error);
    return {
      success: false,
      message: error.message || 'Network request failed',
    };
  }
};
