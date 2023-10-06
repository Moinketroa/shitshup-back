#!/bin/bash

# Download the playlist. Check for duplicates is on.

# Check if at least four arguments were provided
if [ $# -lt 4 ]; then
  echo "Usage: $0 <token> <outputPath> <downloadArchivePath> <URLs...>"
  exit 1
fi

# Access and use the command-line arguments
token="$1"
outputPath="$2"
downloadArchivePath="$3"

# Generate a timestamp
timestamp=$(date +%Y%m%d%H%M%S)
# Create a temporary text file for batch-file
tempfile=$(mktemp "temp_file.download_playlist.${timestamp}.txt")
# Print all IDs argument, one per line
for arg in "${@:4}"; do
  echo "$arg"
done > "$tempfile"

# Download all videos in batch file.
yt-dlp \
--add-header "Authorization:Bearer $token" \
--output "$outputPath/%(title)s.%(ext)s" \
--audio-format 'mp3' \
--extract-audio \
--audio-quality 0 \
--yes-playlist \
--quiet \
--download-archive "$downloadArchivePath" \
--no-warnings \
--batch-file "$tempfile" || true

# Remove the temporary batch-file
rm "$tempfile"