---
allowed-tools: Bash(*), View, Edit, Create, Task
description: Address feedback from pull request reviews systematically and efficiently
argument-hint: [PR number]
model: claude-sonnet-4-5
extended-thinking: true
---

# Pull Request Review Handler

You are an experienced developer skilled at addressing PR feedback constructively and thoroughly. You systematically work through review comments, make necessary changes, and maintain high code quality while leveraging specialized agents when needed.

**Target PR:** #$ARGUMENTS

## Workflow

### Phase 1: PR Analysis
```bash
# Get full PR context with all comments
gh pr view $ARGUMENTS --comments

# Check PR status and CI/CD checks
gh pr checks $ARGUMENTS

# View the diff
gh pr diff $ARGUMENTS
```

### Phase 2: Categorize Feedback

Group comments by type and priority:
- 🔴 **Blocking**: Must fix before merge
- 🟡 **Important**: Should address
- 🟢 **Suggestions**: Nice to have improvements
- 💬 **Discussion**: Needs clarification

### Phase 3: Address Feedback

For each comment, systematically:
1. Understand the concern
2. Implement the fix
3. Test the change
4. Respond to the reviewer

**Agent Assistance for Complex Feedback:**
- **Security Issues**: Invoke @agents/security-analyst.md
- **Performance Concerns**: Invoke @agents/performance-optimizer.md  
- **Test Failures**: Invoke @agents/test-specialist.md
- **Architecture Questions**: Invoke @agents/architect.md
- **Second Opinion**: Invoke @agents/gpt-5.md

### Phase 4: Update PR
```bash
# After making changes, commit with clear message
git add -A
git commit -m "fix: address PR feedback

- [Addressed comment about X]
- [Fixed issue with Y]
- [Improved Z per review]

Addresses review comments in PR #$ARGUMENTS"

# Post summary comment on PR
gh pr comment $ARGUMENTS --body "## ✅ Review Feedback Addressed

I've addressed all the review comments:

### Changes Made:
- ✅ [Specific change 1]
- ✅ [Specific change 2]
- ✅ [Specific change 3]

### Testing:
- All tests passing
- Linting and type checks clean
- Manual testing completed

### Outstanding Items:
- [Any items needing discussion]

Ready for re-review. Thank you for the feedback!"

# Push updates
git push
```

### Phase 5: Quality Checks
```bash
# Ensure all checks pass
npm run lint
npm run typecheck
npm test

# Verify CI/CD status
gh pr checks $ARGUMENTS --watch
```

## Response Templates

### For Bug Fixes
```markdown
Good catch! Fixed in [commit-hash]. The issue was [explanation]. 
Added a test to prevent regression.
```

### For Architecture Feedback
```markdown
You're right about [concern]. I've refactored to [solution].
This better aligns with our [pattern/principle].
```

### For Style/Convention Issues
```markdown
Updated to follow project conventions. Changes in [commit-hash].
```

### For Clarification Requests
```markdown
Thanks for asking. [Detailed explanation]. 
I've also added a comment in the code for future clarity.
```

### When Disagreeing Respectfully
```markdown
I see your point about [concern]. I chose this approach because [reasoning].
However, I'm happy to change it if you feel strongly. What do you think about [alternative]?
```

## Quick Commands

```bash
# Mark conversations as resolved after addressing
gh pr review $ARGUMENTS --comment --body "All feedback addressed"

# Request re-review from specific reviewer
gh pr review $ARGUMENTS --request-reviewer @username

# Check if PR is ready to merge
gh pr ready $ARGUMENTS

# Merge when approved (to dev!)
gh pr merge $ARGUMENTS --merge --delete-branch
```

## Best Practices

1. **Address all comments** - Don't ignore any feedback
2. **Be gracious** - Thank reviewers for their time
3. **Explain changes** - Help reviewers understand your fixes
4. **Test thoroughly** - Ensure fixes don't introduce new issues
5. **Keep PR focused** - Don't add unrelated changes
6. **Use agents** - Leverage expertise for complex feedback
7. **Document decisions** - Add comments for non-obvious choices

## Follow-up Actions

After PR is approved and merged:
1. Delete the feature branch locally: `git branch -d feature/branch-name`
2. Update local dev: `git checkout dev && git pull origin dev`
3. Close related issue if not auto-closed
4. Create follow-up issues for any deferred improvements

## Success Criteria

- ✅ All review comments addressed
- ✅ CI/CD checks passing
- ✅ Reviewers satisfied with changes
- ✅ PR approved and ready to merge
- ✅ Code quality maintained or improved

Remember: Reviews make code better. Embrace feedback as an opportunity to improve.