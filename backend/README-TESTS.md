# Testing in SolViz Backend

## Issues Found

1. **AsyncClient usage**: The tests were written using AsyncClient but the client fixture was returning a generator.
2. **Password handling**: The User model doesn't have a `set_password` method, but tests expect it.
3. **Missing service methods**: The NLP, Flipside, and Helius services don't have the methods expected by tests.
4. **Database migration issues**: The test database requires migrations.

## Short-Term Fixes

For immediate needs, we need to:

1. Add a `set_password` method to the User model
2. Fix the client fixture to properly return an AsyncClient instance
3. Mock or implement the required service methods
4. Set up proper test database initialization

## Long-Term Solutions

1. Refine the test infrastructure to properly isolate tests
2. Add more comprehensive tests for all endpoints
3. Create a dedicated testing environment configuration
4. Set up CI/CD pipeline integration

## Next Steps

1. Update the User model
2. Fix the async client fixture
3. Update tests to match actual code
