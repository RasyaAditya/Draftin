# CLI Orchestrator Usage Guide

## Overview

The CLI orchestrator (`src/index.js`) is the main entry point for the Project Cleanup Tool. It wires together all components in a four-stage pipeline to safely analyze and clean up your project.

## Pipeline Stages

### Stage 1: Analysis
- Scans project structure using `FileScanner`
- Categorizes documentation files using `DocumentationAnalyzer`
- Compares backend folders using `BackendComparator`
- Detects duplicate configuration files using `ConfigFileDetector`

### Stage 2: Planning
- Creates removal plan using `RemovalPlanner`
- Prioritizes removals: documentation → configs → backend
- Calculates estimated space to be freed
- Displays enhanced preview with categorized file lists, reasons for removal, and safety checks

### Stage 3: Validation
- Validates removal plan using `SafetyValidator`
- Checks for references to files being removed
- Verifies essential files are preserved
- Ensures at least one backend folder remains
- Aborts if any safety issues are detected

### Stage 4: Execution
- Prompts user for confirmation
- Executes cleanup using `FileRemover`
- Generates report using `ReportGenerator`
- Saves report to `CLEANUP_REPORT.md`

## Usage

### Basic Usage

Run from project root:
```bash
node cleanup-tool/src/index.js
```

### Specify Project Path

Run on a specific project:
```bash
node cleanup-tool/src/index.js /path/to/project
```

### Example Output

```
Project Cleanup Tool v1.0.0
============================

Target project: C:\Users\user\project

═══════════════════════════════════════════════════
STAGE 1: ANALYSIS
═══════════════════════════════════════════════════

[Analysis] Scanning project structure...
[Analysis] Found 30 documentation files
[Analysis] Found 2 backend folders
[Analysis] Found 24 essential files

[Analysis] Categorizing documentation files...
[Analysis] Identified 25 redundant documentation files

[Analysis] Comparing backend folders...
[Analysis] Active backend: backend
[Analysis] Obsolete backend: Backend-Draftin-Clean
[Analysis] Unique files to preserve: 21

[Analysis] Detecting duplicate configuration files...
[Analysis] Found 2 duplicate configuration files

═══════════════════════════════════════════════════
STAGE 2: PLANNING
═══════════════════════════════════════════════════

[Planning] Creating removal plan...
[Planning] Total items to remove: 28
[Planning] Estimated space to free: 199.45 KB

╔═══════════════════════════════════════════════════════════════╗
║              CLEANUP PREVIEW - FILES TO BE REMOVED            ║
╚═══════════════════════════════════════════════════════════════╝

📊 SUMMARY
─────────────────────────────────────────────────────────────────
Total items to remove: 28
Estimated space freed: 199.45 KB

📄 DOCUMENTATION FILES
─────────────────────────────────────────────────────────────────
Count: 25 files
Reason: Redundant or outdated documentation

  Category: database-fixes
    • DATABASE_CONNECTION_SUMMARY.md (5.2 KB)
    • README_DATABASE_FIX.md (3.8 KB)
    ...

  Category: deployment
    • DEPLOY_OLD.md (12.5 KB)
    ...

⚙️  DUPLICATE CONFIGURATION FILES
─────────────────────────────────────────────────────────────────
Count: 2 files
Reason: Duplicate copies (originals will be preserved)

  • package - Copy.json (1 KB)
  • vite.config - Copy.ts (512 Bytes)

📁 OBSOLETE BACKEND FOLDER
─────────────────────────────────────────────────────────────────
Path: Backend-Draftin-Clean
Reason: Not actively used (active backend identified)

  ⚠️  Unique files to preserve (will be copied first):
    • models/Cart.js
    • models/Notification.js
    ...

🔄 EXECUTION ORDER
─────────────────────────────────────────────────────────────────
  1. Documentation files (lowest risk)
  2. Duplicate configuration files (medium risk)
  3. Obsolete backend folder (highest risk)

🛡️  SAFETY CHECKS
─────────────────────────────────────────────────────────────────
  ✓ Essential files will be preserved
  ✓ Active code will not be removed
  ✓ Git history will remain intact
  ✓ All removals are reversible via git

═══════════════════════════════════════════════════
STAGE 3: VALIDATION
═══════════════════════════════════════════════════

[Validation] Performing safety checks...
[Validation] ✓ All safety checks passed

═══════════════════════════════════════════════════
STAGE 4: EXECUTION
═══════════════════════════════════════════════════

⚠️  WARNING: This operation will permanently delete files.
Make sure you have committed all changes to git before proceeding.

Do you want to proceed with cleanup? (yes/no): yes

[Execution] Starting cleanup operations...
[Execution] Successfully removed: 28 items

═══════════════════════════════════════════════════
GENERATING REPORT
═══════════════════════════════════════════════════

[Report] Generating cleanup report...
[Report] Report saved to: C:\Users\user\project\CLEANUP_REPORT.md

═══════════════════════════════════════════════════
✓ CLEANUP COMPLETE
═══════════════════════════════════════════════════

Files removed: 28
Space freed: 199.45 KB
Report: C:\Users\user\project\CLEANUP_REPORT.md
```

