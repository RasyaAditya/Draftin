/**
 * FileRemover - Executes file and folder deletions
 * 
 * This component is responsible for executing the removal plan by deleting
 * files and directories in the correct order, copying unique files before
 * removal, and tracking success/failure for each operation.
 */

import fs from 'fs';
import path from 'path';

/**
 * FileRemover class for executing file and directory deletions
 */
export class FileRemover {
  /**
   * Executes the removal plan by deleting files and directories in order
   * 
   * @param {Object} removalPlan - RemovalPlan object from RemovalPlanner
   * @param {Array} removalPlan.removalOrder - Ordered array of removal operations
   * @param {Array} removalPlan.uniqueFilesToCopy - Files to copy before backend removal
   * @param {string} removalPlan.backendToRemove - Path to obsolete backend folder
   * @returns {Object} Results object with removed, failed, and errors arrays
   */
  removeFiles(removalPlan) {
    const results = {
      removed: [],
      failed: [],
      errors: []
    };

    // First, copy unique files if there's a backend to remove
    if (removalPlan.backendToRemove && removalPlan.uniqueFilesToCopy.length > 0) {
      for (const fileInfo of removalPlan.uniqueFilesToCopy) {
        try {
          const success = this.copyFile(fileInfo.source, fileInfo.destination);
          if (success) {
            results.removed.push({
              operation: 'copy',
              path: fileInfo.source,
              destination: fileInfo.destination,
              success: true
            });
          } else {
            results.failed.push({
              operation: 'copy',
              path: fileInfo.source,
              destination: fileInfo.destination,
              error: 'Copy operation failed'
            });
          }
        } catch (error) {
          results.failed.push({
            operation: 'copy',
            path: fileInfo.source,
            destination: fileInfo.destination,
            error: error.message
          });
          results.errors.push(error);
        }
      }
    }

    // Execute removals in order
    for (const operation of removalPlan.removalOrder) {
      try {
        let success = false;

        if (operation.type === 'file') {
          // Remove individual file
          success = this._removeFile(operation.path);
        } else if (operation.type === 'directory') {
          // Remove directory recursively
          success = this.removeDirectory(operation.path);
        }

        if (success) {
          results.removed.push({
            operation: 'remove',
            type: operation.type,
            path: operation.path,
            category: operation.category,
            reason: operation.reason,
            size: operation.size,
            success: true
          });
        } else {
          results.failed.push({
            operation: 'remove',
            type: operation.type,
            path: operation.path,
            error: 'Removal operation failed'
          });
        }
      } catch (error) {
        results.failed.push({
          operation: 'remove',
          type: operation.type,
          path: operation.path,
          error: error.message
        });
        results.errors.push(error);
      }
    }

    return results;
  }

  /**
   * Removes a directory and all its contents recursively
   * 
   * @param {string} dirPath - Path to directory to remove
   * @returns {boolean} True if successful, false otherwise
   */
  removeDirectory(dirPath) {
    try {
      // Check if directory exists
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      // Check if it's actually a directory
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
      }

      // Remove directory recursively
      fs.rmSync(dirPath, { recursive: true, force: true });

      return true;
    } catch (error) {
      // Handle specific error types
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new Error(`Permission denied: Cannot remove ${dirPath}`);
      } else if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${dirPath}`);
      } else if (error.code === 'ENOSPC') {
        throw new Error(`Disk full: Cannot complete removal of ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Copies a file from source to destination
   * 
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {boolean} True if successful, false otherwise
   */
  copyFile(source, destination) {
    try {
      // Check if source file exists
      if (!fs.existsSync(source)) {
        throw new Error(`Source file not found: ${source}`);
      }

      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy the file
      fs.copyFileSync(source, destination);

      return true;
    } catch (error) {
      // Handle specific error types
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new Error(`Permission denied: Cannot copy ${source} to ${destination}`);
      } else if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${source}`);
      } else if (error.code === 'ENOSPC') {
        throw new Error(`Disk full: Cannot copy ${source} to ${destination}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Removes a single file
   * 
   * @private
   * @param {string} filePath - Path to file to remove
   * @returns {boolean} True if successful, false otherwise
   */
  _removeFile(filePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Check if it's actually a file
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
      }

      // Remove the file
      fs.unlinkSync(filePath);

      return true;
    } catch (error) {
      // Handle specific error types
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new Error(`Permission denied: Cannot remove ${filePath}`);
      } else if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      } else if (error.code === 'ENOSPC') {
        throw new Error(`Disk full: Cannot complete removal of ${filePath}`);
      } else {
        throw error;
      }
    }
  }
}
