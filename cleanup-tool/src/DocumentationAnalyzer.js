/**
 * DocumentationAnalyzer - Categorizes documentation files and identifies redundancies
 * 
 * This component analyzes documentation files by topic, categorizes them into
 * predefined categories, and identifies redundant files based on priority logic.
 */

/**
 * DocumentationAnalyzer class for categorizing and analyzing documentation files
 */
export class DocumentationAnalyzer {
  /**
   * Topic categories with their associated keywords
   */
  static TOPIC_CATEGORIES = {
    'database-fixes': ['DATABASE', 'MONGODB', 'CONNECTION', 'DB'],
    'login-fixes': ['LOGIN', 'AUTH', 'AUTHENTICATION', 'SIGNIN', 'SIGNUP'],
    'deployment': ['DEPLOY', 'HOSTINGER', 'PRODUCTION', 'HOSTING', 'SERVER'],
    'payment-setup': ['MIDTRANS', 'PAYMENT', 'PAY', 'TRANSACTION'],
    'general-setup': ['SETUP', 'QUICK', 'START', 'CHECKLIST', 'INSTALL', 'CONFIG'],
    'troubleshooting': ['TROUBLESHOOTING', 'FIX', 'PROBLEM', 'ERROR', 'ISSUE', 'DEBUG']
  };

  /**
   * Priority levels for file types (higher number = higher priority to keep)
   */
  static FILE_PRIORITIES = {
    'INDEX': 3,      // INDEX files have highest priority
    'SUMMARY': 2,    // SUMMARY and GUIDE files have medium priority
    'GUIDE': 2,
    'FIX': 1,        // FIX files have lower priority
    'PROBLEM': 1,
    'DEFAULT': 0     // Default priority for other files
  };

  /**
   * Extracts the topic category from a file name based on keywords
   * 
   * @param {string} fileName - The name of the file to categorize
   * @returns {string} The topic category (or 'general-setup' as default)
   */
  extractTopic(fileName) {
    const upperFileName = fileName.toUpperCase();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(DocumentationAnalyzer.TOPIC_CATEGORIES)) {
      for (const keyword of keywords) {
        if (upperFileName.includes(keyword)) {
          return category;
        }
      }
    }

