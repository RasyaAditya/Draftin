/**
 * ReportGenerator - Generates comprehensive cleanup reports
 * 
 * This component generates detailed markdown reports after cleanup operations,
 * including summary statistics, categorized file lists, recovery instructions,
 * and warnings or issues encountered during the cleanup process.
 */

/**
 * ReportGenerator class for creating cleanup reports
 */
export class ReportGenerator {
  /**
   * Generates a comprehensive cleanup report in markdown format
   * 
   * @param {Object} removalResults - Results from FileRemover.removeFiles()
   * @param {Array} removalResults.removed - Successfully removed files/folders
   * @param {Array} removalResults.failed - Failed removal operations
   * @param {Array} removalResults.errors - Error objects encountered
   * @param {Object} plan - RemovalPlan object from RemovalPlanner
   * @param {string} activeBackend - Path to the active backend folder (optional)
   * @returns {string} Markdown formatted report
   */
  generateReport(removalResults, plan, activeBackend = null) {
    const sections = [];

    // Header
    sections.push('# Project Cleanup Report');
    sections.push('');
    sections.push(`**Generated:** ${new Date().toISOString()}`);
    sections.push('');

    // Summary statistics
    sections.push('## Summary');
    sections.push('');
    sections.push(this._generateSummarySection(removalResults, plan));
    sections.push('');

    // Categorized removals
    sections.push('## Removed Files and Folders');
    sections.push('');
    sections.push(this._generateCategorizedRemovalsSection(removalResults));
    sections.push('');

    // Active backend information
    if (activeBackend) {
      sections.push('## Active Backend');
      sections.push('');
      sections.push(`The active backend folder is: \`${activeBackend}\``);
      sections.push('');
    }

    // Failed operations (if any)
    if (removalResults.failed.length > 0) {
      sections.push('## Failed Operations');
      sections.push('');
      sections.push(this._generateFailedOperationsSection(removalResults));
      sections.push('');
    }

    // Recovery instructions
    sections.push('## Recovery Instructions');
    sections.push('');
    sections.push(this._generateRecoveryInstructions());
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Calculates total space freed from removed files
   * 
   * @param {Array} removedFiles - Array of removed file objects
   * @returns {number} Total space freed in bytes
   */
  calculateSpaceFreed(removedFiles) {
    let totalSize = 0;

    for (const file of removedFiles) {
      // Only count removed files, not copy operations or directories
      if (file.operation === 'remove' && file.type === 'file' && file.size) {
        totalSize += file.size;
      }
    }

    return totalSize;
  }

  /**
   * Categorizes removed files by type
   * 
   * @param {Array} removedFiles - Array of removed file objects
   * @returns {Map<string, Array>} Map of category to files
   */
  categorizeRemovals(removedFiles) {
    const categories = new Map();

    for (const file of removedFiles) {
      // Skip copy operations, only categorize removals
      if (file.operation !== 'remove') {
        continue;
      }

      const category = file.category || 'other';

      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category).push(file);
    }

    return categories;
  }

  /**
   * Generates the summary statistics section
   * 
   * @private
   * @param {Object} removalResults - Results from FileRemover
   * @param {Object} plan - RemovalPlan object
   * @returns {string} Formatted summary section
   */
  _generateSummarySection(removalResults, plan) {
    const lines = [];

    // Count successful removals (excluding copy operations)
    const removedCount = removalResults.removed.filter(r => r.operation === 'remove').length;
    const failedCount = removalResults.failed.length;
    const spaceFreed = this.calculateSpaceFreed(removalResults.removed);

    lines.push(`- **Total files/folders removed:** ${removedCount}`);
    lines.push(`- **Failed operations:** ${failedCount}`);
    lines.push(`- **Disk space freed:** ${this._formatBytes(spaceFreed)}`);
    lines.push('');

    // Breakdown by category
    const categorized = this.categorizeRemovals(removalResults.removed);
    
    lines.push('**Breakdown by category:**');
    lines.push(`- Documentation files: ${categorized.get('documentation')?.length || 0}`);
    lines.push(`- Duplicate configuration files: ${categorized.get('config')?.length || 0}`);
    lines.push(`- Obsolete backend folders: ${categorized.get('backend')?.length || 0}`);

    return lines.join('\n');
  }

