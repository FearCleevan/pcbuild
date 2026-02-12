import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '../../../theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type TabBarIconProps = {
  name: IconName;
  color: string;
  size?: number;
  focused?: boolean;
};

export default function TabBarIcon({
  name,
  color,
  size = 22,
  focused = false,
}: TabBarIconProps) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      style={focused ? { textShadowColor: COLORS.primary, textShadowRadius: 8 } : undefined}
    />
  );
}
