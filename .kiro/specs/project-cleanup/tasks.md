# Implementation Plan: Project Cleanup System

## Overview

This implementation plan breaks down the Project Cleanup System into discrete coding tasks. The system will be built as a Node.js CLI tool that analyzes project structure, identifies redundant files, validates safety, and executes cleanup operations. Implementation follows a pipeline architecture: Analysis → Planning → Validation → Execution.

## Tasks

- [x] 1. Set up project structure and core utilities
  - Create `cleanup-tool/` directory in project root
  - Initialize package.json with dependencies (fast-check for property testing)
  - Create `src/` directory for source code
  - Create `test/` directory for unit and property tests
  - Set up basic CLI entry point (`src/index.js`)
  - _Requirements: 9.1, 9.2_

- [ ] 2. Implement FileScanner component
  - [x] 2.1 Create FileScanner class with file system scanning logic
    - Implement `scanProject(rootPath)` method using Node.js fs module
    - Implement recursive directory traversal excluding .git/, node_modules/, .kiro/
    - Implement `isDocumentationFile(filePath)` to identify .md and .txt files in project root
    - Implement `isEssentialFile(filePath)` to identify .env, package.json, .gitignore, etc.
    - Return structured object with categorized file lists
    - _Requirements: 1.1, 5.2_

  - [ ]* 2.2 Write property test for FileScanner
    - **Property 1: Documentation File Discovery**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write unit tests for FileScanner
    - Test scanning with known project structure
    - Test exclusion of .git/, node_modules/, .kiro/ directories
    - Test identification of documentation files by extension
    - Test identification of essential files by name
    - _Requirements: 1.1, 5.2_

- [ ] 3. Implement DocumentationAnalyzer component
  - [x] 3.1 Create DocumentationAnalyzer class with categorization logic
    - Implement `extractTopic(fileName)` to categorize by keywords
    - Define topic categories: database-fixes, login-fixes, deployment, payment-setup, general-setup, troubleshooting
    - Implement `categorizeDocuments(documentationFiles)` returning Map<topic, File[]>
    - Implement `identifyRedundant(categorizedDocs)` with priority logic (INDEX > SUMMARY/GUIDE > FIX)
    - _Requirements: 1.2, 1.3, 2.1, 2.2_

  - [ ]* 3.2 Write property tests for DocumentationAnalyzer
    - **Property 2: Redundancy Detection and Removal**
    - **Validates: Requirements 1.2, 2.1, 2.2**
    - **Property 3: Documentation Categorization**
    - **Validates: Requirements 1.3**
    - **Property 4: Redundancy Report Completeness**
    - **Validates: Requirements 1.4**

  - [ ]* 3.3 Write unit tests for DocumentationAnalyzer
    - Test categorization with specific file names from actual project
    - Test redundancy detection with known duplicate sets
    - Test edge cases: empty project, single file, all unique files
    - _Requirements: 1.2, 1.3, 2.1_

