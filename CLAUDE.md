# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript client library for the Morisawa Fonts web font API. Provides typed access to domain management operations with cursor-based pagination support.

## Common Commands

```bash
# Build the library (outputs to dist/)
npm run build

# Type-check without emitting
npm run typecheck

# Lint and format check with Biome
npm run check

# Auto-fix linting and formatting issues
npm run check:write

# Run tests
npm run test

# Full CI pipeline (typecheck + lint + test)
npm run ci
```

## Architecture

The library follows a resource-based API client pattern:

- **Client** (`src/client.ts`): HTTP client using `ky` library with Bearer token auth, retry logic, and error handling
- **Resource** (`src/resource.ts`): Abstract base class that resources extend to wrap client functionality
- **Pager** (`src/pager.ts`): Generic cursor-based pagination with AsyncIterable support for `for await...of` loops
- **Resources** (`src/resources/`): API resources organized by domain (e.g., domains, stats)
- **APIError** (`src/error.ts`): Custom error class that parses HTTP errors with status codes
- **MorisawaFontsWebFont** (`src/index.ts`): Main entry point that initializes client and resources

## Testing

Tests use Vitest with MSW (Mock Service Worker) for HTTP mocking. Test files are co-located with source files (`*.test.ts`).

### Resource Test Conventions

- **Server Lifecycle**: Use `setupServer()` with `beforeAll`/`afterEach`/`afterAll` hooks for MSW server management
- **Client Factory**: Define a `createClient()` helper function returning a `Client` with test token
- **MSW Handler Setup**: Use `server.use()` within each test to define endpoint-specific handlers
- **Type-safe Responses**: Use `HttpResponse.json<ResourceType.ResultType>({...})` for typed mock responses
- **Request Validation**: Verify request parameters, headers, and body within MSW handlers using `expect()`
- **Pagination Testing**: Mock cursor-based pagination by switching on `url.searchParams.get("cursor")` to return different pages
- **AsyncIterable Testing**: Use `for await...of` loops to iterate through paginated results and verify each item

## Code Style

Biome handles both linting and formatting. Key rules enforce no unused imports/variables. Run `npm run check:write` to auto-fix issues.
