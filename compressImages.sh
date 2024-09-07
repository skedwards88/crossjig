#!/bin/bash

# Directories that include images to compress
declare -a dirs=("src/images/moreGames")

# Loop over the directories
for dir in "${dirs[@]}"; do
  # Loop over the files in the directory
  for file in $dir/*; do
    # Get the file extension
    extension="${file##*.}"
    # Compress the file if it is a png
    if [ "$extension" = "png" ]; then
      cwebp -q 75 $file -o ${dir/compressed}/$(basename $file '.png').webp
    fi
  done
done
