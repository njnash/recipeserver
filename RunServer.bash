#!/bin/bash -f

. ~/.bash_profile

echo "Starting Recipe Server"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

echo "Connecting to $DIR"

# Runs server.js

while true; do
  ./server.js
  if [ $? == 0 ]; then
    echo "Getting latest code and restarting..."
    git pull
  else
    echo "Exit code: $?"
    sleep 30
    git pull
  fi
done
