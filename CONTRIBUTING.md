# Contributing to ResQ-Unified

Thank you for your interest in contributing to ResQ-Unified! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on constructive criticism
- Report inappropriate behavior to maintainers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier available)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/resq-unified.git
cd resq-unified

# Install dependencies
npm install

# Run setup script
bash scripts/setup-dev.sh

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
# Always branch from main
git checkout main
git pull origin main

# Create feature branch (use descriptive names)
git checkout -b feature/add-missing-persons-search
# or for bug fixes:
git checkout -b fix/case-assignment-error
```

### 2. Make Changes

- Write clear, maintainable code
- Follow the project's code style
- Add comments for complex logic
- Test your changes locally

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add missing persons search functionality"
```

**Commit Message Format**: `<type>: <description>`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (no logic change)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions or changes
- `chore:` Build, dependencies, etc.

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/add-missing-persons-search

# Create PR on GitHub
# - Write clear description
# - Reference related issues (#123)
# - Include screenshots for UI changes
```

## Code Style

### TypeScript

- Use strict mode (`strict: true` in tsconfig.json)
- Avoid `any` types
- Use proper type annotations
- Export types for public APIs

```typescript
// ✓ Good
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  // ...
}

// ✗ Bad
export async function getUserProfile(id) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Props should be typed with interfaces
- Keep components focused and small
- Reuse components from shadcn/ui

```typescript
// ✓ Good
interface CaseCardProps {
  caseId: string;
  onSelect?: (id: string) => void;
}

export function CaseCard({ caseId, onSelect }: CaseCardProps) {
  // ...
}

// ✗ Bad
export function CaseCard(props) {
  // ...
}
```

### CSS & Tailwind

- Use Tailwind utilities
- Create custom components in shadcn/ui style when needed
- Use semantic class names
- Respect the design system (colors, spacing, etc.)

```jsx
// ✓ Good
<Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
  Submit
</Button>

// ✗ Bad
<button style={{ backgroundColor: '#00d4ff' }}>
  Submit
</button>
```

## Testing

### Writing Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Guidelines

- Write tests for new features
- Test edge cases and error conditions
- Mock external API calls
- Keep tests focused and independent

## Documentation

### Code Comments

- Comment "why", not "what"
- Use JSDoc for public APIs
- Keep comments updated

```typescript
// ✓ Good
/**
 * Calculate SLA deadline based on priority
 * Handles custom SLA configurations per district
 * @param priority Case priority level
 * @param district Target district
 * @returns Deadline timestamp
 */
function calculateSLADeadline(priority: string, district: string): Date {
  // Implementation uses configurable SLA times per district
  // This allows emergency coordinators to adjust based on capacity
  // ...
}

// ✗ Bad
// Get the SLA
function getSlA(p, d) {
  // ...
}
```

### Documentation Files

- Update README.md for user-facing changes
- Add API documentation for backend changes
- Include examples for new features
- Update CHANGELOG when merging to main

## Performance Considerations

### Frontend Performance

- Use React.lazy for route-based code splitting
- Memoize expensive components with React.memo
- Avoid inline function definitions in render
- Use the React DevTools Profiler for optimization

### Database Performance

- Add indexes for frequently queried columns
- Limit returned fields with select()
- Use pagination for large result sets
- Profile slow queries in Supabase

```typescript
// ✓ Good - select only needed fields
const { data } = await supabase
  .from('cases')
  .select('id,case_number,status,priority')
  .eq('district', 'Colombo');

// ✗ Bad - selects all fields
const { data } = await supabase
  .from('cases')
  .select('*')
  .eq('district', 'Colombo');
```

## Security Best Practices

- **Input Validation**: Always validate user input
- **Secrets**: Never commit API keys or secrets
- **SQL**: Use parameterized queries (Supabase handles this)
- **XSS**: Sanitize data from untrusted sources
- **CSRF**: Use CSRF tokens for state-changing operations
- **Authentication**: Check user permissions before operations

```typescript
// ✓ Good - validates input
async function updateUserRole(userId: string, role: UserRole) {
  if (!Object.values(UserRole).includes(role)) {
    throw new Error('Invalid role');
  }
  
  // Check authorization
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }
  
  // Update with parameterized query
  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId);
}
```

## Building and Deployment

### Local Build

```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

### Deployment to Staging

Merging to `develop` branch automatically deploys to staging.

### Deployment to Production

Create a PR to `main` branch. After approval and merge, automatic deployment occurs.

## Issue Labels

- `bug`: Something is broken
- `feature`: New feature request
- `enhancement`: Improve existing feature
- `documentation`: Docs need updating
- `good-first-issue`: Good for new contributors
- `help-wanted`: Need community help
- `priority-critical`: Critical bug/issue
- `priority-high`: Should be prioritized
- `wontfix`: Decision to not fix

## Pull Request Process

1. **Before Starting**
   - Check existing issues/PRs
   - Comment on issue to claim it
   - Discuss approach with maintainers

2. **During Development**
   - Keep commits clean and logical
   - Write clear commit messages
   - Test thoroughly locally
   - Update documentation

3. **Creating PR**
   - Link to related issue
   - Describe changes clearly
   - Include screenshots for UI changes
   - Request review from maintainers

4. **Code Review**
   - Address feedback promptly
   - Be open to suggestions
   - Retest after changes
   - Respond to all comments

5. **Merging**
   - Ensure CI checks pass
   - Squash commits if requested
   - Delete branch after merge

## Reporting Bugs

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Ubuntu 24.04]
- Node version: [e.g., 18.17.0]

**Additional Context**
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
**Description**
Clear description of the feature

**Problem It Solves**
What problem does this feature solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Examples, mockups, references
```

## Communication

- **Issues**: Use GitHub Issues for discussions
- **Discord**: Join our community server
- **Email**: contact@resq-unified.lk for general inquiries
- **Security**: security@resq-unified.lk for security issues

## Project Structure

```
resq-unified/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── lib/
│   │   ├── api/        # API functions
│   │   ├── auth.ts     # Authentication
│   │   └── utils.ts    # Utilities
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── supabase/          # Database migrations & functions
├── docs/              # Documentation
├── .github/           # GitHub actions & templates
└── package.json
```

## Additional Resources

- **TypeScript**: https://www.typescriptlang.org/docs/
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in project README

## Questions?

- Check existing issues and discussions
- Ask in our Discord community
- Open a discussion on GitHub
- Email maintainers

---

**Thank you for contributing to ResQ-Unified and helping save lives! 🙏**
