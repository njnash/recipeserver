#!/bin/bash

# Runs bin/www

while true; do
  bin/www
  if [$? -eq 0]; then
    echo "Getting latest code and restarting..."
    git pull
  else
    echo "Exit code: $?"
    break
  fi
done
