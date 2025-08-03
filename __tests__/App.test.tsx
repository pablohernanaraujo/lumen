import React from 'react';
import { App } from '../src/app';
import { render, createDualSnapshots } from '../src/test-utils';

describe('App', () => {
  createDualSnapshots(<App />);

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<App />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render correctly in light mode', () => {
      const { toJSON } = render(<App />, { mode: 'light' });
      expect(toJSON()).toMatchSnapshot('light-mode');
    });

    it('should render correctly in dark mode', () => {
      const { toJSON } = render(<App />, { mode: 'dark' });
      expect(toJSON()).toMatchSnapshot('dark-mode');
    });
  });

  describe('structure', () => {
    it('should render app structure correctly', () => {
      const { toJSON } = render(<App />);

      // This test verifies the app structure through snapshot
      expect(toJSON()).toBeTruthy();
      expect(toJSON()).toMatchSnapshot('app-structure');
    });
  });
});
