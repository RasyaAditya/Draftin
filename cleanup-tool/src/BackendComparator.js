/**
 * BackendComparator - Compares backend folders and identifies the active one
 * 
 * This component compares two backend folders to determine which one contains
 * the active code used by the web application, identifies file differences,
 * and finds unique files that need to be preserved.
 */

import { readdir, stat, access } from 'fs/promises';
import { join, relative, basename } from 'path';
import { constants } from 'fs';

/**
 * BackendComparator class for analyzing and comparing backend folders
 */
export class BackendComparator {
  /**
   * Directories to check for activity indicators
   */
  static ACTIVITY_INDICATORS = {
    nodeModules: 'node_modules',
    uploads: 'uploads',
    envFile: '.env'
  };

  /**
   * Code directories to compare for completeness
   */
  static CODE_DIRECTORIES = ['models', 'routes', 'controllers'];

  /**
   * Compares two backend folders and returns comprehensive comparison results
   * 
   * @param {string} backend1Path - Path to first backend folder
   * @param {string} backend2Path - Path to second backend folder
   * @returns {Promise<Object>} Comparison results
   * @returns {Array} returns.differences - List of file differences
   * @returns {Array} returns.uniqueFiles - Files unique to each backend
   * @returns {string} returns.activeBackend - Path to the active backend
   * @returns {Object} returns.backend1Info - Information about backend1
   * @returns {Object} returns.backend2Info - Information about backend2
   */
  async compareBackends(backend1Path, backend2Path) {
    // Gather information about both backends
    const backend1Info = await this._analyzeBackend(backend1Path);
    const backend2Info = await this._analyzeBackend(backend2Path);

    // Identify which backend is active
    const activeBackend = await this.identifyActiveBackend(
      { path: backend1Path, info: backend1Info },
      { path: backend2Path, info: backend2Info }
    );

    // Find file differences
    const differences = await this._findDifferences(
      backend1Path,
      backend2Path,
      backend1Info.allFiles,
      backend2Info.allFiles
    );

    // Determine which is active and which is obsolete
    const isBackend1Active = activeBackend === backend1Path;
    const activeBackendPath = isBackend1Active ? backend1Path : backend2Path;
    const obsoleteBackendPath = isBackend1Active ? backend2Path : backend1Path;
    const activeBackendInfo = isBackend1Active ? backend1Info : backend2Info;
    const obsoleteBackendInfo = isBackend1Active ? backend2Info : backend1Info;

    // Find unique files in obsolete backend
    const uniqueFiles = await this.findUniqueFiles(
      activeBackendPath,
      obsoleteBackendPath,
      activeBackendInfo.allFiles,
      obsoleteBackendInfo.allFiles
    );

    return {
      differences,
      uniqueFiles,
      activeBackend,
      backend1Info,
      backend2Info
    };
  }

  /**
   * Analyzes a backend folder to gather activity indicators and file information
   * 
   * @private
   * @param {string} backendPath - Path to backend folder
   * @returns {Promise<Object>} Backend analysis information
   */
  async _analyzeBackend(backendPath) {
    const info = {
      hasNodeModules: false,
      hasUploads: false,
      hasUploadsWithContent: false,
      envModifiedTime: null,
      modelCount: 0,
      routeCount: 0,
      controllerCount: 0,
      allFiles: [],
      totalFileCount: 0
    };

    try {
      // Check for node_modules
      try {
        await access(join(backendPath, BackendComparator.ACTIVITY_INDICATORS.nodeModules), constants.F_OK);
        info.hasNodeModules = true;
      } catch {
        info.hasNodeModules = false;
      }

      // Check for uploads directory and its content
      try {
        const uploadsPath = join(backendPath, BackendComparator.ACTIVITY_INDICATORS.uploads);
        await access(uploadsPath, constants.F_OK);
        info.hasUploads = true;

        // Check if uploads has content
        const uploadsContent = await readdir(uploadsPath);
        info.hasUploadsWithContent = uploadsContent.length > 0;
      } catch {
        info.hasUploads = false;
        info.hasUploadsWithContent = false;
      }

      // Check .env modification time
      try {
        const envPath = join(backendPath, BackendComparator.ACTIVITY_INDICATORS.envFile);
        const envStats = await stat(envPath);
        info.envModifiedTime = envStats.mtime;
      } catch {
        info.envModifiedTime = null;
      }

      // Count files in code directories
      for (const dir of BackendComparator.CODE_DIRECTORIES) {
        const dirPath = join(backendPath, dir);
        try {
          const count = await this._countFilesInDirectory(dirPath);
          if (dir === 'models') info.modelCount = count;
          if (dir === 'routes') info.routeCount = count;
          if (dir === 'controllers') info.controllerCount = count;
        } catch {
          // Directory doesn't exist, count remains 0
        }
      }

      // Get all files recursively
      info.allFiles = await this._getAllFiles(backendPath);
      info.totalFileCount = info.allFiles.length;

    } catch (error) {
      console.warn(`Warning: Could not fully analyze backend ${backendPath}: ${error.message}`);
    }

    return info;
  }

