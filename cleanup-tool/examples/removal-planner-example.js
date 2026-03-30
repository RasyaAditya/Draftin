/**
 * Example usage of RemovalPlanner component
 * 
 * This example demonstrates how to use RemovalPlanner to create
 * a comprehensive removal plan from analysis results.
 */

import { RemovalPlanner } from '../src/RemovalPlanner.js';

// Example analysis results from various analyzers
const analysisResults = {
  // Documentation files identified as redundant
  documentationToRemove: [
    {
      path: 'OLD_DATABASE_FIX.md',
      name: 'OLD_DATABASE_FIX.md',
      size: 2048,
      category: 'database-fixes'
    },
    {
      path: 'DEPRECATED_SETUP.txt',
      name: 'DEPRECATED_SETUP.txt',
      size: 1024,
      category: 'general-setup'
    },
    {
      path: 'OUTDATED_DEPLOYMENT.md',
      name: 'OUTDATED_DEPLOYMENT.md',
      size: 3072,
      category: 'deployment'
    }
  ],

  // Duplicate configuration files
  configsToRemove: [
    {
      path: 'frontend/package - Copy.json',
      name: 'package - Copy.json',
      size: 4096
    },
    {
      path: 'frontend/vite.config - Copy.ts',
      name: 'vite.config - Copy.ts',
      size: 512
    }
  ],

  // Obsolete backend folder
  obsoleteBackend: 'Backend-Draftin-Clean',

  // Unique files that need to be copied before removal
  uniqueFilesToCopy: [
    {
      relativePath: 'models/AdvancedUser.js',
      source: 'Backend-Draftin-Clean/models/AdvancedUser.js',
      destination: 'backend/models/AdvancedUser.js'
    },
    {
      relativePath: 'routes/specialRoutes.js',
      source: 'Backend-Draftin-Clean/routes/specialRoutes.js',
      destination: 'backend/routes/specialRoutes.js'
    }
  ]
};

// Create a RemovalPlanner instance
const planner = new RemovalPlanner();

// Generate the removal plan
console.log('Creating removal plan...\n');
const plan = planner.createPlan(analysisResults);

// Display the plan summary
console.log(planner.formatPlanSummary(plan));

// Display detailed removal order
console.log('\n=== Detailed Removal Order ===\n');
plan.removalOrder.forEach((operation, index) => {
  console.log(`${index + 1}. [${operation.category.toUpperCase()}] ${operation.path}`);
  console.log(`   Type: ${operation.type}`);
  console.log(`   Reason: ${operation.reason}`);
  console.log(`   Priority: ${operation.priority}`);
  console.log('');
});

// Example output:
// Creating removal plan...
//
// === Removal Plan Summary ===
//
// Total items to remove: 6
// Estimated space freed: 10.75 KB
//
// Documentation files to remove: 3
//   - OLD_DATABASE_FIX.md (database-fixes)
//   - DEPRECATED_SETUP.txt (general-setup)
//   - OUTDATED_DEPLOYMENT.md (deployment)
//
// Duplicate config files to remove: 2
//   - frontend/package - Copy.json
//   - frontend/vite.config - Copy.ts
//
// Obsolete backend folder to remove: Backend-Draftin-Clean
//   Unique files to copy first: 2
//     - models/AdvancedUser.js
//     - routes/specialRoutes.js
//
// Removal order:
//   1. Documentation files (lowest risk)
//   2. Duplicate configuration files (medium risk)
//   3. Obsolete backend folder (highest risk)
//
// === Detailed Removal Order ===
//
// 1. [DOCUMENTATION] OLD_DATABASE_FIX.md
//    Type: file
//    Reason: Redundant documentation file in category: database-fixes
//    Priority: 1
//
// 2. [DOCUMENTATION] DEPRECATED_SETUP.txt
//    Type: file
//    Reason: Redundant documentation file in category: general-setup
//    Priority: 1
//
// ... (and so on)
