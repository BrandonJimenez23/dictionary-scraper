# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2025-06-08

### Added
- **Advanced CORS Support**: Implemented robust CORS handling with multiple proxy fallbacks for browser environments
- **Multi-Proxy Strategy**: Added 4 different CORS proxy services for maximum reliability in browsers
- **Environment Detection**: Automatic detection of Node.js vs browser environments with appropriate handling
- **CORS Documentation**: Created comprehensive CORS_GUIDE.md explaining browser vs Node.js behavior

### Enhanced
- **Browser Compatibility**: Linguee now works reliably in browser environments through intelligent CORS proxy usage
- **Error Handling**: Improved error messages with specific guidance for CORS issues and environment recommendations
- **Proxy Fallbacks**: Automatic fallback through multiple CORS proxy services when one fails
- **Performance Optimization**: Direct requests in Node.js, proxied requests only when necessary in browsers

### Fixed
- **Linguee CORS Issues**: Resolved all CORS blocking issues for Linguee in browser environments
- **Language Pair Support**: Fixed problematic language pairs like en-ru, en-zh, en-ar that were failing in browsers
- **Proxy Response Handling**: Improved parsing of different proxy response formats

### Technical Changes
- Added multiple CORS proxy services: allorigins.win, corsproxy.io, cors-anywhere, codetabs
- Enhanced RequestHandler with intelligent environment detection
- Improved error reporting with environment-specific suggestions
- Added comprehensive logging for CORS troubleshooting

### Documentation
- **CORS_GUIDE.md**: Complete guide for CORS handling, browser compatibility, and troubleshooting
- Updated README with browser compatibility information
- Added examples for both Node.js and browser environments

## [1.1.3] - 2025-06-08

### Changed
- **RequestHandler Complete Cleanup**: Removed ALL headers and proxy logic from HTTP requests
  - Eliminated User-Agent, Accept, and all other headers that could cause server blocking
  - Removed CORS proxy fallback mechanisms completely
  - Simplified RequestHandler to make clean, direct HTTP requests only
  - Improved server compatibility by avoiding detection as automated requests

### Tested
- WordReference scraper: ✅ Working correctly without headers
- Linguee scraper: ✅ Working correctly without headers
- Both scrapers now make minimal HTTP requests that are less likely to be blocked

## [1.1.2] - 2025-06-08

### Fixed
- **CORS Improvements**: Removed problematic User-Agent, Referer, and Accept headers that were causing 403 Forbidden errors
- **Header Optimization**: Both scrapers now work without custom headers, reducing chances of being blocked by servers
- **Better Compatibility**: Improved frontend application compatibility by removing server-blocking headers

### Improved
- **WordReference**: Enhanced reliability and better example extraction without restrictive headers
- **Linguee**: Now uses RequestHandler with CORS support and LanguageValidator for better language handling
- **Error Handling**: More robust connection handling and language validation for both scrapers
- **Unified Architecture**: Both scrapers now use common utilities for consistent behavior

### Technical Changes
- Removed all custom headers from HTTP requests in both scrapers
- Updated Linguee scraper to use RequestHandler.makeRequest() instead of direct axios calls
- Added LanguageValidator support to Linguee scraper for better language code handling
- Enhanced error messages and debugging information

### Enhanced
- **WordReference Parser**: Completely rewritten for better accuracy and robustness
  - Improved example extraction from `FrEx` and `ToEx` cells
  - Enhanced context processing for definitions like "(jogging, footracing)"
  - Smart URL formation for different language pairs
  - Better handling of row types and section headers
  - More accurate extraction of grammatical information and translations

- **Linguee Integration**: Optimized for maximum data extraction
  - Focused processing of `<div id="dictionary">` content
  - Enhanced extraction from `lemma` and `lemma featured` classes
  - Improved context and usage example handling
  - Smart fallback mechanisms for edge cases

### Fixed
- **CORS Issues**: Eliminated all CORS-related problems for frontend use
- **Data Extraction**: Resolved issues with missing examples and contextual information
- **URL Formation**: Fixed special cases for certain language pairs (e.g., English-Spanish)
- **Parser Reliability**: Enhanced error handling and edge case management

