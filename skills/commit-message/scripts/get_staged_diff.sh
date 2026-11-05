#!/usr/bin/env bash
set -e

if git diff --staged --quiet; then
  echo "NO_STAGED_CHANGES"
else
  status=$?
  if [ "$status" -ne 1 ]; then
    exit "$status"
  fi

  echo "Showing staged changes:"
  git diff --staged
fi