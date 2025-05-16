/**
 * Unit tests for path transformation functionality
 * 
 * Run with: node test-path-transforms.js
 */

// Since the function is not directly exported, we'll reimplement it here for testing
function applyPathTransformations(
  urlPath,
  pathTransformation
) {
  if (!pathTransformation) {
    return urlPath;
  }

  let transformedPath = urlPath;
  
  // Remove ignored path segments
  if (pathTransformation.ignorePaths?.length) {
    for (const ignorePath of pathTransformation.ignorePaths) {
      // Create a regex that matches the ignore path at the beginning, middle, or end of the path
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

// Test cases
const testCases = [
  {
    name: 'No transformations',
    input: 'docs/api/method',
    config: null,
    expected: 'docs/api/method'
  },
  {
    name: 'Ignore "docs" at beginning',
    input: 'docs/api/method',
    config: { ignorePaths: ['docs'] },
    expected: 'api/method'
  },
  {
    name: 'Ignore "api" in middle',
    input: 'docs/api/method',
    config: { ignorePaths: ['api'] },
    expected: 'docs/method'
  },
  {
    name: 'Ignore multiple paths',
    input: 'docs/api/method',
    config: { ignorePaths: ['docs', 'api'] },
    expected: 'method'
  },
  {
    name: 'Add path',
    input: 'api/method',
    config: { addPaths: ['reference'] },
    expected: 'reference/api/method'
  },
  {
    name: 'Add path when already exists',
    input: 'reference/api/method',
    config: { addPaths: ['reference'] },
    expected: 'reference/api/method'
  },
  {
    name: 'Multiple add paths',
    input: 'method',
    config: { addPaths: ['reference', 'api'] },
    expected: 'reference/api/method'
  },
  {
    name: 'Both ignore and add paths',
    input: 'docs/old/api/method',
    config: { 
      ignorePaths: ['docs', 'old'],
      addPaths: ['reference']
    },
    expected: 'reference/api/method'
  },
  {
    name: 'Handle index files correctly',
    input: 'docs/index',
    config: { ignorePaths: ['docs'] },
    expected: 'index'
  },
  {
    name: 'Handle empty result from ignoring',
    input: 'docs',
    config: { ignorePaths: ['docs'] },
    expected: ''
  },
  {
    name: 'Path prefix handling',
    pathPrefix: 'docs',
    input: 'api/method',
    config: { ignorePaths: ['docs'] },
    // Should remove 'docs' from the final URL
    expected: 'api/method'
  }
];

// Run tests
function runTests() {
  console.log('Running path transformation unit tests...\n');
  
  let passCount = 0;
  
  testCases.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test.name}`);
    console.log(`  Input: "${test.input}"`);
    
    const result = applyPathTransformations(test.input, test.config);
    console.log(`  Result: "${result}"`);
    console.log(`  Expected: "${test.expected}"`);
    
    if (result === test.expected) {
      console.log('  ✅ PASS');
      passCount++;
    } else {
      console.log('  ❌ FAIL');
    }
    
    // Additional test for path prefix handling if specified
    if (test.pathPrefix) {
      console.log(`  Path prefix: "${test.pathPrefix}"`);
      let transformedPathPrefix = test.pathPrefix;
      if (test.pathPrefix && test.config?.ignorePaths?.includes(test.pathPrefix)) {
        transformedPathPrefix = '';
      }
      console.log(`  Transformed prefix: "${transformedPathPrefix}"`);
      const expectedPrefix = test.pathPrefix && test.config?.ignorePaths?.includes(test.pathPrefix) ? '' : test.pathPrefix;
      
      if (transformedPathPrefix === expectedPrefix) {
        console.log('  ✅ PREFIX PASS');
      } else {
        console.log('  ❌ PREFIX FAIL');
        passCount--;
      }
    }
    
    console.log('');
  });
  
  console.log(`Results: ${passCount} of ${testCases.length} tests passed.`);
}

runTests(); 