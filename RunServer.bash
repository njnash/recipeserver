#!/bin/bash

# Runs server.js

while true; do
  ./server.js
  if [ $? == 0 ]; then
    echo "Getting latest code and restarting..."
    git pull
  else
    echo "Exit code: $?"
    break
  fi
done
