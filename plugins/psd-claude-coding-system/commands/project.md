---
allowed-tools: Bash(*), View, Task
description: Load project context and status briefing
argument-hint: [project name or path]
model: claude-sonnet-4-5
---

# Project Context Loader

You are a project navigator that quickly loads context for a target project, giving the developer a fast status briefing to minimize context-switching cost.

**Target:** $ARGUMENTS

## Workflow

### Phase 1: Resolve Project Path

```bash
# Resolve project path from name or path
TARGET="$ARGUMENTS"

# If it's just a name, check ~/code/
if [ -d "$TARGET" ]; then
  PROJECT_PATH="$TARGET"
elif [ -d "$HOME/code/$TARGET" ]; then
  PROJECT_PATH="$HOME/code/$TARGET"
else
  echo "❌ Project not found: $TARGET"
  echo "Available projects in ~/code/:"
  ls -d "$HOME/code"/*/ 2>/dev/null | xargs -I{} basename {}
  exit 1
fi

echo "=== Project: $(basename $PROJECT_PATH) ==="
echo "Path: $PROJECT_PATH"
```

### Phase 2: Read Project Configuration

Read the following files from $PROJECT_PATH (skip any that don't exist):
- `CLAUDE.md` — project conventions and architecture
- `package.json` — dependencies, scripts, tech stack (if Node/Bun project)
- `pyproject.toml` or `requirements.txt` — dependencies (if Python project)
- `Cargo.toml` — dependencies (if Rust project)
- `.env.example` or `.env.local.example` — required environment variables

### Phase 3: Git & GitHub Status

```bash
cd "$PROJECT_PATH"

echo "=== Git Status ==="
git status --short

echo -e "\n=== Recent Commits (last 10) ==="
git log --oneline -10

echo -e "\n=== Branches ==="
git branch -a --sort=-committerdate | head -15

echo -e "\n=== Open Issues ==="
gh issue list --limit 5 2>/dev/null || echo "(no GitHub remote or gh not configured)"

echo -e "\n=== Open PRs ==="
gh pr list --limit 5 2>/dev/null || echo "(no GitHub remote or gh not configured)"
```

### Phase 4: Code Health Scan

```bash
cd "$PROJECT_PATH"

echo "=== TODO/FIXME/HACK Items ==="
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" --include="*.swift" --include="*.rs" --include="*.go" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=target --exclude-dir=__pycache__ --exclude-dir=.git | head -20

echo -e "\n=== Recently Modified Files (last 7 days) ==="
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.swift" -o -name "*.rs" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/.git/*" -mtime -7 | head -20
```

### Phase 5: Output Briefing

Synthesize all findings into a structured briefing:

```
## Project: [name]
**Stack:** [detected from package.json/pyproject.toml/CLAUDE.md]
**Path:** [full path]

### Current State
- Branch: [current branch]
- Clean: [yes/no, uncommitted changes?]
- Last commit: [date and message]

### Open Work
- Issues: [count and top 3 titles]
- PRs: [count and top 3 titles]

### Tech Debt
- TODO/FIXME items: [count]
- [Top 3 most important items]

### Key Commands
- Test: [from package.json scripts or CLAUDE.md]
- Build: [from package.json scripts or CLAUDE.md]
- Deploy: [from CLAUDE.md if documented]
- Dev: [from package.json scripts or CLAUDE.md]
```

## Success Criteria

- ✅ Project path resolved correctly
- ✅ Tech stack identified
- ✅ Git status and recent activity shown
- ✅ Open issues and PRs listed
- ✅ Code debt surfaced
- ✅ Key commands extracted
