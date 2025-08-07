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
import { ContentWrapper, Icon, Image } from '../ui';

export interface HeaderProps {
  titleStyle?: TextStyle;
  showFilterButton?: boolean;
  activeFilterCount?: number;
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
    color: theme.colors.white,
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
  },
  greetingText: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  filterButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
  },
}));

export const Header: FC<HeaderProps> = ({
  titleStyle,
  showFilterButton = false,
  activeFilterCount = 0,
}) => {
  const styles = useStyles();
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleProfilePress = (): void => {
    if (!user) return;
    navigation.navigate('ProfileModal');
  };

  const handleFilterPress = (): void => {
    navigation.navigate('FilterModal');
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

        {showFilterButton && (
          <TouchableOpacity
            onPress={handleFilterPress}
            style={styles.filterButton}
            testID="filter-button"
          >
            <Icon
              name="filter-list"
              family="MaterialIcons"
              size={28}
              color="text.primary"
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ContentWrapper>
  );
};
