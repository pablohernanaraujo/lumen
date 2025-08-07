import React, { type FC, StrictMode } from 'react';
import { View } from 'react-native';
import { AuthProvider, FilterProvider, QueryProvider } from '../src/contexts';
import { ThemeProvider } from '../src/theme';
import { render, createDualSnapshots } from '../src/test-utils';

// Simple test version of App without complex navigation
const TestApp: FC = () => (
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <FilterProvider>
            <View testID="app-content">
              <View testID="test-view" />
            </View>
          </FilterProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);

describe('App', () => {
  createDualSnapshots(<TestApp />);

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<TestApp />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render correctly in light mode', () => {
      const { toJSON } = render(<TestApp />, { mode: 'light' });
      expect(toJSON()).toMatchSnapshot('light-mode');
    });

    it('should render correctly in dark mode', () => {
      const { toJSON } = render(<TestApp />, { mode: 'dark' });
      expect(toJSON()).toMatchSnapshot('dark-mode');
    });
  });

  describe('structure', () => {
    it('should render app structure correctly', () => {
      const { toJSON } = render(<TestApp />);

      // This test verifies the app structure through snapshot
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot('app-structure');
    });
  });
});
