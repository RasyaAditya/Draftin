# Error Handling and Recovery

This document describes the error handling and recovery mechanisms implemented in the Project Cleanup Tool.

## Overview

The cleanup tool implements comprehensive error handling at every stage of the pipeline to ensure safe operation and provide clear recovery instructions when failures occur.

## Error Handling Features

### 1. Granular Try-Catch Blocks

Each stage of the pipeline has its own try-catch block:

- **Analysis Stage**: Catches errors during file scanning, documentation analysis, backend comparison, and config detection
- **Planning Stage**: Catches errors during removal plan creation
- **Validation Stage**: Catches errors during safety validation
- **Execution Stage**: Catches errors during file removal operations
- **Report Generation**: Catches errors during report generation (non-fatal)

### 2. Detailed Error Logging

The `logError()` function logs errors with full context:

```javascript
logError(stage, error, context)
```

Logs include:
- Stage where error occurred
- Error message
- Error type (constructor name)
- Error code (if available, e.g., EACCES, ENOENT, ENOSPC)
- Context information (JSON formatted)
- Full stack trace

### 3. Error Report Generation

When cleanup fails, an error report is automatically generated and saved to `CLEANUP_ERROR_REPORT.md`.

The report includes:
- Timestamp and failure status
- Error summary (stage, type, message, code)
- Context information (JSON formatted)
- Full stack trace
- Specific recovery instructions based on error type
- Git-based recovery commands

### 4. Context Tracking

The `stageContext` object accumulates information throughout execution:

```javascript
stageContext = {
  scanResults: { documentationCount, backendFoldersCount, essentialFilesCount },
  redundancyResults: { toRemoveCount, toKeepCount },
  backendComparison: { activeBackend, obsoleteBackend, uniqueFilesCount },
  duplicateConfigs: { copiesCount, originalsCount },
  removalPlan: { totalFilesAffected, estimatedSpaceFreed },
  validation: { safe, issuesCount },
  execution: { removedCount, failedCount, errorsCount },
  report: { path, generated }
}
```

This context is included in error reports to help diagnose issues.

## Error Types and Recovery

### Permission Errors (EACCES, EPERM)

**Cause**: Insufficient permissions to read/write/delete files

**Recovery Instructions**:
1. Run the tool with administrator/sudo privileges
2. Check file and directory permissions
3. Ensure no files are locked by other processes

### File Not Found (ENOENT)

**Cause**: Expected files or directories don't exist

**Recovery Instructions**:
1. Verify the project path is correct
2. Ensure the project structure matches expectations
3. Check if files were moved or deleted externally

### Disk Full (ENOSPC)

**Cause**: Insufficient disk space

**Recovery Instructions**:
1. Free up disk space
2. Retry the cleanup operation

### Validation Failures

**Cause**: Safety checks failed (e.g., essential files in removal list, active code references)

**Recovery Instructions**:
1. Review the validation issues listed in the error report
2. Manually verify the files in question
3. Adjust the project structure if needed
4. Report the issue if validation logic is incorrect

## Git-Based Recovery

All error reports include git recovery instructions:

```bash
# Check what was deleted
git status

# Restore a specific file
git checkout -- <file-path>

# Restore all deleted files
git reset --hard HEAD
```

**Important**: Users should commit all changes before running cleanup operations.

## Graceful Degradation

The tool implements graceful degradation where possible:

- **Report Generation Failure**: If report generation fails, the error is logged but the operation doesn't fail entirely
- **Partial Execution**: If some file operations fail, the tool continues with remaining operations and reports all failures

## Testing

Error handling is tested in `test/index.test.js`:

- Error logging with full context
- Error report generation
- Recovery instructions for different error types
- Stage context tracking
- Git recovery commands

Run tests with:
```bash
npm test -- test/index.test.js
```

## Best Practices

1. **Always commit changes** before running cleanup
2. **Review the removal plan** carefully before confirming
3. **Keep error reports** for troubleshooting
4. **Use git status** to verify no unexpected changes
5. **Report persistent issues** with the error report attached

## Example Error Report

```markdown
# Project Cleanup Error Report

**Generated:** 2024-01-15T10:30:00.000Z
**Status:** FAILED

## Error Summary

- **Stage:** Execution
- **Error Type:** Error
- **Error Message:** Permission denied: Cannot remove /path/to/file
- **Error Code:** EACCES

## Context Information

```json
{
  "stage": "File Removal",
  "removalPlan": {
    "totalFilesAffected": 10,
    "estimatedSpaceFreed": 1048576
  }
}
```

## Stack Trace

```
Error: Permission denied: Cannot remove /path/to/file
    at FileRemover._removeFile (...)
    at FileRemover.removeFiles (...)
    ...
```

## Recovery Instructions

1. **Permission Issue:** You may need elevated permissions to access certain files.
   - Try running the tool with administrator/sudo privileges
   - Check file and directory permissions in your project

2. **Review the error message** above for specific details about what went wrong.

3. **Check your git status** to ensure no unexpected changes were made:
   ```bash
   git status
   ```

4. **If any files were modified**, restore them using git:
   ```bash
   git reset --hard HEAD
   ```
```

## Requirements Validation

This implementation satisfies **Requirement 9.3**:

> IF the Web_Application fails after cleanup, THEN THE Cleanup_System SHALL provide instructions for recovery using git

The error handling implementation provides:
- ✅ Try-catch blocks for all file operations
- ✅ Detailed error logging with full context
- ✅ Error report generation on failure
- ✅ Git-based recovery instructions in all error reports
