#!/usr/bin/env bash
#
# Created by André Carvalho on 3rd April 2026
# Last modified: 3rd April 2026
#
# A simple script generate a QR code base on a tour.
#
readonly SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

readonly TOURS_URL="https://www.cambiatours.com/en/tours"
readonly TOURS_DIRECTORY="${SCRIPT_DIRECTORY}/src/content/tours"
readonly QR_CODES_OUTPUT_DIRECTORY="${SCRIPT_DIRECTORY}/output"

readonly RED='\033[1;31m'
readonly GREEN='\033[1;32m'
readonly RESET='\033[0m'

mkdir -p "$QR_CODES_OUTPUT_DIRECTORY"

if ! [[ -x "$(command -v "qrencode")" ]]; then
	echo -e "\n❌ ${RED} \"qrencode\" couldnt be found. Please be sure its included in your PATH environment variable!${RESET}"
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

function main() {
  for file in "$TOURS_DIRECTORY"/*.json; do
    tourId="$(basename "$file" .json)"
    qrencode -o "${QR_CODES_OUTPUT_DIRECTORY}/${tourId}.png" -s 10 -m 2 "${TOURS_URL}/${tourId}/"
  done
}

echo ""
(main) &
pid="$!"
spinner "$pid"
wait $pid

printf "\r✅ ${GREEN} Done!${RESET}"
