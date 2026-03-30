# Project Cleanup Tool

A CLI tool to clean up messy project structures by removing duplicate, redundant, and obsolete files while preserving all functionality.

## Features

- Identifies and removes redundant documentation files
- Compares and consolidates duplicate backend folders
- Removes duplicate configuration files (e.g., "package - Copy.json")
- Validates safety before any deletions
- Generates comprehensive cleanup reports
- Preserves git history and essential files

## Installation

```bash
cd cleanup-tool
npm install
```

## Usage

```bash
# Run from the cleanup-tool directory
node src/index.js [project-root-path]

# If no path is provided, it will use the parent directory
node src/index.js
```

## Pre-Cleanup Checklist

Before running the cleanup tool, ensure you:

1. ✅ Commit all changes to git
2. ✅ Backup any important files
3. ✅ Verify the web application is working
4. ✅ Review the removal plan before confirming

## Safety Features

- **Preview Mode**: See all files to be removed before execution
- **Confirmation Step**: Explicit user confirmation required before deletions
- **Reference Checking**: Validates no active code references files to be removed
- **Essential File Protection**: Never removes .env, package.json, .gitignore, etc.
- **Git Preservation**: Never touches .git/ folder or version control files

## Recovery

If cleanup causes issues, you can recover using git:

```bash
# See what was deleted
git status

# Restore specific file
git checkout -- <file>

# Restore all deleted files
git reset --hard HEAD
```

## Testing

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only property-based tests
npm run test:property

# Run with coverage
npm run test:coverage
```

## Development Status

This tool is currently under development. Task 1 (project structure setup) is complete.

## Requirements

- Node.js 14.x or higher
- Git (for recovery features)

## License

ISC
