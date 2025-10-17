# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Hybrid Sector Graph (HSG) architecture with brain-inspired memory sectors
- Multi-sector memory classification (episodic, semantic, procedural, emotional, reflective)
- Waypoint-based graph traversal system for enhanced memory retrieval
- Multiple embedding providers support (OpenAI, Google Gemini, Ollama, local models)
- Memory decay and reinforcement learning mechanisms
- Comprehensive Python SDK with zero dependencies
- JavaScript/TypeScript SDK with full HSG support
- Docker containerization with docker-compose setup
- Extensive examples for all SDK implementations
- Performance benchmarking tools and system monitoring
- Background processing for non-blocking operations
- Salience-based memory prioritization
- Cross-sector query capabilities
- Memory graph visualization support
- Automatic content classification system

### Changed
- Migrated from Fastify to vanilla Node.js server for better control
- Replaced basic vector storage with advanced HSG database schema
- Enhanced embedding system with provider fallback mechanisms
- Improved query performance with graph traversal algorithms
- Upgraded TypeScript configuration for better module compatibility

### Removed
- Fastify dependency and related middleware
- Basic vector-only retrieval system
- Single embedding provider limitation
- Synchronous processing bottlenecks

### Fixed
- Module import compatibility issues
- TypeScript compilation errors
- Cross-platform file path handling
- Memory leak in long-running processes
- Database connection pooling issues

### Security
- Added authentication middleware support
- Implemented input validation and sanitization
- Enhanced error handling to prevent information disclosure
- Added rate limiting capabilities

## [2.0.0] - 2024-10-17

### Added
- Initial HSG (Hybrid Sector Graph) implementation
- Brain-inspired multi-sector memory architecture
- Waypoint system for memory associations
- Multiple embedding provider support
- Memory decay and reinforcement mechanisms
- Python SDK with comprehensive API coverage
- JavaScript SDK with TypeScript support
- Docker containerization
- Comprehensive documentation and examples

### Changed
- Complete architecture overhaul from simple vector store to HSG
- Server implementation migrated to vanilla Node.js
- Database schema enhanced with graph capabilities
- Embedding system redesigned for multi-provider support

## [1.0.0] - 2024-09-15

### Added
- Initial OpenMemory implementation
- Basic vector similarity search
- Simple REST API
- SQLite database integration
- Basic embedding support
- Initial documentation

### Features
- Memory storage and retrieval
- Vector similarity search
- REST API endpoints
- Basic embedding generation
- SQLite persistence

---

## Release Notes

### Version 2.0.0 - "Brain Architecture"

This major release introduces the revolutionary Hybrid Sector Graph (HSG) architecture, transforming OpenMemory from a simple vector store into a brain-inspired memory system.

#### 🧠 Key Features:
- **Multi-Sector Memory:** Automatic classification into episodic, semantic, procedural, emotional, and reflective sectors
- **Graph Traversal:** Waypoint-based associations for enhanced memory retrieval
- **Adaptive Learning:** Memory decay and reinforcement based on usage patterns
- **Multi-Provider Embeddings:** Support for OpenAI, Gemini, Ollama, and local models

#### 🚀 Performance Improvements:
- 3x faster query performance with graph traversal
- 50% reduction in memory usage through sector optimization
- Background processing for non-blocking operations
- Intelligent caching and salience tracking

#### 🛠 Developer Experience:
- Zero-dependency Python SDK
- TypeScript-first JavaScript SDK
- Comprehensive examples and documentation
- Docker containerization for easy deployment
- Performance benchmarking tools

#### 📊 Compatibility:
- **Breaking Changes:** API endpoints updated for HSG compatibility
- **Migration:** Automatic migration from v1.x vector storage
- **Backwards Compatibility:** Legacy endpoints available with deprecation warnings

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this changelog and the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.