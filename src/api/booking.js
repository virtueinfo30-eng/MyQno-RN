import apiClient from './client';
import { ENDPOINTS } from './config';

export const fetchActiveQueues = async (companyLocationId, date, lat, long) => {
  try {
    // Validate required parameters to prevent 500 error
    if (!companyLocationId) {
      console.warn('Fetch Queues Aborted: Missing companyLocationId');
      return {
        success: false,
        message: 'Invalid Company Location ID',
      };
    }

    // Ensure properly formatted parameters
    const params = new URLSearchParams();
    params.append('company_locations_id', companyLocationId);
    params.append('qdate', date);
    params.append('latitude', lat || '0');
    params.append('longitude', long || '0');

    const response = await apiClient.post(
      ENDPOINTS.SHOW_ACTIVE_QUEUES,
      params.toString(),
    );

    if (response.data && response.data.found) {
      return {
        success: true,
        data: response.data.listActiveQueueInfo || [],
        companyInfo: response.data.searchQueueInfo,
      };
    }

    return { success: false, data: [], message: response.data?.message };
  } catch (error) {
    console.error('Fetch Active Queues Error:', error);

    let errorMessage = 'Failed to fetch queues';
    if (error.response && error.response.status === 500) {
      console.error(
        'Server Error details:',
        JSON.stringify(error.response.data, null, 2),
      );
      errorMessage =
        'Server Error: The queue system is temporarily unavailable for this location.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
};

export const queueMeIn = async (queueMasterId, date, persons) => {
  try {
    const params = new URLSearchParams();
    params.append('queue_master_id', queueMasterId);
    params.append('queue_date', date);
    params.append('persons', persons);

    const response = await apiClient.post(
      ENDPOINTS.QUEUE_ME_IN,
      params.toString(),
    );
    console.log('Queue Me In Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        message: response.data.message || 'Token booked successfully',
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to book token',
    };
  } catch (error) {
    console.error('Queue Me In Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to book token',
    };
  }
};
