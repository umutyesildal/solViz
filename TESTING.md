# SolViz Studio Testing Guide

This document provides instructions for setting up and running tests for the SolViz Studio application.

## Table of Contents

- [Frontend Testing](#frontend-testing)
  - [Overview](#frontend-overview)
  - [Running Tests](#running-frontend-tests)
  - [Writing Tests](#writing-frontend-tests)
- [Backend Testing](#backend-testing)
  - [Overview](#backend-overview)
  - [Running Tests](#running-backend-tests)
  - [Writing Tests](#writing-backend-tests)
- [Integration Tests](#integration-tests)
  - [Setting Up](#setting-up-integration-tests)
  - [Running Integration Tests](#running-integration-tests)
- [CI/CD Integration](#cicd-integration)
- [Known Issues](#known-issues)

## Frontend Testing

### Frontend Overview

The frontend uses the following testing libraries:

- **Jest**: Testing framework
- **React Testing Library**: Utilities for testing React components
- **User Event**: Simulating user interactions
- **Jest DOM**: Custom matchers for DOM testing

Tests are located in `__tests__` directories near the code they're testing.

### Running Frontend Tests

To run frontend tests:

```bash
cd /Users/umutyesildal/Desktop/SolViz/SolViz/solviz/frontend
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate coverage reports:

```bash
npm run test:coverage
```

### Writing Frontend Tests

#### Component Tests

Place component tests in the `__tests__` directory within the component directory:

```
src/
  components/
    query/
      NaturalLanguageQuery.tsx
      __tests__/
        NaturalLanguageQuery.test.tsx
```

Example component test structure:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('handles user interaction', async () => {
    render(<MyComponent />);
    await userEvent.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(screen.getByText('Result after click')).toBeInTheDocument();
  });
});
```

#### Store Tests

For Zustand store tests:

```typescript
import { act, renderHook } from '@testing-library/react';
import { useMyStore } from '../myStore';

jest.mock('@/utils/api', () => ({
  apiModule: {
    someFunction: jest.fn()
  }
}));

describe('useMyStore', () => {
  test('initial state', () => {
    const { result } = renderHook(() => useMyStore());
    expect(result.current.someValue).toBe(expectedValue);
  });
  
  test('action updates state', async () => {
    const { result } = renderHook(() => useMyStore());
    
    await act(async () => {
      await result.current.someAction();
    });
    
    expect(result.current.someValue).toBe(newExpectedValue);
  });
});
```

## Backend Testing

### Backend Overview

The backend uses the following testing libraries:

- **pytest**: Testing framework
- **pytest-asyncio**: Support for async tests
- **httpx**: HTTP client for API testing
- **pytest-cov**: Coverage reporting
- **SQLite**: In-memory database for tests

Tests are located in the `backend/tests` directory.

### Running Backend Tests

To run backend tests:

```bash
cd /Users/umutyesildal/Desktop/SolViz/SolViz/solviz/backend
python -m pytest
```

To run tests with coverage:

```bash
python -m pytest --cov=app
```

To run a specific test file:

```bash
python -m pytest tests/api/test_auth.py
```

### Writing Backend Tests

#### API Tests

Place API tests in the `tests/api` directory:

```
tests/
  api/
    test_auth.py
    test_charts.py
    test_query.py
```

Example API test:

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_endpoint(client: AsyncClient, test_app):
    response = await client.get(
        f"{test_app.url_path_for('endpoint_name')}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "expected_key" in data
```

#### Service Tests

For testing services, use mocks for external dependencies:

```python
from unittest.mock import patch, MagicMock
import pytest

@pytest.mark.asyncio
@patch("app.services.external_service.some_method")
async def test_my_service(mock_some_method):
    # Setup mock return value
    mock_some_method.return_value = {"key": "value"}
    
    # Test the service
    result = await my_service.do_something()
    
    # Assertions
    assert result["key"] == "value"
    mock_some_method.assert_called_once_with(expected_args)
```

## Integration Tests

### Setting Up Integration Tests

Integration tests verify that the frontend and backend work together. These can be set up using tools like Cypress or Playwright.

### Running Integration Tests

Instructions will be added when integration tests are implemented.

## CI/CD Integration

Automated testing has been integrated into CI/CD pipelines via GitHub Actions:

1. **GitHub Actions Configuration**: Implemented in `.github/workflows/ci.yml`
2. **Build Pipelines**:
   - Frontend tests are run on every PR and commit to main/development branches
   - Backend tests are run on every PR and commit to main/development branches
   - Linting checks are performed on both codebases
   - Coverage reports are generated and uploaded to Codecov

3. **CI Workflow Stages**:
   - **Backend Testing**: Runs pytest with coverage reporting in a Postgres-enabled environment
   - **Frontend Testing**: Runs Jest with coverage reporting
   - **Linting**: Ensures code quality with ESLint, Flake8, Black, and isort

4. **Setting Up Codecov Integration**:
   - Create a Codecov account at [codecov.io](https://codecov.io)
   - Connect your GitHub repository
   - Add the repository token to GitHub repository secrets as `CODECOV_TOKEN`

5. **PR Integration**:
   - GitHub Actions automatically runs tests on pull requests
   - Required status checks prevent merging of failing PRs
   - Coverage reports are commented on PRs

6. **Local CI Validation**:
   - Run `act -j frontend-tests` to validate frontend CI workflow locally
   - Run `act -j backend-tests` to validate backend CI workflow locally
   - Requires [nektos/act](https://github.com/nektos/act) to be installed

## Known Issues

### Frontend Testing Issues

1. **React Compatibility Issues**: There's a conflict between the project's React 19 and react-vega which requires React 16-18. This causes issues when running Jest tests. Options to resolve:
   - Downgrade React to version 18
   - Find an alternative visualization library that supports React 19
   - Use a more sophisticated mocking strategy in tests

2. **Jest DOM Assertions**: Some tests use `toBeInTheDocument()` which requires proper Jest DOM setup. This is fixed by using `toBeTruthy()` temporarily.

3. **Mock Implementation**: The test mocks need to be updated to match the actual implementation of stores and API services.

### Backend Testing Issues

1. **Async Client Setup**: The test client setup needs to be corrected to properly handle async requests.

2. **User Password Setting**: The User model does not have a `set_password` method but tests expect one.

3. **Service Method Mocking**: The NLP, Flipside, and Helius services require proper mocking in tests.

4. **Environment Variables**: Tests require proper environment variables, particularly for external services.