# Contributing to Tax Software 2025

## Development Workflow

### Branch Strategy
- **`master`** - Production-ready code. Protected branch.
- **`dev`** - Development branch for integration. Create from master.
- **Feature branches** - Create from `dev`, name as `feature/your-feature-name`
- **Bug fixes** - Create from `dev`, name as `fix/bug-description`

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/add-schedule-c
   ```

2. **Make your changes:**
   - Write code following TypeScript best practices
   - Test locally with `npm run dev`
   - Ensure build passes with `npm run build`
   - Update tests if needed

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add Schedule C self-employment form
   
   - Implement Schedule C form component
   - Add profit/loss calculations
   - Update tax calculator integration"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation only
   - `style:` - Formatting, no code change
   - `refactor:` - Code change that neither fixes a bug nor adds a feature
   - `test:` - Adding or updating tests
   - `chore:` - Updating build tasks, configs, etc.

4. **Push to GitHub:**
   ```bash
   git push -u origin feature/add-schedule-c
   ```

5. **Create Pull Request:**
   - Go to https://github.com/StryxZilla/tax-software-2025
   - Click "New Pull Request"
   - Base: `dev`, Compare: `feature/add-schedule-c`
   - Fill out PR template with description and testing notes
   - Request review

6. **Code Review:**
   - Address feedback from reviewers
   - Push additional commits to same branch
   - Once approved, squash and merge to `dev`

7. **Cleanup:**
   ```bash
   git checkout dev
   git pull origin dev
   git branch -d feature/add-schedule-c
   ```

### Pull Request Guidelines

**PR Title Format:**
```
feat(scope): brief description
```

**PR Description Should Include:**
- What changed
- Why it changed
- How to test it
- Screenshots (for UI changes)
- Related issues/tickets

**Example:**
```markdown
## Changes
Added Schedule C form for self-employment income with profit/loss calculations.

## Testing
1. Run `npm run dev`
2. Navigate to "Income > Self-Employment"
3. Fill out gross receipts and expenses
4. Verify profit calculation is correct
5. Check review page shows SE tax

## Screenshots
[Screenshot of Schedule C form]

Closes #42
```

### Code Review Checklist

**For Reviewers:**
- [ ] Code follows TypeScript best practices
- [ ] Tax calculations are accurate per 2025 IRS rules
- [ ] UI is mobile-responsive
- [ ] Forms validate user input properly
- [ ] No console errors or warnings
- [ ] Build passes (`npm run build`)
- [ ] Changes are well-documented

**For Authors:**
- [ ] Self-reviewed code
- [ ] Tested locally
- [ ] Updated README if needed
- [ ] Added/updated tests
- [ ] No debugging code left in

### Testing

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run tests (when implemented)
npm test

# Type check
npx tsc --noEmit
```

### Tax Calculation Accuracy

**This is critical** - tax calculations affect real money. When working on tax logic:

1. **Reference IRS publications:**
   - Pub 17 (Your Federal Income Tax)
   - Pub 590-A (IRAs)
   - Form instructions from IRS.gov

2. **Test edge cases:**
   - Zero income
   - Negative numbers (losses)
   - Phase-out thresholds
   - AMT triggers

3. **Document sources:**
   ```typescript
   // Source: IRS Pub 590-A, 2025
   // Roth IRA contribution limit: $7,000 ($8,000 if age 50+)
   const contributionLimit = age >= 50 ? 8000 : 7000;
   ```

4. **Add unit tests** for all calculation functions

### Getting Help

- Open an issue for bugs or feature requests
- Tag @StryxZilla for urgent questions
- Check existing PRs for similar work

### License

By contributing, you agree that your contributions will be licensed under the same license as the project (specify license in package.json).
