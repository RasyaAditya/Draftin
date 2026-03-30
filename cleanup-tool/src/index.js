#!/usr/bin/env node

/**
 * Project Cleanup Tool - CLI Entry Point
 * 
 * This tool analyzes a project structure and safely removes duplicate,
 * redundant, and obsolete files while preserving all functionality.
 * 
 * Usage: node src/index.js [project-root-path]
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { FileScanner } from './FileScanner.js';
import { DocumentationAnalyzer } from './DocumentationAnalyzer.js';
import { BackendComparator } from './BackendComparator.js';
import { ConfigFileDetector } from './ConfigFileDetector.js';
import { RemovalPlanner } from './RemovalPlanner.js';
import { SafetyValidator } from './SafetyValidator.js';
import { FileRemover } from './FileRemover.js';
import { ReportGenerator } from './ReportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Displays a progress indicator for a stage
 * 
 * @param {string} stageName - Name of the current stage
 * @param {string} status - Status message
 */
function showProgress(stageName, status) {
  console.log(`[${stageName}] ${status}`);
}

/**
 * Prompts user for confirmation before executing cleanup
 * 
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
async function getUserConfirmation() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nDo you want to proceed with cleanup? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Logs an error with full context
 * 
 * @param {string} stage - Stage where error occurred
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
function logError(stage, error, context = {}) {
  console.error(`\n❌ ERROR in ${stage}:`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Type: ${error.constructor.name}`);
  if (error.code) {
    console.error(`   Code: ${error.code}`);
  }
  if (Object.keys(context).length > 0) {
    console.error(`   Context:`, JSON.stringify(context, null, 2));
  }
  if (error.stack) {
    console.error(`   Stack trace:\n${error.stack}`);
  }
}

/**
 * Generates an error report when cleanup fails
 * 
 * @param {string} stage - Stage where failure occurred
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 * @returns {string} Markdown formatted error report
 */
