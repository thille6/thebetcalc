# Contributing to Project Noah

Thank you for your interest in contributing to Project Noah! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm package manager
- API-Sports API key from [api-football.com](https://www.api-football.com/)
- Git

### Setup Development Environment

1. Fork the repository and clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/project-noah.git
cd project-noah
```

2. Install dependencies:

```bash
npm install
```

3. Create your `.env.local` file:

```bash
cp .env.local.example .env.local
```

Then add your API-Sports key to `.env.local`.

4. Start the development server:

```bash
npm run dev
```

## Development Workflow

### Running Tests

We use Vitest for testing. Always run tests before submitting a PR.

```bash
# Run tests once
npm test

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Formatting

We use Prettier to maintain consistent code style. Always format your code before submitting.

```bash
# Format all files
npm run format

# Check if files are formatted correctly
npm run format:check
```

### Linting

We use ESLint to maintain code quality. Ensure your code passes linting before submitting.

```bash
npm run lint
```

### Type Checking

Verify TypeScript types without building:

```bash
npm run typecheck
```

### Building

Verify your changes build successfully:

```bash
npm run build
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` unless absolutely necessary
- Use type inference where appropriate

### Naming Conventions

- **Files**: Use kebab-case for file names (e.g., `poisson-calculator.ts`)
- **Components**: Use PascalCase for React components
- **Functions**: Use camelCase for function names
- **Constants**: Use UPPER_SNAKE_CASE for constants
- **Types/Interfaces**: Use PascalCase

### Code Organization

- Keep functions small and focused
- Extract reusable logic into separate modules
- Add JSDoc comments for public APIs
- Keep API routes under `/app/api/`
- Keep utility functions under `/lib/`

## Testing Guidelines

### Writing Tests

- Write tests for all new functions and components
- Follow the Arrange-Act-Assert pattern
- Use descriptive test names
- Test edge cases and error conditions

### Test File Naming

- Place test files next to the code they test
- Use `.test.ts` or `.test.tsx` suffix

Example:

```
lib/poisson/
  poisson.ts
  poisson.test.ts
```

### Test Coverage

- Aim for at least 80% code coverage
- All utility functions should have tests
- Test both success and error paths

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Ensure code is formatted: `npm run format`
3. Ensure linting passes: `npm run lint`
4. Ensure type checking passes: `npm run typecheck`
5. Ensure the build succeeds: `npm run build`
6. Update documentation if needed
7. Add tests for new features

**Quick Check Command:**

```bash
npm run format && npm run lint && npm run typecheck && npm test && npm run build
```

### Continuous Integration

All pull requests automatically run through our CI pipeline on GitHub Actions. The CI checks:

- **Linting**: ESLint validation
- **Type Checking**: TypeScript compilation
- **Testing**: All unit tests must pass
- **Building**: Production build must succeed

Your PR must pass all CI checks before it can be merged. You can view the CI status in the PR checks section.

### PR Guidelines

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Commit your changes** with clear, descriptive commit messages:

   ```bash
   git commit -m "Add: Implement new prediction algorithm"
   ```

   Commit message prefixes:
   - `Add:` - New feature
   - `Fix:` - Bug fix
   - `Update:` - Update existing feature
   - `Refactor:` - Code refactoring
   - `Docs:` - Documentation changes
   - `Test:` - Test-related changes

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues
   - Screenshots for UI changes

### PR Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Verify the bug exists in the latest version
- Collect relevant information (error messages, logs, steps to reproduce)

### Bug Report Template

```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**

1. Step 1
2. Step 2
3. ...

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Environment:**

- Node.js version:
- npm version:
- Browser (if applicable):
- Operating System:

**Additional Context:**
Any other relevant information
```

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Clearly describe the feature and its benefits
3. Provide examples of how it would be used
4. Explain why this feature would be valuable

## Security Issues

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `question` label
- Reach out to the maintainers

## License

By contributing to Project Noah, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Project Noah! 🎉
