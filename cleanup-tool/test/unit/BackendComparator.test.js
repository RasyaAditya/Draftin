/**
 * Unit tests for BackendComparator component
 */

import { BackendComparator } from '../../src/BackendComparator.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('BackendComparator', () => {
  let testDir;
  let comparator;
  let backend1Path;
  let backend2Path;

  beforeEach(async () => {
    comparator = new BackendComparator();
    testDir = join(__dirname, 'test-backends');
    backend1Path = join(testDir, 'backend1');
    backend2Path = join(testDir, 'backend2');
    
    // Create test directory structure
    await mkdir(backend1Path, { recursive: true });
    await mkdir(backend2Path, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('identifyActiveBackend', () => {
    test('should identify backend with node_modules as active', async () => {
      // Create node_modules in backend1
      await mkdir(join(backend1Path, 'node_modules'), { recursive: true });
      await writeFile(join(backend1Path, '.env'), 'TEST=1');
      await writeFile(join(backend2Path, '.env'), 'TEST=2');

      const info1 = await comparator._analyzeBackend(backend1Path);
      const info2 = await comparator._analyzeBackend(backend2Path);

      const activeBackend = comparator.identifyActiveBackend(
        { path: backend1Path, info: info1 },
        { path: backend2Path, info: info2 }
      );

      expect(activeBackend).toBe(backend1Path);
    });

    test('should identify backend with uploads directory as more active', async () => {
      // Create uploads with content in backend2
      const uploadsPath = join(backend2Path, 'uploads');
      await mkdir(uploadsPath, { recursive: true });
      await writeFile(join(uploadsPath, 'test.jpg'), 'fake image');
      await writeFile(join(backend1Path, '.env'), 'TEST=1');
      await writeFile(join(backend2Path, '.env'), 'TEST=2');

      const info1 = await comparator._analyzeBackend(backend1Path);
      const info2 = await comparator._analyzeBackend(backend2Path);

      const activeBackend = comparator.identifyActiveBackend(
        { path: backend1Path, info: info1 },
        { path: backend2Path, info: info2 }
      );

      expect(activeBackend).toBe(backend2Path);
    });

    test('should prefer backend with more code files when other indicators are equal', async () => {
      // Create more models in backend1
      const modelsPath1 = join(backend1Path, 'models');
      await mkdir(modelsPath1, { recursive: true });
      await writeFile(join(modelsPath1, 'User.js'), 'module.exports = {}');
      await writeFile(join(modelsPath1, 'Post.js'), 'module.exports = {}');
      await writeFile(join(modelsPath1, 'Comment.js'), 'module.exports = {}');

      // Create fewer models in backend2
      const modelsPath2 = join(backend2Path, 'models');
      await mkdir(modelsPath2, { recursive: true });
      await writeFile(join(modelsPath2, 'User.js'), 'module.exports = {}');

      const info1 = await comparator._analyzeBackend(backend1Path);
      const info2 = await comparator._analyzeBackend(backend2Path);

      const activeBackend = comparator.identifyActiveBackend(
        { path: backend1Path, info: info1 },
        { path: backend2Path, info: info2 }
      );

      expect(activeBackend).toBe(backend1Path);
    });
  });

  describe('compareBackends', () => {
    test('should compare two backend folders and return comparison results', async () => {
      // Setup backend1 with node_modules
      await mkdir(join(backend1Path, 'node_modules'), { recursive: true });
      await writeFile(join(backend1Path, '.env'), 'TEST=1');
      await writeFile(join(backend1Path, 'index.js'), 'console.log("backend1")');

      // Setup backend2 with different files
      await writeFile(join(backend2Path, '.env'), 'TEST=2');
      await writeFile(join(backend2Path, 'server.js'), 'console.log("backend2")');

      const result = await comparator.compareBackends(backend1Path, backend2Path);

      expect(result).toHaveProperty('differences');
      expect(result).toHaveProperty('uniqueFiles');
      expect(result).toHaveProperty('activeBackend');
      expect(result).toHaveProperty('backend1Info');
      expect(result).toHaveProperty('backend2Info');
      expect(result.activeBackend).toBe(backend1Path);
    });

    test('should identify file differences between backends', async () => {
      // Create unique files in each backend
      await writeFile(join(backend1Path, 'unique1.js'), 'backend1 only');
      await writeFile(join(backend2Path, 'unique2.js'), 'backend2 only');
      await writeFile(join(backend1Path, 'common.js'), 'common file');
      await writeFile(join(backend2Path, 'common.js'), 'common file');

      const result = await comparator.compareBackends(backend1Path, backend2Path);

      expect(result.differences.length).toBeGreaterThan(0);
      
      const uniqueToBackend1 = result.differences.filter(d => d.type === 'unique_to_backend1');
      const uniqueToBackend2 = result.differences.filter(d => d.type === 'unique_to_backend2');
      
      expect(uniqueToBackend1.length).toBeGreaterThan(0);
      expect(uniqueToBackend2.length).toBeGreaterThan(0);
    });
  });

  describe('findUniqueFiles', () => {
    test('should find files unique to obsolete backend', async () => {
      // Create files in both backends
      await writeFile(join(backend1Path, 'common.js'), 'common');
      await writeFile(join(backend1Path, 'active-only.js'), 'active only');
      await writeFile(join(backend2Path, 'common.js'), 'common');
      await writeFile(join(backend2Path, 'obsolete-only.js'), 'obsolete only');

      const uniqueFiles = await comparator.findUniqueFiles(backend1Path, backend2Path);

      expect(uniqueFiles.length).toBeGreaterThan(0);
      expect(uniqueFiles.some(f => f.relativePath === 'obsolete-only.js')).toBe(true);
      expect(uniqueFiles.some(f => f.relativePath === 'common.js')).toBe(false);
    });

    test('should exclude node_modules and .git from unique files', async () => {
      // Create files in node_modules and .git
      const nmPath = join(backend2Path, 'node_modules');
      const gitPath = join(backend2Path, '.git');
      await mkdir(nmPath, { recursive: true });
      await mkdir(gitPath, { recursive: true });
      await writeFile(join(nmPath, 'package.js'), 'package');
      await writeFile(join(gitPath, 'config'), 'git config');
      await writeFile(join(backend2Path, 'regular.js'), 'regular file');

      const uniqueFiles = await comparator.findUniqueFiles(backend1Path, backend2Path);

      expect(uniqueFiles.every(f => !f.relativePath.includes('node_modules'))).toBe(true);
      expect(uniqueFiles.every(f => !f.relativePath.includes('.git'))).toBe(true);
      expect(uniqueFiles.some(f => f.relativePath === 'regular.js')).toBe(true);
    });

    test('should return empty array when no unique files exist', async () => {
      // Create identical files in both backends
      await writeFile(join(backend1Path, 'file1.js'), 'content');
      await writeFile(join(backend2Path, 'file1.js'), 'content');

      const uniqueFiles = await comparator.findUniqueFiles(backend1Path, backend2Path);

      expect(uniqueFiles.length).toBe(0);
    });
  });

  describe('_analyzeBackend', () => {
    test('should detect node_modules presence', async () => {
      await mkdir(join(backend1Path, 'node_modules'), { recursive: true });

      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.hasNodeModules).toBe(true);
    });

    test('should detect uploads directory with content', async () => {
      const uploadsPath = join(backend1Path, 'uploads');
      await mkdir(uploadsPath, { recursive: true });
      await writeFile(join(uploadsPath, 'image.jpg'), 'fake image');

      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.hasUploads).toBe(true);
      expect(info.hasUploadsWithContent).toBe(true);
    });

    test('should detect empty uploads directory', async () => {
      await mkdir(join(backend1Path, 'uploads'), { recursive: true });

      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.hasUploads).toBe(true);
      expect(info.hasUploadsWithContent).toBe(false);
    });

    test('should get .env modification time', async () => {
      await writeFile(join(backend1Path, '.env'), 'TEST=1');

      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.envModifiedTime).not.toBeNull();
      expect(typeof info.envModifiedTime.getTime).toBe('function');
    });

    test('should count files in code directories', async () => {
      // Create models
      const modelsPath = join(backend1Path, 'models');
      await mkdir(modelsPath, { recursive: true });
      await writeFile(join(modelsPath, 'User.js'), 'model');
      await writeFile(join(modelsPath, 'Post.js'), 'model');

      // Create routes
      const routesPath = join(backend1Path, 'routes');
      await mkdir(routesPath, { recursive: true });
      await writeFile(join(routesPath, 'api.js'), 'route');

      // Create controllers
      const controllersPath = join(backend1Path, 'controllers');
      await mkdir(controllersPath, { recursive: true });
      await writeFile(join(controllersPath, 'UserController.js'), 'controller');
      await writeFile(join(controllersPath, 'PostController.js'), 'controller');
      await writeFile(join(controllersPath, 'AuthController.js'), 'controller');

      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.modelCount).toBe(2);
      expect(info.routeCount).toBe(1);
      expect(info.controllerCount).toBe(3);
    });

    test('should handle missing code directories gracefully', async () => {
      const info = await comparator._analyzeBackend(backend1Path);

      expect(info.modelCount).toBe(0);
      expect(info.routeCount).toBe(0);
      expect(info.controllerCount).toBe(0);
    });
  });
});
