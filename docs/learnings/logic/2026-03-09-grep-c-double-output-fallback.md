---
title: grep -c double-output bug when using || echo 0 as fallback
category: logic
tags:
  - shell-scripting
  - grep
  - arithmetic
  - format-string
severity: high
date: 2026-03-09
source: auto — /review-pr
applicable_to: project
---

## What Happened

PR #38 used `HITS=$(grep -c "pattern" file || echo 0)` to safely capture a match count. When grep finds no matches, it outputs `0` to stdout AND exits with code 1, causing `|| echo 0` to fire. The result is `HITS` becomes a two-line string (`0\n0`) that breaks any subsequent arithmetic comparison.

## Root Cause

`grep -c` always writes a count to stdout (including `0` for no matches) before exiting. Exit code 1 signals "no matches found" — it is not an error. Using `|| echo 0` as a fallback treats the non-zero exit as a failure and appends a second `0`.

## Solution

Capture output first, then apply a parameter expansion default:

```sh
HITS=$(grep -c "pattern" file 2>/dev/null)
HITS=${HITS:-0}
```

This ensures `HITS` is always a single integer regardless of grep's exit code.

## Prevention

Never use `$(command || echo fallback)` when the command writes to stdout before failing. Use parameter expansion (`${VAR:-default}`) as the fallback mechanism instead.
