# Git Branching Strategy - Synergy HRMS

## Branch Structure

### Main Branches

- **`main`** - Production-ready code only
  - Protected branch
  - All code here should be deployable
  - Only accepts merges via Pull Requests from `develop`

- **`develop`** - Integration branch for features
  - Latest development version
  - All feature branches merge here first
  - Regular testing and integration happens here

### Supporting Branches

#### Feature Branches

- **Pattern**: `feature/description` or `feature/ISSUE-123-description`
- **From**: `develop`
- **Merge to**: `develop`
- **Purpose**: New features and enhancements

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/ai-job-optimization

# After development
git checkout develop
git pull origin develop
git merge feature/ai-job-optimization
git push origin develop
git branch -d feature/ai-job-optimization
```

#### Hotfix Branches

- **Pattern**: `hotfix/description` or `hotfix/ISSUE-123-description`
- **From**: `main`
- **Merge to**: `main` and `develop`
- **Purpose**: Critical fixes for production

```bash
# Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-fix

# After fix
git checkout main
git merge hotfix/critical-auth-fix
git push origin main
git checkout develop
git merge hotfix/critical-auth-fix
git push origin develop
git branch -d hotfix/critical-auth-fix
```

#### Release Branches

- **Pattern**: `release/v1.0.0`
- **From**: `develop`
- **Merge to**: `main` and `develop`
- **Purpose**: Prepare for production release

```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# After testing and bug fixes
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags
git checkout develop
git merge release/v1.0.0
git push origin develop
git branch -d release/v1.0.0
```

## Workflow Examples

### Daily Development Workflow

1. **Start new feature**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-profile-enhancement
   ```

2. **Work on feature** (make commits with conventional commit messages):

   ```bash
   git add .
   git commit -m "feat: add user profile photo upload"
   ```

3. **Push feature branch**:

   ```bash
   git push origin feature/user-profile-enhancement
   ```

4. **Create Pull Request** on GitHub:
   - From: `feature/user-profile-enhancement`
   - To: `develop`
   - Add reviewers, description, etc.

5. **After PR approval and merge**:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/user-profile-enhancement
   ```

### Release Workflow

1. **Prepare release from develop**:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.1.0
   ```

2. **Update version numbers, changelog, final testing**

3. **Merge to main**:

   ```bash
   git checkout main
   git pull origin main
   git merge release/v1.1.0
   git tag v1.1.0
   git push origin main --tags
   ```

4. **Merge back to develop**:
   ```bash
   git checkout develop
   git merge release/v1.1.0
   git push origin develop
   ```

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `build:` - Build system changes
- `ci:` - CI/CD changes

**Examples**:

```
feat: add AI-powered job description generation
fix(auth): resolve login session timeout issue
docs: update API documentation for user endpoints
refactor: optimize database queries for employee search
```

## Branch Protection Rules (Recommended for GitHub)

### Main Branch Protection:

- Require pull request reviews before merging
- Require status checks to pass (CI/CD)
- Require branches to be up to date before merging
- Restrict pushes to main
- Require linear history

### Develop Branch Protection:

- Require status checks to pass
- Allow fast-forward merges
- Delete head branches after merge

## Current Branch Status

- ✅ `main` - Production baseline established
- ✅ `develop` - Active development branch with latest features
- 🔄 Ready for feature branch development

## Next Steps

1. Set up branch protection rules on GitHub
2. Create first feature branch for ongoing development
3. Establish CI/CD pipeline for automated testing
4. Set up code review process with team members
