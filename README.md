# essentials

> **Built by [AgentSystem](https://agentsystem.dev) — the platform for shipping production-grade agentic systems. Visit [agentsystem.dev](https://agentsystem.dev) to learn more.**

A plugin marketplace for agentic coding CLIs. Native support for the [Claude Code marketplace](https://docs.claude.com/en/docs/claude-code/plugins) feature, with copy-paste install paths for **Cursor** and **Codex** so the same plugins work everywhere.

## Plugins

| Name | Description |
| --- | --- |
| [`commit-helper`](plugins/commit-helper) | Drafts a conventional-commit message from staged changes. |
| [`code-reviewer`](plugins/code-reviewer) | Reviews the current diff for bugs, security issues, and style. |
| [`ship-pr`](plugins/ship-pr) | One-shot ship: groups a dirty working tree into clean commits, pushes the branch, and opens a polished GitHub PR with auto-applied labels and "might address #X" issue links. |

---

## Install

### Claude Code

In any Claude Code session:

```
/plugin marketplace add webdevcody/essentials
/plugin install commit-helper@essentials
/plugin install code-reviewer@essentials
/plugin install ship-pr@essentials
```

That's it. Slash commands and subagents become available in your next prompt. To remove:

```
/plugin uninstall commit-helper@essentials
```

### Cursor

Each plugin ships a Cursor rule under `plugins/<name>/cursor/rules.mdc`. Copy the file you want into your project's `.cursor/rules/` directory:

```bash
mkdir -p .cursor/rules
curl -o .cursor/rules/commit-helper.mdc \
  https://raw.githubusercontent.com/webdevcody/essentials/main/plugins/commit-helper/cursor/rules.mdc
```

Repeat per plugin. Cursor picks up new rules automatically.

### Codex (and other `AGENTS.md`-based tools)

Each plugin ships an `AGENTS.md` snippet under `plugins/<name>/codex/AGENTS.md`. Append the snippet to your project's `AGENTS.md`:

```bash
curl https://raw.githubusercontent.com/webdevcody/essentials/main/plugins/commit-helper/codex/AGENTS.md \
  >> AGENTS.md
```

Codex (and any agent that reads `AGENTS.md`) will pick up the new instructions on the next session.

---

## ship-pr — when, why, how

**What it does.** Takes a dirty working tree (often 20–50+ changed files after a feature) and produces a merge-ready GitHub pull request in one pass: logically grouped commits → branch created and pushed → PR opened with a clear title, a high-level description, labels matched against your repo's existing label set, and "might address #X" links to plausibly-related open issues.

**Why use it.**
- Replaces the one-mega-commit habit with a clean, layered commit chain a reviewer can read top-to-bottom.
- Writes the PR description the way a senior engineer would — what changed, why it was needed, what to look out for — without dumping diffs or code snippets.
- Auto-applies labels by matching against `gh label list` (never invents labels, never auto-creates them).
- Links related open issues with the literal phrase `Might address #N` instead of `Closes #N`, so heuristic matches don't auto-close the wrong issue on merge.
- Flags risky areas (auth, payments, migrations) so reviewers know where to look closely.

**When to use it.** You finished work, your tree is dirty, and you want commits + branch + PR in one move. Trigger phrases: `ship it`, `/ship-pr`, `wrap this up into a PR`, `commit and open a PR`.

**Skip it for:** single-file copy tweaks, branches already pushed with an open PR (use `gh pr edit`), amend/fixup workflows, force-push requests, or repos without a GitHub remote.

**How it runs.** A phased Process workflow with two confirmation gates:
1. Inventory + risk scan (parallel `git` + `gh` reads).
2. Group files into commits — **gate 1**: you approve the grouping plan before anything is staged.
3. Commit each group in dependency order (schema → backend → frontend → chore).
4. Create branch if needed (no push yet).
5. Synthesize PR title, body, labels, and related-issue links from the cumulative diff.
6. **Gate 2**: shows you the full PR preview; you `(y)es / (e)dit / (c)ancel`.
7. Push and `gh pr create` only on `y`.

The skill never force-pushes, never skips hooks, never auto-closes issues, never invents labels, and never edits files outside your working tree.

---

## Contributing a plugin

1. Create `plugins/<your-plugin>/` with the following layout:

   ```
   plugins/<your-plugin>/
   ├── .claude-plugin/plugin.json     # required for Claude Code
   ├── commands/*.md                  # slash commands (optional)
   ├── agents/*.md                    # subagents (optional)
   ├── hooks/                         # hooks (optional)
   ├── cursor/rules.mdc               # Cursor rule equivalent
   └── codex/AGENTS.md                # AGENTS.md snippet equivalent
   ```

2. Register it in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) under `plugins`.

3. Open a PR. Keep each plugin focused on one job — small and composable beats one mega-plugin.

### Plugin format

The Claude Code side follows the [official plugin spec](https://docs.claude.com/en/docs/claude-code/plugins) (commands, agents, hooks, MCP servers). The `cursor/` and `codex/` siblings restate the same intent in those tools' native formats so the user-facing behavior stays consistent across CLIs.

---

## License

MIT
