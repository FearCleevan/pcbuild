import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabNavigator from './src/navigation/TabNavigator';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from './theme';

function AppBootLoading() {
  return (
    <SafeAreaView style={styles.loadingSafeArea}>
      <View style={styles.loadingContainer}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name='cpu-64-bit' size={34} color={COLORS.white} />
        </View>

        <Text style={styles.appName}>Custom PC Build</Text>
        <Text style={styles.loadingSubtitle}>Preparing your build workspace</Text>

        <View style={styles.loadingFooter}>
          <ActivityIndicator size='small' color={COLORS.primaryLight} />
          <Text style={styles.loadingText}>Loading components...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBootLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    NavigationBar.setBackgroundColorAsync(COLORS.surface);
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <View style={styles.appRoot}>
      <StatusBar style='light' backgroundColor={COLORS.background} />
      {isBootLoading ? <AppBootLoading /> : <TabNavigator />}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoBadge: {
    width: 78,
    height: 78,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  appName: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes['3xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    marginBottom: SPACING.xs,
  },
  loadingSubtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.md,
  },
  loadingFooter: {
    position: 'absolute',
    bottom: SPACING['4xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.text.tertiary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
});
