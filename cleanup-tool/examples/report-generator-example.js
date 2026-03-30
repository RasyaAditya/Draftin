/**
 * Example usage of ReportGenerator
 * 
 * This example demonstrates how to use the ReportGenerator class
 * to create a comprehensive cleanup report.
 */

import { ReportGenerator } from '../src/ReportGenerator.js';

// Example removal results from FileRemover
const removalResults = {
  removed: [
    {
      operation: 'remove',
      type: 'file',
      path: 'OLD_DATABASE_GUIDE.md',
      category: 'documentation',
      reason: 'Redundant documentation file in category: database-fixes',
      size: 2048,
      success: true
    },
    {
      operation: 'remove',
      type: 'file',
      path: 'DEPRECATED_LOGIN_FIX.md',
      category: 'documentation',
      reason: 'Redundant documentation file in category: login-fixes',
      size: 1536,
      success: true
    },
    {
      operation: 'remove',
      type: 'file',
      path: 'package - Copy.json',
      category: 'config',
      reason: 'Duplicate configuration file (copy)',
      size: 3072,
      success: true
    },
    {
      operation: 'remove',
      type: 'file',
      path: 'vite.config - Copy.ts',
      category: 'config',
      reason: 'Duplicate configuration file (copy)',
      size: 1024,
      success: true
    },
    {
      operation: 'remove',
      type: 'directory',
      path: 'Backend-Draftin-Clean',
      category: 'backend',
      reason: 'Obsolete backend folder (not actively used)',
      size: 0,
      success: true
    },
    {
      operation: 'copy',
      path: 'Backend-Draftin-Clean/models/User.js',
      destination: 'backend/models/User.js',
      success: true
    }
  ],
  failed: [
    {
      operation: 'remove',
      type: 'file',
      path: 'LOCKED_FILE.md',
      error: 'Permission denied: Cannot remove LOCKED_FILE.md'
    }
  ],
  errors: []
};

// Example removal plan from RemovalPlanner
const plan = {
  documentationToRemove: [
    { path: 'OLD_DATABASE_GUIDE.md', size: 2048, category: 'database-fixes' },
    { path: 'DEPRECATED_LOGIN_FIX.md', size: 1536, category: 'login-fixes' }
  ],
  configsToRemove: [
    { path: 'package - Copy.json', size: 3072 },
    { path: 'vite.config - Copy.ts', size: 1024 }
  ],
  backendToRemove: 'Backend-Draftin-Clean',
  uniqueFilesToCopy: [
    {
      relativePath: 'models/User.js',
      source: 'Backend-Draftin-Clean/models/User.js',
      destination: 'backend/models/User.js'
    }
  ],
  estimatedSpaceFreed: 7680,
  totalFilesAffected: 5,
  removalOrder: []
};

// Create ReportGenerator instance
const generator = new ReportGenerator();

// Generate the report
console.log('=== Generating Cleanup Report ===\n');
const report = generator.generateReport(removalResults, plan, 'backend');

// Display the report
console.log(report);

// Demonstrate individual methods
console.log('\n\n=== Individual Method Examples ===\n');

// Calculate space freed
const spaceFreed = generator.calculateSpaceFreed(removalResults.removed);
console.log(`Total space freed: ${spaceFreed} bytes`);

// Categorize removals
const categorized = generator.categorizeRemovals(removalResults.removed);
console.log('\nCategorized removals:');
for (const [category, files] of categorized.entries()) {
  console.log(`  ${category}: ${files.length} files`);
}
