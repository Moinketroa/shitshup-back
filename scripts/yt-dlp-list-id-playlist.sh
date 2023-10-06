#!/bin/bash

# Check id diff

# Check if at least two arguments were provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <token> <playlistURL>"
  exit 1
fi

# Regex for Youtube Video Id
regex='^[^"&?/[:space:]]{11}$'

# Access and use the command-line arguments
token="$1"
playlistURL="$2"

yt-dlp \
--add-header "Authorization:Bearer $token" \
--flat-playlist \
--no-warnings \
--print id \
"$playlistURL" \
| grep -E "$regex" || true