  /**
   * Counts files in a directory (non-recursive)
   * 
   * @private
   * @param {string} dirPath - Path to directory
   * @returns {Promise<number>} Number of files in directory
   */
  async _countFilesInDirectory(dirPath) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      return entries.filter(entry => entry.isFile()).length;
    } catch {
      return 0;
    }
  }

  /**
   * Gets all files recursively from a directory
   * 
   * @private
   * @param {string} dirPath - Path to directory
   * @param {string} basePath - Base path for relative paths (optional)
   * @returns {Promise<Array>} Array of relative file paths
   */
  async _getAllFiles(dirPath, basePath = null) {
    if (basePath === null) {
      basePath = dirPath;
    }

    const files = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        // Skip node_modules and .git directories
        if (entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this._getAllFiles(fullPath, basePath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const relativePath = relative(basePath, fullPath);
          files.push(relativePath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
    }

    return files;
  }

  /**
   * Identifies which backend folder contains the active code
   * 
   * Detection logic (in order of priority):
   * 1. Check for node_modules/ presence (indicates recent npm install)
   * 2. Check for uploads/ directory with content (indicates active usage)
   * 3. Check .env file modification time (more recent = more active)
   * 4. Compare file counts in models/, routes/, controllers/ (more complete = more likely active)
   * 
   * @param {Object} backend1 - Object with path and info for backend1
   * @param {Object} backend2 - Object with path and info for backend2
   * @returns {string} Path to the active backend
   */
  identifyActiveBackend(backend1, backend2) {
    const { path: path1, info: info1 } = backend1;
    const { path: path2, info: info2 } = backend2;

    let score1 = 0;
    let score2 = 0;

    // 1. node_modules presence (strong indicator - 10 points)
    if (info1.hasNodeModules) score1 += 10;
    if (info2.hasNodeModules) score2 += 10;

    // 2. uploads directory with content (strong indicator - 8 points)
    if (info1.hasUploadsWithContent) score1 += 8;
    if (info2.hasUploadsWithContent) score2 += 8;

    // 3. uploads directory exists (medium indicator - 4 points)
    if (info1.hasUploads && !info1.hasUploadsWithContent) score1 += 4;
    if (info2.hasUploads && !info2.hasUploadsWithContent) score2 += 4;

    // 4. .env modification time (medium indicator - 5 points for more recent)
    if (info1.envModifiedTime && info2.envModifiedTime) {
      if (info1.envModifiedTime > info2.envModifiedTime) {
        score1 += 5;
      } else if (info2.envModifiedTime > info1.envModifiedTime) {
        score2 += 5;
      }
    } else if (info1.envModifiedTime) {
      score1 += 3; // Has .env file
    } else if (info2.envModifiedTime) {
      score2 += 3; // Has .env file
    }

    // 5. Code completeness (1 point per file in code directories)
    const completeness1 = info1.modelCount + info1.routeCount + info1.controllerCount;
    const completeness2 = info2.modelCount + info2.routeCount + info2.controllerCount;
    
    score1 += completeness1;
    score2 += completeness2;

    // Return the backend with higher score
    if (score1 > score2) {
      return path1;
    } else if (score2 > score1) {
      return path2;
    } else {
      // If scores are equal, prefer the one with node_modules
      if (info1.hasNodeModules && !info2.hasNodeModules) {
        return path1;
      } else if (info2.hasNodeModules && !info1.hasNodeModules) {
        return path2;
      }
      // If still tied, return the first one
      return path1;
    }
  }

  /**
   * Finds differences between two backend folders
   * 
   * @private
   * @param {string} backend1Path - Path to first backend
   * @param {string} backend2Path - Path to second backend
   * @param {Array} files1 - Files in backend1
   * @param {Array} files2 - Files in backend2
   * @returns {Array} List of differences
   */
  async _findDifferences(backend1Path, backend2Path, files1, files2) {
    const differences = [];
    const files1Set = new Set(files1);
    const files2Set = new Set(files2);

    // Files only in backend1
    for (const file of files1) {
      if (!files2Set.has(file)) {
        differences.push({
          type: 'unique_to_backend1',
          file,
          backend1: backend1Path,
          backend2: backend2Path
        });
      }
    }

    // Files only in backend2
    for (const file of files2) {
      if (!files1Set.has(file)) {
        differences.push({
          type: 'unique_to_backend2',
          file,
          backend1: backend1Path,
          backend2: backend2Path
        });
      }
    }

    // Files in both - could check for content differences here if needed
    // For now, we just identify unique files

    return differences;
  }

  /**
   * Finds unique files in the obsolete backend that should be copied to active backend
   * 
   * @param {string} activeBackendPath - Path to active backend
   * @param {string} obsoleteBackendPath - Path to obsolete backend
   * @param {Array} activeFiles - Files in active backend (optional)
   * @param {Array} obsoleteFiles - Files in obsolete backend (optional)
   * @returns {Promise<Array>} Array of unique files to copy
   */
  async findUniqueFiles(activeBackendPath, obsoleteBackendPath, activeFiles = null, obsoleteFiles = null) {
    // Get file lists if not provided
    if (!activeFiles) {
      activeFiles = await this._getAllFiles(activeBackendPath);
    }
    if (!obsoleteFiles) {
      obsoleteFiles = await this._getAllFiles(obsoleteBackendPath);
    }

    const activeFilesSet = new Set(activeFiles);
    const uniqueFiles = [];

    // Find files in obsolete backend that don't exist in active backend
    for (const file of obsoleteFiles) {
      if (!activeFilesSet.has(file)) {
        // Check if it's an essential file (not node_modules, not .git)
        if (!file.includes('node_modules') && !file.includes('.git')) {
          uniqueFiles.push({
            relativePath: file,
            source: join(obsoleteBackendPath, file),
            destination: join(activeBackendPath, file)
          });
        }
      }
    }

    return uniqueFiles;
  }
}
