/**
 * Unit tests for DocumentationAnalyzer
 */

import { DocumentationAnalyzer } from '../../src/DocumentationAnalyzer.js';

describe('DocumentationAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new DocumentationAnalyzer();
  });

  describe('extractTopic', () => {
    test('should categorize database-related files', () => {
      expect(analyzer.extractTopic('DATABASE_FIX_INDEX.md')).toBe('database-fixes');
      expect(analyzer.extractTopic('MONGODB_CONNECTION.md')).toBe('database-fixes');
      expect(analyzer.extractTopic('db_setup.txt')).toBe('database-fixes');
    });

    test('should categorize login-related files', () => {
      expect(analyzer.extractTopic('LOGIN_TROUBLESHOOTING.md')).toBe('login-fixes');
      expect(analyzer.extractTopic('AUTH_GUIDE.md')).toBe('login-fixes');
      expect(analyzer.extractTopic('authentication_setup.md')).toBe('login-fixes');
    });

    test('should categorize deployment-related files', () => {
      expect(analyzer.extractTopic('DEPLOY_HOSTINGER_PAKET_BIASA.md')).toBe('deployment');
      expect(analyzer.extractTopic('PRODUCTION_SETUP.md')).toBe('deployment');
      expect(analyzer.extractTopic('hosting_guide.txt')).toBe('deployment');
    });

    test('should categorize payment-related files', () => {
      expect(analyzer.extractTopic('MIDTRANS_SETUP_GUIDE.md')).toBe('payment-setup');
      expect(analyzer.extractTopic('PAYMENT_INTEGRATION.md')).toBe('payment-setup');
      expect(analyzer.extractTopic('transaction_fix.md')).toBe('payment-setup');
    });

    test('should categorize general setup files', () => {
      expect(analyzer.extractTopic('QUICK_START.md')).toBe('general-setup');
      expect(analyzer.extractTopic('SETUP_CHECKLIST.md')).toBe('general-setup');
      expect(analyzer.extractTopic('INSTALL_GUIDE.md')).toBe('general-setup');
    });

    test('should categorize troubleshooting files', () => {
      expect(analyzer.extractTopic('TROUBLESHOOTING_GUIDE.md')).toBe('troubleshooting');
      expect(analyzer.extractTopic('FIX_COMMON_ERRORS.md')).toBe('troubleshooting');
      expect(analyzer.extractTopic('PROBLEM_SOLVING.md')).toBe('troubleshooting');
    });

    test('should default to general-setup for unrecognized files', () => {
      expect(analyzer.extractTopic('README.md')).toBe('general-setup');
      expect(analyzer.extractTopic('NOTES.txt')).toBe('general-setup');
    });

    test('should handle case-insensitive matching', () => {
      expect(analyzer.extractTopic('database_fix.md')).toBe('database-fixes');
      expect(analyzer.extractTopic('Login_Guide.md')).toBe('login-fixes');
      expect(analyzer.extractTopic('midtrans_setup.md')).toBe('payment-setup');
    });
  });

  describe('categorizeDocuments', () => {
    test('should categorize multiple files correctly', () => {
      const files = [
        { name: 'DATABASE_FIX.md', path: 'DATABASE_FIX.md', size: 100, modifiedTime: new Date() },
        { name: 'LOGIN_GUIDE.md', path: 'LOGIN_GUIDE.md', size: 200, modifiedTime: new Date() },
        { name: 'MIDTRANS_SETUP.md', path: 'MIDTRANS_SETUP.md', size: 300, modifiedTime: new Date() }
      ];

      const categorized = analyzer.categorizeDocuments(files);

      expect(categorized.get('database-fixes')).toHaveLength(1);
      expect(categorized.get('login-fixes')).toHaveLength(1);
      expect(categorized.get('payment-setup')).toHaveLength(1);
      expect(categorized.get('deployment')).toHaveLength(0);
    });

    test('should add category property to each file', () => {
      const files = [
        { name: 'DATABASE_FIX.md', path: 'DATABASE_FIX.md', size: 100, modifiedTime: new Date() }
      ];

      const categorized = analyzer.categorizeDocuments(files);
      const dbFiles = categorized.get('database-fixes');

      expect(dbFiles[0]).toHaveProperty('category', 'database-fixes');
    });

    test('should handle empty file list', () => {
      const categorized = analyzer.categorizeDocuments([]);

      // All categories should exist but be empty
      expect(categorized.get('database-fixes')).toHaveLength(0);
      expect(categorized.get('login-fixes')).toHaveLength(0);
    });

    test('should handle multiple files in same category', () => {
      const files = [
        { name: 'DATABASE_FIX_1.md', path: 'DATABASE_FIX_1.md', size: 100, modifiedTime: new Date() },
        { name: 'DATABASE_FIX_2.md', path: 'DATABASE_FIX_2.md', size: 200, modifiedTime: new Date() },
        { name: 'MONGODB_GUIDE.md', path: 'MONGODB_GUIDE.md', size: 300, modifiedTime: new Date() }
      ];

      const categorized = analyzer.categorizeDocuments(files);

      expect(categorized.get('database-fixes')).toHaveLength(3);
    });
  });

  describe('identifyRedundant', () => {
    test('should keep INDEX files over other files', () => {
      const categorized = new Map([
        ['database-fixes', [
          { name: 'DATABASE_FIX.md', path: 'DATABASE_FIX.md', size: 100, modifiedTime: new Date('2024-01-01') },
          { name: 'DATABASE_INDEX.md', path: 'DATABASE_INDEX.md', size: 200, modifiedTime: new Date('2024-01-01') }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(1);
      expect(result.toKeep[0].name).toBe('DATABASE_INDEX.md');
      expect(result.toRemove).toHaveLength(1);
      expect(result.toRemove[0].name).toBe('DATABASE_FIX.md');
    });

    test('should keep SUMMARY/GUIDE files over FIX files', () => {
      const categorized = new Map([
        ['payment-setup', [
          { name: 'PAYMENT_FIX.md', path: 'PAYMENT_FIX.md', size: 100, modifiedTime: new Date('2024-01-01') },
          { name: 'PAYMENT_GUIDE.md', path: 'PAYMENT_GUIDE.md', size: 200, modifiedTime: new Date('2024-01-01') }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(1);
      expect(result.toKeep[0].name).toBe('PAYMENT_GUIDE.md');
      expect(result.toRemove).toHaveLength(1);
      expect(result.toRemove[0].name).toBe('PAYMENT_FIX.md');
    });

    test('should keep most recent file when priorities are equal', () => {
      const categorized = new Map([
        ['deployment', [
          { name: 'DEPLOY_OLD.md', path: 'DEPLOY_OLD.md', size: 100, modifiedTime: new Date('2024-01-01') },
          { name: 'DEPLOY_NEW.md', path: 'DEPLOY_NEW.md', size: 200, modifiedTime: new Date('2024-02-01') }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(1);
      expect(result.toKeep[0].name).toBe('DEPLOY_NEW.md');
      expect(result.toRemove).toHaveLength(1);
      expect(result.toRemove[0].name).toBe('DEPLOY_OLD.md');
    });

    test('should keep single file in category', () => {
      const categorized = new Map([
        ['login-fixes', [
          { name: 'LOGIN_GUIDE.md', path: 'LOGIN_GUIDE.md', size: 100, modifiedTime: new Date() }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(1);
      expect(result.toKeep[0].name).toBe('LOGIN_GUIDE.md');
      expect(result.toRemove).toHaveLength(0);
    });

    test('should handle empty categories', () => {
      const categorized = new Map([
        ['database-fixes', []],
        ['login-fixes', []]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(0);
      expect(result.toRemove).toHaveLength(0);
    });

    test('should handle multiple categories with redundancies', () => {
      const categorized = new Map([
        ['database-fixes', [
          { name: 'DB_FIX.md', path: 'DB_FIX.md', size: 100, modifiedTime: new Date('2024-01-01') },
          { name: 'DB_INDEX.md', path: 'DB_INDEX.md', size: 200, modifiedTime: new Date('2024-01-01') }
        ]],
        ['payment-setup', [
          { name: 'PAYMENT_OLD.md', path: 'PAYMENT_OLD.md', size: 100, modifiedTime: new Date('2024-01-01') },
          { name: 'PAYMENT_NEW.md', path: 'PAYMENT_NEW.md', size: 200, modifiedTime: new Date('2024-02-01') }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(2);
      expect(result.toRemove).toHaveLength(2);
      expect(result.toKeep.map(f => f.name)).toContain('DB_INDEX.md');
      expect(result.toKeep.map(f => f.name)).toContain('PAYMENT_NEW.md');
    });

    test('should prioritize INDEX > SUMMARY > FIX correctly', () => {
      const categorized = new Map([
        ['troubleshooting', [
          { name: 'TROUBLESHOOTING_FIX.md', path: 'TROUBLESHOOTING_FIX.md', size: 100, modifiedTime: new Date('2024-01-03') },
          { name: 'TROUBLESHOOTING_SUMMARY.md', path: 'TROUBLESHOOTING_SUMMARY.md', size: 200, modifiedTime: new Date('2024-01-02') },
          { name: 'TROUBLESHOOTING_INDEX.md', path: 'TROUBLESHOOTING_INDEX.md', size: 300, modifiedTime: new Date('2024-01-01') }
        ]]
      ]);

      const result = analyzer.identifyRedundant(categorized);

      expect(result.toKeep).toHaveLength(1);
      expect(result.toKeep[0].name).toBe('TROUBLESHOOTING_INDEX.md');
      expect(result.toRemove).toHaveLength(2);
    });
  });
});