  /**
   * Generates the categorized removals section
   * 
   * @private
   * @param {Object} removalResults - Results from FileRemover
   * @returns {string} Formatted categorized removals section
   */
  _generateCategorizedRemovalsSection(removalResults) {
    const lines = [];
    const categorized = this.categorizeRemovals(removalResults.removed);

    // Documentation files
    if (categorized.has('documentation') && categorized.get('documentation').length > 0) {
      lines.push('### Documentation Files');
      lines.push('');
      for (const file of categorized.get('documentation')) {
        lines.push(`- \`${file.path}\``);
        lines.push(`  - **Reason:** ${file.reason}`);
        lines.push(`  - **Size:** ${this._formatBytes(file.size || 0)}`);
      }
      lines.push('');
    }

    // Configuration files
    if (categorized.has('config') && categorized.get('config').length > 0) {
      lines.push('### Duplicate Configuration Files');
      lines.push('');
      for (const file of categorized.get('config')) {
        lines.push(`- \`${file.path}\``);
        lines.push(`  - **Reason:** ${file.reason}`);
        lines.push(`  - **Size:** ${this._formatBytes(file.size || 0)}`);
      }
      lines.push('');
    }

    // Backend folders
    if (categorized.has('backend') && categorized.get('backend').length > 0) {
      lines.push('### Obsolete Backend Folders');
      lines.push('');
      for (const folder of categorized.get('backend')) {
        lines.push(`- \`${folder.path}\``);
        lines.push(`  - **Reason:** ${folder.reason}`);
      }
      lines.push('');
    }

    // Other categories
    for (const [category, files] of categorized.entries()) {
      if (category !== 'documentation' && category !== 'config' && category !== 'backend') {
        lines.push(`### ${this._capitalizeFirst(category)}`);
        lines.push('');
        for (const file of files) {
          lines.push(`- \`${file.path}\``);
          lines.push(`  - **Reason:** ${file.reason || 'N/A'}`);
          if (file.size) {
            lines.push(`  - **Size:** ${this._formatBytes(file.size)}`);
          }
        }
        lines.push('');
      }
    }

    if (lines.length === 0) {
      lines.push('No files or folders were removed.');
    }

    return lines.join('\n');
  }

  /**
   * Generates the failed operations section
   * 
   * @private
   * @param {Object} removalResults - Results from FileRemover
   * @returns {string} Formatted failed operations section
   */
  _generateFailedOperationsSection(removalResults) {
    const lines = [];

    lines.push('The following operations failed:');
    lines.push('');

    for (const failure of removalResults.failed) {
      lines.push(`- \`${failure.path}\``);
      lines.push(`  - **Operation:** ${failure.operation}`);
      lines.push(`  - **Error:** ${failure.error}`);
      if (failure.destination) {
        lines.push(`  - **Destination:** ${failure.destination}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generates recovery instructions using git
   * 
   * @private
   * @returns {string} Formatted recovery instructions
   */
  _generateRecoveryInstructions() {
    const lines = [];

    lines.push('If the web application fails after cleanup, you can recover using git:');
    lines.push('');
    lines.push('```bash');
    lines.push('# Check what was deleted');
    lines.push('git status');
    lines.push('');
    lines.push('# Restore a specific file');
    lines.push('git checkout -- <file-path>');
    lines.push('');
    lines.push('# Restore all deleted files');
    lines.push('git reset --hard HEAD');
    lines.push('```');
    lines.push('');
    lines.push('**Important:** Make sure you have committed all changes before running cleanup operations.');

    return lines.join('\n');
  }

  /**
   * Formats bytes into human-readable format
   * 
   * @private
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string (e.g., "1.5 MB")
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Capitalizes the first letter of a string
   * 
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  _capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
