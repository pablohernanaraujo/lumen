import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { TestWrapper } from '../../../test-utils';
import { ErrorState } from '../error-state';

describe('ErrorState', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ErrorState />
      </TestWrapper>,
    );

    expect(getByTestId('error-state')).toBeTruthy();
    expect(getByTestId('error-state-icon')).toBeTruthy();
    expect(getByTestId('error-state-title')).toBeTruthy();
    expect(getByTestId('error-state-message')).toBeTruthy();
  });

  it('should render custom title and message', () => {
    const { getByText } = render(
      <TestWrapper>
        <ErrorState title="Custom Error" message="Custom error message" />
      </TestWrapper>,
    );

    expect(getByText('Custom Error')).toBeTruthy();
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('should show retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <ErrorState onRetry={onRetry} />
      </TestWrapper>,
    );

    const retryButton = getByTestId('error-state-retry-button');
    expect(retryButton).toBeTruthy();

    fireEvent.press(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should show loading indicator when isRetrying is true', () => {
    const { getByTestId, queryByTestId } = render(
      <TestWrapper>
        <ErrorState onRetry={() => {}} isRetrying />
      </TestWrapper>,
    );

    expect(getByTestId('error-state-loading')).toBeTruthy();
    expect(queryByTestId('error-state-retry-button')).toBeFalsy();
  });

  it('should use custom retry text', () => {
    const { getByText } = render(
      <TestWrapper>
        <ErrorState onRetry={() => {}} retryText="Try Again" />
      </TestWrapper>,
    );

    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ErrorState testID="custom-error" />
      </TestWrapper>,
    );

    expect(getByTestId('custom-error')).toBeTruthy();
  });
});