    // Default to general-setup if no keywords match
    return 'general-setup';
  }

  /**
   * Categorizes documentation files by topic
   * 
   * @param {Array} documentationFiles - Array of file objects from FileScanner
   * @returns {Map<string, Array>} Map of topic categories to arrays of files
   */
  categorizeDocuments(documentationFiles) {
    const categorized = new Map();

    // Initialize all categories with empty arrays
    for (const category of Object.keys(DocumentationAnalyzer.TOPIC_CATEGORIES)) {
      categorized.set(category, []);
    }

    // Categorize each file
    for (const file of documentationFiles) {
      const topic = this.extractTopic(file.name);
      
      // Add category property to file object
      const fileWithCategory = { ...file, category: topic };
      
      if (!categorized.has(topic)) {
        categorized.set(topic, []);
      }
      categorized.get(topic).push(fileWithCategory);
    }

    return categorized;
  }

  /**
   * Determines the priority of a file based on its name
   * 
   * @private
   * @param {string} fileName - The name of the file
   * @returns {number} Priority level (higher = more important to keep)
   */
  _getFilePriority(fileName) {
    const upperFileName = fileName.toUpperCase();

    // Check for priority keywords in order
    for (const [keyword, priority] of Object.entries(DocumentationAnalyzer.FILE_PRIORITIES)) {
      if (keyword !== 'DEFAULT' && upperFileName.includes(keyword)) {
        return priority;
      }
    }

    return DocumentationAnalyzer.FILE_PRIORITIES.DEFAULT;
  }

  /**
   * Identifies redundant documentation files within categorized documents
   * 
   * Priority logic:
   * - INDEX files have highest priority (keep these)
   * - SUMMARY/GUIDE files have medium priority
   * - FIX files have lower priority
   * - Within same priority, keep the most recent file
   * 
   * @param {Map<string, Array>} categorizedDocs - Map from categorizeDocuments()
   * @returns {Object} Object with toKeep and toRemove arrays
   * @returns {Array} returns.toKeep - Files to preserve
   * @returns {Array} returns.toRemove - Files to remove
   */
  identifyRedundant(categorizedDocs) {
    const toKeep = [];
    const toRemove = [];

    // Process each category
    for (const [category, files] of categorizedDocs.entries()) {
      // Skip empty categories
      if (files.length === 0) {
        continue;
      }

      // If only one file in category, keep it
      if (files.length === 1) {
        toKeep.push(files[0]);
        continue;
      }

      // Sort files by priority (descending) and then by modification time (descending)
      const sortedFiles = [...files].sort((a, b) => {
        const priorityA = this._getFilePriority(a.name);
        const priorityB = this._getFilePriority(b.name);

        // First compare by priority
        if (priorityA !== priorityB) {
          return priorityB - priorityA; // Higher priority first
        }

        // If same priority, compare by modification time (more recent first)
        return new Date(b.modifiedTime) - new Date(a.modifiedTime);
      });

      // Keep the first file (highest priority/most recent)
      toKeep.push(sortedFiles[0]);

      // Mark the rest as redundant
      for (let i = 1; i < sortedFiles.length; i++) {
        toRemove.push(sortedFiles[i]);
      }
    }

    return { toKeep, toRemove };
  }

    /**
     * Consolidates multiple documentation files with unique content into a single file
     *
     * This method reads the content of files in the same category, detects unique
     * information across files, and creates a consolidated file with combined content.
     *
     * @param {Array} files - Array of file objects in the same category
     * @param {string} rootPath - Project root path for reading files
     * @returns {Promise<Object>} Consolidation result
     * @returns {string|null} returns.consolidatedContent - Combined content if consolidation needed
     * @returns {string|null} returns.consolidatedFileName - Suggested name for consolidated file
     * @returns {boolean} returns.needsConsolidation - Whether consolidation is needed
     */
    async consolidateFiles(files, rootPath) {
      // Need at least 2 files to consolidate
      if (files.length < 2) {
        return {
          consolidatedContent: null,
          consolidatedFileName: null,
          needsConsolidation: false
        };
      }

      try {
        // Read content from all files
        const { readFile } = await import('fs/promises');
        const { join } = await import('path');

        const fileContents = await Promise.all(
          files.map(async (file) => {
            try {
              const content = await readFile(join(rootPath, file.path), 'utf-8');
              return {
                file,
                content: content.trim(),
                lines: content.trim().split('\n').map(line => line.trim())
              };
            } catch (error) {
              console.warn(`Warning: Could not read file ${file.path}: ${error.message}`);
              return null;
            }
          })
        );

        // Filter out failed reads
        const validContents = fileContents.filter(fc => fc !== null);

        if (validContents.length < 2) {
          return {
            consolidatedContent: null,
            consolidatedFileName: null,
            needsConsolidation: false
          };
        }

        // Check if files have unique content
        const hasUniqueContent = this._detectUniqueContent(validContents);

        if (!hasUniqueContent) {
          return {
            consolidatedContent: null,
            consolidatedFileName: null,
            needsConsolidation: false
          };
        }

        // Merge content from all files
        const consolidatedContent = this._mergeFileContents(validContents);

        // Generate consolidated file name based on category
        const category = files[0].category || 'general';
        const consolidatedFileName = this._generateConsolidatedFileName(category, files);

        return {
          consolidatedContent,
          consolidatedFileName,
          needsConsolidation: true
        };
      } catch (error) {
        console.error(`Error during consolidation: ${error.message}`);
        return {
          consolidatedContent: null,
          consolidatedFileName: null,
          needsConsolidation: false
        };
      }
    }

    /**
     * Detects if files contain unique content that should be preserved
     *
     * @private
     * @param {Array} fileContents - Array of file content objects
     * @returns {boolean} True if files have unique content worth consolidating
     */
    _detectUniqueContent(fileContents) {
      if (fileContents.length < 2) {
        return false;
      }

      // Compare each file with others to find unique lines
      for (let i = 0; i < fileContents.length; i++) {
        const currentLines = new Set(fileContents[i].lines.filter(line => line.length > 0));

        for (let j = i + 1; j < fileContents.length; j++) {
          const otherLines = new Set(fileContents[j].lines.filter(line => line.length > 0));

          // Check if there are lines unique to each file
          const uniqueInCurrent = [...currentLines].filter(line => !otherLines.has(line));
          const uniqueInOther = [...otherLines].filter(line => !currentLines.has(line));

          // If both files have unique content (more than just headers), consolidation is needed
          const significantUniqueInCurrent = uniqueInCurrent.filter(line =>
            line.length > 10 && !line.startsWith('#')
          );
          const significantUniqueInOther = uniqueInOther.filter(line =>
            line.length > 10 && !line.startsWith('#')
          );

          if (significantUniqueInCurrent.length > 0 && significantUniqueInOther.length > 0) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Merges content from multiple files into a single consolidated document
     *
     * @private
     * @param {Array} fileContents - Array of file content objects
     * @returns {string} Merged content
     */
    _mergeFileContents(fileContents) {
      // Sort files by priority to determine merge order
      const sortedContents = [...fileContents].sort((a, b) => {
        const priorityA = this._getFilePriority(a.file.name);
        const priorityB = this._getFilePriority(b.file.name);
        return priorityB - priorityA; // Higher priority first
      });

      let mergedContent = '';

      // Add header
      mergedContent += '# Consolidated Documentation\n\n';
      mergedContent += `This document consolidates information from multiple files:\n`;
      sortedContents.forEach(fc => {
        mergedContent += `- ${fc.file.name}\n`;
      });
      mergedContent += '\n---\n\n';

      // Add content from each file
      sortedContents.forEach((fc, index) => {
        if (index > 0) {
          mergedContent += '\n---\n\n';
        }

        mergedContent += `## From: ${fc.file.name}\n\n`;
        mergedContent += fc.content + '\n';
      });

      return mergedContent;
    }

    /**
     * Generates a consolidated file name based on category and source files
     *
     * @private
     * @param {string} category - The topic category
     * @param {Array} files - Source files being consolidated
     * @returns {string} Generated file name
     */
    _generateConsolidatedFileName(category, files) {
      // Convert category to title case
      const categoryTitle = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');

      return `${categoryTitle}_CONSOLIDATED.md`;
    }
}
