import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ExploreStackParamList } from '../navigation/types';
import { allComponents, type ComponentItem } from '../../data/mockData';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../theme';

type Props = NativeStackScreenProps<ExploreStackParamList, 'CompareReview'>;

type ComparisonRow = {
    key: string;
    values: string[];
    bestIndex: number | null;
};

function toNumber(value: string): number | null {
    const match = value.match(/(-?\d+(\.\d+)?)/);
    if (!match) {
        return null;
    }
    return Number(match[1]);
}

function extractMetricValue(component: ComponentItem, keys: string[]): number {
    for (const key of keys) {
        const raw = component.specs[key];
        if (raw === undefined || raw === null) {
            continue;
        }
        const parsed = toNumber(String(raw));
        if (parsed !== null) {
            return parsed;
        }
    }
    return 0;
}

function scoreComponent(component: ComponentItem): number {
    const core = extractMetricValue(component, ['Core Count', 'Cores']);
    const thread = extractMetricValue(component, ['Thread Count', 'Threads']);
    const boostClock = extractMetricValue(component, ['Max Boost Clock', 'Boost Clock', 'Clock Speed']);
    const memory = extractMetricValue(component, ['VRAM', 'Memory Size', 'Capacity']);
    const stockSignal = Math.min(component.stockCount, 40);
    const price = Math.max(component.price, 1);

    const performance = core * 5 + thread * 2 + boostClock * 6 + memory * 2;
    const value = (performance / price) * 100000;
    const reliability = stockSignal;

    return performance * 0.6 + value * 0.3 + reliability * 0.1;
}

export default function CompareReviewScreen({ route }: Props) {
    const comparedItems = useMemo(
        () => allComponents.filter((item) => route.params.compareIds.includes(item.id)),
        [route.params.compareIds]
    );
    const shouldHorizontalScroll = comparedItems.length >= 4;

    const winner = useMemo(() => {
        if (comparedItems.length === 0) {
            return null;
        }

        return [...comparedItems].sort((a, b) => scoreComponent(b) - scoreComponent(a))[0];
    }, [comparedItems]);

    const comparisonRows = useMemo<ComparisonRow[]>(() => {
        const keys = new Set<string>();

        comparedItems.forEach((item) => {
            Object.keys(item.specs).forEach((key) => keys.add(key));
        });

        const rows: ComparisonRow[] = [];

        rows.push({
            key: 'Price',
            values: comparedItems.map((item) => `PHP ${item.price.toLocaleString()}`),
            bestIndex: (() => {
                if (comparedItems.length < 2) {
                    return null;
                }
                let best = 0;
                comparedItems.forEach((item, index) => {
                    if (item.price < comparedItems[best].price) {
                        best = index;
                    }
                });
                return best;
            })(),
        });

        [...keys].slice(0, 16).forEach((key) => {
            const values = comparedItems.map((item) => String(item.specs[key] ?? '-'));
            const numericValues = values.map((value) => toNumber(value));
            const comparable = numericValues.every((value) => value !== null) && comparedItems.length > 1;

            let bestIndex: number | null = null;
            if (comparable) {
                let best = 0;
                numericValues.forEach((value, index) => {
                    if ((value ?? 0) > (numericValues[best] ?? 0)) {
                        best = index;
                    }
                });
                bestIndex = best;
            }

            rows.push({ key, values, bestIndex });
        });

        return rows;
    }, [comparedItems]);

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {comparedItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No items in review list</Text>
                        <Text style={styles.emptySubtitle}>Add products from Explore first, then open Compare Review.</Text>
                    </View>
                ) : (
                    <>
                        {winner ? (
                            <View style={styles.winnerCard}>
                                <Text style={styles.winnerBadge}>Best Overall Review</Text>
                                <Text style={styles.winnerName}>{winner.name}</Text>
                                <Text style={styles.winnerReason}>
                                    Strong balance of specs, value, and availability based on your compared products.
                                </Text>
                            </View>
                        ) : null}

                        <ScrollView
                            horizontal={shouldHorizontalScroll}
                            scrollEnabled={shouldHorizontalScroll}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.tableWrap}
                        >
                            <View style={[styles.table, !shouldHorizontalScroll && styles.tableNoScroll]}>
                                <View style={styles.headerRow}>
                                    <View
                                        style={[
                                            styles.specCol,
                                            styles.headerCell,
                                            styles.specHeaderCell,
                                            !shouldHorizontalScroll && styles.specColNoScroll,
                                        ]}
                                    >
                                        <Text style={styles.headerCellText}>Specifications</Text>
                                    </View>
                                    {comparedItems.map((item) => (
                                        <View
                                            key={item.id}
                                            style={[styles.valueCol, styles.headerCell, !shouldHorizontalScroll && styles.valueColNoScroll]}
                                        >
                                            <Image source={{ uri: item.image }} style={styles.headerImage} />
                                            <Text style={styles.headerName} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {comparisonRows.map((row) => (
                                    <View key={row.key} style={styles.tableRow}>
                                        <View style={[styles.specCol, styles.specCell, !shouldHorizontalScroll && styles.specColNoScroll]}>
                                            <Text style={styles.specLabel}>{row.key}</Text>
                                        </View>

                                        {row.values.map((value, index) => {
                                            const isBest = row.bestIndex === index;
                                            const hasIndicator = row.bestIndex !== null;

                                            return (
                                                <View
                                                    key={`${row.key}-${index}`}
                                                    style={[styles.valueCol, styles.valueCell, !shouldHorizontalScroll && styles.valueColNoScroll]}
                                                >
                                                    <View style={styles.valueWithIndicator}>
                                                        <Text style={styles.valueText}>{value}</Text>
                                                        {hasIndicator ? (
                                                            <MaterialCommunityIcons
                                                                name={isBest ? 'check-circle' : 'close-circle'}
                                                                size={15}
                                                                color={isBest ? COLORS.success : COLORS.danger}
                                                            />
                                                        ) : null}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        padding: SPACING.lg,
        gap: SPACING.md,
        paddingBottom: SPACING['4xl'],
    },
    emptyState: {
        marginTop: SPACING['2xl'],
        alignItems: 'center',
    },
    emptyTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.lg,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
    },
    emptySubtitle: {
        color: COLORS.text.secondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    winnerCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
    },
    winnerBadge: {
        color: COLORS.success,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
        marginBottom: SPACING.xs,
    },
    winnerName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.xl,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
        marginBottom: SPACING.xs,
    },
    winnerReason: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSizes.sm,
        lineHeight: 18,
    },
    tableWrap: {
        paddingBottom: SPACING.sm,
    },
    table: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    tableNoScroll: {
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surfaceLight,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    specCol: {
        width: 150,
    },
    specColNoScroll: {
        width: 120,
    },
    valueCol: {
        width: 190,
    },
    valueColNoScroll: {
        flex: 1,
        width: undefined,
        minWidth: 90,
    },
    headerCell: {
        padding: SPACING.sm,
        minHeight: 92,
        justifyContent: 'center',
    },
    specHeaderCell: {
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    headerCellText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.sm,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
    },
    headerImage: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.xs,
    },
    headerName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        fontWeight: TYPOGRAPHY.fontWeights.semibold,
        lineHeight: 15,
    },
    specCell: {
        padding: SPACING.sm,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        justifyContent: 'center',
    },
    specLabel: {
        color: COLORS.primaryLight,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        fontWeight: TYPOGRAPHY.fontWeights.semibold,
    },
    valueCell: {
        padding: SPACING.sm,
        justifyContent: 'center',
    },
    valueWithIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    valueText: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        lineHeight: 16,
        flex: 1,
    },
});
