# 📜 docusaurus-plugin-llms

A Docusaurus plugin for generating LLM-friendly documentation following the [llmstxt standard](https://llmstxt.org/).

## Installation

```bash
npm install docusaurus-plugin-llms --save-dev
```

Then add to your Docusaurus configuration:

```js
module.exports = {
  // ... your existing Docusaurus config
  plugins: [
    'docusaurus-plugin-llms',
    // ... your other plugins
  ],
};
```

## Configuration Options

You can configure the plugin by passing options:

```js
module.exports = {
  // ... your existing Docusaurus config
  plugins: [
    [
      'docusaurus-plugin-llms',
      {
        // Options here
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        docsDir: 'docs',
        ignoreFiles: ['advanced/*', 'private/*'],
        title: 'My Project Documentation',
        description: 'Complete reference documentation for My Project',
        includeBlog: true,
        // Path transformation options
        pathTransformation: {
          // Paths to ignore when constructing URLs (will be removed if found)
          ignorePaths: ['docs'],
          // Paths to add when constructing URLs (will be prepended if not already present)
          addPaths: ['api'],
        },
      },
    ],
    // ... your other plugins
  ],
};
```

### Available Options

| Option                | Type     | Default           | Description                                  |
|-----------------------|----------|-------------------|----------------------------------------------|
| `generateLLMsTxt`     | boolean  | `true`            | Whether to generate the links file           |
| `generateLLMsFullTxt` | boolean  | `true`            | Whether to generate the full content file    |
| `docsDir`             | string   | `'docs'`          | Base directory for documentation files       |
| `ignoreFiles`         | string[] | `[]`              | Array of glob patterns for files to ignore   |
| `title`               | string   | Site title        | Custom title to use in generated files       |
| `description`         | string   | Site tagline      | Custom description to use in generated files |
| `llmsTxtFilename`     | string   | `'llms.txt'`      | Custom filename for the links file           |
| `llmsFullTxtFilename` | string   | `'llms-full.txt'` | Custom filename for the full content file    |
| `includeBlog`         | boolean  | `false`           | Whether to include blog content              |
| `pathTransformation`  | object   | `undefined`       | Path transformation options for URL construction |
| `pathTransformation.ignorePaths` | string[] | `[]`    | Path segments to ignore when constructing URLs |
| `pathTransformation.addPaths`   | string[] | `[]`    | Path segments to add when constructing URLs |

### Path Transformation Examples

The path transformation feature allows you to manipulate how URLs are constructed from file paths:

**Example 1**: Remove 'docs' from the URL path
```js
pathTransformation: {
  ignorePaths: ['docs'],
}
```
File path: `/content/docs/manual/decorators.md` → URL: `https://example.com/manual/decorators`

**Example 2**: Add 'api' to the URL path
```js
pathTransformation: {
  addPaths: ['api'],
}
```
File path: `/content/manual/decorators.md` → URL: `https://example.com/api/manual/decorators`

**Example 3**: Combine both transformations
```js
pathTransformation: {
  ignorePaths: ['docs'],
  addPaths: ['api'],
}
```
File path: `/content/docs/manual/decorators.md` → URL: `https://example.com/api/manual/decorators`

The configuration supports multiple path segments in both arrays.

## How It Works

This plugin automatically generates the following files during the build process:

- **llms.txt**: Contains links to all sections of your documentation
- **llms-full.txt**: Contains all documentation content in a single file

These files follow the [llmstxt standard](https://llmstxt.org/), making your documentation optimized for use with Large Language Models (LLMs).

## Features

- ⚡️ Easy integration with Docusaurus
- ✅ Zero config required, works out of the box
- ⚙️ Highly customizable with multiple options
- 📝 Creates `llms.txt` with section links
- 📖 Produces `llms-full.txt` with all content in one file
- 🧹 Cleans HTML and normalizes content for optimal LLM consumption
- 📊 Provides statistics about generated documentation
- 📚 Option to include blog posts
- 🔄 Path transformation to customize URL construction

## Implementation Details

The plugin:

1. Scans your `docs` directory recursively for all Markdown files
2. Optionally includes blog content
3. Extracts metadata, titles, and content from each file
4. Creates proper URL links to each document section
5. Applies path transformations according to configuration (removing or adding path segments)
6. Generates a table of contents in `llms.txt`
7. Combines all documentation content in `llms-full.txt`
8. Provides statistics about the generated documentation

## Testing

The plugin includes comprehensive tests in the `tests` directory:

- **Unit tests**: Test the path transformation functionality in isolation
- **Integration tests**: Simulate a Docusaurus build with various configurations

To run the tests:

```bash
# Run all tests
npm test

# Run just the unit tests
npm run test:unit

# Run just the integration tests
npm run test:integration
```

For more detailed testing instructions, see [tests/TESTING.md](tests/TESTING.md).

## Future Enhancements

Planned features for future versions:

- Advanced glob pattern matching for file filtering
- Support for i18n content
- Specific content tags for LLM-only sections

## License

MIT 