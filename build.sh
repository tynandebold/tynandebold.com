#!/bin/bash

SOURCE_DIR=~/sites/tynandebold.com/
IO_DIR=~/sites/tynandebold.github.io/

cd $IO_DIR
git pull
cd $SOURCE_DIR
cp -r ./build/ $IO_DIR
if [[ $(git status -s) ]]; then
  git add .
  git commit -m "update"
  git push
fi