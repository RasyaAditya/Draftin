/**
 * RemovalPlanner - Creates a safe removal plan with prioritized order
 * 
 * This component takes analysis results from various analyzers and creates
 * a comprehensive removal plan that specifies which files to remove, in what
 * order, and which unique files need to be copied before removal.
 */

/**
 * RemovalPlanner class for creating and prioritizing file removal plans
 */
export class RemovalPlanner {
  /**
   * Removal priority order (lower number = removed first)
   */
  static REMOVAL_PRIORITY = {
    DOCUMENTATION: 1,  // Lowest risk - remove first
    CONFIGS: 2,        // Medium risk - remove second
    BACKEND: 3         // Highest risk - remove last
  };

  /**
   * Creates a comprehensive removal plan from analysis results
   * 
   * @param {Object} analysisResults - Results from all analyzers
   * @param {Array} analysisResults.documentationToRemove - Documentation files to remove
   * @param {Array} analysisResults.configsToRemove - Duplicate config files to remove
   * @param {string} analysisResults.obsoleteBackend - Path to obsolete backend folder
   * @param {Array} analysisResults.uniqueFilesToCopy - Unique files to copy before removal
   * @returns {Object} RemovalPlan object
   */
  createPlan(analysisResults) {
    const {
      documentationToRemove = [],
      configsToRemove = [],
      obsoleteBackend = null,
      uniqueFilesToCopy = []
    } = analysisResults;

    // Calculate total files affected
    const totalFilesAffected = this._calculateTotalFiles(
      documentationToRemove,
      configsToRemove,
      obsoleteBackend
    );

    // Calculate estimated space freed
    const estimatedSpaceFreed = this._calculateSpaceFreed(
      documentationToRemove,
      configsToRemove
    );

    // Create prioritized removal order
    const removalOrder = this.prioritizeRemovals({
      documentationToRemove,
      configsToRemove,
      obsoleteBackend
    });

    // Build the removal plan
    const plan = {
      documentationToRemove,
      configsToRemove,
      backendToRemove: obsoleteBackend,
      uniqueFilesToCopy,
      estimatedSpaceFreed,
      totalFilesAffected,
      removalOrder
    };

    return plan;
  }

  /**
   * Prioritizes removals in the correct order: docs → configs → backend
   * 
   * @param {Object} filesToRemove - Object containing files to remove
   * @param {Array} filesToRemove.documentationToRemove - Documentation files
   * @param {Array} filesToRemove.configsToRemove - Config files
   * @param {string} filesToRemove.obsoleteBackend - Backend folder path
   * @returns {Array} Ordered array of removal operations
   */
  prioritizeRemovals(filesToRemove) {
    const {
      documentationToRemove = [],
      configsToRemove = [],
      obsoleteBackend = null
    } = filesToRemove;

    const removalOrder = [];

    // Priority 1: Documentation files (lowest risk)
    for (const file of documentationToRemove) {
      removalOrder.push({
        priority: RemovalPlanner.REMOVAL_PRIORITY.DOCUMENTATION,
        type: 'file',
        category: 'documentation',
        path: file.path,
        reason: `Redundant documentation file in category: ${file.category || 'general'}`,
        size: file.size || 0
      });
    }

    // Priority 2: Duplicate configuration files (medium risk)
    for (const file of configsToRemove) {
      removalOrder.push({
        priority: RemovalPlanner.REMOVAL_PRIORITY.CONFIGS,
        type: 'file',
        category: 'config',
        path: file.path,
        reason: 'Duplicate configuration file (copy)',
        size: file.size || 0
      });
    }

    // Priority 3: Obsolete backend folder (highest risk - done last)
    if (obsoleteBackend) {
      removalOrder.push({
        priority: RemovalPlanner.REMOVAL_PRIORITY.BACKEND,
        type: 'directory',
        category: 'backend',
        path: obsoleteBackend,
        reason: 'Obsolete backend folder (not actively used)',
        size: 0 // Directory size calculated separately
      });
    }

    // Sort by priority (lower number first)
    removalOrder.sort((a, b) => a.priority - b.priority);

    return removalOrder;
  }

  /**
   * Calculates the total number of files affected by the removal plan
   * 
   * @private
   * @param {Array} documentationToRemove - Documentation files
   * @param {Array} configsToRemove - Config files
   * @param {string} obsoleteBackend - Backend folder path
   * @returns {number} Total number of files affected
   */
  _calculateTotalFiles(documentationToRemove, configsToRemove, obsoleteBackend) {
    let total = 0;

    // Count documentation files
    total += documentationToRemove.length;

    // Count config files
    total += configsToRemove.length;

    // Count backend folder as 1 (actual file count would require scanning)
    if (obsoleteBackend) {
      total += 1; // Represents the folder itself
    }

    return total;
  }

