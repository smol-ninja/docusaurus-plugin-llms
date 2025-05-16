# 📜 docusaurus-plugin-llms

A Docusaurus plugin for generating LLM-friendly documentation following the [llmtxt standard](https://llmtxt.org/).

## Installation

There are two ways to use this plugin:

### 1. Direct Integration (Simplest Method)

For quick integration, create a plugin file directly in your Docusaurus project:

```bash
mkdir -p src/plugins/llms
```

Then create a file at `src/plugins/llms/index.js` with the plugin code. Finally, add it to your `docusaurus.config.js`:

```js
module.exports = {
  // ... your existing Docusaurus config
  plugins: [
    require('./src/plugins/llms'),
    // ... your other plugins
  ],
};
```

### 2. As a Package (Not Yet Published)

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
      },
    ],
    // ... your other plugins
  ],
};
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `generateLLMsTxt` | boolean | `true` | Whether to generate the links file |
| `generateLLMsFullTxt` | boolean | `true` | Whether to generate the full content file |
| `docsDir` | string | `'docs'` | Base directory for documentation files |
| `ignoreFiles` | string[] | `[]` | Array of glob patterns for files to ignore |
| `title` | string | Site title | Custom title to use in generated files |
| `description` | string | Site tagline | Custom description to use in generated files |
| `llmsTxtFilename` | string | `'llms.txt'` | Custom filename for the links file |
| `llmsFullTxtFilename` | string | `'llms-full.txt'` | Custom filename for the full content file |
| `includeBlog` | boolean | `false` | Whether to include blog content |

## How It Works

This plugin automatically generates the following files during the build process:

- **llms.txt**: Contains links to all sections of your documentation
- **llms-full.txt**: Contains all documentation content in a single file

These files follow the [llmtxt standard](https://llmtxt.org/), making your documentation optimized for use with Large Language Models (LLMs).

## Features

- ⚡️ Easy integration with Docusaurus
- ✅ Zero config required, works out of the box
- ⚙️ Highly customizable with multiple options
- 📝 Creates `llms.txt` with section links
- 📖 Produces `llms-full.txt` with all content in one file
- 🧹 Cleans HTML and normalizes content for optimal LLM consumption
- 📊 Provides statistics about generated documentation
- 📚 Option to include blog posts

## Implementation Details

The plugin:

1. Scans your `docs` directory recursively for all Markdown files
2. Optionally includes blog content
3. Extracts metadata, titles, and content from each file
4. Creates proper URL links to each document section
5. Generates a table of contents in `llms.txt`
6. Combines all documentation content in `llms-full.txt`
7. Provides statistics about the generated documentation

## Future Enhancements

Planned features for future versions:

- Advanced glob pattern matching for file filtering
- Support for i18n content
- Specific content tags for LLM-only sections

## License

MIT 