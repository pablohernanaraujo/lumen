import React from 'react';
import { render } from '@testing-library/react-native';

import { TestWrapper } from '../../../test-utils';
import { SkeletonLoader } from '../skeleton-loader';

describe('SkeletonLoader', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader />
      </TestWrapper>,
    );

    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });

  it('should render with circle variant', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader variant="circle" />
      </TestWrapper>,
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should render with text variant', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader variant="text" />
      </TestWrapper>,
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should render with crypto-item variant', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader variant="crypto-item" />
      </TestWrapper>,
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should accept custom width and height', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader width={200} height={50} />
      </TestWrapper>,
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader testID="custom-skeleton" />
      </TestWrapper>,
    );

    expect(getByTestId('custom-skeleton')).toBeTruthy();
  });

  it('should render without animation when animate is false', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SkeletonLoader animate={false} />
      </TestWrapper>,
    );

    const skeleton = getByTestId('skeleton-loader');
    expect(skeleton).toBeTruthy();
  });
});
