import React, { type FC } from 'react';

import { makeStyles, useTheme } from '../../theme';
import {
  Body1,
  ContentWrapper,
  H2,
  Icon,
  ScreenWrapper,
  VStack,
} from '../../ui';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
}));

export const ExchangeScreen: FC = () => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <ScreenWrapper>
      <ContentWrapper variant="screen" style={styles.container}>
        <VStack spacing="xl" align="center">
          <Icon
            name="swap-horizontal"
            family="MaterialCommunityIcons"
            size="xxxl"
            color={theme.colors.primary.main}
          />
          <H2 style={styles.title}>Exchange</H2>
          <Body1 style={styles.description}>
            Convert between cryptocurrencies and fiat currencies. Buy, sell, and
            swap your digital assets instantly.
          </Body1>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
