import React, { type FC } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../routing';
import { makeStyles } from '../../../theme';
import { CurrencyPicker } from '../../../ui';

export interface CurrencyPickerModalParams {
  initialTab?: 'crypto' | 'fiat';
  onSelect?: (payload: unknown) => void;
}

export type CurrencyPickerModalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrencyPickerModal'
>;

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    paddingTop: 16,
  },
}));

export const CurrencyPickerModalScreen: FC<CurrencyPickerModalScreenProps> = ({
  route,
  navigation,
}) => {
  const styles = useStyles();
  const initialTab = route.params?.initialTab ?? 'crypto';
  const onSelect = route.params?.onSelect;

  return (
    <View style={styles.container}>
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
    </View>
  );
};
