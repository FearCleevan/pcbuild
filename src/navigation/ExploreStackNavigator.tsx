import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';

import type { ExploreStackParamList } from './types';
import ExploreScreen from '../screens/ExploreScreen';
import CompareReviewScreen from '../screens/CompareReviewScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { COLORS } from '../../theme';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        animation: 'slide_from_bottom',
        presentation: 'fullScreenModal',
        contentStyle: {
          backgroundColor: COLORS.background,
        },
        headerTitleStyle: {
          color: COLORS.text.primary,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.text.primary,
        headerLeft: () => (
          <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
            <MaterialCommunityIcons name='arrow-left' size={24} color={COLORS.text.primary} />
          </Pressable>
        ),
      })}
    >
      <Stack.Screen
        name='ExploreMain'
        component={ExploreScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'fade_from_bottom',
        }}
      />
      <Stack.Screen
        name='CompareReview'
        component={CompareReviewScreen}
        options={{
          title: 'Compare Review',
          presentation: 'fullScreenModal',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name='ProductDetails'
        component={ProductDetailsScreen}
        options={{
          title: 'Product Details',
          presentation: 'fullScreenModal',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
