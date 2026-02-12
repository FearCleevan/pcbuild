import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ExploreStackParamList } from '../navigation/types';
import { allComponents } from '../../data/mockData';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ navigation, route }: Props) {
    const product = useMemo(
        () => allComponents.find((item) => item.id === route.params.productId),
        [route.params.productId]
    );

    const similarProducts = useMemo(() => {
        if (!product) {
            return [];
        }

        return allComponents
            .filter((item) => item.type === product.type && item.id !== product.id)
            .slice(0, 4);
    }, [product]);

    if (!product) {
        return (
            <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                <View style={styles.notFound}>
                    <Text style={styles.notFoundTitle}>Product not found</Text>
                    <Text style={styles.notFoundSubtitle}>The selected product could not be loaded.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.heroCard}>
                    <Image source={{ uri: product.image }} style={styles.heroImage} />
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>PHP {product.price.toLocaleString()}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaPill}>{product.type.toUpperCase()}</Text>
                        <Text style={styles.metaPill}>{product.stock}</Text>
                    </View>
                </View>

                <View style={styles.specCard}>
                    <Text style={styles.sectionTitle}>Full Specifications</Text>
                    {Object.entries(product.specs).map(([key, value]) => (
                        <View key={key} style={styles.specRow}>
                            <Text style={styles.specKey}>{key}</Text>
                            <Text style={styles.specValue}>{String(value)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.similarCard}>
                    <Text style={styles.sectionTitle}>Similar Products</Text>
                    {similarProducts.map((item) => (
                        <Pressable
                            key={item.id}
                            style={styles.similarItem}
                            onPress={() => navigation.push('ProductDetails', { productId: item.id })}
                        >
                            <Image source={{ uri: item.image }} style={styles.similarImage} />
                            <View style={styles.similarTextWrap}>
                                <Text style={styles.similarName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text style={styles.similarPrice}>PHP {item.price.toLocaleString()}</Text>
                            </View>
                            <MaterialCommunityIcons name='chevron-right' size={18} color={COLORS.text.tertiary} />
                        </Pressable>
                    ))}
                </View>
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
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
    },
    notFoundTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.lg,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
    },
    notFoundSubtitle: {
        color: COLORS.text.secondary,
        marginTop: SPACING.xs,
    },
    heroCard: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        ...SHADOWS.md,
    },
    heroImage: {
        width: '100%',
        height: 190,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.surfaceLight,
        marginBottom: SPACING.md,
    },
    productName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.xl,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
    },
    productPrice: {
        color: COLORS.primaryLight,
        fontSize: TYPOGRAPHY.fontSizes.lg,
        fontWeight: TYPOGRAPHY.fontWeights.semibold,
        marginTop: SPACING.xs,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginTop: SPACING.sm,
    },
    metaPill: {
        backgroundColor: COLORS.surfaceLight,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSizes.xs,
    },
    specCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    sectionTitle: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.lg,
        fontWeight: TYPOGRAPHY.fontWeights.bold,
    },
    specRow: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
        gap: 2,
    },
    specKey: {
        color: COLORS.primaryLight,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        fontWeight: TYPOGRAPHY.fontWeights.semibold,
    },
    specValue: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSizes.sm,
        lineHeight: 18,
    },
    similarCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    similarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    similarImage: {
        width: 52,
        height: 52,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surfaceLight,
    },
    similarTextWrap: {
        flex: 1,
    },
    similarName: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.fontSizes.sm,
        fontWeight: TYPOGRAPHY.fontWeights.semibold,
    },
    similarPrice: {
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSizes.xs,
        marginTop: 2,
    },
});
