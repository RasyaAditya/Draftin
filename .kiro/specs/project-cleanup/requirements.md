# Requirements Document

## Introduction

This document defines requirements for cleaning up a messy web application project by removing duplicate, redundant, and obsolete files while preserving all functionality. The project currently contains duplicate backend folders, numerous redundant documentation files, and outdated setup guides that need consolidation or removal.

## Glossary

- **Cleanup_System**: The automated system that identifies and removes unnecessary files
- **Active_Code**: Source code files that are currently used by the running web application
- **Documentation_File**: Markdown or text files containing setup guides, troubleshooting steps, or project information
- **Duplicate_Folder**: A folder that contains similar or identical content to another folder in the project
- **Essential_File**: Configuration files, package manifests, or code files required for application functionality
- **Obsolete_File**: Files that are no longer relevant to the current project state
- **Web_Application**: The complete system including frontend and backend components

## Requirements

### Requirement 1: Identify Redundant Documentation

**User Story:** As a developer, I want to identify all redundant documentation files, so that I can understand which files are duplicates or obsolete.

#### Acceptance Criteria

1. THE Cleanup_System SHALL scan all Documentation_Files in the project root directory
2. WHEN multiple Documentation_Files cover the same topic, THE Cleanup_System SHALL identify them as redundant
3. THE Cleanup_System SHALL categorize Documentation_Files by topic (database fixes, login fixes, deployment guides, payment setup, general setup)
4. THE Cleanup_System SHALL generate a report listing all redundant Documentation_Files with their categories

### Requirement 2: Remove Duplicate Documentation Files

**User Story:** As a developer, I want to remove duplicate documentation files, so that the project root is clean and organized.

#### Acceptance Criteria

1. WHEN redundant Documentation_Files are identified, THE Cleanup_System SHALL remove older or less comprehensive versions
2. THE Cleanup_System SHALL preserve the most recent or most comprehensive Documentation_File for each topic
3. IF multiple Documentation_Files contain unique information, THEN THE Cleanup_System SHALL consolidate them into a single file before removing duplicates
4. THE Cleanup_System SHALL remove at least 15 redundant Documentation_Files from the project root

### Requirement 3: Analyze Duplicate Backend Folders

**User Story:** As a developer, I want to understand the differences between duplicate backend folders, so that I can safely consolidate them.

#### Acceptance Criteria

1. THE Cleanup_System SHALL compare the contents of backend/ and Backend-Draftin-Clean/ folders
2. THE Cleanup_System SHALL identify which backend folder contains the Active_Code used by the Web_Application
3. THE Cleanup_System SHALL list all file differences between the two backend folders
4. THE Cleanup_System SHALL determine if Backend-Draftin-Clean/ contains any unique files not present in backend/

### Requirement 4: Remove Obsolete Backend Folder

**User Story:** As a developer, I want to remove the obsolete backend folder, so that there is only one source of truth for backend code.

#### Acceptance Criteria

1. WHEN the Active_Code backend folder is identified, THE Cleanup_System SHALL mark the other backend folder for removal
2. IF Backend-Draftin-Clean/ contains unique Essential_Files, THEN THE Cleanup_System SHALL copy them to backend/ before removal
3. THE Cleanup_System SHALL remove the obsolete backend folder and all its contents
4. AFTER removal, THE Cleanup_System SHALL verify that only one backend folder remains

### Requirement 5: Preserve Web Application Functionality

**User Story:** As a developer, I want to ensure the web application continues working after cleanup, so that no functionality is broken.

#### Acceptance Criteria

1. THE Cleanup_System SHALL NOT remove any Active_Code files from frontend/ or the active backend folder
2. THE Cleanup_System SHALL NOT remove Essential_Files including .env, package.json, package-lock.json, .gitignore, index.js, or configuration files
3. THE Cleanup_System SHALL NOT remove folders containing Active_Code (controllers/, models/, routes/, middleware/, utils/, src/, public/, dist/)
4. WHEN removing files, THE Cleanup_System SHALL verify no import statements or file references point to the removed files

### Requirement 6: Remove Duplicate Configuration Files

**User Story:** As a developer, I want to remove duplicate configuration files, so that the project only contains necessary files.

#### Acceptance Criteria

1. WHEN duplicate configuration files are found (e.g., "package - Copy.json", "vite.config - Copy.ts"), THE Cleanup_System SHALL remove the copy versions
2. THE Cleanup_System SHALL preserve the original configuration files without "Copy" in their names
3. THE Cleanup_System SHALL verify that removed configuration files are not referenced by any Active_Code

### Requirement 7: Preserve Version Control Files

**User Story:** As a developer, I want to keep git history and configuration, so that version control remains intact.

#### Acceptance Criteria

1. THE Cleanup_System SHALL NOT remove the .git/ folder or any of its contents
2. THE Cleanup_System SHALL NOT remove .gitignore files from any directory
3. THE Cleanup_System SHALL preserve all git configuration and history

### Requirement 8: Generate Cleanup Report

**User Story:** As a developer, I want to see a report of all cleanup actions, so that I understand what was removed and why.

#### Acceptance Criteria

1. AFTER cleanup completion, THE Cleanup_System SHALL generate a report listing all removed files
2. THE Cleanup_System SHALL categorize removed files by type (documentation, duplicate folders, obsolete files, duplicate configs)
3. THE Cleanup_System SHALL include the reason for removal for each file or folder
4. THE Cleanup_System SHALL report the total number of files removed and disk space freed

### Requirement 9: Safe Cleanup Execution

**User Story:** As a developer, I want cleanup to be performed safely, so that I can recover files if needed.

#### Acceptance Criteria

1. BEFORE removing any files, THE Cleanup_System SHALL create a list of files to be removed for user review
2. THE Cleanup_System SHALL provide a confirmation step before executing file deletions
3. IF the Web_Application fails after cleanup, THEN THE Cleanup_System SHALL provide instructions for recovery using git
4. THE Cleanup_System SHALL execute cleanup operations in a logical order (documentation first, then duplicate configs, then duplicate folders last)

### Requirement 10: Maintain Project Structure

**User Story:** As a developer, I want to maintain a clean project structure, so that the project is easy to navigate.

#### Acceptance Criteria

1. AFTER cleanup, THE project root SHALL contain only Essential_Files and active folders (backend/, frontend/, .git/, .kiro/)
2. THE Cleanup_System SHALL NOT create new folders or reorganize existing folder structures
3. THE Cleanup_System SHALL preserve the existing folder hierarchy for frontend/ and backend/
4. AFTER cleanup, THE project root SHALL contain fewer than 5 Documentation_Files
