/**
 * @fileoverview Docusaurus plugin that generates LLM-friendly documentation following the llmtxt.org standard.
 * 
 * This plugin creates two files:
 * - llms.txt: Contains links to all sections of documentation
 * - llms-full.txt: Contains all documentation content in a single file
 * 
 * The plugin runs during the Docusaurus build process and scans all Markdown files in the docs directory.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { minimatch } from 'minimatch';
import type { LoadContext, Plugin } from '@docusaurus/types';

/**
 * Interface for processed document information
 */
interface DocInfo {
  title: string;
  path: string;
  url: string;
  content: string;
  description: string;
}

/**
 * Plugin options interface
 */
interface PluginOptions {
  /** Whether to generate the llms.txt file (default: true) */
  generateLLMsTxt?: boolean;
  
  /** Whether to generate the llms-full.txt file (default: true) */
  generateLLMsFullTxt?: boolean;
  
  /** Base directory for documentation files (default: 'docs') */
  docsDir?: string;
  
  /** Array of glob patterns for files to ignore */
  ignoreFiles?: string[];
  
  /** Custom title to use in generated files (defaults to site title) */
  title?: string;
  
  /** Custom description to use in generated files (defaults to site tagline) */
  description?: string;
  
  /** Custom file name for the links file (default: 'llms.txt') */
  llmsTxtFilename?: string;
  
  /** Custom file name for the full content file (default: 'llms-full.txt') */
  llmsFullTxtFilename?: string;
  
  /** Whether to include blog content (default: false) */
  includeBlog?: boolean;
  
  /** Path transformation options for URL construction */
  pathTransformation?: {
    /** Path segments to ignore when constructing URLs (will be removed if found) */
    ignorePaths?: string[];
    /** Path segments to add when constructing URLs (will be prepended if not already present) */
    addPaths?: string[];
  };
}

/**
 * Write content to a file
 * @param filePath - Path to write the file to
 * @param data - Content to write
 */
async function writeFile(filePath: string, data: string): Promise<void> {
  return fs.writeFile(filePath, data, 'utf8');
}

/**
 * Read content from a file
 * @param filePath - Path of the file to read
 * @returns Content of the file
 */
async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

/**
 * Check if a file should be ignored based on glob patterns
 * @param filePath - Path to the file
 * @param baseDir - Base directory for relative paths
 * @param ignorePatterns - Glob patterns for files to ignore
 * @returns Whether the file should be ignored
 */
function shouldIgnoreFile(filePath: string, baseDir: string, ignorePatterns: string[]): boolean {
  if (ignorePatterns.length === 0) {
    return false;
  }
  
  const relativePath = path.relative(baseDir, filePath);
  
  return ignorePatterns.some(pattern => 
    minimatch(relativePath, pattern, { matchBase: true })
  );
}

/**
 * Recursively reads all Markdown files in a directory
 * @param dir - Directory to scan
 * @param baseDir - Base directory for relative paths
 * @param ignorePatterns - Glob patterns for files to ignore
 * @returns Array of file paths
 */
