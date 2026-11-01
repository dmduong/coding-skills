---
name: commit-message
description: Generate a Conventional Commit message from staged changes. Use when the user asks you to write a commit message or asks what they should commit.
argument-hint: Write a commit message for the staged changes.
---

# Commit Message Skill

## Workflow

1. Run `scripts/get_branch_checkout.sh` to get the current branch.
2. Run `scripts/get_staged_diff.sh` to get the staged changes.
3. Read `references/conventions.md` and choose the appropriate type (feat, fix, chore, etc.).
4. Fill in the template in `assets/commit-template.txt`. Use the exact branch name from step 1 and the appropriate type from step 3.
5. Return one commit message without a lengthy explanation.

## Notes

- Use the branch name from the script output. Do NOT guess or invent it.
- The subject line must be no longer than 70 characters.
- If there are no staged changes, tell the user.
