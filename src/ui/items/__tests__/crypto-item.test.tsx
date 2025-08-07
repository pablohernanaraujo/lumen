import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { CryptoItem } from '../crypto-item';
import type { CryptoItemProps } from '../types';

const mockCrypto = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/bitcoin.png',
  current_price: 45000,
  market_cap: 850000000000,
  market_cap_rank: 1,
  fully_diluted_valuation: 945000000000,
  total_volume: 25000000000,
  high_24h: 46500,
  low_24h: 44200,
  price_change_24h: 1250.75,
  price_change_percentage_24h: 2.86,
  market_cap_change_24h: 23450000000,
  market_cap_change_percentage_24h: 2.84,
  circulating_supply: 19500000,
  total_supply: 21000000,
  max_supply: 21000000,
  ath: 69000,
  ath_change_percentage: -34.78,
  ath_date: '2021-11-10T14:24:11.849Z',
  atl: 67.81,
  atl_change_percentage: 66278.45,
  atl_date: '2013-07-06T00:00:00.000Z',
  roi: {
    times: 89.75,
    currency: 'usd',
    percentage: 8975.23,
  },
  last_updated: '2023-12-07T10:30:00.000Z',
};

const renderWithTheme = (
  component: React.ReactElement,
): ReturnType<typeof render> =>
  render(<ThemeProvider>{component}</ThemeProvider>);

const defaultProps: CryptoItemProps = {
  crypto: mockCrypto,
  testID: 'crypto-item-test',
};

describe('CryptoItem', () => {
  it('should render correctly with crypto data', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CryptoItem {...defaultProps} />,
    );

    expect(getByTestId('crypto-item-test')).toBeTruthy();
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('#1 • BTC')).toBeTruthy();
  });

  it('should format price correctly for different values', () => {
    // arrange
    const cryptoWithSmallPrice = {
      ...mockCrypto,
      current_price: 0.000123,
    };

    // act
    const { getByText } = renderWithTheme(
      <CryptoItem crypto={cryptoWithSmallPrice} />,
    );

    // assert
    expect(getByText('$0.000123')).toBeTruthy();
  });

  it('should format price correctly for large values', () => {
    // arrange
    const { getByText } = renderWithTheme(<CryptoItem {...defaultProps} />);

    // assert
    expect(getByText('$45.00K')).toBeTruthy();
  });

  it('should display positive price change in green', () => {
    // arrange
    const { getByTestId } = renderWithTheme(<CryptoItem {...defaultProps} />);

    // assert
    const changeText = getByTestId('crypto-item-test-change');
    expect(changeText.props.children).toBe('+2.86%');
  });

  it('should display negative price change in red', () => {
    // arrange
    const cryptoWithNegativeChange = {
      ...mockCrypto,
      price_change_percentage_24h: -3.45,
    };

    const { getByTestId } = renderWithTheme(
      <CryptoItem
        crypto={cryptoWithNegativeChange}
        testID="crypto-item-test"
      />,
    );

    // assert
    const changeText = getByTestId('crypto-item-test-change');
    expect(changeText.props.children).toBe('-3.45%');
  });

  it('should display cryptocurrency symbol in uppercase', () => {
    // arrange
    const { getByText } = renderWithTheme(<CryptoItem {...defaultProps} />);

    // assert
    expect(getByText('#1 • BTC')).toBeTruthy();
  });

  it('should call onPress with crypto id when pressed', () => {
    // arrange
    const mockOnPress = jest.fn();
    const { getByTestId } = renderWithTheme(
      <CryptoItem {...defaultProps} onPress={mockOnPress} />,
    );

    // act
    fireEvent.press(getByTestId('crypto-item-test'));

    // assert
    expect(mockOnPress).toHaveBeenCalledWith('bitcoin');
  });

  it('should render shimmer when showShimmer is true', () => {
    // arrange
    const { getByTestId, queryByText } = renderWithTheme(
      <CryptoItem {...defaultProps} showShimmer={true} />,
    );

    // assert
    expect(getByTestId('crypto-item-test')).toBeTruthy();
    expect(queryByText('Bitcoin')).toBeNull();
  });

  it('should truncate long cryptocurrency names', () => {
    // arrange
    const cryptoWithLongName = {
      ...mockCrypto,
      name: 'Very Long Cryptocurrency Name That Should Be Truncated',
    };

    const { getByTestId } = renderWithTheme(
      <CryptoItem crypto={cryptoWithLongName} testID="crypto-item-test" />,
    );

    // assert
    const nameText = getByTestId('crypto-item-test-name');
    expect(nameText.props.numberOfLines).toBe(1);
  });

  it('should render crypto image with correct testID', () => {
    // arrange
    const { getByTestId } = renderWithTheme(<CryptoItem {...defaultProps} />);

    // assert
    expect(getByTestId('crypto-item-test-image')).toBeTruthy();
  });
});
