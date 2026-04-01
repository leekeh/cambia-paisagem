#!/usr/bin/env bash
#
# Created by André Carvalho on 29th April 2025
# Last modified: 1st April 2026
#
# A simple script to compress all the mock environment images, so they are lighter in size and take less time to load
#
readonly SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly DIRECTORIES=(
    "$SCRIPT_DIRECTORY/src/assets/images/"
	"$SCRIPT_DIRECTORY/src/assets/images/fado"
)
readonly QUALITY="80"
readonly MAX_DIMENSION="860"
readonly OUTPUT_FORMAT="webp"
readonly FORMATS_TO_PROCESS=(
    "png"
    "jpg"
)
readonly RED='\033[1;31m'
readonly GREEN='\033[1;32m'
readonly RESET='\033[0m'

if ! [[ -x "$(command -v "mogrify")" ]]; then
	echo -e "\n❌ ${RED} \"ImageMagick\" couldnt be found. Please be sure its included in your PATH environment variable!${RESET}"
	exit 1
fi

function spinner() {
    local pid="$1"
    local delay=0.1
    local characters='⣷⣯⣟⡿⢿⣻⣽⣾'
    local index=0

    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        index=$(( (index+1) % 8 ))
        printf "\r${characters:$index:1} Running..."
        sleep "$delay"
    done
}

function process_image() {
	local file="$1"
	local format="$2"
	local width="$(identify -format "%w" "$file" 2> /dev/null)"
	local height="$(identify -format "%h" "$file" 2> /dev/null)"
	local scale="-1"

	if [[ "$width" -gt "$MAX_DIMENSION" || "$height" -gt "$MAX_DIMENSION" ]]; then
		if [[ "$width" -gt "$height" ]]; then
			scale="${MAX_DIMENSION}x>"
		else
			scale="x${MAX_DIMENSION}>"
		fi
	fi

	if [[ "$scale" != "-1" ]]; then
		mogrify -format "$OUTPUT_FORMAT" -quality "$QUALITY" -resize "$scale" "$file" &> /dev/null
	else
		mogrify -format "$OUTPUT_FORMAT" -quality "$QUALITY" "$file" &> /dev/null
	fi

	if [[ "$format" != "$OUTPUT_FORMAT" ]]; then
		rm -f "$file" &> /dev/null
	fi

	local directory="$(dirname "$file")"
	local transformedFile="${file%.*}.$OUTPUT_FORMAT"
	local renamedFile="$directory/$(basename "$transformedFile" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')"

	if [[ "$transformedFile" != "$renamedFile" ]]; then
		mv "$transformedFile" "$renamedFile" &> /dev/null
	fi
}

function main() {
	for directory in "${DIRECTORIES[@]}"; do
		if [[ -d "$directory" ]]; then
			for format in "${FORMATS_TO_PROCESS[@]}"; do
				while IFS= read -r -d '' file; do
					process_image "$file" "$format"
				done < <(find "$directory" -maxdepth 1 -type f -name "*.$format" -print0)
			done
		fi
	done
}

echo ""
(main) &
pid="$!"
spinner "$pid"
wait $pid

printf "\r✅ ${GREEN} Done!${RESET}"
