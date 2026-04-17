# Daily blog automation

Automated daily blog post pipeline for HardAssets.io.

## What this does

Every day at **13:00 UTC (9:00 AM Eastern, EDT)**, a GitHub Actions workflow runs [Claude Code](https://www.anthropic.com/claude-code) non-interactively. Claude researches trending precious-metals / hard-asset topics, writes an SEO-optimized 1,800–2,500 word blog post, creates SVG images for it, and drops supporting social-media drafts into `social/`. The workflow then commits and pushes those files to `main`. Vercel picks up the push and auto-deploys.

No human involvement required once the API key is set.

## Files

| Path | Purpose |
|---|---|
| `.github/workflows/daily-blog.yml` | The GitHub Actions workflow — schedule, permissions, Claude invocation, commit/push. |
| `.github/scripts/daily-blog-prompt.md` | The full instructions handed to Claude Code each run. Tweak this to change blog tone, length, structure, keyword strategy, or topic bank. |
| `.github/scripts/README.md` | This file. |

## Editing the prompt

Open `.github/scripts/daily-blog-prompt.md` and edit in plain Markdown. Anything you write here is passed to Claude as the system instructions for that run. Common edits:

- **Change the topic bank** — edit the evergreen list in Step 2
- **Change tone / voice** — edit the TONE section in Step 4
- **Change length** — edit the LENGTH target in Step 4
- **Add a new image format** — edit the IMAGES instructions in Step 4
- **Change social platforms** — edit Step 7

Commit and push the edit; the next scheduled run uses the new prompt.

## Changing the schedule

Edit the `cron:` line in `.github/workflows/daily-blog.yml`:

```yaml
on:
  schedule:
    - cron: '0 13 * * *'    # ← edit this line
```

Cron is in UTC. Reference for US Eastern:

| Desired ET | Summer (EDT) cron | Winter (EST) cron |
|---|---|---|
| 9:00 AM | `0 13 * * *` | `0 14 * * *` |
| Noon | `0 16 * * *` | `0 17 * * *` |
| 5:00 AM | `0 9 * * *` | `0 10 * * *` |

GitHub cron only accepts UTC and does not observe DST; pick one offset and accept the 1-hour drift across DST boundaries, or schedule twice (once for each) and let the workflow be idempotent.

## Running it manually

1. Go to [Actions](https://github.com/justco-cell/hardassets/actions)
2. In the left sidebar, click **Daily Blog Post**
3. Click the **Run workflow** dropdown (top-right) → **Run workflow**

Useful for testing prompt changes without waiting for the next scheduled run.

## Pausing the automation

**Actions tab → Daily Blog Post → "..." menu (top-right) → Disable workflow.**

Re-enable from the same menu. Disabling does not delete the file; it just stops scheduled and manual runs.

## Adding the API key secret

The workflow requires a GitHub Actions secret named `ANTHROPIC_API_KEY`.

1. Get an API key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Go to [repo settings → Secrets and variables → Actions](https://github.com/justco-cell/hardassets/settings/secrets/actions)
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: paste the key (starts with `sk-ant-...`)
6. Click **Add secret**

If the key is rotated, update the secret value. The workflow picks up the new value on the next run.

## Cost

Each run uses Claude Opus to research + write + build-check. Expect roughly a few dollars per run depending on how much research browsing is needed. At one run per day, budget a few-to-low-double-digit dollars per month.

If you want to cut cost, change the model in `.github/workflows/daily-blog.yml`:

```yaml
claude_args: >-
  --model claude-sonnet-4-6    # cheaper; slightly less thorough
  ...
```

## Troubleshooting

- **Workflow fails with "API key not configured"** → The `ANTHROPIC_API_KEY` secret isn't set. See "Adding the API key secret" above.
- **Workflow succeeds but no commit appears** → Check the run's logs for the "No changes" notice. Claude may have chosen to skip (e.g., it decided every evergreen topic is taken). Edit the prompt to widen the topic pool.
- **Build step inside Claude's run fails** → Claude will stop and report the error. Open the run log, look at the tail, fix whatever's wrong in a manual commit.
- **Push fails with 403** → The `contents: write` permission block in the workflow should prevent this. If it still happens, verify repo settings → Actions → General → Workflow permissions is set to "Read and write permissions".
- **Cron fires at the wrong time** → GitHub cron is UTC only and doesn't observe DST; see "Changing the schedule" above.

## Related

- Main project context: [../../CLAUDE.md](../../CLAUDE.md)
- Claude Code docs: https://code.claude.com/docs
- Claude Code GitHub Action: https://github.com/anthropics/claude-code-action