- [ ] 4. Implement content consolidation logic
  - [x] 4.1 Add consolidation method to DocumentationAnalyzer
    - Implement file content reading and merging logic
    - Detect unique information across files in same category
    - Create consolidated file with combined content
    - _Requirements: 2.3_

  - [ ]* 4.2 Write property test for content consolidation
    - **Property 5: Content Consolidation**
    - **Validates: Requirements 2.3**

  - [ ]* 4.3 Write unit tests for consolidation
    - Test consolidation with files containing unique content
    - Test consolidation with files containing duplicate content
    - _Requirements: 2.3_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement BackendComparator component
  - [x] 6.1 Create BackendComparator class with folder comparison logic
    - Implement `compareBackends(backend1Path, backend2Path)` to find differences
    - Implement recursive file comparison for both directories
    - Implement `identifyActiveBackend(backend1, backend2)` with detection logic
    - Check for node_modules/ presence, .env modification time, uploads/ directory
    - Compare file counts in models/, routes/, controllers/ directories
    - Implement `findUniqueFiles(activeBackend, obsoleteBackend)` to identify files to copy
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 6.2 Write property tests for BackendComparator
    - **Property 6: Directory Comparison**
    - **Validates: Requirements 3.3, 3.4**
    - **Property 7: Active Backend Detection**
    - **Validates: Requirements 3.2**

  - [ ]* 6.3 Write unit tests for BackendComparator
    - Test comparison of actual backend/ and Backend-Draftin-Clean/ folders
    - Test active backend detection with various indicators
    - Test unique file identification
    - Test edge cases: identical folders, one empty folder
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. Implement ConfigFileDetector component
  - [x] 7.1 Create ConfigFileDetector class with duplicate detection logic
    - Implement `findDuplicateConfigs(files)` to identify files with " - Copy" pattern
    - Implement `isDuplicateConfig(fileName)` to check for copy pattern
    - Verify original file exists for each copy found
    - Return structured object with originals and copies arrays
    - _Requirements: 6.1, 6.2_

  - [ ]* 7.2 Write property test for ConfigFileDetector
    - **Property 14: Duplicate Configuration Removal**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 7.3 Write unit tests for ConfigFileDetector
    - Test detection with known duplicate config files
    - Test with "package - Copy.json" and "vite.config - Copy.ts"
    - Test edge case: copy exists but original doesn't
    - _Requirements: 6.1, 6.2_

- [ ] 8. Implement RemovalPlanner component
  - [x] 8.1 Create RemovalPlanner class with planning logic
    - Implement `createPlan(analysisResults)` to generate RemovalPlan object
    - Implement `prioritizeRemovals(filesToRemove)` with order: docs → configs → backend
    - Calculate estimated space freed and total files affected
    - Identify unique files to copy from obsolete backend
    - _Requirements: 4.1, 4.2, 9.4_

  - [ ]* 8.2 Write property tests for RemovalPlanner
    - **Property 8: Obsolete Folder Marking**
    - **Validates: Requirements 4.1**
    - **Property 9: Unique File Preservation**
    - **Validates: Requirements 4.2**
    - **Property 18: Execution Order Consistency**
    - **Validates: Requirements 9.4**

  - [ ]* 8.3 Write unit tests for RemovalPlanner
    - Test plan creation with known analysis results
    - Test prioritization order
    - Test space calculation with known file sizes
    - _Requirements: 4.1, 4.2, 9.4_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement SafetyValidator component
  - [x] 10.1 Create SafetyValidator class with validation logic
    - Implement `validateRemovalPlan(plan)` to check safety conditions
    - Implement `checkForReferences(filePath, codebase)` to scan for import/require statements
    - Search all .js, .ts, .jsx, .tsx files for references to files being removed
    - Implement `verifyEssentialFilesPreserved(plan)` to ensure no essential files in removal list
    - Check that active backend folder is not marked for removal
    - Verify at least one backend folder remains after cleanup
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

  - [ ]* 10.2 Write property tests for SafetyValidator
    - **Property 11: Active Code Preservation Invariant**
    - **Validates: Requirements 5.1, 5.3**
    - **Property 12: Essential File Preservation Invariant**
    - **Validates: Requirements 5.2**
    - **Property 13: Reference Validation**
    - **Validates: Requirements 5.4, 6.3**
    - **Property 15: Git Preservation Invariant**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ]* 10.3 Write unit tests for SafetyValidator
    - Test validation with files that have references
    - Test validation with essential files in removal list
    - Test validation with active code in removal list
    - Test edge case: no files to remove, all files safe
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 11. Implement FileRemover component
  - [x] 11.1 Create FileRemover class with deletion logic
    - Implement `removeFiles(removalPlan)` to execute deletions in order
    - Implement `removeDirectory(dirPath)` for recursive folder removal
    - Implement `copyFile(source, destination)` for unique file preservation
    - Add error handling for permission denied, file not found, disk full
    - Track success/failure for each operation
    - _Requirements: 2.4, 4.2, 4.3, 9.4_

  - [ ]* 11.2 Write property tests for FileRemover
    - **Property 10: Folder Removal Completeness**
    - **Validates: Requirements 4.3, 4.4**

  - [ ]* 11.3 Write unit tests for FileRemover
    - Test file removal with temporary test files
    - Test directory removal with nested structure
    - Test file copying before removal
    - Test error handling: permission denied, file not found
    - _Requirements: 4.2, 4.3_

