/* eslint-disable @typescript-eslint/no-explicit-any */
import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = (
  name: keyof RootStackParamList,
  params?: unknown,
): void => {
  if (navigationRef.isReady()) {
    if (params) {
      (navigationRef.navigate as any)(name, params);
    } else {
      (navigationRef.navigate as any)(name);
    }
  }
};

export const goBack = (): void => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

export const reset = (routeName: keyof RootStackParamList): void => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName as never }],
    });
  }
};

export const getCurrentRoute = (): unknown => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
};

export const isNavigationReady = (): boolean => navigationRef.isReady();