### Improved
- **Frontend Compatibility**: Zero configuration required for React, Vue, Angular applications
- **Error Handling**: More descriptive error messages and better fallback strategies
- **Performance**: Optimized parsing algorithms for faster response times

## [1.1.1] - 2025-06-07

### Added
- **Direct Function Exports**: New function-based API without class instantiation
- **Enhanced CORS Support**: Improved compatibility with frontend frameworks

## [1.0.0] - 2025-06-07

### Added

- **Multi-Dictionary Scraper System**: Professional unified API for multiple dictionary sources
- **WordReference Integration**: Full scraper with grammatical types, audio links, and comprehensive translations
- **Linguee Integration**: Context-based translations with real-world usage examples
- **TypeScript Support**: Complete type definitions for all APIs and data structures
- **Unified API**: Single interface to access multiple dictionaries with automatic fallback
- **Language Support**: 34 languages with 1000+ language pairs coverage
- **Professional Documentation**: Comprehensive README, implementation guide, and API reference
- **Dictionary Format Documentation**: Detailed specification of output formats for each dictionary
- **Error Handling**: Robust error management with meaningful error messages
- **Rate Limiting**: Built-in protection against anti-bot measures
- **ES Modules**: Modern JavaScript module system support
- **NPM Package Structure**: Professional package with proper exports, files, and metadata

### Features

- **Automatic Dictionary Selection**: Priority-based selection with fallback mechanisms
- **Language Pair Validation**: Automatic validation of supported language combinations
- **Flexible Translation Methods**: 
  - `translate(dictionary, word, from, to)` - Specific dictionary translation
  - `translateMultiple(word, from, to)` - All available dictionaries
  - `translateAuto(word, from, to)` - Best available dictionary
- **Comprehensive Output**: Includes translations, grammatical types, contexts, and metadata
- **Audio Support**: WordReference audio pronunciation links
- **Context Examples**: Linguee real-world usage examples
- **Statistics and Metadata**: Dictionary capabilities, language support, and feature information

### Technical

- **Dependencies**: axios for HTTP requests, cheerio for HTML parsing
- **Test Suite**: Comprehensive examples and test cases
- **Package Size**: Optimized for minimal footprint
- **Browser Compatibility**: Works in Node.js and modern browsers
- **Performance**: Efficient scraping with optimized selectors and parsing

### Documentation

- **README.md**: Complete user guide with examples and API reference
- **DICTIONARY_FORMATS.md**: Detailed format specifications for each dictionary
- **IMPLEMENTATION_GUIDE.md**: Guide for adding new dictionaries
- **DEPLOYMENT_GUIDE.md**: NPM publication and business strategy guide
- **TypeScript Definitions**: Complete type coverage for all APIs

### Supported Dictionaries

1. **WordReference** (Priority: 1)
   - Languages: 23 languages including EN, ES, FR, DE, IT, PT, RU, AR, ZH, JA, KO
   - Features: Audio, pronunciation, grammatical types, comprehensive translations
   
2. **Linguee** (Priority: 2)
   - Languages: 23 languages including EN, ES, FR, DE, PT, IT, NL, PL
   - Features: Context examples, verified translations, real-world usage

### Language Coverage

- **English** ↔ Spanish, French, German, Italian, Portuguese, Russian, Arabic, Chinese, Japanese, Korean, Dutch, Polish, and more
- **Spanish** ↔ French, Italian, Portuguese, Catalan, and more  
- **French** ↔ German, Italian, Portuguese, Dutch, and more
- **German** ↔ Spanish, French, Italian, Dutch, Polish, and more
- **Total**: 1000+ language pair combinations

## [Unreleased]

### Planned

- Cambridge Dictionary integration
- Oxford Dictionary integration
- Collins Dictionary integration
- Enhanced caching system
- Proxy rotation support
- Audio file downloading
- Batch translation support
- CLI interface

---

For more information about upcoming features and development roadmap, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
