import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { preBuiltSeriesList } from '../../data/mockData';
import {
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../../theme';

type PendingRoute =
  | 'Search'
  | 'Cart'
  | 'StartBuild'
  | 'ExploreComponents'
  | 'PrebuildGaming'
  | 'PrebuildWorkstation'
  | 'PrebuildIndustrial';

type PrebuildCard = {
  title: string;
  subtitle: string;
  routeKey: PendingRoute;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type ArrivalItem = {
  title: string;
  detail: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export default function HomeScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const prebuildCards = useMemo<PrebuildCard[]>(
    () => {
      const iconMap: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
        gaming: 'controller-classic-outline',
        workstation: 'monitor-dashboard',
        industrial: 'factory',
      };

      const routeMap: Record<string, PendingRoute> = {
        gaming: 'PrebuildGaming',
        workstation: 'PrebuildWorkstation',
        industrial: 'PrebuildIndustrial',
      };

      return preBuiltSeriesList.map((series) => ({
        title: series.name,
        subtitle: series.subtitle,
        routeKey: routeMap[series.slug] ?? 'PrebuildGaming',
        icon: iconMap[series.slug] ?? 'desktop-classic',
      }));
    },
    []
  );

  const arrivals = useMemo<ArrivalItem[]>(
    () => [
      {
        title: 'Graphics Cards',
        detail: 'RTX and Radeon stock refresh available now.',
        icon: 'expansion-card-variant',
      },
      {
        title: 'CPUs',
        detail: 'Latest multi-core chips for gaming and productivity.',
        icon: 'cpu-64-bit',
      },
      {
        title: 'Motherboards',
        detail: 'New ATX and mATX boards with DDR5 support.',
        icon: 'memory',
      },
      {
        title: 'Power Supplies',
        detail: '80+ Gold and Platinum units from trusted brands.',
        icon: 'power-plug-outline',
      },
    ],
    []
  );

  const onPendingNavigate = (route: PendingRoute) => {
    Alert.alert('Route Placeholder', `${route} is prepared and ready to wire once you add the target screen.`);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setShowSkeleton(true);

    setTimeout(() => {
      setShowSkeleton(false);
      setIsRefreshing(false);
    }, 1400);
  };

  useEffect(() => {
    if (!showSkeleton || isRefreshing) {
      return;
    }

    // Simulates first-open content load for the home screen.
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isRefreshing, showSkeleton]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primaryLight]}
            progressBackgroundColor={COLORS.surface}
          />
        }
      >
        {showSkeleton ? (
          <HomeSkeleton />
        ) : (
          <>
            <View style={styles.topBar}>
              <View style={styles.brandWrapper}>
                <View style={styles.logoBadge}>
                  <MaterialCommunityIcons name='cpu-64-bit' size={20} color={COLORS.text.primary} />
                </View>
                <View>
                  <Text style={styles.brandLabel}>Custom PC Build</Text>
                  <Text style={styles.brandSubLabel}>Build. Compare. Upgrade.</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => onPendingNavigate('Search')}
                >
                  <MaterialCommunityIcons name='magnify' size={20} color={COLORS.text.primary} />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => onPendingNavigate('Cart')}
                >
                  <MaterialCommunityIcons name='cart-outline' size={20} color={COLORS.text.primary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.heroBanner}>
              <Text style={styles.heroBadge}>PROMOTIONAL BANNER</Text>
              <Text style={styles.heroTitle}>Assemble your next performance rig with confidence.</Text>
              <Text style={styles.heroSubtitle}>
                Get curated components, compatibility hints, and optimized pre-build options.
              </Text>
            </View>

            <View style={styles.ctaRow}>
              <Pressable
                style={[styles.ctaButton, styles.ctaPrimary]}
                onPress={() => onPendingNavigate('StartBuild')}
              >
                <Text style={styles.ctaPrimaryText}>Start to Build</Text>
              </Pressable>

              <Pressable
                style={[styles.ctaButton, styles.ctaSecondary]}
                onPress={() => onPendingNavigate('ExploreComponents')}
              >
                <Text style={styles.ctaSecondaryText}>Explore Components</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrival Components</Text>
              <Text style={styles.sectionCaption}>Graphics Cards, CPU, Motherboard, and more</Text>
            </View>

            <View style={styles.arrivalsGrid}>
              {arrivals.map((item) => (
                <View key={item.title} style={styles.arrivalCard}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={COLORS.primaryLight} />
                  <Text style={styles.arrivalTitle}>{item.title}</Text>
                  <Text style={styles.arrivalText}>{item.detail}</Text>
                </View>
              ))}
            </View>

            <View style={styles.promoStrip}>
              <Text style={styles.promoTitle}>Limited Promo</Text>
              <Text style={styles.promoText}>
                Bundle selected GPU + PSU combinations and unlock exclusive pricing this week.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pre-Build PCs</Text>
              <Text style={styles.sectionCaption}>Choose a base profile and customize it later</Text>
            </View>

            <View style={styles.prebuildList}>
              {prebuildCards.map((card) => (
                <Pressable
                  key={card.title}
                  style={styles.prebuildCard}
                  onPress={() => onPendingNavigate(card.routeKey)}
                >
                  <View style={styles.prebuildLeft}>
                    <View style={styles.prebuildIconBadge}>
                      <MaterialCommunityIcons name={card.icon} size={18} color={COLORS.primaryLight} />
                    </View>
                    <View style={styles.prebuildTextWrap}>
                      <Text style={styles.prebuildTitle}>{card.title}</Text>
                      <Text style={styles.prebuildSubtitle}>{card.subtitle}</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name='chevron-right' size={20} color={COLORS.text.tertiary} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
        <View style={[styles.skeletonCircle]} />
      </View>
      <View style={[styles.skeletonBlock, styles.skeletonBanner]} />
      <View style={styles.skeletonButtonRow}>
        <View style={[styles.skeletonBlock, styles.skeletonButton]} />
        <View style={[styles.skeletonBlock, styles.skeletonButton]} />
      </View>
      <View style={[styles.skeletonBlock, styles.skeletonLineLong]} />
      <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
      <View style={[styles.skeletonBlock, styles.skeletonCard]} />
      <View style={[styles.skeletonBlock, styles.skeletonCard]} />
      <View style={[styles.skeletonBlock, styles.skeletonCard]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.lg,
  },
  skeletonWrap: {
    gap: SPACING.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skeletonBlock: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonTitle: {
    width: '62%',
    height: 28,
  },
  skeletonCircle: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonBanner: {
    height: 140,
    borderRadius: BORDER_RADIUS.xl,
  },
  skeletonButton: {
    flex: 1,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
  },
  skeletonLineLong: {
    width: '72%',
    height: 22,
  },
  skeletonLineShort: {
    width: '45%',
    height: 16,
  },
  skeletonCard: {
    height: 84,
    borderRadius: BORDER_RADIUS.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  brandLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  brandSubLabel: {
    color: COLORS.text.tertiary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  heroBadge: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    lineHeight: TYPOGRAPHY.fontSizes.md * TYPOGRAPHY.lineHeights.relaxed,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ctaButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ctaPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.primary,
  },
  ctaSecondary: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
  },
  ctaPrimaryText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  ctaSecondaryText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  sectionCaption: {
    color: COLORS.text.tertiary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  arrivalsGrid: {
    gap: SPACING.sm,
  },
  arrivalCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  arrivalTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  arrivalText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    lineHeight: 19,
  },
  promoStrip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  promoTitle: {
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  promoText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    lineHeight: 20,
  },
  prebuildList: {
    gap: SPACING.sm,
  },
  prebuildCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  prebuildLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 1,
  },
  prebuildIconBadge: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prebuildTextWrap: {
    flexShrink: 1,
  },
  prebuildTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    marginBottom: 2,
  },
  prebuildSubtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    lineHeight: 18,
  },
});
