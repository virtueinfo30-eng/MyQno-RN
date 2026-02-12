export const API_CONFIG = {
  BASE_URL: 'https://myqno.com/qapp/', // Matching native URL_PRODUCTION
  HEADERS: {
    AUTHORIZATION: 'Basic YW5kcm9pZF92aV82MDU6MUAzJCVWST09',
    HTTP_APP_NAME: 'android',
    HTTP_APP_TYPE_USER: 'user',
    HTTP_APP_TYPE_VENDOR: 'vendor',
  },
  TIMEOUT: 60000,
};

export const ENDPOINTS = {
  LOGIN: 'api/login/loginuser',
  COUNTRIES: 'api/region/listcountries',
  STATES: 'api/region/liststates',
  CITIES: 'api/region/listcities',
  COMPANY_CATEGORIES: 'api/company/listcompanycategories/no',
  REGISTER_COMPANY: 'api/register/registercompany',
  REGISTER_USER: 'api/user/userregister',
  SEARCH_COMPANIES: 'api/region/showactivecompanies',
  FETCH_MY_TOKENS: 'api/user/fetchusertokens',
  FETCH_USER_PROFILE: 'api/user/fetchuser',
  UPDATE_USER_PROFILE: 'api/user/update',
  UPDATE_PROFILE_PIC: 'api/user/uploaduserpic',
  CHECK_DUPLICATE_MOBILE: 'api/comcode/ismobilenoduplicate',
  GENERATE_OTP: 'api/comcode/generateotpformobile',
  CONFIRM_OTP: 'api/comcode/otpconfirmed',
  WALLET_BALANCE: 'api/wallet/availablebalance',
  WALLET_INVOICES: 'api/wallet/fetchuserinvoice/0',
  PLACES_VISITED: 'api/company/alreadyvisited',
  SHOW_ACTIVE_QUEUES: 'api/region/showcompanyqueues',
  QUEUE_ME_IN: 'api/user/usequeuein',
  FETCH_SHARED_TOKENS: 'api/user/fetchsharedtokens',
  CANCEL_SHARED_TOKEN: 'api/user/cancelsharedtoken',
  FEEDBACK_USER: 'api/user/addfeedback',
  SHARE_USER_TOKEN: 'api/user/setsharedtoken',
  CHANGE_PASSWORD: 'api/user/changepassword',
};
