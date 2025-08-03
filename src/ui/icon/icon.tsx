/* eslint-disable complexity */
import React, { type ComponentType, type FC } from 'react';
import { TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';

import { useTheme } from '../../theme';
import type { IconFamily, IconProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIconComponent = (family: IconFamily): ComponentType<any> => {
  switch (family) {
    case 'AntDesign':
      return AntDesign;
    case 'Entypo':
      return Entypo;
    case 'EvilIcons':
      return EvilIcons;
    case 'Feather':
      return Feather;
    case 'FontAwesome':
      return FontAwesome;
    case 'FontAwesome5':
      return FontAwesome5;
    case 'Foundation':
      return Foundation;
    case 'Ionicons':
      return Ionicons;
    case 'MaterialIcons':
      return MaterialIcons;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Octicons':
      return Octicons;
    case 'SimpleLineIcons':
      return SimpleLineIcons;
    case 'Zocial':
      return Zocial;
    default:
      return MaterialIcons;
  }
};

export const Icon: FC<IconProps> = ({
  name,
  family = 'MaterialIcons',
  size = 'md',
  color,
  style,
  testID,
  onPress,
  accessible = true,
  accessibilityLabel,
  children,
}) => {
  const { theme } = useTheme();

  const IconComponent = getIconComponent(family);

  const iconSize =
    typeof size === 'number' ? size : theme.typography.size[size];
  const iconColor = color || theme.colors.text.primary;

  const iconElement = (
    <IconComponent
      name={name}
      size={iconSize}
      color={iconColor}
      style={style}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || `${family} ${name} icon`}
    >
      {children}
    </IconComponent>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || `${family} ${name} button`}
        accessibilityRole="button"
        testID={testID ? `${testID}-button` : undefined}
      >
        {iconElement}
      </TouchableOpacity>
    );
  }

  return iconElement;
};
