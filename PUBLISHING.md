# Publishing docusaurus-plugin-llms

This document outlines the steps to publish the `docusaurus-plugin-llms` package to npm.

## Prerequisites

- An npm account. If you don't have one, you can create one at [npmjs.com](https://www.npmjs.com/signup).
- Ensure you're logged in to npm from the command line. If not, run:
  ```bash
  npm login
  ```

## Publishing Steps

1. **Ensure all changes are committed**

   Make sure all your changes are committed to version control.

2. **Update the version**

   Update the version in `package.json`. Follow [semantic versioning](https://semver.org/) principles:
   - `patch` (0.1.x) for bug fixes
   - `minor` (0.x.0) for new features
   - `major` (x.0.0) for breaking changes

   You can use npm to update the version:
   ```bash
   # For a patch update (0.1.0 -> 0.1.1)
   npm version patch
   
   # For a minor update (0.1.0 -> 0.2.0)
   npm version minor
   
   # For a major update (0.1.0 -> 1.0.0)
   npm version major
   ```

3. **Run the build and cleanup process**

   This will compile TypeScript and clean up unnecessary files:
   ```bash
   npm run build && npm run cleanup
   ```

4. **Verify the package contents**

   Check what files will be included in the package:
   ```bash
   npm pack --dry-run
   ```

5. **Publish to npm**

   When you're ready to publish:
   ```bash
   npm publish
   ```

   For the first time publishing, you might want to publish with the `public` flag:
   ```bash
   npm publish --access=public
   ```

6. **Verify the published package**

   Check that your package is listed on npm:
   https://www.npmjs.com/package/docusaurus-plugin-llms

## Post-publishing

1. **Create a git tag for the version**

   ```bash
   git tag -a v0.1.0 -m "Version 0.1.0"
   git push origin v0.1.0
   ```

2. **Update the release notes**

   If you have a GitHub repository, create a new release with release notes on GitHub.

## Publishing a pre-release version

If you want to publish a pre-release version:

```bash
# Update version with pre-release tag
npm version prerelease --preid=alpha

# Publish with tag
npm publish --tag alpha
```

Users can install the pre-release version with:
```bash
npm install docusaurus-plugin-llms@alpha
``` 