- [ ] 12. Implement ReportGenerator component
  - [x] 12.1 Create ReportGenerator class with report generation logic
    - Implement `generateReport(removalResults, plan)` to create markdown report
    - Implement `calculateSpaceFreed(removedFiles)` to sum file sizes
    - Implement `categorizeRemovals(removedFiles)` to group by type
    - Include summary statistics, categorized file lists, recovery instructions
    - Format report as markdown with sections for each category
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.3_

  - [ ]* 12.2 Write property test for ReportGenerator
    - **Property 16: Cleanup Report Generation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ]* 12.3 Write unit tests for ReportGenerator
    - Test report generation with known removal results
    - Test space calculation with known file sizes
    - Test categorization of removed files
    - Test markdown formatting of report
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [-] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement CLI interface and orchestration
  - [x] 14.1 Create main CLI orchestrator
    - Wire together all components in pipeline: Analysis → Planning → Validation → Execution
    - Implement command-line argument parsing for project root path
    - Add progress indicators for each stage
    - Implement user confirmation step before execution
    - Handle user cancellation gracefully
    - _Requirements: 9.1, 9.2_

  - [x] 14.2 Add preview functionality
    - Display complete list of files to be removed before execution
    - Show categorized preview with reasons for removal
    - Display estimated space to be freed
    - _Requirements: 9.1_

  - [x] 14.3 Implement error handling and recovery
    - Add try-catch blocks for all file operations
    - Log all errors with full context
    - Generate error report if cleanup fails
    - Provide git-based recovery instructions
    - _Requirements: 9.3_

  - [ ]* 14.4 Write integration tests for CLI
    - Test end-to-end cleanup with test project structure
    - Test user confirmation and cancellation flows
    - Test error handling with permission issues
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 15. Implement post-cleanup validation
  - [ ] 15.1 Add post-cleanup verification
    - Verify only one backend folder remains
    - Verify project root contains fewer than 5 documentation files
    - Verify all essential files are preserved
    - Verify folder hierarchy is maintained
    - _Requirements: 4.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 15.2 Write property tests for post-cleanup state
    - **Property 17: Preview Before Execution**
    - **Validates: Requirements 9.1**
    - **Property 19: Clean Project Root Post-Condition**
    - **Validates: Requirements 10.1**
    - **Property 20: Structure Preservation Invariant**
    - **Validates: Requirements 10.2, 10.3**

  - [ ]* 15.3 Write unit tests for post-cleanup validation
    - Test verification with known post-cleanup state
    - Test detection of validation failures
    - _Requirements: 4.4, 10.1, 10.4_

- [ ] 16. Create documentation and usage guide
  - [ ] 16.1 Write README for cleanup tool
    - Document installation steps
    - Document usage instructions with examples
    - Document safety features and recovery process
    - Include pre-cleanup checklist (commit changes, backup important files)
    - _Requirements: 9.3_

  - [ ] 16.2 Add inline code documentation
    - Add JSDoc comments to all public methods
    - Document parameters, return values, and error conditions
    - Add usage examples in comments
    - _Requirements: All_

- [ ] 17. Final integration and testing
  - [ ] 17.1 Run complete test suite
    - Execute all unit tests with coverage report
    - Execute all property-based tests with 100 iterations
    - Verify 80% code coverage minimum
    - _Requirements: All_

  - [ ] 17.2 Perform manual testing on actual project
    - Run cleanup tool on the actual messy project
    - Verify web application still works after cleanup
    - Verify frontend can connect to backend
    - Verify all essential files are preserved
    - Verify git history is intact
    - Test recovery instructions
    - _Requirements: 5.1, 5.2, 7.1, 7.3, 9.3_

- [ ] 18. Final checkpoint - Ensure all tests pass and tool is ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The tool should be run from project root: `node cleanup-tool/src/index.js`
- Users should commit all changes before running cleanup for easy recovery
- All file operations use Node.js fs module with proper error handling
