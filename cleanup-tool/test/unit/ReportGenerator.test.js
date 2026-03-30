/**
 * Unit tests for ReportGenerator component
 */

import { ReportGenerator } from '../../src/ReportGenerator.js';

describe('ReportGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new ReportGenerator();
  });

  describe('generateReport', () => {
    test('should generate a complete markdown report', () => {
      const removalResults = {
        removed: [
          {
            operation: 'remove',
            type: 'file',
            path: 'OLD_GUIDE.md',
            category: 'documentation',
            reason: 'Redundant documentation file in category: general-setup',
            size: 1024,
            success: true
          },
          {
            operation: 'remove',
            type: 'file',
            path: 'package - Copy.json',
            category: 'config',
            reason: 'Duplicate configuration file (copy)',
            size: 2048,
            success: true
          }
        ],
        failed: [],
        errors: []
      };

      const plan = {
        documentationToRemove: [{ path: 'OLD_GUIDE.md', size: 1024 }],
        configsToRemove: [{ path: 'package - Copy.json', size: 2048 }],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        estimatedSpaceFreed: 3072,
        totalFilesAffected: 2,
        removalOrder: []
      };

      const report = generator.generateReport(removalResults, plan, 'backend');

      expect(report).toContain('# Project Cleanup Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('## Removed Files and Folders');
      expect(report).toContain('## Active Backend');
      expect(report).toContain('## Recovery Instructions');
      expect(report).toContain('backend');
    });

    test('should include failed operations section when failures exist', () => {
      const removalResults = {
        removed: [],
        failed: [
          {
            operation: 'remove',
            type: 'file',
            path: 'locked-file.md',
            error: 'Permission denied'
          }
        ],
        errors: []
      };

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        estimatedSpaceFreed: 0,
        totalFilesAffected: 0,
        removalOrder: []
      };

      const report = generator.generateReport(removalResults, plan);

      expect(report).toContain('## Failed Operations');
      expect(report).toContain('locked-file.md');
      expect(report).toContain('Permission denied');
    });

    test('should not include failed operations section when no failures', () => {
      const removalResults = {
        removed: [
          {
            operation: 'remove',
            type: 'file',
            path: 'test.md',
            category: 'documentation',
            reason: 'Test',
            size: 100,
            success: true
          }
        ],
        failed: [],
        errors: []
      };

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        estimatedSpaceFreed: 0,
        totalFilesAffected: 0,
        removalOrder: []
      };

      const report = generator.generateReport(removalResults, plan);

      expect(report).not.toContain('## Failed Operations');
    });

    test('should handle empty removal results', () => {
      const removalResults = {
        removed: [],
        failed: [],
        errors: []
      };

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        estimatedSpaceFreed: 0,
        totalFilesAffected: 0,
        removalOrder: []
      };

      const report = generator.generateReport(removalResults, plan);

      expect(report).toContain('# Project Cleanup Report');
      expect(report).toContain('No files or folders were removed');
    });
  });

  describe('calculateSpaceFreed', () => {
    test('should calculate total space freed from removed files', () => {
      const removedFiles = [
        { operation: 'remove', type: 'file', size: 1024 },
        { operation: 'remove', type: 'file', size: 2048 },
        { operation: 'remove', type: 'file', size: 512 }
      ];

      const spaceFreed = generator.calculateSpaceFreed(removedFiles);

      expect(spaceFreed).toBe(3584); // 1024 + 2048 + 512
    });

    test('should ignore directories when calculating space', () => {
      const removedFiles = [
        { operation: 'remove', type: 'file', size: 1024 },
        { operation: 'remove', type: 'directory', size: 0 },
        { operation: 'remove', type: 'file', size: 512 }
      ];

      const spaceFreed = generator.calculateSpaceFreed(removedFiles);

      expect(spaceFreed).toBe(1536); // 1024 + 512, directory ignored
    });

    test('should ignore copy operations when calculating space', () => {
      const removedFiles = [
        { operation: 'remove', type: 'file', size: 1024 },
        { operation: 'copy', type: 'file', size: 2048 },
        { operation: 'remove', type: 'file', size: 512 }
      ];

      const spaceFreed = generator.calculateSpaceFreed(removedFiles);

      expect(spaceFreed).toBe(1536); // 1024 + 512, copy ignored
    });

    test('should handle files without size property', () => {
      const removedFiles = [
        { operation: 'remove', type: 'file', size: 1024 },
        { operation: 'remove', type: 'file' }, // No size
        { operation: 'remove', type: 'file', size: 512 }
      ];

      const spaceFreed = generator.calculateSpaceFreed(removedFiles);

      expect(spaceFreed).toBe(1536); // 1024 + 512
    });

    test('should return 0 for empty array', () => {
      const spaceFreed = generator.calculateSpaceFreed([]);

      expect(spaceFreed).toBe(0);
    });
  });

  describe('categorizeRemovals', () => {
    test('should categorize removed files by type', () => {
      const removedFiles = [
        {
          operation: 'remove',
          type: 'file',
          path: 'doc1.md',
          category: 'documentation'
        },
        {
          operation: 'remove',
          type: 'file',
          path: 'doc2.md',
          category: 'documentation'
        },
        {
          operation: 'remove',
          type: 'file',
          path: 'config.json',
          category: 'config'
        },
        {
          operation: 'remove',
          type: 'directory',
          path: 'old-backend',
          category: 'backend'
        }
      ];

      const categorized = generator.categorizeRemovals(removedFiles);

      expect(categorized.size).toBe(3);
      expect(categorized.get('documentation')).toHaveLength(2);
      expect(categorized.get('config')).toHaveLength(1);
      expect(categorized.get('backend')).toHaveLength(1);
    });

    test('should skip copy operations', () => {
      const removedFiles = [
        {
          operation: 'copy',
          type: 'file',
          path: 'copied.js',
          category: 'code'
        },
        {
          operation: 'remove',
          type: 'file',
          path: 'removed.md',
          category: 'documentation'
        }
      ];

      const categorized = generator.categorizeRemovals(removedFiles);

      expect(categorized.size).toBe(1);
      expect(categorized.has('documentation')).toBe(true);
      expect(categorized.has('code')).toBe(false);
    });

    test('should handle files without category as "other"', () => {
      const removedFiles = [
        {
          operation: 'remove',
          type: 'file',
          path: 'unknown.xyz'
        }
      ];

      const categorized = generator.categorizeRemovals(removedFiles);

      expect(categorized.has('other')).toBe(true);
      expect(categorized.get('other')).toHaveLength(1);
    });

    test('should return empty map for empty array', () => {
      const categorized = generator.categorizeRemovals([]);

      expect(categorized.size).toBe(0);
    });

    test('should handle multiple files in same category', () => {
      const removedFiles = [
        {
          operation: 'remove',
          type: 'file',
          path: 'doc1.md',
          category: 'documentation'
        },
        {
          operation: 'remove',
          type: 'file',
          path: 'doc2.md',
          category: 'documentation'
        },
        {
          operation: 'remove',
          type: 'file',
          path: 'doc3.md',
          category: 'documentation'
        }
      ];

      const categorized = generator.categorizeRemovals(removedFiles);

      expect(categorized.get('documentation')).toHaveLength(3);
    });
  });

  describe('_formatBytes', () => {
    test('should format bytes correctly', () => {
      expect(generator._formatBytes(0)).toBe('0 Bytes');
      expect(generator._formatBytes(500)).toBe('500 Bytes');
      expect(generator._formatBytes(1024)).toBe('1 KB');
      expect(generator._formatBytes(1536)).toBe('1.5 KB');
      expect(generator._formatBytes(1048576)).toBe('1 MB');
      expect(generator._formatBytes(1572864)).toBe('1.5 MB');
      expect(generator._formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('_capitalizeFirst', () => {
    test('should capitalize first letter of string', () => {
      expect(generator._capitalizeFirst('hello')).toBe('Hello');
      expect(generator._capitalizeFirst('world')).toBe('World');
      expect(generator._capitalizeFirst('a')).toBe('A');
    });

    test('should handle already capitalized strings', () => {
      expect(generator._capitalizeFirst('Hello')).toBe('Hello');
      expect(generator._capitalizeFirst('WORLD')).toBe('WORLD');
    });

    test('should handle empty string', () => {
      expect(generator._capitalizeFirst('')).toBe('');
    });

    test('should handle null or undefined', () => {
      expect(generator._capitalizeFirst(null)).toBe('');
      expect(generator._capitalizeFirst(undefined)).toBe('');
    });
  });

  describe('_generateSummarySection', () => {
    test('should generate summary with correct statistics', () => {
      const removalResults = {
        removed: [
          {
            operation: 'remove',
            type: 'file',
            path: 'doc1.md',
            category: 'documentation',
            size: 1024
          },
          {
            operation: 'remove',
            type: 'file',
            path: 'config.json',
            category: 'config',
            size: 2048
          }
        ],
        failed: [
          {
            operation: 'remove',
            path: 'locked.md',
            error: 'Permission denied'
          }
        ],
        errors: []
      };

      const plan = {};

      const summary = generator._generateSummarySection(removalResults, plan);

      expect(summary).toContain('Total files/folders removed:** 2');
      expect(summary).toContain('Failed operations:** 1');
      expect(summary).toContain('3 KB'); // 1024 + 2048 = 3072 bytes = 3 KB
      expect(summary).toContain('Documentation files: 1');
      expect(summary).toContain('Duplicate configuration files: 1');
    });

    test('should show zero counts when no files removed', () => {
      const removalResults = {
        removed: [],
        failed: [],
        errors: []
      };

      const plan = {};

      const summary = generator._generateSummarySection(removalResults, plan);

      expect(summary).toContain('Total files/folders removed:** 0');
      expect(summary).toContain('Failed operations:** 0');
      expect(summary).toContain('0 Bytes');
      expect(summary).toContain('Documentation files: 0');
      expect(summary).toContain('Duplicate configuration files: 0');
      expect(summary).toContain('Obsolete backend folders: 0');
    });
  });

  describe('_generateRecoveryInstructions', () => {
    test('should generate git recovery instructions', () => {
      const instructions = generator._generateRecoveryInstructions();

      expect(instructions).toContain('git status');
      expect(instructions).toContain('git checkout -- <file-path>');
      expect(instructions).toContain('git reset --hard HEAD');
      expect(instructions).toContain('committed all changes');
    });
  });
});
