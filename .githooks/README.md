# Git hooks (opt-in safety net)

Strips Cursor-injected `Co-authored-by: Cursor` and `Made-with: Cursor` lines from commit messages.

## Activate (once per clone)

```bash
git config core.hooksPath .githooks
chmod +x .githooks/prepare-commit-msg
```

## Also disable at the source

1. **Cursor IDE:** Cursor Settings → **Agents** → **Attribution** → turn off **Commit Attribution**
2. **Cursor CLI:** set `"commitAttribution": false` in `~/.cursor/cli-config.json`

The hook is a fallback when the IDE/CLI setting does not apply (e.g. some agent flows re-inject the trailer).
