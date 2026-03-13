---
title: Use specific Bash subcommand patterns in settings.json, not wildcards
category: security
tags:
  - settings-json
  - permissions
  - hooks
  - worktree
  - security
severity: high
date: 2026-03-09
source: auto — /review-pr
applicable_to: project
---

## What Happened

PR #34 (v1.26.0 release gap adoption) shipped a `settings.json` with `Bash(git *)` as an allowed tool pattern. Gemini and Copilot independently flagged it during round 1 review. The wildcard silently grants destructive git capabilities (reset --hard, push --force, branch -D) without confirmation prompts.

## Root Cause

Using a glob wildcard (`git *`) to permit all git subcommands felt convenient but bypasses the confirmation flow Claude Code normally applies to destructive operations.

A second issue in the same PR: a hook command used `${worktree_path}` in a file path without guarding for empty/unset, which could have written to filesystem root if the env var was missing.

## Solution

- Replace `Bash(git *)` with explicit subcommand patterns: `Bash(git status*)`, `Bash(git commit*)`, `Bash(git log*)`, `Bash(git diff*)`, etc.
- List only the subcommands the skill or agent actually needs.
- Guard every env var used in file paths: `[ -n "${worktree_path}" ] && [ -d "${worktree_path}" ]` before use.

## Prevention

- Audit `settings.json` Bash entries at PR review time — wildcards on system commands are a red flag.
- Any hook or script that interpolates an env var into a path must null-check and dir-check before proceeding.
- Treat `Bash(git *)` the same way you'd treat `chmod 777` — convenient but almost always wrong.
