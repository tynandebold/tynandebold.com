#!/bin/bash

SOURCE_DIR=~/sites/tynandebold.com
IO_DIR=~/sites/tynandebold.github.io

cd $IO_DIR
git stash
git pull
git stash pop
cp -r $SOURCE_DIR/build/ $IO_DIR
if [[ $(git status -s) ]]; then
  ga
  gcam "update"
  git push
fi