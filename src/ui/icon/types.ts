import type { ReactNode } from 'react';

import type { Theme } from '../../theme';

export type IconSize = keyof Theme['typography']['size'] | number;

export type IconFamily =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

export interface IconProps {
  name: string;
  family?: IconFamily;
  size?: IconSize;
  color?: string;
  style?: object;
  testID?: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}
