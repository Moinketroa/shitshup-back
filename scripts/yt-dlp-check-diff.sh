#!/bin/bash

# Check id diff

# Check if at least three arguments were provided
if [ $# -lt 3 ]; then
  echo "Usage: $0 <token> <downloadArchivePath> <URLs...>"
  exit 1
fi

# Regex for Youtube Video Id
regex='^[^"&?/[:space:]]{11}$'

# Access and use the command-line arguments
token="$1"
downloadArchivePath="$2"

# Generate a timestamp
timestamp=$(date +%Y%m%d%H%M%S)
# Create a temporary text file for batch-file
tempfile=$(mktemp "temp_file.check_diff.${timestamp}.txt")
# Print all IDs argument, one per line
for arg in "${@:3}"; do
  echo "$arg"
done > "$tempfile"

yt-dlp \
--add-header "Authorization:Bearer $token" \
--download-archive "$downloadArchivePath" \
--flat-playlist \
--no-warnings \
--print id \
--batch-file "$tempfile" \
| grep -E "$regex" || true

# Remove the temporary batch-file
rm "$tempfile"