/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-nested-callbacks */
import { analyticsService } from '../analytics-service';

// Mock console methods to avoid test noise
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService.clearEvents();
    analyticsService.setEnabled(true);
  });

  describe('Basic functionality', () => {
    it('should track events when enabled', () => {
      analyticsService.track('address_saved', {
        blockchain_type: 'Bitcoin',
        source: 'scanner',
        is_duplicate: false,
        usage_count: 1,
      });

      const summary = analyticsService.getSummary();
      expect(summary.totalEvents).toBe(1);
      expect(summary.recentEvents).toHaveLength(1);
      expect(summary.recentEvents[0].name).toBe('address_saved');
    });

    it('should not track events when disabled', () => {
      analyticsService.setEnabled(false);

      analyticsService.track('address_saved', {
        blockchain_type: 'Bitcoin',
        source: 'scanner',
        is_duplicate: false,
        usage_count: 1,
      });

      const summary = analyticsService.getSummary();
      expect(summary.totalEvents).toBe(0);
      expect(summary.isEnabled).toBe(false);
    });

    it('should export events correctly', () => {
      analyticsService.track('address_favorited', {
        blockchain_type: 'Ethereum',
        previous_usage_count: 2,
        is_favoriting: true,
      });

      const events = analyticsService.exportEvents();
      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('address_favorited');
      expect(events[0].properties.blockchain_type).toBe('Ethereum');
      expect(events[0].timestamp).toBeDefined();
    });

    it('should clear events', () => {
      analyticsService.track('address_saved', {
        blockchain_type: 'Bitcoin',
        source: 'scanner',
        is_duplicate: false,
        usage_count: 1,
      });

      expect(analyticsService.getSummary().totalEvents).toBe(1);

      analyticsService.clearEvents();

      expect(analyticsService.getSummary().totalEvents).toBe(0);
    });
  });

  describe('Scanner session tracking', () => {
    it('should start and end scanner sessions', () => {
      analyticsService.startScannerSession('tab_navigation');

      const summary = analyticsService.getSummary();
      expect(summary.currentSession).toBeDefined();
      expect(summary.totalEvents).toBe(1);

      analyticsService.endScannerSession();

      const finalSummary = analyticsService.getSummary();
      expect(finalSummary.currentSession).toBeNull();
      expect(finalSummary.totalEvents).toBe(2); // scanner_opened + scanner_closed
    });

    it('should track successful scans with session', () => {
      analyticsService.startScannerSession('history_screen');
      const scanStartTime = Date.now() - 1000; // 1 second ago

      analyticsService.trackSuccessfulScan(
        'Bitcoin',
        scanStartTime,
        'NativeSegWit',
        true, // has amount
        false, // no label
      );

      const events = analyticsService.exportEvents();
      const scanEvent = events.find((e) => e.name === 'qr_scanned_success');

      expect(scanEvent).toBeDefined();
      expect(scanEvent!.properties.blockchain_type).toBe('Bitcoin');
      expect(scanEvent!.properties.address_type).toBe('NativeSegWit');
      expect(scanEvent!.properties.has_amount).toBe(true);
      expect(scanEvent!.properties.has_label).toBe(false);
      expect(scanEvent!.properties.scan_duration_ms).toBeGreaterThan(0);
    });

    it('should track failed scans with session', () => {
      analyticsService.startScannerSession('scanner_tab');
      const scanStartTime = Date.now() - 500; // 500ms ago

      analyticsService.trackFailedScan('invalid_qr', scanStartTime);

      const events = analyticsService.exportEvents();
      const failEvent = events.find((e) => e.name === 'qr_scanned_error');

      expect(failEvent).toBeDefined();
      expect(failEvent!.properties.error_type).toBe('invalid_qr');
      expect(failEvent!.properties.scan_duration_ms).toBeGreaterThan(0);
    });

    it('should handle tracking without active session', () => {
      // Ensure no session is active by ending any existing session
      analyticsService.endScannerSession();
      analyticsService.clearEvents(); // Clear any session events

      const scanStartTime = Date.now() - 1000;

      // Should not crash, but should log warning
      analyticsService.trackSuccessfulScan('Bitcoin', scanStartTime);
      analyticsService.trackFailedScan('timeout', scanStartTime);

      // Events shouldn't be tracked without session
      const events = analyticsService.exportEvents();
      expect(events.filter((e) => e.name.includes('qr_scanned'))).toHaveLength(
        0,
      );
    });
  });

  describe('Storage event tracking', () => {
    it('should track address operations', () => {
      // Test all address-related events
      analyticsService.track('address_saved', {
        blockchain_type: 'Bitcoin',
        source: 'scanner',
        is_duplicate: false,
        usage_count: 1,
      });

      analyticsService.track('address_favorited', {
        blockchain_type: 'Bitcoin',
        previous_usage_count: 1,
        is_favoriting: true,
      });

      analyticsService.track('address_labeled', {
        blockchain_type: 'Bitcoin',
        label_length: 12,
        is_editing: false,
      });

      analyticsService.track('address_deleted', {
        blockchain_type: 'Bitcoin',
        usage_count: 1,
        was_favorite: true,
        had_label: true,
      });

      const events = analyticsService.exportEvents();
      expect(events).toHaveLength(4);
      expect(events.map((e) => e.name)).toEqual([
        'address_saved',
        'address_favorited',
        'address_labeled',
        'address_deleted',
      ]);
    });
  });

  describe('History event tracking', () => {
    it('should track history interactions', () => {
      analyticsService.track('history_opened', {
        source_screen: 'tab_navigation',
        total_addresses: 25,
        favorites_count: 5,
      });

      analyticsService.track('history_searched', {
        query_length: 8,
        results_count: 3,
      });

      analyticsService.track('history_filtered', {
        filter_type: 'network',
        results_count: 10,
      });

      analyticsService.track('address_details_viewed', {
        blockchain_type: 'Ethereum',
        usage_count: 3,
        has_label: true,
        is_favorite: false,
      });

      const events = analyticsService.exportEvents();
      expect(events).toHaveLength(4);

      const historyEvent = events.find((e) => e.name === 'history_opened');
      expect(historyEvent!.properties.total_addresses).toBe(25);
      expect(historyEvent!.properties.favorites_count).toBe(5);
    });
  });

  describe('Event management', () => {
    it('should limit stored events to maximum', () => {
      // Track more events than the limit (1000)
      for (let i = 0; i < 1100; i++) {
        analyticsService.track('address_saved', {
          blockchain_type: 'Bitcoin',
          source: 'scanner',
          is_duplicate: false,
          usage_count: i,
        });
      }

      const summary = analyticsService.getSummary();
      expect(summary.totalEvents).toBe(1000); // Should be capped at max
    });

    it('should handle flush operation', async () => {
      analyticsService.track('address_saved', {
        blockchain_type: 'Bitcoin',
        source: 'scanner',
        is_duplicate: false,
        usage_count: 1,
      });

      // Should not throw error
      await expect(analyticsService.flushEvents()).resolves.toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle tracking errors gracefully', () => {
      // Force an error by passing invalid data
      expect(() => {
        analyticsService.track('address_saved' as any, null as any);
      }).not.toThrow();
    });
  });
});
