import React, { type FC } from 'react';
import {
  type ImageStyle,
  Text,
  type TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../contexts';
import type { RootStackParamList } from '../routing';
import { makeStyles } from '../theme';
import { ContentWrapper, Image } from '../ui';

export interface HeaderProps {
  titleStyle?: TextStyle;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatarSection: {
    marginRight: theme.spacing.md,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
  },
  greetingText: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
}));

export const Header: FC<HeaderProps> = ({ titleStyle }) => {
  const styles = useStyles();
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleProfilePress = (): void => {
    if (!user) return;
    navigation.navigate('ProfileModal');
  };

  const getInitials = (): string => {
    if (!user) return '?';
    const name = user.user.name || user.user.email;
    const words = name.split(' ');
    if (words.length > 1) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getGreeting = (): string => {
    if (!user) return 'Hola';
    const firstName =
      user.user.givenName || user.user.name?.split(' ')[0] || 'Usuario';
    return `Hola, ${firstName}`;
  };

  return (
    <ContentWrapper variant="header">
      <View style={styles.container}>
        {user && (
          <TouchableOpacity
            onPress={handleProfilePress}
            testID="profile-avatar-button"
            style={styles.avatarSection}
          >
            {user.user.photo ? (
              <Image
                source={{ uri: user.user.photo }}
                style={styles.profileImage as ImageStyle}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text style={[styles.greetingText, titleStyle]}>{getGreeting()}</Text>
      </View>
    </ContentWrapper>
  );
};
