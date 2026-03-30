/**
 * Unit tests for SafetyValidator component
 */

import { SafetyValidator } from '../../src/SafetyValidator.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('SafetyValidator', () => {
  let testDir;
  let validator;

  beforeEach(async () => {
    validator = new SafetyValidator();
    testDir = join(__dirname, 'test-project-validator');
    
    // Create test directory structure
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('verifyEssentialFilesPreserved', () => {
    test('should flag essential files in documentation removal list', () => {
      const plan = {
        documentationToRemove: [
          { path: 'package.json', size: 1000 },
          { path: 'README.md', size: 500 }
        ],
        configsToRemove: [],
        backendToRemove: null
      };

      const issues = validator.verifyEssentialFilesPreserved(plan);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('package.json');
    });

    test('should flag essential files in config removal list', () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [
          { path: '.env', size: 100 },
          { path: 'config - Copy.js', size: 200 }
        ],
        backendToRemove: null
      };

      const issues = validator.verifyEssentialFilesPreserved(plan);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('.env');
    });

    test('should not flag non-essential files', () => {
      const plan = {
        documentationToRemove: [
          { path: 'OLD_GUIDE.md', size: 500 }
        ],
        configsToRemove: [
          { path: 'vite.config - Copy.ts', size: 200 }
        ],
        backendToRemove: null
      };

      const issues = validator.verifyEssentialFilesPreserved(plan);
      
      expect(issues.length).toBe(0);
    });

    test('should flag .gitignore files', () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [
          { path: 'frontend/.gitignore', size: 50 }
        ],
        backendToRemove: null
      };

      const issues = validator.verifyEssentialFilesPreserved(plan);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toContain('.gitignore');
    });

    test('should handle empty removal lists', () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null
      };

      const issues = validator.verifyEssentialFilesPreserved(plan);
      
      expect(issues.length).toBe(0);
    });
  });

  describe('checkForReferences', () => {
    test('should detect require statements', async () => {
      // Create a code file with a require statement
      const codeFile = join(testDir, 'app.js');
      await writeFile(codeFile, `
        const config = require('./config.js');
        console.log(config);
      `);

      const references = await validator.checkForReferences('config.js', testDir);
      
      expect(references.length).toBeGreaterThan(0);
      expect(references[0]).toContain('app.js');
    });

    test('should detect import statements', async () => {
      // Create a code file with an import statement
      const codeFile = join(testDir, 'main.js');
      await writeFile(codeFile, `
        import { helper } from './helper.js';
        helper();
      `);

      const references = await validator.checkForReferences('helper.js', testDir);
      
      expect(references.length).toBeGreaterThan(0);
      expect(references[0]).toContain('main.js');
    });

    test('should detect dynamic imports', async () => {
      // Create a code file with a dynamic import
      const codeFile = join(testDir, 'loader.js');
      await writeFile(codeFile, `
        const module = await import('./module.js');
        module.run();
      `);

      const references = await validator.checkForReferences('module.js', testDir);
      
      expect(references.length).toBeGreaterThan(0);
      expect(references[0]).toContain('loader.js');
    });

    test('should not detect references when file is not imported', async () => {
      // Create a code file without references
      const codeFile = join(testDir, 'standalone.js');
      await writeFile(codeFile, `
        console.log('No imports here');
      `);

      const references = await validator.checkForReferences('other.js', testDir);
      
      expect(references.length).toBe(0);
    });

    test('should handle files that cannot be read', async () => {
      // Try to check references in a non-existent directory
      const references = await validator.checkForReferences('nonexistent.js', join(testDir, 'fake'));
      
      expect(references.length).toBe(0);
    });
  });

  describe('validateRemovalPlan', () => {
    test('should pass validation for safe removal plan', async () => {
      // Create a simple backend structure
      const backendDir = join(testDir, 'backend');
      await mkdir(backendDir, { recursive: true });
      await writeFile(join(backendDir, 'index.js'), 'console.log("backend");');

      const plan = {
        documentationToRemove: [
          { path: 'OLD_README.md', size: 500 }
        ],
        configsToRemove: [
          { path: 'vite.config - Copy.ts', size: 200 }
        ],
        backendToRemove: null,
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    test('should fail validation when essential files are in removal list', async () => {
      const plan = {
        documentationToRemove: [
          { path: 'package.json', size: 1000 }
        ],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('should fail validation when no backend folder remains', async () => {
      // Create only one backend folder
      const backendDir = join(testDir, 'Backend-Draftin-Clean');
      await mkdir(backendDir, { recursive: true });

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: 'Backend-Draftin-Clean',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('No backend folder will remain'))).toBe(true);
    });

    test('should pass validation when one backend remains after removal', async () => {
      // Create two backend folders
      const backend1 = join(testDir, 'backend');
      const backend2 = join(testDir, 'Backend-Draftin-Clean');
      await mkdir(backend1, { recursive: true });
      await mkdir(backend2, { recursive: true });

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: 'Backend-Draftin-Clean',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      // Should not have the "no backend remains" issue
      expect(result.issues.some(issue => issue.includes('No backend folder will remain'))).toBe(false);
    });

    test('should warn when removing backend with node_modules', async () => {
      // Create backend with node_modules
      const backendDir = join(testDir, 'Backend-Draftin-Clean');
      const nodeModules = join(backendDir, 'node_modules');
      await mkdir(nodeModules, { recursive: true });
      await writeFile(join(nodeModules, 'package.json'), '{}');

      // Create another backend to remain
      const backend2 = join(testDir, 'backend');
      await mkdir(backend2, { recursive: true });

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: 'Backend-Draftin-Clean',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.issues.some(issue => issue.includes('node_modules'))).toBe(true);
    });

    test('should warn when removing backend with uploads directory', async () => {
      // Create backend with uploads
      const backendDir = join(testDir, 'Backend-Draftin-Clean');
      const uploadsDir = join(backendDir, 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(join(uploadsDir, 'image.jpg'), 'fake image');

      // Create another backend to remain
      const backend2 = join(testDir, 'backend');
      await mkdir(backend2, { recursive: true });

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: 'Backend-Draftin-Clean',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.issues.some(issue => issue.includes('uploads'))).toBe(true);
    });

    test('should detect references to files being removed', async () => {
      // Create a code file that references a file to be removed
      const codeFile = join(testDir, 'app.js');
      await writeFile(codeFile, `
        const oldConfig = require('./old-config.js');
      `);

      const plan = {
        documentationToRemove: [],
        configsToRemove: [
          { path: 'old-config.js', size: 100 }
        ],
        backendToRemove: null,
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('old-config.js') && issue.includes('referenced'))).toBe(true);
    });

    test('should prevent removal of .git folder', async () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: '.git',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('.git'))).toBe(true);
    });

    test('should prevent removal of active code directories', async () => {
      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: 'frontend',
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      expect(result.safe).toBe(false);
      expect(result.issues.some(issue => issue.includes('Active code directory'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle plan with undefined arrays', async () => {
      const plan = {
        backendToRemove: null,
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, testDir);
      
      // Should not crash, just return safe result
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('issues');
    });

    test('should handle empty project directory', async () => {
      const emptyDir = join(testDir, 'empty');
      await mkdir(emptyDir, { recursive: true });

      const plan = {
        documentationToRemove: [],
        configsToRemove: [],
        backendToRemove: null,
        uniqueFilesToCopy: []
      };

      const result = await validator.validateRemovalPlan(plan, emptyDir);
      
      expect(result.safe).toBe(true);
    });

    test('should handle files with special characters in names', async () => {
      const codeFile = join(testDir, 'app.js');
      await writeFile(codeFile, `
        import { test } from './file-with-dashes.js';
      `);

      const references = await validator.checkForReferences('file-with-dashes.js', testDir);
      
      expect(references.length).toBeGreaterThan(0);
    });

    test('should handle deeply nested code files', async () => {
      const deepDir = join(testDir, 'src', 'components', 'nested');
      await mkdir(deepDir, { recursive: true });
      
      const codeFile = join(deepDir, 'component.js');
      await writeFile(codeFile, `
        import utils from '../../../utils.js';
      `);

      const references = await validator.checkForReferences('utils.js', testDir);
      
      expect(references.length).toBeGreaterThan(0);
    });
  });
});
