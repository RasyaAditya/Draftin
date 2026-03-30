/**
 * SafetyValidator - Validates that removals won't break the application
 * 
 * This component performs critical safety checks before any files are removed,
 * ensuring that essential files are preserved, no active code references files
 * being removed, and the application will continue to function after cleanup.
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative, dirname, basename } from 'path';

/**
 * SafetyValidator class for validating removal plans
 */
export class SafetyValidator {
  /**
   * Code file extensions to scan for references
   */
  static CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];

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
   * Active code directories that should never be removed
   */
  static ACTIVE_CODE_DIRS = [
    'controllers',
    'models',
    'routes',
    'middleware',
    'utils',
    'src',
    'public',
    'dist',
    'frontend'
  ];

  /**
   * Directories to exclude from reference scanning
   */
  static EXCLUDED_DIRS = ['.git', 'node_modules', '.kiro', 'dist', 'build'];

  /**
   * Validates a removal plan for safety
   * 
   * @param {Object} plan - RemovalPlan object from RemovalPlanner
   * @param {string} rootPath - Project root path
   * @returns {Promise<Object>} Validation result
   * @returns {boolean} returns.safe - Whether the plan is safe to execute
   * @returns {Array<string>} returns.issues - List of safety issues found
   */
  async validateRemovalPlan(plan, rootPath) {
    const issues = [];

    // Check 1: Verify essential files are preserved
    const essentialFileIssues = this.verifyEssentialFilesPreserved(plan);
    issues.push(...essentialFileIssues);

    // Check 2: Verify active backend folder is not marked for removal
    if (plan.backendToRemove) {
      const backendIssues = await this._verifyActiveBackendNotRemoved(plan, rootPath);
      issues.push(...backendIssues);
    }

    // Check 3: Verify at least one backend folder remains
    const backendCountIssues = await this._verifyBackendFolderRemains(plan, rootPath);
    issues.push(...backendCountIssues);

    // Check 4: Check for references to files being removed
    const referenceIssues = await this._checkAllReferences(plan, rootPath);
    issues.push(...referenceIssues);

    // Check 5: Verify .git folder is not in removal list
    const gitIssues = this._verifyGitPreserved(plan);
    issues.push(...gitIssues);

    // Check 6: Verify active code directories are not in removal list
    const activeCodeIssues = this._verifyActiveCodePreserved(plan);
    issues.push(...activeCodeIssues);

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Verifies that no essential files are in the removal list
   * 
   * @param {Object} plan - RemovalPlan object
   * @returns {Array<string>} List of issues found
   */
  verifyEssentialFilesPreserved(plan) {
    const issues = [];

    // Check documentation files
    for (const file of plan.documentationToRemove || []) {
      if (this._isEssentialFile(file.path)) {
        issues.push(`Essential file marked for removal: ${file.path}`);
      }
    }

    // Check config files
    for (const file of plan.configsToRemove || []) {
      if (this._isEssentialFile(file.path)) {
        issues.push(`Essential file marked for removal: ${file.path}`);
      }
    }

    return issues;
  }

  /**
   * Checks if a file path represents an essential file
   * 
   * @private
   * @param {string} filePath - File path to check
   * @returns {boolean} True if file is essential
   */
  _isEssentialFile(filePath) {
    const fileName = basename(filePath);
    
    // Check exact matches
    if (SafetyValidator.ESSENTIAL_FILES.includes(fileName)) {
      return true;
    }

    // Check for .gitignore files
    if (fileName === '.gitignore') {
      return true;
    }

    // Files without " - Copy" are considered essential configs
    if (fileName.includes(' - Copy')) {
      return false;
    }

    // Check for essential config patterns
    const essentialPatterns = [
      /^package.*\.json$/,
      /^\.env/,
      /config\.(js|ts|json)$/,
      /^tsconfig.*\.json$/
    ];

    return essentialPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Verifies that the active backend folder is not marked for removal
   * 
   * @private
   * @param {Object} plan - RemovalPlan object
   * @param {string} rootPath - Project root path
   * @returns {Promise<Array<string>>} List of issues found
   */
  async _verifyActiveBackendNotRemoved(plan, rootPath) {
    const issues = [];

    if (!plan.backendToRemove) {
      return issues;
    }

    // Check if the backend being removed has indicators of being active
    const backendPath = join(rootPath, plan.backendToRemove);
    
    try {
      const entries = await readdir(backendPath, { withFileTypes: true });
      
      // Check for node_modules (strong indicator of active backend)
      const hasNodeModules = entries.some(e => e.isDirectory() && e.name === 'node_modules');
      if (hasNodeModules) {
        issues.push(`Backend folder marked for removal contains node_modules: ${plan.backendToRemove}`);
      }

      // Check for uploads directory with content
      const uploadsDir = entries.find(e => e.isDirectory() && e.name === 'uploads');
      if (uploadsDir) {
        const uploadsPath = join(backendPath, 'uploads');
        const uploadsContent = await readdir(uploadsPath);
        if (uploadsContent.length > 0) {
          issues.push(`Backend folder marked for removal contains uploads with content: ${plan.backendToRemove}`);
        }
      }
    } catch (error) {
      // If we can't read the directory, it might already be gone or inaccessible
      console.warn(`Warning: Could not verify backend folder ${plan.backendToRemove}: ${error.message}`);
    }

    return issues;
  }

  /**
   * Verifies that at least one backend folder remains after cleanup
   * 
   * @private
   * @param {Object} plan - RemovalPlan object
   * @param {string} rootPath - Project root path
   * @returns {Promise<Array<string>>} List of issues found
   */
  async _verifyBackendFolderRemains(plan, rootPath) {
    const issues = [];

    if (!plan.backendToRemove) {
      return issues;
    }

    try {
      // Find all backend folders in the project
      const entries = await readdir(rootPath, { withFileTypes: true });
      const backendFolders = entries.filter(e => 
        e.isDirectory() && 
        (e.name === 'backend' || e.name.toLowerCase().includes('backend'))
      );

      // After removal, we should have at least one backend folder
      const remainingBackends = backendFolders.filter(
        folder => folder.name !== basename(plan.backendToRemove)
      );

      if (remainingBackends.length === 0) {
        issues.push('No backend folder will remain after removal - at least one backend is required');
      }
    } catch (error) {
      issues.push(`Could not verify backend folder count: ${error.message}`);
    }

    return issues;
  }

  /**
   * Checks for references to all files being removed
   * 
   * @private
   * @param {Object} plan - RemovalPlan object
   * @param {string} rootPath - Project root path
   * @returns {Promise<Array<string>>} List of issues found
   */
  async _checkAllReferences(plan, rootPath) {
    const issues = [];

    // Collect all file paths being removed
    const filesToCheck = [];

    // Add documentation files
    for (const file of plan.documentationToRemove || []) {
      filesToCheck.push(file.path);
    }

    // Add config files
    for (const file of plan.configsToRemove || []) {
      filesToCheck.push(file.path);
    }

    // Check each file for references
    for (const filePath of filesToCheck) {
      const references = await this.checkForReferences(filePath, rootPath);
      if (references.length > 0) {
        issues.push(`File ${filePath} is referenced by: ${references.join(', ')}`);
      }
    }

    return issues;
  }

  /**
   * Checks for import/require statements referencing a specific file
   * 
   * @param {string} filePath - Relative path to file being checked
   * @param {string} rootPath - Project root path
   * @returns {Promise<Array<string>>} List of files that reference this file
   */
  async checkForReferences(filePath, rootPath) {
    const references = [];
    const codeFiles = await this._findAllCodeFiles(rootPath);

    // Normalize the file path for comparison
    const normalizedPath = filePath.replace(/\\/g, '/');
    const fileNameWithoutExt = basename(filePath, extname(filePath));

    for (const codeFile of codeFiles) {
      try {
        const content = await readFile(codeFile, 'utf-8');
        
        // Check for various import/require patterns
        if (this._hasReference(content, normalizedPath, fileNameWithoutExt)) {
          const relativePath = relative(rootPath, codeFile);
          references.push(relativePath);
        }
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Warning: Could not read file ${codeFile}: ${error.message}`);
      }
    }

    return references;
  }

  /**
   * Checks if file content contains references to a specific file
   * 
   * @private
   * @param {string} content - File content to search
   * @param {string} filePath - File path to search for
   * @param {string} fileName - File name without extension
   * @returns {boolean} True if reference found
   */
  _hasReference(content, filePath, fileName) {
    // Patterns to check:
    // 1. require('path') or require("path")
    // 2. import from 'path' or import from "path"
    // 3. import('path') dynamic import
    // 4. Direct file path references

    const patterns = [
      // require statements
      new RegExp(`require\\s*\\(\\s*['"\`][^'"\`]*${this._escapeRegex(fileName)}[^'"\`]*['"\`]\\s*\\)`, 'g'),
      new RegExp(`require\\s*\\(\\s*['"\`][^'"\`]*${this._escapeRegex(filePath)}[^'"\`]*['"\`]\\s*\\)`, 'g'),
      
      // import statements
      new RegExp(`import\\s+.*from\\s+['"\`][^'"\`]*${this._escapeRegex(fileName)}[^'"\`]*['"\`]`, 'g'),
      new RegExp(`import\\s+.*from\\s+['"\`][^'"\`]*${this._escapeRegex(filePath)}[^'"\`]*['"\`]`, 'g'),
      
      // dynamic imports
      new RegExp(`import\\s*\\(\\s*['"\`][^'"\`]*${this._escapeRegex(fileName)}[^'"\`]*['"\`]\\s*\\)`, 'g'),
      new RegExp(`import\\s*\\(\\s*['"\`][^'"\`]*${this._escapeRegex(filePath)}[^'"\`]*['"\`]\\s*\\)`, 'g'),
      
      // Direct path references (less common but possible)
      new RegExp(`['"\`][^'"\`]*${this._escapeRegex(filePath)}[^'"\`]*['"\`]`, 'g')
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Escapes special regex characters in a string
   * 
   * @private
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Finds all code files in the project
   * 
   * @private
   * @param {string} rootPath - Project root path
   * @returns {Promise<Array<string>>} List of code file paths
   */
  async _findAllCodeFiles(rootPath) {
    const codeFiles = [];
    await this._scanForCodeFiles(rootPath, codeFiles);
    return codeFiles;
  }

  /**
   * Recursively scans for code files
   * 
   * @private
   * @param {string} dirPath - Directory to scan
   * @param {Array<string>} codeFiles - Array to populate with code file paths
   */
  async _scanForCodeFiles(dirPath, codeFiles) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (SafetyValidator.EXCLUDED_DIRS.includes(entry.name)) {
            continue;
          }
          await this._scanForCodeFiles(fullPath, codeFiles);
        } else if (entry.isFile()) {
          // Check if it's a code file
          const ext = extname(entry.name);
          if (SafetyValidator.CODE_EXTENSIONS.includes(ext)) {
            codeFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
      console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Verifies that .git folder is not in removal list
   * 
   * @private
   * @param {Object} plan - RemovalPlan object
   * @returns {Array<string>} List of issues found
   */
  _verifyGitPreserved(plan) {
    const issues = [];

    // Check if backend to remove is .git or contains .git
    if (plan.backendToRemove && plan.backendToRemove.includes('.git')) {
      issues.push('.git folder or its contents are marked for removal');
    }

    // Check documentation files
    for (const file of plan.documentationToRemove || []) {
      if (file.path.includes('.git')) {
        issues.push(`.git related file marked for removal: ${file.path}`);
      }
    }

    // Check config files
    for (const file of plan.configsToRemove || []) {
      if (file.path.includes('.git')) {
        issues.push(`.git related file marked for removal: ${file.path}`);
      }
    }

    return issues;
  }

  /**
   * Verifies that active code directories are not in removal list
   * 
   * @private
   * @param {Object} plan - RemovalPlan object
   * @returns {Array<string>} List of issues found
   */
  _verifyActiveCodePreserved(plan) {
    const issues = [];

    // Check if backend to remove contains active code directories
    if (plan.backendToRemove) {
      const backendPath = plan.backendToRemove.toLowerCase();
      
      // Only flag if we're removing a top-level active code directory
      for (const activeDir of SafetyValidator.ACTIVE_CODE_DIRS) {
        if (backendPath === activeDir || backendPath.endsWith(`/${activeDir}`)) {
          issues.push(`Active code directory marked for removal: ${plan.backendToRemove}`);
        }
      }
    }

    return issues;
  }
}

/**
 * Helper function to get file extension
 * 
 * @param {string} filePath - File path
 * @returns {string} File extension including the dot
 */
function extname(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  
  if (lastDot > lastSlash) {
    return filePath.substring(lastDot);
  }
  return '';
}
