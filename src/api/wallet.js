import apiClient from './client';
import { ENDPOINTS } from './config';

export const fetchWalletBalance = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.WALLET_BALANCE);
    console.log('Wallet Balance Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        balance: response.data.available_balance || '0.00',
        currency: response.data.currency || 'USD',
      };
    }

    return { success: false, balance: '0.00', currency: 'USD' };
  } catch (error) {
    console.error('Fetch Wallet Balance Error:', error);
    return {
      success: false,
      balance: '0.00',
      currency: 'USD',
      message: error.message || 'Failed to fetch balance',
    };
  }
};

export const fetchWalletInvoices = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.WALLET_INVOICES);
    console.log('Wallet Invoices Response:', response.data);

    if (response.data && response.data.found) {
      return {
        success: true,
        data: response.data.listInvoiceInfo || [],
      };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('Fetch Wallet Invoices Error:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch invoices',
    };
  }
};
