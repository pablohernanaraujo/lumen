import React, { type FC, type ReactElement } from 'react';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react-native';

import { ThemeProvider } from './theme';
import type { Mode } from './theme/types';

interface AllTheProvidersProps {
  children: React.ReactNode;
  mode?: Mode;
}

const AllTheProviders: FC<AllTheProvidersProps> = ({
  children,
  mode = 'light',
}) => <ThemeProvider preference={mode}>{children}</ThemeProvider>;

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mode?: Mode;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export const customRender = (
  ui: ReactElement,
  { mode = 'light', wrapper, ...renderOptions }: CustomRenderOptions = {},
): RenderResult => {
  const Wrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = <AllTheProviders mode={mode}>{children}</AllTheProviders>;

    return wrapper
      ? React.createElement(wrapper, { children: content })
      : content;
  };

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';

// Override the default render with our custom one
export { customRender as render };

// Create snapshot matcher helper
export const createSnapshot = (
  component: ReactElement,
  mode: Mode = 'light',
): void => {
  const { toJSON } = customRender(component, { mode });
  expect(toJSON()).toMatchSnapshot();
};

// Create both light and dark mode snapshots
export const createDualSnapshots = (component: ReactElement): void => {
  describe('snapshots', () => {
    it('should render correctly in light mode', () => {
      createSnapshot(component, 'light');
    });

    it('should render correctly in dark mode', () => {
      createSnapshot(component, 'dark');
    });
  });
};

// Export TestWrapper for use in tests
export const TestWrapper: FC<{ children: React.ReactNode; mode?: Mode }> = ({
  children,
  mode = 'light',
}) => <AllTheProviders mode={mode}>{children}</AllTheProviders>;
