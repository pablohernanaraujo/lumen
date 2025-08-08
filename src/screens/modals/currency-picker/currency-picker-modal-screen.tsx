import React, { type FC } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  ContentWrapper,
  CurrencyPicker,
  ScreenWrapper,
  VStack,
} from '../../../ui';

export interface CurrencyPickerModalParams {
  initialTab?: 'crypto' | 'fiat';
  onSelect?: (payload: unknown) => void;
}

export type CurrencyPickerModalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrencyPickerModal'
>;

const useStyles = makeStyles(() => ({
  container: { flex: 1 },
}));

export const CurrencyPickerModalScreen: FC<CurrencyPickerModalScreenProps> = ({
  route,
  navigation,
}) => {
  const styles = useStyles();
  const initialTab = route.params?.initialTab ?? 'crypto';
  const onSelect = route.params?.onSelect;

  return (
    <ScreenWrapper disableSafeArea>
      <ContentWrapper variant="body" style={styles.container}>
        <VStack>
          <CurrencyPicker
            initialTab={initialTab}
            onSelectCrypto={(c) => {
              onSelect?.({
                type: 'crypto',
                value: c,
              });
              navigation.goBack();
            }}
            onSelectFiat={(f) => {
              onSelect?.({
                type: 'fiat',
                value: f,
              });
              navigation.goBack();
            }}
          />
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
