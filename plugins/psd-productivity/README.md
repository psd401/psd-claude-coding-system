# PSD Productivity

**General-purpose productivity workflows for Peninsula School District**

Version: 2.0.0
Status: Scaffolded — Skills Under Development
Author: Kris Hagel (hagelk@psd401.net)

---

## What Is This?

A Claude Code / Claude Cowork plugin providing district operations workflows. Designed for both developer and non-developer use via Claude Cowork.

---

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-plugins

# Install this plugin
/plugin install psd-productivity

# Use workflows
/enrollment            # Enrollment workflow
/chief-of-staff        # Executive support
```

---

## Skills

| Skill | Description | Status |
|-------|-------------|--------|
| `/enrollment` | Guide families through PSD enrollment | Placeholder |
| `/chief-of-staff` | Daily briefings and priority management | Placeholder |

---

## Architecture

This plugin is part of the **PSD Plugin Marketplace** (`psd-claude-plugins`). It is independently installable — no dependency on `psd-coding-system`.

```
psd-productivity/
  .claude-plugin/
    plugin.json
  skills/
    enrollment/SKILL.md
    chief-of-staff/SKILL.md
  agents/                    # Created as needed per workflow
  README.md
```