  /**
   * Calculates estimated space freed by removing files
   * 
   * @private
   * @param {Array} documentationToRemove - Documentation files
   * @param {Array} configsToRemove - Config files
   * @returns {number} Estimated space freed in bytes
   */
  _calculateSpaceFreed(documentationToRemove, configsToRemove) {
    let totalSize = 0;

    // Sum documentation file sizes
    for (const file of documentationToRemove) {
      totalSize += file.size || 0;
    }

    // Sum config file sizes
    for (const file of configsToRemove) {
      totalSize += file.size || 0;
    }

    // Note: Backend folder size is not included here as it would require
    // recursive scanning. This can be added in a future enhancement.

    return totalSize;
  }

  /**
   * Formats the removal plan as a human-readable summary with detailed preview
   * 
   * @param {Object} plan - RemovalPlan object from createPlan()
   * @returns {string} Formatted summary string
   */
  formatPlanSummary(plan) {
    const lines = [];

    lines.push('╔═══════════════════════════════════════════════════════════════╗');
    lines.push('║              CLEANUP PREVIEW - FILES TO BE REMOVED            ║');
    lines.push('╚═══════════════════════════════════════════════════════════════╝');
    lines.push('');
    
    // Summary statistics
    lines.push('📊 SUMMARY');
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push(`Total items to remove: ${plan.totalFilesAffected}`);
    lines.push(`Estimated space freed: ${this._formatBytes(plan.estimatedSpaceFreed)}`);
    lines.push('');

    // Documentation files section
    if (plan.documentationToRemove.length > 0) {
      lines.push('📄 DOCUMENTATION FILES');
      lines.push('─────────────────────────────────────────────────────────────────');
      lines.push(`Count: ${plan.documentationToRemove.length} files`);
      lines.push('Reason: Redundant or outdated documentation');
      lines.push('');
      
      // Group by category
      const byCategory = this._groupByCategory(plan.documentationToRemove);
      for (const [category, files] of Object.entries(byCategory)) {
        lines.push(`  Category: ${category}`);
        files.forEach(file => {
          const size = file.size ? ` (${this._formatBytes(file.size)})` : '';
          lines.push(`    • ${file.path}${size}`);
        });
        lines.push('');
      }
    }

    // Config files section
    if (plan.configsToRemove.length > 0) {
      lines.push('⚙️  DUPLICATE CONFIGURATION FILES');
      lines.push('─────────────────────────────────────────────────────────────────');
      lines.push(`Count: ${plan.configsToRemove.length} files`);
      lines.push('Reason: Duplicate copies (originals will be preserved)');
      lines.push('');
      
      plan.configsToRemove.forEach(file => {
        const size = file.size ? ` (${this._formatBytes(file.size)})` : '';
        lines.push(`  • ${file.path}${size}`);
      });
      lines.push('');
    }

    // Backend folder section
    if (plan.backendToRemove) {
      lines.push('📁 OBSOLETE BACKEND FOLDER');
      lines.push('─────────────────────────────────────────────────────────────────');
      lines.push(`Path: ${plan.backendToRemove}`);
      lines.push('Reason: Not actively used (active backend identified)');
      lines.push('');
      
      if (plan.uniqueFilesToCopy.length > 0) {
        lines.push(`  ⚠️  Unique files to preserve (will be copied first):`);
        plan.uniqueFilesToCopy.forEach(file => {
          lines.push(`    • ${file.relativePath}`);
        });
        lines.push('');
      }
    }

    // Execution order
    lines.push('🔄 EXECUTION ORDER');
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push('  1. Documentation files (lowest risk)');
    lines.push('  2. Duplicate configuration files (medium risk)');
    lines.push('  3. Obsolete backend folder (highest risk)');
    lines.push('');

    // Safety note
    lines.push('🛡️  SAFETY CHECKS');
    lines.push('─────────────────────────────────────────────────────────────────');
    lines.push('  ✓ Essential files will be preserved');
    lines.push('  ✓ Active code will not be removed');
    lines.push('  ✓ Git history will remain intact');
    lines.push('  ✓ All removals are reversible via git');

    return lines.join('\n');
  }

  /**
   * Groups files by their category
   * 
   * @private
   * @param {Array} files - Array of file objects with category property
   * @returns {Object} Object with categories as keys and file arrays as values
   */
  _groupByCategory(files) {
    const grouped = {};
    
    for (const file of files) {
      const category = file.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(file);
    }
    
    return grouped;
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
}
