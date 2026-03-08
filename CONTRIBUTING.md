# Contributing to HealthOmics AI Troubleshooter

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Run tests: `npm test`
6. Build the project: `npm run build`
7. Submit a pull request

## Development Setup

```bash
npm install
npm run build
npm test
```

## Code Style

- Follow TypeScript best practices
- Use Prettier for formatting: `npm run format`
- Use ESLint for linting: `npm run lint`
- Write tests for new features
- Include property-based tests where appropriate

## Testing

- Unit tests go in `tests/unit/`
- Property-based tests go in `tests/property/`
- Run tests with `npm test`
- Check coverage with `npm run test:coverage`

## Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Reference any related issues in your PR description

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone.

## Questions?

Open an issue or start a discussion on GitHub.
