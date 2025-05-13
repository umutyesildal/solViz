# CI/CD for SolViz Studio Testing

This document explains how the Continuous Integration and Continuous Deployment (CI/CD) pipeline is set up for testing SolViz Studio.

## Overview

SolViz Studio uses GitHub Actions for its CI/CD pipeline, which automatically runs tests, linting, and generates code coverage reports whenever code is pushed to the repository or a pull request is created.

## GitHub Actions Workflow

The CI/CD pipeline is defined in the `.github/workflows/ci.yml` file and consists of the following jobs:

### Backend Tests

The `backend-tests` job:

1. Sets up a PostgreSQL database service
2. Installs Python and dependencies
3. Runs pytest on the backend code
4. Generates and uploads coverage reports

This ensures that the backend API and services are functioning correctly with each change.

### Frontend Tests

The `frontend-tests` job:

1. Sets up Node.js
2. Installs npm dependencies
3. Runs Jest tests on the frontend code
4. Generates and uploads coverage reports

This verifies that React components, stores, and utilities are working as expected.

### Linting

The `lint` job:

1. Runs ESLint on frontend code
2. Runs Flake8, Black, and isort on backend code

This enforces code quality and style guidelines.

## Local CI Workflow Testing

You can test the GitHub Actions workflow locally using [Act](https://github.com/nektos/act):

1. Install Act:
   ```
   brew install act
   ```

2. Run a specific job:
   ```
   act -j backend-tests
   ```
   or
   ```
   act -j frontend-tests
   ```

## Code Coverage Tracking

We use Codecov to track code coverage over time:

1. Coverage reports are generated during CI runs
2. Reports are uploaded to Codecov
3. Coverage trends and changes can be viewed on the Codecov dashboard
4. PR comments show coverage impact

## CI Badge

You can add CI status badges to your README.md with:

```markdown
![CI Status](https://github.com/username/solviz/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/username/solviz/branch/main/graph/badge.svg)](https://codecov.io/gh/username/solviz)
```

## Required Status Checks

To protect your main branches, you can require status checks to pass before merging:

1. Go to your repository's "Settings" tab
2. Navigate to "Branches"
3. Add a branch protection rule for `main` and `development`
4. Check "Require status checks to pass before merging"
5. Select the following status checks:
   - backend-tests
   - frontend-tests
   - lint

## Troubleshooting Common CI Issues

### 1. Failed Backend Tests

- Check PostgreSQL connection issues
- Ensure environment variables are properly set
- Look for missing dependencies

### 2. Failed Frontend Tests

- React version compatibility issues
- Module resolution problems
- Import/export errors

### 3. Linting Errors

- Run linters locally to fix issues:
  ```
  cd frontend && npm run lint
  ```
  ```
  cd backend && black . && flake8 . && isort .
  ```

## Next Steps for CI/CD

- Add deployment workflows for staging and production
- Implement E2E testing with Cypress or Playwright
- Set up dependency scanning and security checks
