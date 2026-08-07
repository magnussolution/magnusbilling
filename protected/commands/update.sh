#!/bin/bash
clear
echo
echo
echo
echo "=======================WWW.MAGNUSBILLING.COM===========================";
echo "_      _                               ______ _ _ _ _  			     ";
echo "|\    /|                               | ___ (_) | (_) 			     ";
echo "| \  / | ___  ____ _ __  _   _   _____ | |_/ /_| | |_ _ __   __ _ 	 ";
echo "|  \/  |/   \/  _ \| '_ \| | | \| ___| | ___ \ | | | | '_ \ /  _ \	 ";
echo "| |\/| |  | |  (_| | | | | |_| ||____  | |_/ / | | | | | | |  (_| |	 ";
echo "|_|  |_|\___|\___  |_| | |_____|_____|  \___/|_|_|_|_|_| |_|\___  |	 ";
echo "                _/ |                                           _/ |	 ";
echo "               |__/                                           |__/ 	 ";
echo "														                 ";
echo "============================== UPDATE =================================";
echo

set -euo pipefail

MBILLING_DIR="/var/www/html/mbilling"
PACKAGE_NAME="MagnusBilling8-current.tar.gz"
PACKAGE_URL="https://magnusbilling.org/download/$PACKAGE_NAME"
UPDATE_COMMAND="$MBILLING_DIR/protected/commands/updateCommand.sh"
LOCK_FILE="/run/lock/magnusbilling-update.lock"

# Impede atualizações simultâneas
exec 9>"$LOCK_FILE"
flock -n 9 || {
    echo "Another MagnusBilling update is already running."
    exit 1
}

if [[ -e "$MBILLING_DIR/protected/commands/update2.sh" ]]; then
    bash "$MBILLING_DIR/protected/commands/update2.sh"
    exit
fi

cd "$MBILLING_DIR"

rm -f -- "$PACKAGE_NAME"

wget \
    --https-only \
    --output-document="$PACKAGE_NAME" \
    "$PACKAGE_URL"

# Confirma que o download é um arquivo TAR válido
tar tzf "$PACKAGE_NAME" >/dev/null

tar xzf "$PACKAGE_NAME"

if [[ ! -f "$UPDATE_COMMAND" ]]; then
    echo "ERROR: updateCommand.sh was not found in the package."
    exit 1
fi

chmod 755 "$MBILLING_DIR"/protected/commands/*.sh

bash "$UPDATE_COMMAND"

if [[ -e "$MBILLING_DIR/protected/commands/update3.sh" ]]; then
    bash "$MBILLING_DIR/protected/commands/update3.sh"
fi

echo "MagnusBilling updated successfully."