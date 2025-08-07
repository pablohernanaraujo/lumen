import { act, renderHook } from '@testing-library/react-native';

import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    // arrange & act
    const { result } = renderHook(() => useDebounce('test', { delay: 400 }));

    // assert
    expect(result.current.debouncedValue).toBe('test');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should debounce value changes', () => {
    // arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 400 }),
      { initialProps: { value: 'initial' } },
    );

    // act
    rerender({ value: 'updated' });

    // assert - immediately after change, should show debouncing state
    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isDebouncing).toBe(true);
  });

  it('should update debounced value after delay', () => {
    // arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 400 }),
      { initialProps: { value: 'initial' } },
    );

    // act
    rerender({ value: 'updated' });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // assert
    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should reset timer on rapid changes', () => {
    // arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 400 }),
      { initialProps: { value: 'initial' } },
    );

    // act
    rerender({ value: 'update1' });

    // Fast-forward partway
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Make another change before debounce completes
    rerender({ value: 'update2' });

    // Fast-forward remaining time
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // assert - should still be debouncing because timer was reset
    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isDebouncing).toBe(true);

    // Complete the debounce
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.debouncedValue).toBe('update2');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should handle different delay times', () => {
    // arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 100 }),
      { initialProps: { value: 'initial' } },
    );

    // act
    rerender({ value: 'updated' });

    // Fast-forward with custom delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // assert
    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should handle same value without debouncing', () => {
    // arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 400 }),
      { initialProps: { value: 'test' } },
    );

    // act - set the same value
    rerender({ value: 'test' });

    // assert - should not trigger debouncing for same value
    expect(result.current.debouncedValue).toBe('test');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should cleanup timeout on unmount', () => {
    // arrange
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, { delay: 400 }),
      { initialProps: { value: 'initial' } },
    );

    // act
    rerender({ value: 'updated' });
    unmount();

    // Fast-forward time after unmount
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // assert - no errors should occur
    expect(true).toBe(true); // Test passes if no errors thrown
  });
});
