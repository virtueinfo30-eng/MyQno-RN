import apiClient from './client';
import { ENDPOINTS } from './config';

export const fetchPlacesVisited = async (
  startPage = 1,
  recordsPerPage = 100,
  searchText = '',
) => {
  try {
    // Build URL matching native code logic
    // Default to 'no' if search text is empty, similar to other endpoints
    const searchParam =
      searchText && searchText.trim() !== ''
        ? searchText.trim()
        : '{searchtext}';

    // Construct simplified URL
    const url = `${ENDPOINTS.PLACES_VISITED}/${startPage}/${recordsPerPage}/${searchParam}`;

    console.log('🔗 [places.js] Final URL:', url);

    const response = await apiClient.get(url);
    console.log(
      '📥 [places.js] Raw Response Data:',
      JSON.stringify(response.data, null, 2),
    );

    // Handle both response formats:
    // 1. JSON object: {type: "success", listFavouriteInfo: [...]}
    // 2. Plain array: [] (when session auth fails)
    if (Array.isArray(response.data)) {
      console.warn(
        '⚠️ [places.js] Server returned plain array (Session Issue?):',
        response.data,
      );
      // Server returned plain array (likely empty due to session issue)
      return {
        success: true, // Should this be false if session failed?
        data: response.data,
        message:
          response.data.length === 0
            ? 'No places visited yet (Empty Array)'
            : undefined,
      };
    } else if (
      response.data &&
      response.data.type &&
      response.data.type.toLowerCase() === 'success'
    ) {
      console.log(
        '✅ [places.js] Success Type. Count:',
        response.data.listFavouriteInfo?.length,
      );
      return {
        success: true,
        data: response.data.listFavouriteInfo || [],
      };
    }

    console.warn('⚠️ [places.js] Unexpected Response Format:', response.data);
    return { success: false, data: [], message: response.data?.message };
  } catch (error) {
    console.error('❌ [places.js] Request Failed:', error);
    console.error('❌ [places.js] Error Status:', error.response?.status);
    console.error(
      '❌ [places.js] Error Data:',
      JSON.stringify(error.response?.data, null, 2),
    );

    // Return empty data instead of error
    return {
      success: true,
      data: [],
      message: 'Error fetching places',
    };
  }
};
