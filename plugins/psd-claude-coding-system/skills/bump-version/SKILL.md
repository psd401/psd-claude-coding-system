---
name: bump-version
description: Automate the 6-file version bump ritual — increment, patch, changelog, commit, tag, push
argument-hint: "[patch|minor|major]"
model: claude-sonnet-4-6
context: fork
agent: general-purpose
allowed-tools:
  - Bash(*)
  - Read
  - Edit
  - Write
  - Grep
  - Glob
extended-thinking: true
---

# Bump Version Command

You automate the version bump ritual for the PSD Claude Coding System plugin. Every release requires updating 6 files in the exact same pattern — this skill eliminates that manual work.

**Bump type:** $ARGUMENTS

## Phase 1: Determine Bump Type

```bash
BUMP_TYPE="$ARGUMENTS"

# Validate bump type
case "$BUMP_TYPE" in
  patch|minor|major) echo "Bump type: $BUMP_TYPE" ;;
  *)
    echo "Invalid bump type: '$BUMP_TYPE'"
    echo "Usage: /bump-version [patch|minor|major]"
    echo ""
    echo "  patch (1.23.0 → 1.23.1) — bug fixes"
    echo "  minor (1.23.0 → 1.24.0) — new features"
    echo "  major (1.23.0 → 2.0.0)  — breaking changes"
    exit 1
    ;;
esac
```

If the argument is empty or invalid, use AskUserQuestion to ask which bump type they want.

## Phase 2: Read Current Version

```bash
PLUGIN_JSON="plugins/psd-claude-coding-system/.claude-plugin/plugin.json"
CURRENT_VERSION=$(grep -o '"version": *"[^"]*"' "$PLUGIN_JSON" | head -1 | sed 's/.*"version": *"//;s/"//')
echo "Current version: $CURRENT_VERSION"

# Parse semver components
MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)

# Calculate new version
case "$BUMP_TYPE" in
  patch) NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
  minor) NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
  major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
esac

echo "New version: $NEW_VERSION"
```

## Phase 3: Update All 6 Locations

Use the Edit tool with `replace_all: true` to update version strings across all 6 files:

1. **`plugins/psd-claude-coding-system/.claude-plugin/plugin.json`** — `"version": "X.Y.Z"`
2. **`.claude-plugin/marketplace.json`** — `metadata.version` AND `plugins[0].version` (2 occurrences)
3. **`CLAUDE.md`** — `**Version**: X.Y.Z`
4. **`README.md`** — badge URL, `**Version**: X.Y.Z`, and any other occurrences
5. **`plugins/psd-claude-coding-system/README.md`** — `Version: X.Y.Z`
6. **`CHANGELOG.md`** — Add new section at top (see Phase 4)

For files 1-5, use Edit with `replace_all: true` replacing `$CURRENT_VERSION` with `$NEW_VERSION`.

**Important:** Read each file first before editing (required by Edit tool).

## Phase 4: Update CHANGELOG

Use AskUserQuestion to ask the user for a brief description of what changed in this release. Then add a new CHANGELOG entry at the top:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [New features if any]

### Changed
- [Changes to existing functionality if any]

### Fixed
- [Bug fixes if any]
```

Use the current date (run `date +%Y-%m-%d` to get it).

## Phase 5: Update Skill/Agent Counts (if changed)

Check if the skill or agent count has changed since the last version:

```bash
SKILL_COUNT=$(find plugins/psd-claude-coding-system/skills -name 'SKILL.md' -type f | wc -l | tr -d ' ')
AGENT_COUNT=$(find plugins/psd-claude-coding-system/agents -name '*.md' -type f | wc -l | tr -d ' ')
echo "Skills: $SKILL_COUNT"
echo "Agents: $AGENT_COUNT"
```

If counts differ from what's in CLAUDE.md, update count references. If unchanged, skip this step.

## Phase 6: Commit, Tag, Push

```bash
# Stage all 6 files
git add \
  plugins/psd-claude-coding-system/.claude-plugin/plugin.json \
  .claude-plugin/marketplace.json \
  CLAUDE.md \
  README.md \
  plugins/psd-claude-coding-system/README.md \
  CHANGELOG.md

# Commit
git commit -m "chore: Bump version to $NEW_VERSION — [brief reason]"

# Tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION - [brief summary]"

# Push commit and tag
git push origin HEAD
git push origin "v$NEW_VERSION"
```

## Phase 7: Summary

```markdown
### Version Bumped: v$CURRENT_VERSION → v$NEW_VERSION

| File | Status |
|------|--------|
| plugin.json | ✅ Updated |
| marketplace.json | ✅ Updated (2 occurrences) |
| CLAUDE.md | ✅ Updated |
| README.md | ✅ Updated |
| plugins/README.md | ✅ Updated |
| CHANGELOG.md | ✅ Updated |

**Tag:** v$NEW_VERSION
**Pushed:** ✅

Don't forget to refresh the plugin cache:
```
/plugin install psd-claude-coding-system
```
```
