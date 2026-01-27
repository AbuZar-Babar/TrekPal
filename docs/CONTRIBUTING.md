# 🤝 Contributing to TrekPal

<div align="center">

**Thank you for your interest in contributing to TrekPal!**

We welcome contributions from the community to help make TrekPal better.

[Code of Conduct](#-code-of-conduct) • [Getting Started](#-getting-started) • [Development](#-development-workflow) • [Guidelines](#-coding-guidelines)

</div>

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Guidelines](#-coding-guidelines)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation](#-documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes:**
- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards others

**Unacceptable behavior includes:**
- ❌ Trolling, insulting, or derogatory comments
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed
- A GitHub account
- Basic knowledge of TypeScript/JavaScript
- Familiarity with React (for frontend) or Express (for backend)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trekpal.git
   cd trekpal
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/trekpal.git
   ```

### Setup Development Environment

```bash
# Install backend dependencies
cd backend
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Install frontend dependencies
cd ../admin-portal
npm install

cd ../agency-portal
npm install
```

---

## 💻 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding guidelines below
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend
cd backend
npm run lint
npm run type-check
npm test  # When tests are added

# Frontend
cd admin-portal  # or agency-portal
npm run lint
npm run build  # Ensure it builds
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Guidelines](#-commit-guidelines) for commit message format.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📝 Coding Guidelines

### TypeScript/JavaScript

#### General Rules
- ✅ Use TypeScript for all new code
- ✅ Enable strict mode
- ✅ Avoid `any` type - use `unknown` or proper types
- ✅ Use meaningful variable and function names
- ✅ Keep functions small and focused
- ✅ Add comments for complex logic

#### Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = "John";
function getUserData() { }

// Classes and interfaces: PascalCase
class UserService { }
interface UserData { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Private properties: prefix with underscore
class Example {
  private _privateProperty: string;
}
```

#### Code Examples

**Good:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUserById(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}
```

**Bad:**
```typescript
// Avoid any type
function getUser(id: any): any {
  return prisma.user.findUnique({ where: { id } });
}

// Avoid unclear names
function fn(x: string) {
  return x.split('');
}
```

### React/Frontend

#### Component Structure

```tsx
// Good component structure
import { useState } from 'react';
import { Button } from '@/components/common';

interface UserCardProps {
  userId: string;
  name: string;
  onDelete: (id: string) => void;
}

export function UserCard({ userId, name, onDelete }: UserCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(userId);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <Button onClick={handleDelete} disabled={isDeleting}>
        Delete
      </Button>
    </div>
  );
}
```

#### Hooks Guidelines
- ✅ Use custom hooks for reusable logic
- ✅ Follow hooks naming convention (`use` prefix)
- ✅ Keep hooks focused and single-purpose

```typescript
// Custom hook example
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}
```

### Backend/API

#### Controller Pattern

```typescript
export class UserController {
  async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error: unknown) {
      sendError(res, getErrorMessage(error), 404);
    }
  }
}
```

#### Service Pattern

```typescript
export class UserService {
  async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { agency: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
}
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Includes new endpoints and email templates.

Closes #123

---

fix(booking): correct total price calculation

Fixed bug where tax was not included in total price.

Fixes #456

---

docs(readme): update installation instructions

Added troubleshooting section for common database issues.
```

---

## 🔄 Pull Request Process

### Before Submitting

- ✅ Ensure all tests pass
- ✅ Update documentation
- ✅ Add tests for new features
- ✅ Follow coding guidelines
- ✅ Rebase on latest main branch

### PR Title Format

```
<type>: <description>
```

Examples:
- `feat: add hotel search functionality`
- `fix: resolve booking date validation issue`
- `docs: improve API documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by at least one maintainer
3. **Address feedback** and make requested changes
4. **Approval** from maintainer
5. **Merge** by maintainer

---

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Example test
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await userService.getUserById('user-123');
      expect(user).toBeDefined();
      expect(user.id).toBe('user-123');
    });
    
    it('should throw error when user not found', async () => {
      await expect(
        userService.getUserById('invalid-id')
      ).rejects.toThrow('User not found');
    });
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- Test critical paths thoroughly
- Include edge cases and error scenarios
- Test both success and failure cases

---

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Retrieves a user by their ID
 * 
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to the user object
 * @throws Error if user is not found
 * 
 * @example
 * ```typescript
 * const user = await getUserById('user-123');
 * console.log(user.name);
 * ```
 */
async function getUserById(userId: string): Promise<User> {
  // Implementation
}
```

### README Updates

When adding new features:
- Update relevant documentation files
- Add examples and usage instructions
- Update API documentation if applicable
- Add troubleshooting tips if needed

---

## 🎯 Areas for Contribution

### High Priority
- 🔴 Bug fixes
- 🔴 Security improvements
- 🔴 Performance optimizations
- 🔴 Test coverage

### Medium Priority
- 🟡 New features
- 🟡 UI/UX improvements
- 🟡 Documentation improvements
- 🟡 Code refactoring

### Low Priority
- 🟢 Minor enhancements
- 🟢 Code cleanup
- 🟢 Comment improvements

---

## 💡 Getting Help

- 📖 Read the [documentation](README.md)
- 🐛 Check [existing issues](https://github.com/OWNER/trekpal/issues)
- 💬 Ask questions in discussions
- 📧 Contact maintainers

---

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

<div align="center">

**Thank you for contributing to TrekPal! 🎉**

**[⬆ Back to Top](#-contributing-to-trekpal)**

</div>
