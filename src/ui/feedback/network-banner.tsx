/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable max-statements */
import { type FC, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetworkStatus } from '../../contexts/network-context';
import { useTheme } from '../../theme';
import { Icon } from '../icon';
import { Body2 } from '../typography';

export interface NetworkBannerProps {
  style?: ViewStyle;
}

export const NetworkBanner: FC<NetworkBannerProps> = ({ style }) => {
  const { theme } = useTheme();
  const { isOnline, wasOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-100)).current;
  const showBanner = !isOnline || wasOffline;

  useEffect(() => {
    if (!isOnline) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (wasOffline) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.delay(2000),
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isOnline, wasOffline, translateY]);

  if (!showBanner) {
    return null;
  }

  const isOffline = !isOnline;
  const backgroundColor = isOffline
    ? theme.colors.error.main
    : theme.colors.success.main;
  const textColor = theme.colors.text.inverse;
  const iconName = isOffline ? 'wifi-off' : 'wifi';
  const message = isOffline ? 'Sin conexión a internet' : 'Conexión restaurada';

  const styles = createStyles({
    backgroundColor,
    textColor,
    topOffset: insets.top,
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }, style]}
      testID={`network-banner-${isOffline ? 'offline' : 'online'}`}
    >
      <Icon
        name={iconName}
        size={16}
        color={textColor}
        testID="network-banner-icon"
      />
      <Body2 style={styles.text} testID="network-banner-text">
        {message}
      </Body2>
    </Animated.View>
  );
};

interface StyleProps {
  backgroundColor: string;
  textColor: string;
  topOffset: number;
}

const createStyles = ({
  backgroundColor,
  textColor,
  topOffset,
}: StyleProps): {
  container: ViewStyle;
  text: TextStyle;
} =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor,
      paddingTop: topOffset + 8,
      paddingBottom: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      elevation: 10,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    text: {
      color: textColor,
      marginLeft: 8,
      fontWeight: '600',
    },
  });
