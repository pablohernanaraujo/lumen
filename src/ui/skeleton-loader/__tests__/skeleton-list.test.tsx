import React from 'react';
import { render } from '@testing-library/react-native';

import { TestWrapper } from '../../../test-utils';
import { SkeletonList } from '../skeleton-list';

describe('SkeletonList', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonList />
      </TestWrapper>,
    );

    expect(getByTestId('skeleton-list')).toBeTruthy();
  });

  it('should render specified number of items', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonList count={3} />
      </TestWrapper>,
    );

    expect(getByTestId('skeleton-list-item-0')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-1')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-2')).toBeTruthy();
  });

  it('should render crypto-item variant', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonList count={2} variant="crypto-item" />
      </TestWrapper>,
    );

    expect(getByTestId('skeleton-list')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-0')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-1')).toBeTruthy();
  });

  it('should render default variant', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonList count={2} variant="default" />
      </TestWrapper>,
    );

    expect(getByTestId('skeleton-list')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-0')).toBeTruthy();
    expect(getByTestId('skeleton-list-item-1')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonList testID="custom-list" count={1} />
      </TestWrapper>,
    );

    expect(getByTestId('custom-list')).toBeTruthy();
    expect(getByTestId('custom-list-item-0')).toBeTruthy();
  });
});
