---
title: Feature A producing config that Feature B never reads is a silent integration failure
category: logic
tags:
  - skill-integration
  - documentation-accuracy
  - config-reading
  - skill-development
severity: high
date: 2026-03-09
source: auto — /review-pr
applicable_to: project
---

## What Happened

PR #37 introduced `/setup` which wrote a config file intended to be consumed by `/review-pr`. The config integration was described in docs and the UI, but `/review-pr` never actually read the config. The feature appeared complete but was cosmetic — no behavior changed based on the config.

## Root Cause

Skill A (`/setup`) was built independently and produced output (a config file). Skill B (`/review-pr`) was not updated to consume it. No cross-skill integration test existed to catch the gap. Additional bugs: `/setup show` fell through to interactive mode instead of exiting, and agent count in UI (14) was wrong (actual: 20 including conditional agents).

## Solution

- Added Phase 0.7 config reader to `/review-pr` to actually load and apply the setup config
- Fixed `/setup show` to `exit 0` after displaying config (no fall-through)
- Corrected agent count to 20 (audited all conditional agents, not just always-on ones)
- Removed clipboard hint referencing unimplemented functionality

## Prevention

Before shipping any feature described as "A integrates with B", verify:
1. B has explicit code that reads A's output
2. A behavioral difference exists when A's output is present vs absent
3. Any UI count or reference to implementation details is audited against actual code
