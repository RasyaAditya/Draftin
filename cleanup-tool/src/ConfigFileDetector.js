/**
 * ConfigFileDetector - Identifies duplicate configuration files
 * 
 * This component detects configuration files that are duplicates (containing " - Copy"
 * in their names) and verifies that the original files exist. It helps identify
 * unnecessary copy files that can be safely removed.
 */

import { basename } from 'path';

/**
 * ConfigFileDetector class for identifying duplicate configuration files
 */
export class ConfigFileDetector {
  /**
   * Pattern to identify duplicate/copy files
   */
  static COPY_PATTERN = ' - Copy';

  /**
   * Finds duplicate configuration files and their originals
   * 
   * This method scans through all files, identifies those with " - Copy" in their names,
   * and verifies that the original file (without " - Copy") exists.
   * 
   * @param {Array} files - Array of file objects from FileScanner
   * @returns {Object} Object containing originals and copies arrays
   * @returns {Array} returns.originals - Original configuration files
   * @returns {Array} returns.copies - Duplicate copy files that can be removed
   */
  findDuplicateConfigs(files) {
    const originals = [];
    const copies = [];
    const fileMap = new Map();

    // First pass: Build a map of all files by their path
    for (const file of files) {
      fileMap.set(file.path, file);
    }

    // Second pass: Identify copies and verify originals exist
    for (const file of files) {
      if (this.isDuplicateConfig(file.name)) {
        // This is a copy file
        const originalPath = this._getOriginalPath(file.path);
        
        // Check if the original file exists
        if (fileMap.has(originalPath)) {
          const originalFile = fileMap.get(originalPath);
          
          // Add to copies array (these can be removed)
          copies.push(file);
          
          // Add original to originals array if not already there
          if (!originals.some(f => f.path === originalFile.path)) {
            originals.push(originalFile);
          }
        } else {
          // Copy exists but original doesn't - log warning but don't add to removal list
          console.warn(`Warning: Copy file "${file.path}" found but original does not exist`);
        }
      }
    }

    return { originals, copies };
  }

  /**
   * Checks if a file name indicates it's a duplicate configuration file
   * 
   * @param {string} fileName - The name of the file to check
   * @returns {boolean} True if the file name contains " - Copy" pattern
   */
  isDuplicateConfig(fileName) {
    return fileName.includes(ConfigFileDetector.COPY_PATTERN);
  }

  /**
   * Gets the original file path by removing the " - Copy" pattern
   * 
   * @private
   * @param {string} filePath - Path to the copy file
   * @returns {string} Path to the original file
   */
  _getOriginalPath(filePath) {
    // Replace " - Copy" with empty string to get original path
    return filePath.replace(ConfigFileDetector.COPY_PATTERN, '');
  }
}
