import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { TestWrapper } from '../../../test-utils';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <EmptyState />
      </TestWrapper>,
    );

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByTestId('empty-state-icon')).toBeTruthy();
    expect(getByTestId('empty-state-title')).toBeTruthy();
    expect(getByTestId('empty-state-message')).toBeTruthy();
  });

  it('should render with search variant', () => {
    const { getByText } = render(
      <TestWrapper>
        <EmptyState variant="search" />
      </TestWrapper>,
    );

    expect(getByText('Sin resultados')).toBeTruthy();
  });

  it('should render with filter variant', () => {
    const { getByText } = render(
      <TestWrapper>
        <EmptyState variant="filter" />
      </TestWrapper>,
    );

    expect(getByText('Sin coincidencias')).toBeTruthy();
  });

  it('should render custom title and message', () => {
    const { getByText } = render(
      <TestWrapper>
        <EmptyState title="Custom Title" message="Custom message" />
      </TestWrapper>,
    );

    expect(getByText('Custom Title')).toBeTruthy();
    expect(getByText('Custom message')).toBeTruthy();
  });

  it('should show action button when onAction is provided', () => {
    const onAction = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <EmptyState actionText="Take Action" onAction={onAction} />
      </TestWrapper>,
    );

    const actionButton = getByTestId('empty-state-action-button');
    expect(actionButton).toBeTruthy();

    fireEvent.press(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not show action button when only onAction is provided without actionText', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <EmptyState onAction={() => {}} />
      </TestWrapper>,
    );

    expect(queryByTestId('empty-state-action-button')).toBeFalsy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <EmptyState testID="custom-empty" />
      </TestWrapper>,
    );

    expect(getByTestId('custom-empty')).toBeTruthy();
  });
});
