import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';

type CompatibilityCheck = {
  label: string;
  status: 'pass' | 'warning';
  detail: string;
};

type WattageLine = {
  part: string;
  watts: number;
};

export default function BuildScreen() {
  const checks: CompatibilityCheck[] = [
    {
      label: 'CPU and Motherboard Socket',
      status: 'pass',
      detail: 'AM5 processor is compatible with selected B650 motherboard.',
    },
    {
      label: 'RAM Generation Match',
      status: 'pass',
      detail: 'DDR5 memory supported by board and CPU controller.',
    },
    {
      label: 'GPU Clearance',
      status: 'warning',
      detail: 'Estimated 5mm case clearance. Verify front fan thickness.',
    },
    {
      label: 'Cooling Support',
      status: 'warning',
      detail: 'Top radiator support depends on motherboard VRM heatsink height.',
    },
  ];

  const loadEstimate: WattageLine[] = [
    { part: 'CPU', watts: 125 },
    { part: 'Graphics Card', watts: 320 },
    { part: 'Motherboard + RAM', watts: 70 },
    { part: 'Storage + Cooling', watts: 55 },
  ];

  const totalLoad = loadEstimate.reduce((sum, item) => sum + item.watts, 0);
  const recommendedPsu = 850;
  const headroom = recommendedPsu - totalLoad;
  const usageRatio = Math.min(totalLoad / recommendedPsu, 1);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Build Assistant</Text>
          <Text style={styles.subtitle}>Compatibility checking and reliable wattage planning for your custom PC.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name='shield-check-outline' size={20} color={COLORS.success} />
            <Text style={styles.cardTitle}>Compatibility Checking</Text>
          </View>

          <View style={styles.checkList}>
            {checks.map((check) => {
              const isPass = check.status === 'pass';
              return (
                <View key={check.label} style={styles.checkRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isPass ? COLORS.success : COLORS.warning },
                    ]}
                  />
                  <View style={styles.checkTextWrap}>
                    <Text style={styles.checkLabel}>{check.label}</Text>
                    <Text style={styles.checkDetail}>{check.detail}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable
            style={styles.outlineButton}
            onPress={() => Alert.alert('Placeholder', 'Compatibility route is ready to wire.')}
          >
            <Text style={styles.outlineButtonText}>Run Full Compatibility Scan</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name='flash-outline' size={20} color={COLORS.secondary} />
            <Text style={styles.cardTitle}>Reliable Wattage Calculator</Text>
          </View>

          <View style={styles.wattList}>
            {loadEstimate.map((line) => (
              <View key={line.part} style={styles.wattRow}>
                <Text style={styles.wattPart}>{line.part}</Text>
                <Text style={styles.wattValue}>{line.watts}W</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Estimated Full Load</Text>
            <Text style={styles.totalValue}>{totalLoad}W</Text>
          </View>

          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${usageRatio * 100}%` }]} />
          </View>

          <View style={styles.psuRow}>
            <Text style={styles.psuText}>Recommended PSU: {recommendedPsu}W</Text>
            <Text style={styles.psuHeadroom}>Headroom: {headroom}W</Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => Alert.alert('Placeholder', 'Wattage details route is ready to wire.')}
          >
            <Text style={styles.primaryButtonText}>View Detailed Power Report</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  titleWrap: {
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes['3xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  checkList: {
    gap: SPACING.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 6,
  },
  checkTextWrap: {
    flex: 1,
    gap: 2,
  },
  checkLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  checkDetail: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    lineHeight: 19,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  outlineButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  wattList: {
    gap: SPACING.xs,
  },
  wattRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  wattPart: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  wattValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  totalBlock: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  totalValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  meterTrack: {
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  psuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  psuText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  psuHeadroom: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
});
