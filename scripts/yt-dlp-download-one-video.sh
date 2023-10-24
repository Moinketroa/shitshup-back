#!/bin/bash

# Download one video. Check for duplicates is OFF.

# Check if at least 3 arguments were provided
if [ $# -lt 3 ]; then
  echo "Usage: $0 <token> <outputPath> <downloadArchivePath> <URL>"
  exit 1
fi

# Access and use the command-line arguments
token="$1"
outputPath="$2"
videoId="$3"

# Generate a timestamp
timestamp=$(date +%Y%m%d%H%M%S)
# Create a temporary text file for batch-file
tempOutputPrintFile=$(mktemp "temp_file.output_download_playlist.${timestamp}.txt")

# Output File Template
outputTemplate="$outputPath/%(title)s (%(id)s).%(ext)s"

# Output Print File Template
outputPrintTemplate="id=%(id)s track=%(track)s artist=%(artist)s filepath=%(filepath)s"

# Download all videos in batch file.
yt-dlp \
--add-header "Authorization:Bearer $token" \
--output "$outputTemplate" \
--audio-format 'mp3' \
--extract-audio \
--audio-quality 0 \
--yes-playlist \
--quiet \
--no-warnings \
--print-to-file after_move:"$outputPrintTemplate" "$tempOutputPrintFile" \
"$videoId" || true

echo "$tempOutputPrintFile"