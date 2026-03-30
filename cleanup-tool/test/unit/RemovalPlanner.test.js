/**
 * Unit tests for RemovalPlanner component
 */

import { RemovalPlanner } from '../../src/RemovalPlanner.js';

describe('RemovalPlanner', () => {
  let planner;

  beforeEach(() => {
    planner = new RemovalPlanner();
  });

  describe('createPlan', () => {
    test('should create a removal plan with all components', () => {
      const analysisResults = {
        documentationToRemove: [
          { path: 'OLD_GUIDE.md', name: 'OLD_GUIDE.md', size: 1024, category: 'general-setup' },
          { path: 'DEPRECATED.txt', name: 'DEPRECATED.txt', size: 512, category: 'troubleshooting' }
        ],
        configsToRemove: [
          { path: 'package - Copy.json', name: 'package - Copy.json', size: 2048 }
        ],
        obsoleteBackend: 'Backend-Draftin-Clean',
        uniqueFilesToCopy: [
          { relativePath: 'models/User.js', source: 'Backend-Draftin-Clean/models/User.js', destination: 'backend/models/User.js' }
        ]
      };

      const plan = planner.createPlan(analysisResults);

      expect(plan).toHaveProperty('documentationToRemove');
      expect(plan).toHaveProperty('configsToRemove');
      expect(plan).toHaveProperty('backendToRemove');
      expect(plan).toHaveProperty('uniqueFilesToCopy');
      expect(plan).toHaveProperty('estimatedSpaceFreed');
      expect(plan).toHaveProperty('totalFilesAffected');
      expect(plan).toHaveProperty('removalOrder');

      expect(plan.documentationToRemove).toHaveLength(2);
      expect(plan.configsToRemove).toHaveLength(1);
      expect(plan.backendToRemove).toBe('Backend-Draftin-Clean');
      expect(plan.uniqueFilesToCopy).toHaveLength(1);
    });

    test('should calculate total files affected correctly', () => {
      const analysisResults = {
        documentationToRemove: [
          { path: 'file1.md', size: 100 },
          { path: 'file2.md', size: 200 }
        ],
        configsToRemove: [
          { path: 'config - Copy.json', size: 300 }
        ],
        obsoleteBackend: 'old-backend',
        uniqueFilesToCopy: []
      };

      const plan = planner.createPlan(analysisResults);

      // 2 docs + 1 config + 1 backend folder = 4
      expect(plan.totalFilesAffected).toBe(4);
    });

    test('should calculate estimated space freed correctly', () => {
      const analysisResults = {
        documentationToRemove: [
          { path: 'file1.md', size: 1000 },
          { path: 'file2.md', size: 2000 }
        ],
        configsToRemove: [
          { path: 'config - Copy.json', size: 3000 }
        ],
        obsoleteBackend: null,
        uniqueFilesToCopy: []
      };

      const plan = planner.createPlan(analysisResults);

      // 1000 + 2000 + 3000 = 6000 bytes
      expect(plan.estimatedSpaceFreed).toBe(6000);
    });

    test('should handle empty analysis results', () => {
      const analysisResults = {
        documentationToRemove: [],
        configsToRemove: [],
        obsoleteBackend: null,
        uniqueFilesToCopy: []
      };

      const plan = planner.createPlan(analysisResults);

      expect(plan.totalFilesAffected).toBe(0);
      expect(plan.estimatedSpaceFreed).toBe(0);
      expect(plan.removalOrder).toHaveLength(0);
    });

    test('should handle missing properties in analysis results', () => {
      const analysisResults = {};

      const plan = planner.createPlan(analysisResults);

      expect(plan.documentationToRemove).toEqual([]);
      expect(plan.configsToRemove).toEqual([]);
      expect(plan.backendToRemove).toBeNull();
      expect(plan.uniqueFilesToCopy).toEqual([]);
    });
  });

  describe('prioritizeRemovals', () => {
    test('should order removals correctly: docs → configs → backend', () => {
      const filesToRemove = {
        documentationToRemove: [
          { path: 'doc1.md', size: 100, category: 'general' }
        ],
        configsToRemove: [
          { path: 'config - Copy.json', size: 200 }
        ],
        obsoleteBackend: 'old-backend'
      };

      const removalOrder = planner.prioritizeRemovals(filesToRemove);

      expect(removalOrder).toHaveLength(3);
      
      // Check order by priority
      expect(removalOrder[0].priority).toBe(RemovalPlanner.REMOVAL_PRIORITY.DOCUMENTATION);
      expect(removalOrder[0].category).toBe('documentation');
      
      expect(removalOrder[1].priority).toBe(RemovalPlanner.REMOVAL_PRIORITY.CONFIGS);
      expect(removalOrder[1].category).toBe('config');
      
      expect(removalOrder[2].priority).toBe(RemovalPlanner.REMOVAL_PRIORITY.BACKEND);
      expect(removalOrder[2].category).toBe('backend');
    });

    test('should include correct metadata for each removal operation', () => {
      const filesToRemove = {
        documentationToRemove: [
          { path: 'OLD_GUIDE.md', size: 1024, category: 'deployment' }
        ],
        configsToRemove: [],
        obsoleteBackend: null
      };

      const removalOrder = planner.prioritizeRemovals(filesToRemove);

      expect(removalOrder).toHaveLength(1);
      expect(removalOrder[0]).toMatchObject({
        priority: RemovalPlanner.REMOVAL_PRIORITY.DOCUMENTATION,
        type: 'file',
        category: 'documentation',
        path: 'OLD_GUIDE.md',
        size: 1024
      });
      expect(removalOrder[0].reason).toContain('deployment');
    });

    test('should handle multiple files of same priority', () => {
      const filesToRemove = {
        documentationToRemove: [
          { path: 'doc1.md', size: 100, category: 'general' },
          { path: 'doc2.md', size: 200, category: 'setup' },
          { path: 'doc3.md', size: 300, category: 'troubleshooting' }
        ],
        configsToRemove: [],
        obsoleteBackend: null
      };

      const removalOrder = planner.prioritizeRemovals(filesToRemove);

      expect(removalOrder).toHaveLength(3);
      // All should have same priority
      expect(removalOrder.every(op => op.priority === RemovalPlanner.REMOVAL_PRIORITY.DOCUMENTATION)).toBe(true);
    });

    test('should mark backend removal as directory type', () => {
      const filesToRemove = {
        documentationToRemove: [],
        configsToRemove: [],
        obsoleteBackend: 'Backend-Draftin-Clean'
      };

      const removalOrder = planner.prioritizeRemovals(filesToRemove);

      expect(removalOrder).toHaveLength(1);
      expect(removalOrder[0].type).toBe('directory');
      expect(removalOrder[0].path).toBe('Backend-Draftin-Clean');
    });

    test('should handle empty input', () => {
      const filesToRemove = {
        documentationToRemove: [],
        configsToRemove: [],
        obsoleteBackend: null
      };

      const removalOrder = planner.prioritizeRemovals(filesToRemove);

      expect(removalOrder).toHaveLength(0);
    });
  });

  describe('formatPlanSummary', () => {
    test('should format plan summary as readable text with enhanced preview', () => {
      const plan = {
        documentationToRemove: [
          { path: 'OLD.md', category: 'general', size: 1024 }
        ],
        configsToRemove: [
          { path: 'config - Copy.json', size: 2048 }
        ],
        backendToRemove: 'old-backend',
        uniqueFilesToCopy: [
          { relativePath: 'models/User.js' }
        ],
        totalFilesAffected: 3,
        estimatedSpaceFreed: 5000,
        removalOrder: []
      };

      const summary = planner.formatPlanSummary(plan);

      // Check for enhanced preview headers
      expect(summary).toContain('CLEANUP PREVIEW - FILES TO BE REMOVED');
      expect(summary).toContain('📊 SUMMARY');
      expect(summary).toContain('Total items to remove: 3');
      
      // Check for categorized sections
      expect(summary).toContain('📄 DOCUMENTATION FILES');
      expect(summary).toContain('Count: 1 files');
      expect(summary).toContain('Reason: Redundant or outdated documentation');
      expect(summary).toContain('Category: general');
      expect(summary).toContain('OLD.md');
      
      expect(summary).toContain('⚙️  DUPLICATE CONFIGURATION FILES');
      expect(summary).toContain('Count: 1 files');
      expect(summary).toContain('Reason: Duplicate copies (originals will be preserved)');
      expect(summary).toContain('config - Copy.json');
      
      expect(summary).toContain('📁 OBSOLETE BACKEND FOLDER');
      expect(summary).toContain('Path: old-backend');
      expect(summary).toContain('Reason: Not actively used (active backend identified)');
      expect(summary).toContain('Unique files to preserve (will be copied first)');
      expect(summary).toContain('models/User.js');
      
      // Check for execution order
      expect(summary).toContain('🔄 EXECUTION ORDER');
      expect(summary).toContain('1. Documentation files (lowest risk)');
      expect(summary).toContain('2. Duplicate configuration files (medium risk)');
      expect(summary).toContain('3. Obsolete backend folder (highest risk)');
      
      // Check for safety checks
      expect(summary).toContain('🛡️  SAFETY CHECKS');
      expect(summary).toContain('Essential files will be preserved');
      expect(summary).toContain('Active code will not be removed');
      expect(summary).toContain('Git history will remain intact');
    });

    test('should display file sizes in preview', () => {
      const plan = {
        documentationToRemove: [
          { path: 'OLD.md', category: 'general', size: 1536 }
        ],
        configsToRemove: [
          { path: 'config - Copy.json', size: 2048 }
        ],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        totalFilesAffected: 2,
        estimatedSpaceFreed: 3584,
        removalOrder: []
      };

      const summary = planner.formatPlanSummary(plan);

      expect(summary).toContain('OLD.md (1.5 KB)');
      expect(summary).toContain('config - Copy.json (2 KB)');
      expect(summary).toContain('Estimated space freed: 3.5 KB');
    });

    test('should group documentation files by category', () => {
      const plan = {
        documentationToRemove: [
          { path: 'DB_FIX.md', category: 'database-fixes', size: 1024 },
          { path: 'DB_GUIDE.md', category: 'database-fixes', size: 2048 },
          { path: 'DEPLOY.md', category: 'deployment', size: 512 }
        ],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        totalFilesAffected: 3,
        estimatedSpaceFreed: 3584,
        removalOrder: []
      };

      const summary = planner.formatPlanSummary(plan);

      expect(summary).toContain('Category: database-fixes');
      expect(summary).toContain('DB_FIX.md');
      expect(summary).toContain('DB_GUIDE.md');
      expect(summary).toContain('Category: deployment');
      expect(summary).toContain('DEPLOY.md');
    });

    test('should handle plan with no removals', () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        totalFilesAffected: 0,
        estimatedSpaceFreed: 0,
        removalOrder: []
      };

      const summary = planner.formatPlanSummary(plan);

      expect(summary).toContain('Total items to remove: 0');
      expect(summary).toContain('0 Bytes');
      expect(summary).toContain('SAFETY CHECKS');
    });

    test('should handle documentation without backend removal', () => {
      const plan = {
        documentationToRemove: [
          { path: 'OLD.md', category: 'general', size: 1024 }
        ],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: [],
        totalFilesAffected: 1,
        estimatedSpaceFreed: 1024,
        removalOrder: []
      };

      const summary = planner.formatPlanSummary(plan);

      expect(summary).toContain('📄 DOCUMENTATION FILES');
      expect(summary).not.toContain('📁 OBSOLETE BACKEND FOLDER');
      expect(summary).not.toContain('⚙️  DUPLICATE CONFIGURATION FILES');
    });
  });

  describe('_formatBytes', () => {
    test('should format bytes correctly', () => {
      expect(planner._formatBytes(0)).toBe('0 Bytes');
      expect(planner._formatBytes(500)).toBe('500 Bytes');
      expect(planner._formatBytes(1024)).toBe('1 KB');
      expect(planner._formatBytes(1536)).toBe('1.5 KB');
      expect(planner._formatBytes(1048576)).toBe('1 MB');
      expect(planner._formatBytes(1572864)).toBe('1.5 MB');
      expect(planner._formatBytes(1073741824)).toBe('1 GB');
    });
  });
});
