/**
 * Unit tests for FileScanner component
 */

import { FileScanner } from '../../src/FileScanner.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('FileScanner', () => {
  let testDir;
  let scanner;

  beforeEach(async () => {
    scanner = new FileScanner();
    testDir = join(__dirname, 'test-project');
    
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

  describe('isDocumentationFile', () => {
    test('should identify .md files as documentation', () => {
      expect(scanner.isDocumentationFile('README.md')).toBe(true);
    });

    test('should identify .txt files as documentation', () => {
      expect(scanner.isDocumentationFile('NOTES.txt')).toBe(true);
    });

    test('should not identify .js files as documentation', () => {
      expect(scanner.isDocumentationFile('index.js')).toBe(false);
    });

    test('should only identify files in project root when rootPath is provided', () => {
      const rootPath = '/project';
      expect(scanner.isDocumentationFile('/project/README.md', rootPath)).toBe(true);
      expect(scanner.isDocumentationFile('/project/docs/README.md', rootPath)).toBe(false);
    });
  });

  describe('isEssentialFile', () => {
    test('should identify .env as essential', () => {
      expect(scanner.isEssentialFile('.env')).toBe(true);
    });

    test('should identify package.json as essential', () => {
      expect(scanner.isEssentialFile('package.json')).toBe(true);
    });

    test('should identify .gitignore as essential', () => {
      expect(scanner.isEssentialFile('.gitignore')).toBe(true);
    });

    test('should identify index.js as essential', () => {
      expect(scanner.isEssentialFile('index.js')).toBe(true);
    });

    test('should not identify files with " - Copy" as essential', () => {
      expect(scanner.isEssentialFile('package - Copy.json')).toBe(false);
    });

    test('should not identify random files as essential', () => {
      expect(scanner.isEssentialFile('random-file.txt')).toBe(false);
    });
  });

  describe('scanProject', () => {
    test('should scan project and find documentation files in root', async () => {
      // Create test files
      await writeFile(join(testDir, 'README.md'), '# Test');
      await writeFile(join(testDir, 'GUIDE.txt'), 'Guide content');
      await writeFile(join(testDir, 'index.js'), 'console.log("test")');

      const result = await scanner.scanProject(testDir);

      expect(result.documentationFiles).toHaveLength(2);
      expect(result.documentationFiles.some(f => f.name === 'README.md')).toBe(true);
      expect(result.documentationFiles.some(f => f.name === 'GUIDE.txt')).toBe(true);
    });

    test('should exclude .git, node_modules, and .kiro directories', async () => {
      // Create excluded directories with files
      await mkdir(join(testDir, '.git'), { recursive: true });
      await writeFile(join(testDir, '.git', 'config'), 'git config');
      
      await mkdir(join(testDir, 'node_modules'), { recursive: true });
      await writeFile(join(testDir, 'node_modules', 'package.json'), '{}');
      
      await mkdir(join(testDir, '.kiro'), { recursive: true });
      await writeFile(join(testDir, '.kiro', 'config'), 'kiro config');

      const result = await scanner.scanProject(testDir);

      // Should not find files in excluded directories
      expect(result.allFiles.some(f => f.path.includes('.git'))).toBe(false);
      expect(result.allFiles.some(f => f.path.includes('node_modules'))).toBe(false);
      expect(result.allFiles.some(f => f.path.includes('.kiro'))).toBe(false);
    });

    test('should identify essential files', async () => {
      await writeFile(join(testDir, 'package.json'), '{}');
      await writeFile(join(testDir, '.env'), 'KEY=value');
      await writeFile(join(testDir, '.gitignore'), 'node_modules');

      const result = await scanner.scanProject(testDir);

      expect(result.essentialFiles).toHaveLength(3);
      expect(result.essentialFiles.some(f => f.name === 'package.json')).toBe(true);
      expect(result.essentialFiles.some(f => f.name === '.env')).toBe(true);
      expect(result.essentialFiles.some(f => f.name === '.gitignore')).toBe(true);
    });

    test('should identify backend folders', async () => {
      await mkdir(join(testDir, 'backend'), { recursive: true });
      await mkdir(join(testDir, 'Backend-Draftin-Clean'), { recursive: true });
      await mkdir(join(testDir, 'frontend'), { recursive: true });

      const result = await scanner.scanProject(testDir);

      expect(result.backendFolders).toHaveLength(2);
      expect(result.backendFolders).toContain('backend');
      expect(result.backendFolders).toContain('Backend-Draftin-Clean');
      expect(result.backendFolders).not.toContain('frontend');
    });

    test('should return file information with correct properties', async () => {
      await writeFile(join(testDir, 'test.md'), '# Test');

      const result = await scanner.scanProject(testDir);

      expect(result.allFiles).toHaveLength(1);
      const file = result.allFiles[0];
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('name');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('modifiedTime');
      expect(file).toHaveProperty('type');
      expect(file).toHaveProperty('isEssential');
      expect(file.name).toBe('test.md');
      expect(file.type).toBe('documentation');
    });

    test('should handle nested directory structures', async () => {
      await mkdir(join(testDir, 'src', 'components'), { recursive: true });
      await writeFile(join(testDir, 'src', 'index.js'), 'code');
      await writeFile(join(testDir, 'src', 'components', 'Button.js'), 'code');

      const result = await scanner.scanProject(testDir);

      expect(result.allFiles).toHaveLength(2);
      expect(result.allFiles.some(f => f.path.includes('src'))).toBe(true);
    });

    test('should not include subdirectory documentation files in documentationFiles', async () => {
      await mkdir(join(testDir, 'docs'), { recursive: true });
      await writeFile(join(testDir, 'README.md'), '# Root');
      await writeFile(join(testDir, 'docs', 'API.md'), '# API');

      const result = await scanner.scanProject(testDir);

      // Only root README.md should be in documentationFiles
      expect(result.documentationFiles).toHaveLength(1);
      expect(result.documentationFiles[0].name).toBe('README.md');
      
      // But both should be in allFiles
      expect(result.allFiles).toHaveLength(2);
    });
  });
});
