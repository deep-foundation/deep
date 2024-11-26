# Contributing to Deep

Thank you for your interest in contributing to Deep! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style](#code-style)

## Code of Conduct

This project is meant to be a welcoming and inclusive space. All contributors are expected to adhere to our code of conduct, which promotes:
- Inclusive and respectful communication
- Constructive feedback
- Focus on the project's goals
- Collaborative problem-solving

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/deep.git`
3. Add the upstream repository: `git remote add upstream https://github.com/deep-foundation/deep.git`
4. Create a new branch for your changes: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn
- TypeScript knowledge
- React experience (for UI components)

### Installation
1. Install dependencies:
```bash
npm install
# or
yarn
```

2. Build the project:
```bash
npm run build
# or
yarn build
```

### Available Scripts
- `npm run test` - Run tests (from ./src/test.ts)
- `npm run build` - Build the project (build ./src into ./dist as import/npx scripts)
- `npm run next` - Start Next.js development server (development of next from ./src/app)
- `npm run server` - Build Next.js client-server application (build to ./server)
- `npm run start` - Start Next.js production server (starts ./server)
- `npm run client` - Build Next.js client application without server (build to ./client)
- `npm run ios` - Sync and open iOS project (from ./client to ./ios)
- `npm run android` - Sync and open Android project (from ./client to ./android)
- `npm run electron` - Build and open Electron app (from ./client to ./electron)
- `npm run assets` - Generate app icons and splash screens (from ./assets to all splashs/logos/icons/favicons places)

## Making Changes

1. Create a new branch for your changes
2. Write clear, concise commit messages
3. Follow the existing code style
4. Add tests for new functionality
5. Update documentation as needed
6. Ensure all tests pass

## Code Style

1. Keep code concise:
   - Don't create function variables for one-time use (e.g. in onChange)
   - Use inline functions for event handlers
   - Avoid unnecessary abstractions

2. Follow Deep relationship naming conventions:
   - Use PascalCase (capital first letter) for Type relationships (e.g., `Type`, `Contains`, `Value`)
   - Use camelCase (lowercase first letter) for instance relationships (e.g., `type`, `from`, `to`, `value`)

## Commits and Releases
For publishing, it is necessary to:
1. Increase the version level, usually patch
2. Extract changes description from `git status` and `git diff` for all modified files
3. Format the message according to the following template:
```
Version: type(scope): summary

body

Breaking Changes:
- list of breaking changes (if any)
```
