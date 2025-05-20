---
title: Changelog
description: Complete version history with all features, improvements, and bug fixes.
sidebar_position: 6
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Experimental support for WebSocket connections
- New event subscription model for real-time updates

### Changed
- Improved error messaging for authentication failures

## [3.2.1] - 2023-11-15

### Fixed
- Fixed regression in error handling for network timeouts
- Corrected TypeScript definitions for the `configure()` method

### Security
- Updated dependencies to address potential vulnerability in a third-party package

## [3.2.0] - 2023-10-28

### Added
- New `batchProcess()` method for handling multiple items efficiently
- Support for custom retry strategies
- Added TypeScript 5.0 compatibility

### Changed
- Improved performance of large dataset processing by approximately 35%
- Enhanced logging with more context and better formatting
- Updated documentation with more examples

### Deprecated
- The `legacyFetch()` method is now deprecated and will be removed in v4.0

## [3.1.2] - 2023-09-12

### Fixed
- Addressed memory leak when processing very large datasets
- Fixed incorrect handling of UTF-8 characters in certain API responses
- Resolved issue with connection pooling under high load

## [3.1.1] - 2023-08-05

### Fixed
- Corrected an issue where rate limiting wasn't properly handled
- Fixed TypeScript type definitions for optional parameters

## [3.1.0] - 2023-07-18

### Added
- New caching layer for frequently accessed resources
- Support for request interceptors
- Added `debug` mode with detailed logging

### Changed
- Improved error handling with more descriptive messages
- Enhanced performance for batch operations

## [3.0.0] - 2023-06-02

### Added
- Complete rewrite with TypeScript
- New plugin system for extending functionality
- Built-in support for rate limiting
- Comprehensive test suite with 95%+ coverage

### Changed
- Simplified API with more consistent method names
- Improved documentation with more examples
- Better error handling with detailed error types
- Enhanced performance for most operations

### Removed
- Removed support for callback-style API (now Promise-based only)
- Dropped support for Node.js versions below 14
- Removed deprecated methods from v2.x

## [2.5.4] - 2023-03-15

### Fixed
- Addressed security vulnerability in dependency
- Fixed handling of unexpected server responses

## [2.5.3] - 2023-02-27

### Fixed
- Resolved issue with connection timeouts
- Fixed memory leak in connection pooling

## [2.5.2] - 2023-01-18

### Fixed
- Corrected TypeScript definitions
- Fixed JSON parsing error for certain response types

## [2.5.1] - 2022-12-05

### Fixed
- Addressed race condition in concurrent requests
- Fixed handling of redirect responses

## [2.5.0] - 2022-11-20

### Added
- Support for Node.js 18
- New methods for resource management
- Enhanced logging capabilities

### Changed
- Improved error reporting
- Better handling of network instability

## [2.4.2] - 2022-10-08

### Fixed
- Resolved regression in error handling
- Fixed memory consumption issue during large uploads

## [2.4.1] - 2022-09-15

### Security
- Updated dependencies to address security vulnerabilities

## [2.4.0] - 2022-08-22

### Added
- New authentication methods
- Support for custom headers
- Enhanced caching options

### Changed
- Improved performance for bulk operations
- Better handling of network errors with automatic retries

## [2.3.0] - 2022-07-10

### Added
- Streaming API for large data sets
- Custom serialization options
- Support for proxy configurations

### Fixed
- Several edge cases in error handling
- Improved resilience to network failures

## [2.2.1] - 2022-06-05

### Fixed
- Corrected handling of certain error conditions
- Fixed documentation links

## [2.2.0] - 2022-05-18

### Added
- New utility functions for common operations
- Enhanced logging with more detail levels

### Changed
- Improved validation for input parameters
- Better error messages for common mistakes

## [2.1.0] - 2022-04-03

### Added
- Support for custom timeout configurations
- New helper methods for common patterns

### Fixed
- Several edge cases in the request pipeline
- Improved handling of connection resets

## [2.0.0] - 2022-03-01

### Added
- Promise-based API (while maintaining callback support)
- Comprehensive documentation
- New configuration options

### Changed
- Modern codebase with ES6+ features
- Improved error handling
- Better performance across all operations

### Removed
- Deprecated methods from v1.x

## [1.9.5] - 2022-01-15

### Fixed
- Final bug fixes before v2.0 release

## [1.0.0] - 2021-07-01

### Added
- Initial stable release 