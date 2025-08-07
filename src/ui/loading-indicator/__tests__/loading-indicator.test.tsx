import React from 'react';
import { render } from '@testing-library/react-native';

import { TestWrapper } from '../../../test-utils';
import { LoadingIndicator } from '../loading-indicator';

describe('LoadingIndicator', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByTestId('loading-indicator-spinner')).toBeTruthy();
  });

  it('should render small size', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator size="small" />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator-spinner')).toBeTruthy();
  });

  it('should render medium size', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator size="medium" />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator-spinner')).toBeTruthy();
  });

  it('should render large size', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator size="large" />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator-spinner')).toBeTruthy();
  });

  it('should show label when showLabel is true', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <LoadingIndicator showLabel />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator-label')).toBeTruthy();
    expect(getByText('Cargando...')).toBeTruthy();
  });

  it('should show custom label', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoadingIndicator showLabel label="Loading data..." />
      </TestWrapper>,
    );

    expect(getByText('Loading data...')).toBeTruthy();
  });

  it('should not show label by default', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <LoadingIndicator />
      </TestWrapper>,
    );

    expect(queryByTestId('loading-indicator-label')).toBeFalsy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator testID="custom-loading" />
      </TestWrapper>,
    );

    expect(getByTestId('custom-loading')).toBeTruthy();
    expect(getByTestId('custom-loading-spinner')).toBeTruthy();
  });

  it('should accept custom color', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <LoadingIndicator color="#FF0000" />
      </TestWrapper>,
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
