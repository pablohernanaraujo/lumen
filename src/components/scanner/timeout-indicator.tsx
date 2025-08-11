import React, { type FC, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import type { ThemeContextValue } from '../../theme/types';
import { Body2 } from '../../ui/typography';

interface TimeoutIndicatorProps {
  duration: number; // Duration in seconds
  isActive: boolean;
  onTimeout: () => void;
  isPaused?: boolean;
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  progressCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: theme.colors.primary.main,
    transform: [{ rotate: '-90deg' }],
  },
  timerText: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    fontSize: 12,
  },
  warningColor: {
    borderTopColor: theme.colors.warning.main,
  },
  dangerColor: {
    borderTopColor: theme.colors.error.main,
  },
}));

const getProgressColorStyle = (
  timeLeft: number,
  styles: { dangerColor: object; warningColor: object },
): object => {
  if (timeLeft <= 5) {
    return styles.dangerColor;
  }
  if (timeLeft <= 10) {
    return styles.warningColor;
  }
  return {};
};

const getTextColor = (timeLeft: number, theme: ThemeContextValue): string => {
  if (timeLeft <= 5) {
    return theme.theme.colors.error.main;
  }
  if (timeLeft <= 10) {
    return theme.theme.colors.warning.main;
  }
  return theme.theme.colors.text.primary;
};

export const TimeoutIndicator: FC<TimeoutIndicatorProps> = ({
  duration,
  isActive,
  onTimeout,
  isPaused = false,
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(duration);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const cleanup = (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };

    if (!isActive || isPaused) {
      cleanup();
      return;
    }

    // Reset and start
    setTimeLeft(duration);
    animatedValue.setValue(0);

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          cleanup();
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start animation
    animationRef.current = Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: true,
    });
    animationRef.current.start();

    return cleanup;
  }, [isActive, isPaused, duration, onTimeout, animatedValue]);

  if (!isActive) {
    return null;
  }

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressCircle,
            getProgressColorStyle(timeLeft, styles),
            {
              transform: [{ rotate: '-90deg' }, { rotate: rotation }],
            },
          ]}
        />
        <Body2
          style={{
            ...styles.timerText,
            color: getTextColor(timeLeft, theme),
          }}
        >
          {timeLeft}
        </Body2>
      </View>
      <Body2 style={styles.label}>{isPaused ? 'Paused' : 'Scanning...'}</Body2>
    </View>
  );
};
