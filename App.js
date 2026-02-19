import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  initFCM,
  setupForegroundNotifications,
  handleNotificationOpenedApp,
} from './src/utils/fcmService';

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    // Initialize FCM: request permission + save token
    initFCM();

    // Handle foreground notifications
    const unsubscribeForeground = setupForegroundNotifications();

    // Handle notification taps (background/quit)
    handleNotificationOpenedApp(navigationRef);

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator navigationRef={navigationRef} />
    </SafeAreaProvider>
  );
};

export default App;
