---
title: Quick Start Guide
description: Get up and running with our product in less than 5 minutes.
sidebar_position: 1
tags: [beginner, tutorial]
---

# Quick Start Guide

This guide will help you set up and run your first application in less than 5 minutes.

## Prerequisites

Before you begin, make sure you have:

- Node.js v16 or higher installed
- A valid account on our platform
- Basic knowledge of JavaScript

## Step 1: Installation

Install the package using npm:

```bash
npm install @example/sdk
```

## Step 2: Create Configuration File

Create a file named `config.js` with the following content:

```javascript
module.exports = {
  apiKey: 'YOUR_API_KEY',
  environment: 'development',
  debug: true
};
```

Replace `YOUR_API_KEY` with the key from your account dashboard.

## Step 3: Initialize the SDK

Create an `index.js` file:

```javascript
const ExampleSDK = require('@example/sdk');
const config = require('./config');

async function main() {
  // Initialize the SDK
  const sdk = new ExampleSDK(config);
  
  // Verify connection
  const status = await sdk.checkStatus();
  console.log('Connection status:', status);
  
  // Your application code goes here
}

main().catch(console.error);
```

## Step 4: Run Your Application

Execute your application with:

```bash
node index.js
```

You should see the connection status printed in your console.

## Next Steps

- Explore the [API Reference](/api/overview) to learn about all available methods
- Check out our [Examples](https://github.com/example/sdk-examples) repository
- Join our [Discord community](https://discord.gg/example) for support

## Troubleshooting

If you encounter any issues, please verify:

1. Your API key is correct
2. You have the latest version of the SDK
3. Your network allows connections to our API servers 