## User Confirmation

Before executing any deletions, the tool displays an enhanced preview that includes:

### Preview Features
- **Complete file list**: All files to be removed are listed with their paths
- **Categorization**: Files are grouped by type (documentation, configs, backend)
- **Reasons**: Each category shows why files are being removed
- **File sizes**: Individual file sizes and total space to be freed
- **Safety indicators**: Visual confirmation of safety checks
- **Execution order**: Clear indication of removal sequence

The tool requires explicit user confirmation before executing any deletions:
- Type `yes` or `y` to proceed
- Type `no` or `n` to cancel
- Input is case-insensitive

## Cancellation

You can cancel the cleanup at any time:
- During confirmation prompt: Type `no` or press Ctrl+C
- The tool will exit gracefully without making any changes

## Error Handling

### Validation Failure
If safety validation fails, the tool will:
1. Display all detected issues
2. Abort cleanup operation
3. Exit with error code 1

Example:
```
❌ SAFETY VALIDATION FAILED

The following issues were detected:

1. Essential file marked for removal: package.json
2. File config.js is referenced by: src/app.js

Cleanup aborted for safety reasons.
```

### Fatal Errors
If a fatal error occurs during execution:
1. Error message and stack trace are displayed
2. Cleanup is aborted
3. Exit with error code 1

## Recovery

If the web application fails after cleanup, use git to recover:

```bash
# Check what was deleted
git status

# Restore a specific file
git checkout -- <file-path>

# Restore all deleted files
git reset --hard HEAD
```

## Requirements

- Node.js 14+ (ES modules support)
- Git repository (for recovery)
- All changes committed before running cleanup

## Component Integration

The CLI orchestrator integrates the following components:

1. **FileScanner** - Scans project structure
2. **DocumentationAnalyzer** - Categorizes and identifies redundant docs
3. **BackendComparator** - Compares backend folders
4. **ConfigFileDetector** - Finds duplicate configs
5. **RemovalPlanner** - Creates prioritized removal plan
6. **SafetyValidator** - Validates plan safety
7. **FileRemover** - Executes deletions
8. **ReportGenerator** - Generates cleanup report

## Progress Indicators

The tool displays progress indicators for each stage:
- `[Analysis]` - Analysis stage operations
- `[Planning]` - Planning stage operations
- `[Validation]` - Validation stage operations
- `[Execution]` - Execution stage operations
- `[Report]` - Report generation operations

## Exit Codes

- `0` - Success or user cancellation
- `1` - Error or validation failure

## Testing

Run the CLI orchestrator tests:
```bash
cd cleanup-tool
npx jest test/index.test.js
```

All tests should pass (15 tests total).