async function readMarkdownFiles(dir: string, baseDir: string, ignorePatterns: string[] = []): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (shouldIgnoreFile(fullPath, baseDir, ignorePatterns)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      const subDirFiles = await readMarkdownFiles(fullPath, baseDir, ignorePatterns);
      files.push(...subDirFiles);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract title from content or use the filename
 * @param data - Frontmatter data
 * @param content - Markdown content
 * @param filePath - Path to the file
 * @returns Extracted title
 */
function extractTitle(data: any, content: string, filePath: string): string {
  // First try frontmatter
  if (data.title) {
    return data.title;
  }
  
  // Then try first heading
  const headingMatch = content.match(/^#\s+(.*)/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // Finally use filename
  return path.basename(filePath, path.extname(filePath))
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Clean markdown content for LLM consumption
 * @param content - Raw markdown content
 * @returns Cleaned content
 */
function cleanMarkdownContent(content: string): string {
  // Remove HTML tags
  let cleaned = content.replace(/<[^>]*>/g, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return cleaned;
}

/**
 * Apply path transformations according to configuration
 * @param urlPath - Original URL path
 * @param pathTransformation - Path transformation configuration
 * @returns Transformed URL path
 */
function applyPathTransformations(
  urlPath: string,
  pathTransformation?: PluginOptions['pathTransformation']
): string {
  if (!pathTransformation) {
    return urlPath;
  }

  let transformedPath = urlPath;
  
  // Remove ignored path segments
  if (pathTransformation.ignorePaths?.length) {
    for (const ignorePath of pathTransformation.ignorePaths) {
      // Create a regex that matches the ignore path at the beginning, middle, or end of the path
      // We use word boundaries to ensure we match complete path segments
      const ignoreRegex = new RegExp(`(^|/)(${ignorePath})(/|$)`, 'g');
      transformedPath = transformedPath.replace(ignoreRegex, '$1$3');
    }
    
    // Clean up any double slashes that might have been created
    transformedPath = transformedPath.replace(/\/+/g, '/');
    
    // Remove leading slash if present
    transformedPath = transformedPath.replace(/^\//, '');
  }
  
  // Add path segments if they're not already present
  if (pathTransformation.addPaths?.length) {
    // Process in reverse order to maintain the specified order in the final path
    // This is because each path is prepended to the front
    const pathsToAdd = [...pathTransformation.addPaths].reverse();
    
    for (const addPath of pathsToAdd) {
      // Only add if not already present at the beginning
      if (!transformedPath.startsWith(addPath + '/') && transformedPath !== addPath) {
        transformedPath = `${addPath}/${transformedPath}`;
      }
    }
  }
  
  return transformedPath;
}

/**
 * Process a markdown file and extract its metadata and content
 * @param filePath - Path to the markdown file
 * @param baseDir - Base directory
 * @param siteUrl - Base URL of the site
 * @param pathPrefix - Path prefix for URLs (e.g., 'docs' or 'blog')
 * @param pathTransformation - Path transformation configuration
 * @returns Processed file data
 */
async function processMarkdownFile(
  filePath: string, 
  baseDir: string, 
  siteUrl: string,
  pathPrefix: string = 'docs',
  pathTransformation?: PluginOptions['pathTransformation']
): Promise<DocInfo> {
  const content = await readFile(filePath);
  const { data, content: markdownContent } = matter(content);
  
  const relativePath = path.relative(baseDir, filePath);
  // Convert to URL path format (replace backslashes with forward slashes on Windows)
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  // Convert .md extension to appropriate path
  const linkPathBase = normalizedPath.replace(/\.mdx?$/, '');
  
  // Handle index files specially
  const linkPath = linkPathBase.endsWith('index') 
    ? linkPathBase.replace(/\/index$/, '') 
    : linkPathBase;
  
  // Apply path transformations to the link path
  const transformedLinkPath = applyPathTransformations(linkPath, pathTransformation);
  
  // Also apply path transformations to the pathPrefix if it's not empty
  // This allows removing 'docs' from the path when specified in ignorePaths
  let transformedPathPrefix = pathPrefix;
  if (pathPrefix && pathTransformation?.ignorePaths?.includes(pathPrefix)) {
    transformedPathPrefix = '';
  }
  
  // Generate full URL with transformed path and path prefix
  const fullUrl = new URL(
    `${transformedPathPrefix ? `${transformedPathPrefix}/` : ''}${transformedLinkPath}`, 
    siteUrl
  ).toString();
  
  // Extract title
  const title = extractTitle(data, markdownContent, filePath);
  
  // Get description from frontmatter or first paragraph
  let description = data.description || '';
  if (!description) {
    const paragraphs = markdownContent.split('\n\n');
    for (const para of paragraphs) {
      if (para.trim() && !para.startsWith('#')) {
        description = para.trim();
        break;
      }
    }
  }
  
  // Clean and process content
  const cleanedContent = cleanMarkdownContent(markdownContent);
  
  return {
    title,
    path: normalizedPath,
    url: fullUrl,
    content: cleanedContent,
    description: description || '',
  };
}

/**
 * A Docusaurus plugin to generate LLM-friendly documentation following
 * the llmtxt.org standard
 * 
 * @param context - Docusaurus context
 * @param options - Plugin options
 * @returns Plugin object
 */
export default function docusaurusPluginLLMs(
  context: LoadContext,
  options: PluginOptions = {}
): Plugin<void> {
  // Set default options
  const {
    generateLLMsTxt = true,
    generateLLMsFullTxt = true,
    docsDir = 'docs',
    ignoreFiles = [],
    title,
    description,
    llmsTxtFilename = 'llms.txt',
    llmsFullTxtFilename = 'llms-full.txt',
    includeBlog = false,
    pathTransformation,
  } = options;

  const {
    siteDir,
    siteConfig,
    outDir,
  } = context;

  return {
    name: 'docusaurus-plugin-llms',

    /**
     * Generates LLM-friendly documentation files after the build is complete
     */
    async postBuild(): Promise<void> {
      console.log('Generating LLM-friendly documentation...');

      // Custom title and description or fallback to site values
      const docTitle = title || siteConfig.title;
      const docDescription = description || siteConfig.tagline || '';
      
      // Build the site URL with proper trailing slash
      const siteUrl = siteConfig.url + (
        siteConfig.baseUrl.endsWith('/') 
          ? siteConfig.baseUrl.slice(0, -1) 
          : siteConfig.baseUrl || ''
      );
      
      // Initialize docs collection
      const allDocs: DocInfo[] = [];

      try {
        // Process docs directory
        const fullDocsDir = path.join(siteDir, docsDir);
        
        try {
          await fs.access(fullDocsDir);
          
          // Collect all markdown files from docs directory
          const docFiles = await readMarkdownFiles(fullDocsDir, siteDir, ignoreFiles);
          
          if (docFiles.length > 0) {
            // Process each file
            for (const filePath of docFiles) {
              try {
                const docInfo = await processMarkdownFile(
                  filePath, 
                  fullDocsDir, 
                  siteUrl,
                  'docs',
                  pathTransformation
                );
                allDocs.push(docInfo);
              } catch (err: any) {
                console.warn(`Error processing ${filePath}: ${err.message}`);
              }
            }
            console.log(`Processed ${docFiles.length} documentation files`);
          } else {
            console.warn('No markdown files found in docs directory.');
          }
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
            
            if (blogFiles.length > 0) {
              // Process each file
              for (const filePath of blogFiles) {
                try {
                  const docInfo = await processMarkdownFile(
                    filePath, 
                    blogDir, 
                    siteUrl,
                    'blog',
                    pathTransformation
                  );
                  allDocs.push(docInfo);
                } catch (err: any) {
                  console.warn(`Error processing ${filePath}: ${err.message}`);
                }
              }
              console.log(`Processed ${blogFiles.length} blog files`);
            } else {
              console.warn('No markdown files found in blog directory.');
            }
          } catch (err) {
            console.warn(`Blog directory not found: ${blogDir}`);
          }
        }
        
        // Skip further processing if no documents were found
        if (allDocs.length === 0) {
          console.warn('No documents found to process.');
          return;
        }
        
        // Sort files to ensure consistent ordering
        allDocs.sort((a, b) => a.title.localeCompare(b.title));

        // Generate llms.txt
        if (generateLLMsTxt) {
          const llmsTxtPath = path.join(outDir, llmsTxtFilename);
          const tocItems = allDocs.map(doc => {
            return `- [${doc.title}](${doc.url})${doc.description ? `: ${doc.description.split('\n')[0]}` : ''}`;
          });

          const llmsTxtContent = `# ${docTitle}

> ${docDescription}

This file contains links to all documentation sections following the llmtxt.org standard.

## Table of Contents

${tocItems.join('\n')}
`;

          await writeFile(llmsTxtPath, llmsTxtContent);
          console.log(`Generated ${llmsTxtFilename}: ${llmsTxtPath}`);
        }

        // Generate llms-full.txt with all content
        if (generateLLMsFullTxt) {
          const llmsFullTxtPath = path.join(outDir, llmsFullTxtFilename);
          
          const fullContentSections = allDocs.map(doc => {
            return `## ${doc.title}

${doc.content}`;
          });

          const llmsFullTxtContent = `# ${docTitle}

> ${docDescription}

This file contains all documentation content in a single document following the llmtxt.org standard.

${fullContentSections.join('\n\n---\n\n')}
`;

          await writeFile(llmsFullTxtPath, llmsFullTxtContent);
          console.log(`Generated ${llmsFullTxtFilename}: ${llmsFullTxtPath}`);
        }
        
        // Output statistics
        const stats = {
          totalDocuments: allDocs.length,
          totalBytes: allDocs.reduce((sum, doc) => sum + doc.content.length, 0),
          approxTokens: Math.round(allDocs.reduce((sum, doc) => sum + doc.content.length, 0) / 4), // Rough token estimate
        };
        
        console.log(`Stats: ${stats.totalDocuments} documents, ${Math.round(stats.totalBytes / 1024)}KB, ~${stats.approxTokens} tokens`);
      } catch (err: any) {
        console.error('Error generating LLM documentation:', err);
      }
    },
  };
} 