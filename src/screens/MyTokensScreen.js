import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { theme } from '../theme';
import { MyTokensTab } from '../components/MyTokensTab';
import { SharedTokensTab } from '../components/SharedTokensTab';

export const MyTokensScreen = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'myTokens', title: 'My Tokens' },
    { key: 'sharedTokens', title: 'Shared Tokens' },
  ]);

  const renderScene = SceneMap({
    myTokens: MyTokensTab,
    sharedTokens: SharedTokensTab,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={theme.colors.white}
      inactiveColor="rgba(255, 255, 255, 0.6)"
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
    />
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: theme.colors.white,
    height: 3,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: theme.fontSize.medium,
    textTransform: 'none',
  },
});
