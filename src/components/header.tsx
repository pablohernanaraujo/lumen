import React, { type FC } from 'react';
import { type ImageStyle, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../contexts';
import type { RootStackParamList } from '../routing';
import { makeStyles } from '../theme';
import {
  Body3,
  ContentWrapper,
  H2,
  HStack,
  Icon,
  Image,
  SortButton,
} from '../ui';

export interface HeaderProps {
  showFilterButton?: boolean;
  activeFilterCount?: number;
  showSortButton?: boolean;
  sortBy?: string;
  onSortChange?: (sortId: string) => void;
}

const useStyles = makeStyles((theme) => ({
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
}));

export const Header: FC<HeaderProps> = ({
  showFilterButton = false,
  activeFilterCount = 0,
  showSortButton = false,
  sortBy = 'marketCap-desc',
  onSortChange,
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
    <ContentWrapper variant="body">
      <HStack textAlign="space-between">
        <HStack>
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
                  circular
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <H2>{getInitials()}</H2>
                </View>
              )}
            </TouchableOpacity>
          )}

          <H2>{getGreeting()}</H2>
        </HStack>

        <HStack>
          {showSortButton && onSortChange && (
            <SortButton
              value={sortBy}
              onValueChange={onSortChange}
              testID="header-sort-button"
            />
          )}

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
                  <Body3 color="inverse" emphasis="pure" fontWeight="bold">
                    {activeFilterCount}
                  </Body3>
                </View>
              )}
            </TouchableOpacity>
          )}
        </HStack>
      </HStack>
    </ContentWrapper>
  );
};