function generateErrorReport(stage, error, context = {}) {
  const lines = [];
  
  lines.push('# Project Cleanup Error Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Status:** FAILED`);
  lines.push('');
  
  lines.push('## Error Summary');
  lines.push('');
  lines.push(`- **Stage:** ${stage}`);
  lines.push(`- **Error Type:** ${error.constructor.name}`);
  lines.push(`- **Error Message:** ${error.message}`);
  if (error.code) {
    lines.push(`- **Error Code:** ${error.code}`);
  }
  lines.push('');
  
  if (Object.keys(context).length > 0) {
    lines.push('## Context Information');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(context, null, 2));
    lines.push('```');
    lines.push('');
  }
  
  lines.push('## Stack Trace');
  lines.push('');
  lines.push('```');
  lines.push(error.stack || 'No stack trace available');
  lines.push('```');
  lines.push('');
  
  lines.push('## Recovery Instructions');
  lines.push('');
  lines.push('The cleanup operation failed before making any changes to your project.');
  lines.push('');
  lines.push('### Troubleshooting Steps:');
  lines.push('');
  
  // Provide specific recovery instructions based on error type
  if (error.code === 'EACCES' || error.code === 'EPERM') {
    lines.push('1. **Permission Issue:** You may need elevated permissions to access certain files.');
    lines.push('   - Try running the tool with administrator/sudo privileges');
    lines.push('   - Check file and directory permissions in your project');
    lines.push('');
  } else if (error.code === 'ENOENT') {
    lines.push('1. **File Not Found:** The tool could not find expected files or directories.');
    lines.push('   - Verify the project path is correct');
    lines.push('   - Ensure the project structure matches expectations');
    lines.push('');
  } else if (error.code === 'ENOSPC') {
    lines.push('1. **Disk Full:** There is insufficient disk space to complete the operation.');
    lines.push('   - Free up disk space and try again');
    lines.push('');
  }
  
  lines.push('2. **Review the error message** above for specific details about what went wrong.');
  lines.push('');
  lines.push('3. **Check your git status** to ensure no unexpected changes were made:');
  lines.push('   ```bash');
  lines.push('   git status');
  lines.push('   ```');
  lines.push('');
  lines.push('4. **If any files were modified**, restore them using git:');
  lines.push('   ```bash');
  lines.push('   # Restore all changes');
  lines.push('   git reset --hard HEAD');
  lines.push('   ```');
  lines.push('');
  lines.push('5. **Report the issue** if the problem persists, including this error report.');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Main entry point for the cleanup tool
 * Pipeline: Analysis → Planning → Validation → Execution
 */
async function main() {
  console.log('Project Cleanup Tool v1.0.0');
  console.log('============================\n');

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const projectRoot = args[0] ? resolve(args[0]) : resolve(__dirname, '../..');

  console.log(`Target project: ${projectRoot}\n`);

  let currentStage = 'Initialization';
  let stageContext = {};

  try {
    // ============================================================
    // STAGE 1: ANALYSIS - Scan and analyze project structure
    // ============================================================
    currentStage = 'Analysis';
    console.log('═══════════════════════════════════════════════════');
    console.log('STAGE 1: ANALYSIS');
    console.log('═══════════════════════════════════════════════════\n');

    showProgress('Analysis', 'Scanning project structure...');
    
    let scanner, scanResults;
    try {
      scanner = new FileScanner();
      scanResults = await scanner.scanProject(projectRoot);
      stageContext.scanResults = {
        documentationCount: scanResults.documentationFiles.length,
        backendFoldersCount: scanResults.backendFolders.length,
        essentialFilesCount: scanResults.essentialFiles.length
      };
    } catch (error) {
      logError('Analysis - File Scanning', error, { projectRoot });
      throw new Error(`Failed to scan project structure: ${error.message}`);
    }
    
    showProgress('Analysis', `Found ${scanResults.documentationFiles.length} documentation files`);
    showProgress('Analysis', `Found ${scanResults.backendFolders.length} backend folders`);
    showProgress('Analysis', `Found ${scanResults.essentialFiles.length} essential files`);
    console.log();

    // Analyze documentation files
    showProgress('Analysis', 'Categorizing documentation files...');
    
    let docAnalyzer, categorizedDocs, redundancyResults;
    try {
      docAnalyzer = new DocumentationAnalyzer();
      categorizedDocs = docAnalyzer.categorizeDocuments(scanResults.documentationFiles);
      redundancyResults = docAnalyzer.identifyRedundant(categorizedDocs);
      stageContext.redundancyResults = {
        toRemoveCount: redundancyResults.toRemove.length,
        toKeepCount: redundancyResults.toKeep.length
      };
    } catch (error) {
      logError('Analysis - Documentation Analysis', error, { 
        documentationFilesCount: scanResults.documentationFiles.length 
      });
      throw new Error(`Failed to analyze documentation files: ${error.message}`);
    }
    
    showProgress('Analysis', `Identified ${redundancyResults.toRemove.length} redundant documentation files`);
    console.log();

    // Compare backend folders (if multiple exist)
    let backendComparison = null;
    let obsoleteBackend = null;
    let uniqueFilesToCopy = [];
    
    if (scanResults.backendFolders.length >= 2) {
      showProgress('Analysis', 'Comparing backend folders...');
      
      try {
        const comparator = new BackendComparator();
        backendComparison = await comparator.compareBackends(
          scanResults.backendFolders[0],
          scanResults.backendFolders[1]
        );
        
        // Determine obsolete backend
        obsoleteBackend = backendComparison.activeBackend === scanResults.backendFolders[0]
          ? scanResults.backendFolders[1]
          : scanResults.backendFolders[0];
        
        uniqueFilesToCopy = backendComparison.uniqueFiles;
        
        stageContext.backendComparison = {
          activeBackend: backendComparison.activeBackend,
          obsoleteBackend: obsoleteBackend,
          uniqueFilesCount: uniqueFilesToCopy.length
        };
        
        showProgress('Analysis', `Active backend: ${backendComparison.activeBackend}`);
        showProgress('Analysis', `Obsolete backend: ${obsoleteBackend}`);
        showProgress('Analysis', `Unique files to preserve: ${uniqueFilesToCopy.length}`);
        console.log();
      } catch (error) {
        logError('Analysis - Backend Comparison', error, {
          backend1: scanResults.backendFolders[0],
          backend2: scanResults.backendFolders[1]
        });
        throw new Error(`Failed to compare backend folders: ${error.message}`);
      }
    } else {
      showProgress('Analysis', 'Only one backend folder found - skipping backend comparison');
      console.log();
    }

    // Detect duplicate configuration files
    showProgress('Analysis', 'Detecting duplicate configuration files...');
    
    let configDetector, duplicateConfigs;
    try {
      configDetector = new ConfigFileDetector();
      duplicateConfigs = configDetector.findDuplicateConfigs(scanResults.allFiles);
      stageContext.duplicateConfigs = {
        copiesCount: duplicateConfigs.copies.length,
        originalsCount: duplicateConfigs.originals.length
      };
    } catch (error) {
      logError('Analysis - Config Detection', error, {
        totalFilesScanned: scanResults.allFiles.length
      });
      throw new Error(`Failed to detect duplicate configuration files: ${error.message}`);
    }
    
    showProgress('Analysis', `Found ${duplicateConfigs.copies.length} duplicate configuration files`);
    console.log();

    // ============================================================
    // STAGE 2: PLANNING - Create removal plan
    // ============================================================
    currentStage = 'Planning';
    console.log('═══════════════════════════════════════════════════');
    console.log('STAGE 2: PLANNING');
    console.log('═══════════════════════════════════════════════════\n');

    showProgress('Planning', 'Creating removal plan...');
    
    let planner, removalPlan;
    try {
      planner = new RemovalPlanner();
      removalPlan = planner.createPlan({
        documentationToRemove: redundancyResults.toRemove,
        configsToRemove: duplicateConfigs.copies,
        obsoleteBackend: obsoleteBackend,
        uniqueFilesToCopy: uniqueFilesToCopy
      });
      
      stageContext.removalPlan = {
        totalFilesAffected: removalPlan.totalFilesAffected,
        estimatedSpaceFreed: removalPlan.estimatedSpaceFreed
      };
    } catch (error) {
      logError('Planning - Removal Plan Creation', error, {
        documentationToRemoveCount: redundancyResults.toRemove.length,
        configsToRemoveCount: duplicateConfigs.copies.length,
        hasObsoleteBackend: !!obsoleteBackend
      });
      throw new Error(`Failed to create removal plan: ${error.message}`);
    }

    showProgress('Planning', `Total items to remove: ${removalPlan.totalFilesAffected}`);
    showProgress('Planning', `Estimated space to free: ${formatBytes(removalPlan.estimatedSpaceFreed)}`);
    console.log();

    // Display plan summary
    console.log(planner.formatPlanSummary(removalPlan));
    console.log();

    // ============================================================
    // STAGE 3: VALIDATION - Verify safety
    // ============================================================
    currentStage = 'Validation';
    console.log('═══════════════════════════════════════════════════');
    console.log('STAGE 3: VALIDATION');
    console.log('═══════════════════════════════════════════════════\n');

    showProgress('Validation', 'Performing safety checks...');
    
    let validator, validationResult;
    try {
      validator = new SafetyValidator();
      validationResult = await validator.validateRemovalPlan(removalPlan, projectRoot);
      
      stageContext.validation = {
        safe: validationResult.safe,
        issuesCount: validationResult.issues.length
      };
    } catch (error) {
      logError('Validation - Safety Checks', error, {
        removalPlanSize: removalPlan.totalFilesAffected
      });
      throw new Error(`Failed to validate removal plan: ${error.message}`);
    }

    if (!validationResult.safe) {
      console.error('\n❌ SAFETY VALIDATION FAILED\n');
      console.error('The following issues were detected:\n');
      validationResult.issues.forEach((issue, index) => {
        console.error(`${index + 1}. ${issue}`);
      });
      console.error('\nCleanup aborted for safety reasons.');
      
      // Generate error report for validation failure
      const errorReport = generateErrorReport(
        'Validation',
        new Error('Safety validation failed'),
        {
          issues: validationResult.issues,
          removalPlan: stageContext.removalPlan
        }
      );
      
      const fs = await import('fs/promises');
      const errorReportPath = resolve(projectRoot, 'CLEANUP_ERROR_REPORT.md');
      await fs.writeFile(errorReportPath, errorReport, 'utf-8');
      console.error(`\nError report saved to: ${errorReportPath}\n`);
      
      process.exit(1);
    }

    showProgress('Validation', '✓ All safety checks passed');
    console.log();

    // ============================================================
    // STAGE 4: EXECUTION - User confirmation and cleanup
    // ============================================================
    currentStage = 'Execution';
    console.log('═══════════════════════════════════════════════════');
    console.log('STAGE 4: EXECUTION');
    console.log('═══════════════════════════════════════════════════\n');

    // User confirmation step
    console.log('⚠️  WARNING: This operation will permanently delete files.');
    console.log('Make sure you have committed all changes to git before proceeding.\n');

    const confirmed = await getUserConfirmation();

    if (!confirmed) {
      console.log('\n❌ Cleanup cancelled by user.');
      console.log('No files were modified.');
      process.exit(0);
    }

    // Execute cleanup
    console.log();
    showProgress('Execution', 'Starting cleanup operations...');
    
    let remover, removalResults;
    try {
      remover = new FileRemover();
      removalResults = remover.removeFiles(removalPlan);
      
      stageContext.execution = {
        removedCount: removalResults.removed.length,
        failedCount: removalResults.failed.length,
        errorsCount: removalResults.errors.length
      };
    } catch (error) {
      logError('Execution - File Removal', error, {
        removalPlanSize: removalPlan.totalFilesAffected
      });
      
      // Generate error report for execution failure
      const errorReport = generateErrorReport(
        'Execution',
        error,
        {
          stage: 'File Removal',
          removalPlan: stageContext.removalPlan,
          partialResults: removalResults || { removed: [], failed: [], errors: [] }
        }
      );
      
      const fs = await import('fs/promises');
      const errorReportPath = resolve(projectRoot, 'CLEANUP_ERROR_REPORT.md');
      await fs.writeFile(errorReportPath, errorReport, 'utf-8');
      console.error(`\nError report saved to: ${errorReportPath}\n`);
      
      throw new Error(`Failed to execute cleanup operations: ${error.message}`);
    }

    showProgress('Execution', `Successfully removed: ${removalResults.removed.length} items`);
    if (removalResults.failed.length > 0) {
      showProgress('Execution', `Failed operations: ${removalResults.failed.length} items`);
    }
    console.log();

    // ============================================================
    // GENERATE REPORT
    // ============================================================
    currentStage = 'Report Generation';
    console.log('═══════════════════════════════════════════════════');
    console.log('GENERATING REPORT');
    console.log('═══════════════════════════════════════════════════\n');

    showProgress('Report', 'Generating cleanup report...');
    
    let reportGenerator, report, reportPath;
    try {
      reportGenerator = new ReportGenerator();
      report = reportGenerator.generateReport(
        removalResults,
        removalPlan,
        backendComparison?.activeBackend
      );

      // Save report to file
      reportPath = resolve(projectRoot, 'CLEANUP_REPORT.md');
      const fs = await import('fs/promises');
      await fs.writeFile(reportPath, report, 'utf-8');
      
      stageContext.report = {
        path: reportPath,
        generated: true
      };
    } catch (error) {
      logError('Report Generation', error, {
        removalResultsSize: removalResults.removed.length + removalResults.failed.length
      });
      
      // Don't fail the entire operation if report generation fails
      // Just log the error and continue
      console.error('\n⚠️  Warning: Failed to generate cleanup report');
      console.error(`   Error: ${error.message}\n`);
      reportPath = null;
    }

    if (reportPath) {
      showProgress('Report', `Report saved to: ${reportPath}`);
    }
    console.log();

    // Display summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✓ CLEANUP COMPLETE');
    console.log('═══════════════════════════════════════════════════\n');

    if (reportGenerator && removalResults) {
      const spaceFreed = reportGenerator.calculateSpaceFreed(removalResults.removed);
      console.log(`Files removed: ${removalResults.removed.filter(r => r.operation === 'remove').length}`);
      console.log(`Space freed: ${formatBytes(spaceFreed)}`);
    }
    
    if (reportPath) {
      console.log(`Report: ${reportPath}\n`);
    }

    if (removalResults && removalResults.failed.length > 0) {
      console.log(`⚠️  ${removalResults.failed.length} operations failed. Check the report for details.\n`);
    }

    console.log('If you encounter any issues, use git to recover deleted files.');
    console.log('See the report for recovery instructions.\n');

  } catch (error) {
    // Main error handler - catches any unhandled errors from all stages
    logError(currentStage, error, stageContext);
    
    // Generate comprehensive error report
    try {
      const errorReport = generateErrorReport(currentStage, error, stageContext);
      const fs = await import('fs/promises');
      const errorReportPath = resolve(projectRoot, 'CLEANUP_ERROR_REPORT.md');
      await fs.writeFile(errorReportPath, errorReport, 'utf-8');
      
      console.error(`\n📄 Error report saved to: ${errorReportPath}`);
      console.error('\nPlease review the error report for detailed information and recovery instructions.\n');
    } catch (reportError) {
      console.error('\n⚠️  Failed to generate error report:', reportError.message);
    }
    
    console.error('\n❌ Cleanup aborted due to error.');
    console.error('No files should have been modified if the error occurred before the Execution stage.');
    console.error('If files were modified, use git to recover them:\n');
    console.error('  git status');
    console.error('  git reset --hard HEAD\n');
    
    process.exit(1);
  }
}

/**
 * Formats bytes into human-readable format
 * 
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
