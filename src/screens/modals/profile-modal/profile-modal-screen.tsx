import React, { type FC } from 'react';
import { Alert, type ImageStyle, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../../contexts';
import type { RootStackParamList } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  Body1,
  Body2,
  ButtonRegular,
  ContentWrapper,
  H1,
  HStack,
  Image,
  ScreenWrapper,
  VStack,
} from '../../../ui';

interface ProfileModalScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileModal'>;
}

const useStyles = makeStyles((theme) => ({
  profileContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.typography.size.xxxl,
    fontWeight: theme.typography.weight.bold,
  },
}));

export const ProfileModalScreen: FC<ProfileModalScreenProps> = ({
  navigation,
}) => {
  const styles = useStyles();
  const { user, signOut } = useAuth();

  if (!user) {
    navigation.goBack();
    return null;
  }

  const getInitials = (): string => {
    const name = user.user.name || user.user.email;
    const words = name.split(' ');
    if (words.length > 1) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = (): void => {
    const userName = user.user.givenName || user.user.name || 'User';

    Alert.alert(
      'Cerrar sesión',
      `¿Estás seguro que deseas salir, ${userName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.goBack();
            } catch {
              Alert.alert(
                'Error',
                'No se pudo cerrar sesión. Intenta nuevamente.',
              );
            }
          },
        },
      ],
    );
  };

  const formatGoogleId = (id: string): string => {
    if (id.length > 20) {
      return `${id.slice(0, 8)}...${id.slice(Math.max(0, id.length - 8))}`;
    }
    return id;
  };

  return (
    <ScreenWrapper disableSafeArea>
      <ContentWrapper variant="header">
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {user.user.photo ? (
              <Image
                source={{ uri: user.user.photo }}
                style={styles.profileImage as ImageStyle}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <H1 style={styles.avatarText}>{getInitials()}</H1>
              </View>
            )}
          </View>

          <VStack spacing="xs">
            <H1>{user.user.name || 'Usuario de Lumen'}</H1>
            <Body2 emphasis="medium">{user.user.email}</Body2>
          </VStack>
        </View>
      </ContentWrapper>
      <ContentWrapper variant="body">
        <VStack>
          <HStack textAlign="space-between">
            <Body2>Nombre</Body2>
            <Body1>{user.user.name || 'No proporcionado'}</Body1>
          </HStack>
          <HStack textAlign="space-between">
            <Body2>Email</Body2>
            <Body1>{user.user.email}</Body1>
          </HStack>
          <HStack textAlign="space-between">
            <Body2>Nombre</Body2>
            <Body1>{user.user.givenName || 'No disponible'}</Body1>
          </HStack>
          <HStack textAlign="space-between">
            <Body2>Apellido</Body2>
            <Body1>{user.user.familyName || 'No disponible'}</Body1>
          </HStack>
          <HStack textAlign="space-between">
            <Body2>Google ID</Body2>
            <Body1>{formatGoogleId(user.user.id)}</Body1>
          </HStack>
        </VStack>
      </ContentWrapper>
      <ContentWrapper variant="footer">
        <ButtonRegular
          onPress={handleLogout}
          testID="logout-button"
          variant="danger"
          fullWidth
        >
          Cerrar sesión
        </ButtonRegular>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
