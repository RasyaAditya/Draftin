# Project Cleanup Error Report

**Generated:** 2026-03-30T06:49:20.648Z
**Status:** FAILED

## Error Summary

- **Stage:** Validation
- **Error Type:** Error
- **Error Message:** Safety validation failed

## Context Information

```json
{
  "issues": [
    "File DEPLOY_HOSTINGER_PAKET_BIASA.md is referenced by: cleanup-tool\\test\\unit\\DocumentationAnalyzer.test.js",
    "File MIDTRANS_SETUP_GUIDE.md is referenced by: cleanup-tool\\test\\unit\\DocumentationAnalyzer.test.js",
    "File frontend\\package - Copy.json is referenced by: cleanup-tool\\examples\\removal-planner-example.js",
    "File frontend\\vite.config - Copy.ts is referenced by: cleanup-tool\\examples\\removal-planner-example.js"
  ],
  "removalPlan": {
    "totalFilesAffected": 28,
    "estimatedSpaceFreed": 204236
  }
}
```

## Stack Trace

```
Error: Safety validation failed
    at main (file:///C:/Users/rasya/Draftin/cleanup-tool/src/index.js:376:9)
```

## Recovery Instructions

The cleanup operation failed before making any changes to your project.

### Troubleshooting Steps:

2. **Review the error message** above for specific details about what went wrong.

3. **Check your git status** to ensure no unexpected changes were made:
   ```bash
   git status
   ```

4. **If any files were modified**, restore them using git:
   ```bash
   # Restore all changes
   git reset --hard HEAD
   ```

5. **Report the issue** if the problem persists, including this error report.
