---
title: Core API Reference
description: Complete reference documentation for the core API functionalities.
sidebar_position: 2
---

# Core API Reference

This document provides detailed information about all core API methods and their parameters.

## Installation

```bash
npm install @example/core-api
```

## Methods

### initialize(options)

Initialize the API with the provided configuration options.

**Parameters:**

- `options` (Object): Configuration options
  - `apiKey` (string): Your API key
  - `environment` (string, optional): Environment to use ('production' or 'sandbox')
  - `timeout` (number, optional): Request timeout in milliseconds

**Returns:** 

Promise that resolves when initialization is complete.

**Example:**

```javascript
await api.initialize({
  apiKey: 'your-api-key',
  environment: 'production',
  timeout: 5000
});
```

### fetchData(endpoint, params)

Retrieve data from the specified endpoint.

**Parameters:**

- `endpoint` (string): API endpoint to call
- `params` (Object): Query parameters

**Returns:**

Promise that resolves with the fetched data.

**Example:**

```javascript
const data = await api.fetchData('users', { limit: 10 });
```

## Error Codes

| Code | Description |
|------|-------------|
| 401  | Unauthorized - Invalid API key |
| 404  | Resource not found |
| 429  | Rate limit exceeded |
| 500  | Server error | 