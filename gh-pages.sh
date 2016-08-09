#!/bin/bash
if [ "`git branch --list --remote origin/gh-pages`" ]
then
  git push origin --delete gh-pages
fi
