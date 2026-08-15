# Skill Consolidator（吸星大法）

> A meta-skill for organizing, merging, and optimizing locally installed skills / rules / commands for WorkBuddy, Trae, Cursor, Claude Code, Windsurf, Cline, Continue, Roo Code, Copilot, Codex, and other AI Agents.

## Why Do You Need It?

As you use Agents more deeply, more and more skills get installed locally: research, writing, coding, debugging, browser automation, document processing, and so on.

The more skills you have of the same type, the more likely you are to run into:

- **Name collisions**: Skills from different sources share the same `name`.
- **Functional overlaps**: Multiple skills claim to handle "research" or "writing".
- **Trigger-word conflicts**: Different skills listen for the same user command, causing the model to pick the wrong one.
- **Declining hit rate**: The model no longer knows which skill to invoke.

**Skill Consolidator** (吸星大法) works like the martial art from *Demi-Gods and Semi-Devils*: it absorbs scattered skills, removes the dross, and fuses the essence into a clean skill catalog and cleanup plan.

## Core Features

- **Deterministic scanner** (`skill-consolidator/scripts/scan_skills.mjs`): scans agent skill directories in one shot, parses frontmatter, detects name collisions, functional overlaps, trigger-word conflicts and version divergence, categorizes skills, and generates a Markdown report (or JSON).
- **Extensible scan scope**: scan targets live in the `TARGETS` constant at the top of the scanner script — edit the script, not SKILL.md.
- **Read-only by default**: only generates a report; never deletes or modifies existing skills until the user explicitly confirms.

## Installation

### Option 1: Copy (simplest)

Copy the whole `skill-consolidator/` directory (including `scripts/`) into the target agent's skills directory:

```bash
# Cursor / Claude Code / Trae / WorkBuddy (user level)
cp -r skill-consolidator ~/.cursor/skills/
cp -r skill-consolidator ~/.claude/skills/
cp -r skill-consolidator ~/.trae-cn/skills/
cp -r skill-consolidator ~/.workbuddy/skills/

# Project level (example: Cursor)
cp -r skill-consolidator .cursor/skills/

# Windsurf (rules layout only supports a single file; scripts unavailable)
mkdir -p ~/.windsurf/rules/skill-consolidator
cp skill-consolidator/SKILL.md ~/.windsurf/rules/skill-consolidator/skill-consolidator.md
```

### Option 2: npm (optional)

```bash
npm install -g skill-consolidator
# Install into agent directories (manual, no automatic side effects)
npm run install:skills                       # default: workbuddy, claude, cursor, trae
npm run install:skills -- --agents claude,cursor
npm run install:skills -- --project          # install into the current project
```

### Option 3: skills.sh / ClawHub

```bash
npx skills add alancouny/skill-consolidator --skill skill-consolidator
clawhub skill publish ./skill-consolidator
```

Restart your agent / IDE after installation.

## Usage

### Manual trigger

```
/吸星大法    or    /skill-consolidator
```

Or just say: "organize my skills", "clean up my skills", "帮我整理一下 skill", "skills 太多了" etc.

### Auto trigger

Before installing or recommending a new skill, the agent should invoke this skill to check for conflicts with existing skills. The `description` includes explicit trigger conditions to increase the chance of being selected.

## Directory Structure

```
.
├── skill-consolidator/          # the single skill package (source of truth)
│   ├── SKILL.md                 # bilingual skill definition (Chinese primary)
│   ├── _meta.json               # ClawHub metadata
│   └── scripts/
│       ├── scan_skills.mjs      # scanner: scan/parse/detect/categorize/report
│       └── install_skills.mjs   # installer (manual, copies the whole package)
├── scripts/
│   └── validate.mjs             # repo validation (shared by CI / npm run validate)
├── package.json                 # npm publishing config (no auto-install side effects)
├── .github/workflows/validate-skill.yml  # CI validation
├── README.md / README_EN.md / LICENSE
```

## Development

```bash
npm run validate                 # validate SKILL.md / _meta.json / package.json
node skill-consolidator/scripts/scan_skills.mjs --no-write   # dry-run the scanner
```

## Notes

- Before explicit confirmation, Skill Consolidator **never deletes or modifies** any existing skill.
- Built-in skills (e.g. `~/.workbuddy/plugins/cache/`, `~/.cursor/plugins/cache/`) are read-only references.
- Scan results are grouped by tool source so same-name files from different agents are not misreported as conflicts.

## License

[MIT](LICENSE)
