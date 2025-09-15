/**
 * LLM file generation functions for the docusaurus-plugin-llms plugin
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { DocInfo, PluginContext, CustomLLMFile } from './types';
import { 
  writeFile, 
  readMarkdownFiles, 
  sanitizeForFilename, 
  ensureUniqueIdentifier, 
  createMarkdownContent 
} from './utils';
import { processFilesWithPatterns } from './processor';

/**
 * Clean a description for use in a TOC item
 * @param description - The original description
 * @returns Cleaned description suitable for TOC
 */
function cleanDescriptionForToc(description: string): string {
  if (!description) return '';
  
  // Get just the first line for TOC display
  const firstLine = description.split('\n')[0];
  
  // Remove heading markers only at the beginning of the line
  // Be careful to only remove actual heading markers (# followed by space at beginning)
  // and not hashtag symbols that are part of the content (inline hashtags)
  const cleaned = firstLine.replace(/^(#+)\s+/g, '');
  
  // Truncate if too long (150 characters max with ellipsis)
  return cleaned.length > 150 ? cleaned.substring(0, 147) + '...' : cleaned;
}

/**
 * Generate an LLM-friendly file
 * @param docs - Processed document information
 * @param outputPath - Path to write the output file
 * @param fileTitle - Title for the file
 * @param fileDescription - Description for the file
 * @param includeFullContent - Whether to include full content or just links
 * @param version - Version of the file
 * @param customRootContent - Optional custom content to include at the root level
 */
export async function generateLLMFile(
  docs: DocInfo[],
  outputPath: string,
  fileTitle: string,
  fileDescription: string,
  includeFullContent: boolean,
  version?: string,
  customRootContent?: string
): Promise<void> {
  console.log(`Generating file: ${outputPath}, version: ${version || 'undefined'}`);
  const versionInfo = version ? `\n\nVersion: ${version}` : '';
  
  if (includeFullContent) {
    // Generate full content file with header deduplication
    const usedHeaders = new Set<string>();
    const fullContentSections = docs.map(doc => {
      // Check if content already starts with the same heading to avoid duplication
      const trimmedContent = doc.content.trim();
      const firstLine = trimmedContent.split('\n')[0];
      
      // Check if the first line is a heading that matches our title
      const headingMatch = firstLine.match(/^#+\s+(.+)$/);
      const firstHeadingText = headingMatch ? headingMatch[1].trim() : null;
      
      // Generate unique header using the utility function
      const uniqueHeader = ensureUniqueIdentifier(
        doc.title, 
        usedHeaders, 
        (counter, base) => {
          // Try to make it more descriptive by adding the file path info if available
          if (doc.path && counter === 2) {
            const pathParts = doc.path.split('/');
            const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
            if (folderName) {
              return `(${folderName.charAt(0).toUpperCase() + folderName.slice(1)})`;
            }
          }
          return `(${counter})`;
        }
      );
      
      if (firstHeadingText === doc.title) {
        // Content already has the same heading, replace it with our unique header if needed
        if (uniqueHeader !== doc.title) {
          const restOfContent = trimmedContent.split('\n').slice(1).join('\n');
          return `## ${uniqueHeader}

${restOfContent}`;
        } else {
          // Replace the existing H1 with H2 to comply with llmstxt.org standard
          const restOfContent = trimmedContent.split('\n').slice(1).join('\n');
          return `## ${uniqueHeader}

${restOfContent}`;
        }
      } else {
        // Content doesn't have the same heading, add our unique H2 header
        return `## ${uniqueHeader}

${doc.content}`;
      }
    });

    // Use custom root content or default message
    const rootContent = customRootContent || 'This file contains all documentation content in a single document following the llmstxt.org standard.';
    
    const llmFileContent = createMarkdownContent(
      fileTitle,
      `${fileDescription}${versionInfo}`,
      `${rootContent}\n\n${fullContentSections.join('\n\n---\n\n')}`,
      true // include metadata (description)
    );

    await writeFile(outputPath, llmFileContent);
  } else {
    // Generate links-only file
    const tocItems = docs.map(doc => {
      // Clean and format the description for TOC
      const cleanedDescription = cleanDescriptionForToc(doc.description);
      
      return `- [${doc.title}](${doc.url})${cleanedDescription ? `: ${cleanedDescription}` : ''}`;
    });

    // Use custom root content or default message
    const rootContent = customRootContent || 'This file contains links to documentation sections following the llmstxt.org standard.';
    
    const llmFileContent = createMarkdownContent(
      fileTitle,
      `${fileDescription}${versionInfo}`,
      `${rootContent}\n\n## Table of Contents\n\n${tocItems.join('\n')}`,
      true // include metadata (description)
    );

    await writeFile(outputPath, llmFileContent);
  }
  
  console.log(`Generated: ${outputPath}`);
}

/**
 * Generate individual markdown files for each document
 * @param docs - Processed document information  
 * @param outputDir - Directory to write the markdown files
 * @param siteUrl - Base site URL
 * @param docsDir - The configured docs directory name (e.g., 'docs', 'documentation', etc.)
 * @param keepFrontMatter - Array of frontmatter keys to preserve in generated files
 * @returns Updated docs with new URLs pointing to generated markdown files
 */
export async function generateIndividualMarkdownFiles(
  docs: DocInfo[],
  outputDir: string,
  siteUrl: string,
  docsDir: string = 'docs',
  keepFrontMatter: string[] = []
): Promise<DocInfo[]> {
  const updatedDocs: DocInfo[] = [];
  const usedPaths = new Set<string>();
  
  
  for (const doc of docs) {
    // Use the original path structure, cleaning it up for file system use
    let relativePath = doc.path
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\.mdx?$/, '.md'); // Ensure .md extension
    
    
    relativePath = relativePath
      .replace(new RegExp(`^${docsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`), '');// Remove configured docs dir prefix
    
    // If path is empty or invalid, create a fallback path
    if (!relativePath || relativePath === '.md') {
      const sanitizedTitle = sanitizeForFilename(doc.title, 'untitled');
      relativePath = `${sanitizedTitle}.md`;
    }
    
    // Ensure path uniqueness
    let uniquePath = relativePath;
    let counter = 1;
    while (usedPaths.has(uniquePath.toLowerCase())) {
      counter++;
      const pathParts = relativePath.split('.');
      const extension = pathParts.pop() || 'md';
      const basePath = pathParts.join('.');
      uniquePath = `${basePath}-${counter}.${extension}`;
    }
    usedPaths.add(uniquePath.toLowerCase());
    
    // Create the full file path and ensure directory exists
    const fullPath = path.join(outputDir, uniquePath);
    const directory = path.dirname(fullPath);
    
    // Create directory structure if it doesn't exist
    await fs.mkdir(directory, { recursive: true });
    
    // Extract preserved frontmatter if specified
    let preservedFrontMatter: Record<string, any> = {};
    if (keepFrontMatter.length > 0 && doc.frontMatter) {
      for (const key of keepFrontMatter) {
        if (key in doc.frontMatter) {
          preservedFrontMatter[key] = doc.frontMatter[key];
        }
      }
    }

    // Create markdown content using the utility function
    const markdownContent = createMarkdownContent(
      doc.title, 
      doc.description, 
      doc.content, 
      true, // includeMetadata
      Object.keys(preservedFrontMatter).length > 0 ? preservedFrontMatter : undefined
    );
    
    // Write the markdown file
    await writeFile(fullPath, markdownContent);
    
    // Create updated DocInfo with new URL pointing to the generated markdown file
    // Convert file path to URL path (use forward slashes)
    const urlPath = uniquePath.replace(/\\/g, '/');
    const newUrl = `${siteUrl}/${urlPath}`;
    
    updatedDocs.push({
      ...doc,
      url: newUrl,
      path: `/${urlPath}` // Update path to the new markdown file
    });
    
    console.log(`Generated markdown file: ${uniquePath}`);
  }
  
  return updatedDocs;
}

/**
 * Generate standard LLM files (llms.txt and llms-full.txt)
 * @param context - Plugin context
 * @param allDocFiles - Array of all document files
 */
export async function generateStandardLLMFiles(
  context: PluginContext,
  allDocFiles: string[]
): Promise<void> {
  const { 
    outDir, 
    siteUrl,
    docTitle, 
    docDescription, 
    options 
  } = context;
  
  const { 
    generateLLMsTxt, 
    generateLLMsFullTxt,
    llmsTxtFilename = 'llms.txt',
    llmsFullTxtFilename = 'llms-full.txt',
    includeOrder = [],
    includeUnmatchedLast = true,
    version,
    generateMarkdownFiles = false,
    rootContent,
    fullRootContent
  } = options;
  
  if (!generateLLMsTxt && !generateLLMsFullTxt) {
    return;
  }
  
  // Process files for the standard outputs
  let processedDocs = await processFilesWithPatterns(
    context,
    allDocFiles,
    [], // No specific include patterns - include all
    [], // No additional ignore patterns beyond global ignoreFiles
    includeOrder,
    includeUnmatchedLast
  );
  
  console.log(`Processed ${processedDocs.length} documentation files for standard LLM files`);
  
  // Generate individual markdown files if requested
  if (generateMarkdownFiles && processedDocs.length > 0) {
    console.log('Generating individual markdown files...');
    processedDocs = await generateIndividualMarkdownFiles(
      processedDocs,
      outDir,
      siteUrl,
      context.docsDir,
      context.options.keepFrontMatter || []
    );
  }
  
  // Generate llms.txt
  if (generateLLMsTxt) {
    const llmsTxtPath = path.join(outDir, llmsTxtFilename);
    await generateLLMFile(
      processedDocs,
      llmsTxtPath,
      docTitle,
      docDescription,
      false, // links only
      version,
      rootContent
    );
  }

  // Generate llms-full.txt
  if (generateLLMsFullTxt) {
    const llmsFullTxtPath = path.join(outDir, llmsFullTxtFilename);
    await generateLLMFile(
      processedDocs,
      llmsFullTxtPath,
      docTitle,
      docDescription,
      true, // full content
      version,
      fullRootContent
    );
  }
}

/**
 * Generate custom LLM files based on configuration
 * @param context - Plugin context
 * @param allDocFiles - Array of all document files
 */
export async function generateCustomLLMFiles(
  context: PluginContext,
  allDocFiles: string[]
): Promise<void> {
  const { outDir, siteUrl, docTitle, docDescription, options } = context;
  const { customLLMFiles = [], ignoreFiles = [], generateMarkdownFiles = false } = options;
  
  if (customLLMFiles.length === 0) {
    return;
  }
  
  console.log(`Generating ${customLLMFiles.length} custom LLM files...`);
  
  for (const customFile of customLLMFiles) {
    console.log(`Processing custom file: ${customFile.filename}, version: ${customFile.version || 'undefined'}`);
    
    // Combine global ignores with custom ignores
    const combinedIgnores = [...ignoreFiles];
    if (customFile.ignorePatterns) {
      combinedIgnores.push(...customFile.ignorePatterns);
    }
    
    // Process files according to the custom configuration
    let customDocs = await processFilesWithPatterns(
      context,
      allDocFiles,
      customFile.includePatterns,
      combinedIgnores,
      customFile.orderPatterns || [],
      customFile.includeUnmatchedLast ?? false
    );
    
    if (customDocs.length > 0) {
      // Generate individual markdown files if requested
      if (generateMarkdownFiles) {
        console.log(`Generating individual markdown files for custom file: ${customFile.filename}...`);
        customDocs = await generateIndividualMarkdownFiles(
          customDocs,
          outDir,
          siteUrl,
          context.docsDir,
          context.options.keepFrontMatter || []
        );
      }
      
      // Use custom title/description or fall back to defaults
      const customTitle = customFile.title || docTitle;
      const customDescription = customFile.description || docDescription;
      
      // Generate the custom LLM file
      const customFilePath = path.join(outDir, customFile.filename);
      await generateLLMFile(
        customDocs,
        customFilePath,
        customTitle,
        customDescription,
        customFile.fullContent,
        customFile.version,
        customFile.rootContent
      );
      
      console.log(`Generated custom LLM file: ${customFile.filename} with ${customDocs.length} documents`);
    } else {
      console.warn(`No matching documents found for custom LLM file: ${customFile.filename}`);
    }
  }
}

/**
 * Collect all document files from docs directory and optionally blog
 * @param context - Plugin context
 * @returns Array of file paths
 */
export async function collectDocFiles(context: PluginContext): Promise<string[]> {
  const { siteDir, docsDir, options } = context;
  const { ignoreFiles = [], includeBlog = false } = options;
  
  const allDocFiles: string[] = [];
  
  // Process docs directory
  const fullDocsDir = path.join(siteDir, docsDir);
  
  try {
    await fs.access(fullDocsDir);
    
    // Collect all markdown files from docs directory
    const docFiles = await readMarkdownFiles(fullDocsDir, siteDir, ignoreFiles);
    allDocFiles.push(...docFiles);
    
  } catch (err) {
    console.warn(`Docs directory not found: ${fullDocsDir}`);
  }
  
  // Process blog if enabled
  if (includeBlog) {
    const blogDir = path.join(siteDir, 'blog');
    
    try {
      await fs.access(blogDir);
      
      // Collect all markdown files from blog directory
      const blogFiles = await readMarkdownFiles(blogDir, siteDir, ignoreFiles);
      allDocFiles.push(...blogFiles);
      
    } catch (err) {
      console.warn(`Blog directory not found: ${blogDir}`);
    }
  }
  
  return allDocFiles;
} 