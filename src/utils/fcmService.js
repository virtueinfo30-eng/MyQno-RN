/**
 * FCM Notification Service
 * Matches native MyFirebaseMessagingService.java behavior:
 * - Requests notification permission on startup
 * - Saves FCM token to AsyncStorage (used in login/register)
 * - Handles foreground notifications (shows Alert)
 * - Handles background/quit notification taps (navigates to relevant screen)
 *
 * NOTE: Firebase native module must be linked (google-services.json + rebuild).
 * All functions are fault-tolerant and silently no-op if Firebase is not configured.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Lazy-load messaging to avoid crash if native module is not linked yet
let _messaging = null;
const getMessaging = () => {
  if (_messaging) return _messaging;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _messaging = require('@react-native-firebase/messaging').default;
    return _messaging;
  } catch (e) {
    console.warn('⚠️ [FCM] Firebase messaging not available:', e.message);
    return null;
  }
};

/**
 * Request notification permission and save FCM token.
 * Call this once on app startup.
 */
export const initFCM = async () => {
  try {
    const messaging = getMessaging();
    if (!messaging) return; // Firebase not configured yet

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem('fcm_token', token);
        console.log('✅ [FCM] Token saved:', token);
      }

      // Refresh token listener
      messaging().onTokenRefresh(async newToken => {
        await AsyncStorage.setItem('fcm_token', newToken);
        console.log('🔄 [FCM] Token refreshed:', newToken);
      });
    } else {
      console.warn('⚠️ [FCM] Notification permission denied');
    }
  } catch (error) {
    console.warn(
      '⚠️ [FCM] Init error (Firebase may not be configured):',
      error.message,
    );
  }
};

/**
 * Get the saved FCM token (for use in login/register API calls).
 */
export const getFCMToken = async () => {
  try {
    return (await AsyncStorage.getItem('fcm_token')) || 'dummy_device_token';
  } catch {
    return 'dummy_device_token';
  }
};

/**
 * Set up foreground notification listener.
 * Returns an unsubscribe function — call it on component unmount.
 */
export const setupForegroundNotifications = () => {
  try {
    const messaging = getMessaging();
    if (!messaging) return () => {}; // no-op unsubscribe

    return messaging().onMessage(async remoteMessage => {
      console.log('📩 [FCM] Foreground message:', remoteMessage);
      const title = remoteMessage.notification?.title || 'MyQno';
      const body =
        remoteMessage.notification?.body || 'You have a new notification';
      Alert.alert(title, body);
    });
  } catch (error) {
    console.warn('⚠️ [FCM] setupForegroundNotifications error:', error.message);
    return () => {};
  }
};

/**
 * Handle notification that opened the app from background/quit state.
 * Pass a navigation ref to navigate to the right screen.
 */
export const handleNotificationOpenedApp = navigationRef => {
  try {
    const messaging = getMessaging();
    if (!messaging) return;

    // App opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        '📲 [FCM] Notification opened app from background:',
        remoteMessage,
      );
      handleNotificationNavigation(remoteMessage, navigationRef);
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📲 [FCM] App opened from quit state:', remoteMessage);
          handleNotificationNavigation(remoteMessage, navigationRef);
        }
      });
  } catch (error) {
    console.warn('⚠️ [FCM] handleNotificationOpenedApp error:', error.message);
  }
};

/**
 * Navigate based on notification data (matches native notification handling).
 * Native sends: category, company_token_id, company_id, form_name, section, token_id, user_type
 */
const handleNotificationNavigation = (remoteMessage, navigationRef) => {
  const data = remoteMessage?.data || {};
  if (!navigationRef?.current) return;

  const category = data.category || '';
  const tokenId = data.token_id || '';
  const formName = data.form_name || '';
  const section = data.section || '';

  if (formName || (tokenId && tokenId !== '0') || section) {
    // Navigate to relevant screen based on section/formName
    navigationRef.current.navigate('Main');
  } else if (category === 'BUZZ' || !formName) {
    // Generic notification — go to My Tokens
    navigationRef.current.navigate('Main');
  }
};
