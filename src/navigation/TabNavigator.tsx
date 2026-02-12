import { NavigationContainer, DefaultTheme, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import BuildScreen from '../screens/BuildScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreStackNavigator from './ExploreStackNavigator';
import type { RootTabParamList } from './types';
import TabBarIcon from '../components/navigation/TabBarIcon';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text.primary,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

const tabIcons: Record<keyof RootTabParamList, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  Home: 'home-variant-outline',
  Build: 'tools',
  Explore: 'compass-outline',
  Profile: 'account-outline',
};

export default function TabNavigator() {
  return (
    <NavigationContainer theme={appTheme}>
      <Tab.Navigator
        initialRouteName='Home'
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
          headerShown: false,
          animation: 'shift',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 220,
            },
          },
          sceneStyle: {
            backgroundColor: COLORS.background,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: COLORS.primaryLight,
          tabBarInactiveTintColor: COLORS.text.tertiary,
          tabBarLabelStyle: {
            fontSize: TYPOGRAPHY.fontSizes.xs,
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
            letterSpacing: TYPOGRAPHY.letterSpacing.wide,
            textTransform: 'uppercase',
            marginBottom: SPACING.xs,
          },
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 72,
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.sm,
            ...SHADOWS.lg,
          },
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: COLORS.surface }} />,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={tabIcons[route.name as keyof RootTabParamList]} color={color} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name='Home' component={HomeScreen} />
        <Tab.Screen name='Build' component={BuildScreen} />
        <Tab.Screen
          name='Explore'
          component={ExploreStackNavigator}
          options={({ route }) => {
            const nestedRoute = getFocusedRouteNameFromRoute(route);
            const isExploreMain = !nestedRoute || nestedRoute === 'ExploreMain';

            return {
              tabBarStyle: isExploreMain
                ? {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 72,
                    paddingTop: SPACING.xs,
                    paddingBottom: SPACING.sm,
                    ...SHADOWS.lg,
                  }
                : { display: 'none' },
            };
          }}
        />
        <Tab.Screen name='Profile' component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
