/**
 * FileScanner - Scans project directories and categorizes files
 * 
 * This component recursively scans the project structure, identifies different
 * types of files (documentation, essential files, etc.), and excludes certain
 * directories from scanning (.git/, node_modules/, .kiro/).
 */

import { readdir, stat } from 'fs/promises';
import { join, basename, extname, relative } from 'path';

/**
 * FileScanner class for analyzing project file structure
 */
export class FileScanner {
  /**
   * Directories to exclude from scanning
   */
  static EXCLUDED_DIRS = ['.git', 'node_modules', '.kiro'];

  /**
   * Essential file names that should never be removed
   */
  static ESSENTIAL_FILES = [
    '.env',
    'package.json',
    'package-lock.json',
    '.gitignore',
    'index.js',
    'index.html',
    'vite.config.js',
    'vite.config.ts',
    'tsconfig.json',
    'jest.config.js',
    'babel.config.js',
    '.eslintrc',
    '.prettierrc'
  ];

  /**
   * Documentation file extensions
   */
  static DOC_EXTENSIONS = ['.md', '.txt'];

  /**
   * Scans the project directory and categorizes all files
   * 
   * @param {string} rootPath - The root directory to scan
   * @returns {Promise<Object>} Object containing categorized file lists
   * @returns {Array} returns.documentationFiles - Documentation files in project root
   * @returns {Array} returns.allFiles - All files found (excluding excluded dirs)
   * @returns {Array} returns.essentialFiles - Essential configuration files
   * @returns {Array} returns.backendFolders - Backend folder paths found
   */
  async scanProject(rootPath) {
    const result = {
      documentationFiles: [],
      allFiles: [],
      essentialFiles: [],
      backendFolders: []
    };

    await this._scanDirectory(rootPath, rootPath, result);

    return result;
  }

  /**
   * Recursively scans a directory and populates the result object
   * 
   * @private
   * @param {string} dirPath - Current directory being scanned
   * @param {string} rootPath - Project root path
   * @param {Object} result - Result object to populate
   */
  async _scanDirectory(dirPath, rootPath, result) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        const relativePath = relative(rootPath, fullPath);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (FileScanner.EXCLUDED_DIRS.includes(entry.name)) {
            continue;
          }

          // Track backend folders
          if (entry.name === 'backend' || entry.name.toLowerCase().includes('backend')) {
            result.backendFolders.push(relativePath);
          }

          // Recursively scan subdirectories
          await this._scanDirectory(fullPath, rootPath, result);
        } else if (entry.isFile()) {
          const fileInfo = await this._getFileInfo(fullPath, rootPath);
          result.allFiles.push(fileInfo);

          // Check if it's a documentation file in project root
          if (this.isDocumentationFile(fullPath, rootPath)) {
            result.documentationFiles.push(fileInfo);
          }

          // Check if it's an essential file
          if (this.isEssentialFile(fullPath)) {
            result.essentialFiles.push(fileInfo);
          }
        }
      }
    } catch (error) {
      // Log error but continue scanning
      console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Gets detailed information about a file
   * 
   * @private
   * @param {string} filePath - Full path to the file
   * @param {string} rootPath - Project root path
   * @returns {Promise<Object>} File information object
   */
  async _getFileInfo(filePath, rootPath) {
    const stats = await stat(filePath);
    const relativePath = relative(rootPath, filePath);

    return {
      path: relativePath,
      name: basename(filePath),
      size: stats.size,
      modifiedTime: stats.mtime,
      type: this._determineFileType(filePath, rootPath),
      isEssential: this.isEssentialFile(filePath)
    };
  }

  /**
   * Determines the type of a file
   * 
   * @private
   * @param {string} filePath - Full path to the file
   * @param {string} rootPath - Project root path
   * @returns {string} File type ('documentation', 'essential', 'config', 'code')
   */
  _determineFileType(filePath, rootPath) {
    if (this.isDocumentationFile(filePath, rootPath)) {
      return 'documentation';
    }
    if (this.isEssentialFile(filePath)) {
      return 'essential';
    }
    const ext = extname(filePath);
    if (['.json', '.js', '.ts', '.yaml', '.yml', '.toml'].includes(ext)) {
      return 'config';
    }
    return 'code';
  }

  /**
   * Checks if a file is a documentation file in the project root
   * 
   * @param {string} filePath - Full path to the file
   * @param {string} rootPath - Project root path (optional, for checking root location)
   * @returns {boolean} True if file is a documentation file in project root
   */
  isDocumentationFile(filePath, rootPath = null) {
    const ext = extname(filePath).toLowerCase();
    
    // Check if it has a documentation extension
    if (!FileScanner.DOC_EXTENSIONS.includes(ext)) {
      return false;
    }

    // If rootPath is provided, check if file is in project root
    if (rootPath) {
      const relativePath = relative(rootPath, filePath);
      // File should be in root (no directory separators in relative path)
      return !relativePath.includes('/') && !relativePath.includes('\\');
    }

    // If no rootPath provided, just check extension
    return true;
  }

  /**
   * Checks if a file is an essential file that should not be removed
   * 
   * @param {string} filePath - Full path to the file
   * @returns {boolean} True if file is essential
   */
  isEssentialFile(filePath) {
    const fileName = basename(filePath);
    
    // Check exact matches
    if (FileScanner.ESSENTIAL_FILES.includes(fileName)) {
      return true;
    }

    // Check for .gitignore files anywhere in the tree
    if (fileName === '.gitignore') {
      return true;
    }

    // Check for files without " - Copy" in the name (originals are essential)
    if (fileName.includes(' - Copy')) {
      return false;
    }

    return false;
  }
}
