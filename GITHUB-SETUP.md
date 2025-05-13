# GitHub Repository Setup for SolViz Studio

This document provides guidelines for managing the SolViz Studio GitHub repository.

## Repository Structure

The repository follows a monorepo structure with the following components:

- `/solviz/frontend` - Next.js/React frontend application
- `/solviz/backend` - FastAPI/Python backend application
- `/solviz/docs` - Project documentation
- `/solviz/.github` - GitHub-specific configuration and workflows

## Branch Strategy

We follow the GitFlow workflow with the following branches:

- `main` - Production branch, contains released code
- `development` - Development branch for integrating features
- `feature/*` - Feature branches for individual features
- `bugfix/*` - Bug fix branches
- `release/*` - Release preparation branches
- `hotfix/*` - Hotfix branches for production

## Pull Request Workflow

1. Create a feature/bugfix branch from `development`
2. Implement your changes with tests
3. Submit a Pull Request to `development`
4. Ensure CI passes and get code review
5. Merge to `development` once approved

## Continuous Integration

The `.github/workflows/ci.yml` file defines our CI pipeline, which:

- Runs the backend tests with pytest
- Runs the frontend tests with Jest
- Performs linting on both codebases

## Release Process

1. Create a `release/vX.Y.Z` branch from `development`
2. Make any release-specific adjustments (version numbers, etc.)
3. Submit a PR from `release/vX.Y.Z` to `main`
4. After approval and merge, tag the release on `main`

## Testing Before Commit

Before committing, ensure:

1. Backend tests pass: `cd backend && python -m pytest`
2. Frontend tests pass: `cd frontend && npm test`
3. Code adheres to linting standards

## Git Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>
```

Where `type` is one of:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code refactoring without changing behavior
- test: Adding or modifying tests
- chore: Changes to the build process, tools, etc.

## Ignore Files

The repository uses several `.gitignore` files:

- Root `.gitignore` - Project-wide ignore patterns
- `/solviz/frontend/.gitignore` - Frontend-specific patterns
- `/solviz/backend/.gitignore` - Backend-specific patterns

Do not commit sensitive information such as API keys, passwords, or environment variables.
