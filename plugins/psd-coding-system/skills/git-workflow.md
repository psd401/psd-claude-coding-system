# Git Workflow Skill

Reusable Git workflow patterns for branching, committing, and PR creation.

## Branch Creation

```bash
# Always branch from dev, not main
git checkout dev && git pull origin dev

# For issue-based work
if [ -n "$ISSUE_NUMBER" ]; then
  BRANCH_NAME="feature/${ISSUE_NUMBER}-$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | cut -c1-30)"
  git checkout -b "$BRANCH_NAME"
else
  # For quick fixes
  BRANCH_NAME="fix/$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | cut -c1-50)"
  git checkout -b "$BRANCH_NAME"
fi

echo "✓ Created branch: $BRANCH_NAME"
```

## Commit Creation

```bash
# Stage all changes
git add -A

# For issue-based commits
if [ -n "$ISSUE_NUMBER" ]; then
  git commit -m "$(cat <<EOF
feat: implement solution for #${ISSUE_NUMBER}

${COMMIT_DETAILS}

Closes #${ISSUE_NUMBER}
EOF
)"
else
  # For quick fixes
  git commit -m "$(cat <<EOF
fix: ${DESCRIPTION}

${COMMIT_DETAILS}
EOF
)"
fi

echo "✓ Changes committed"
```

## PR Creation

```bash
# Push to remote
if [ -n "$ISSUE_NUMBER" ]; then
  git push origin "feature/${ISSUE_NUMBER}-*" || git push origin HEAD
else
  git push origin HEAD
fi

# Create pull request
if [ -n "$ISSUE_NUMBER" ]; then
  gh pr create \
    --base dev \
    --title "feat: #${ISSUE_NUMBER} - ${PR_TITLE}" \
    --body "$(cat <<EOF
## Description
Implements solution for #${ISSUE_NUMBER}

## Changes
${CHANGES_LIST}

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] No TypeScript errors
- [ ] Tests added/updated
- [ ] Documentation updated if needed

Closes #${ISSUE_NUMBER}
EOF
)" \
    --assignee "@me"
else
  gh pr create \
    --base dev \
    --title "fix: ${PR_TITLE}" \
    --body "$(cat <<EOF
## Description
Quick fix: ${DESCRIPTION}

## Changes
${CHANGES_LIST}

## Testing
- [ ] Tests pass
- [ ] Manually verified fix

## Type of Change
- [x] Bug fix (non-breaking change)
- [ ] New feature
- [ ] Breaking change
EOF
)" \
    --assignee "@me"
fi

# Get PR number
PR_NUMBER=$(gh pr list --author "@me" --limit 1 --json number --jq '.[0].number')
echo "✓ PR #${PR_NUMBER} created"
```

## Usage

Invoke this skill from commands by setting variables and sourcing:

```bash
# Set required variables
ISSUE_NUMBER="347"  # or empty for quick fixes
DESCRIPTION="add user authentication"
COMMIT_DETAILS="- Added JWT authentication
- Implemented login/logout endpoints
- Added user session management"
CHANGES_LIST="- \`src/auth/jwt.ts\` - JWT token generation
- \`src/routes/auth.ts\` - Authentication endpoints
- \`src/middleware/auth.ts\` - Auth middleware"
PR_TITLE="Add JWT authentication system"

# Then include the skill sections as needed
```
