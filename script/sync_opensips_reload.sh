#!/bin/bash

DB_USER="root"
DB_PASS=$(cat /root/passwordMysql.log)
DB_NAME="opensips"

SNAP_ADDR="/tmp/address_snapshot.txt"
SNAP_DS="/tmp/dispatcher_snapshot.txt"

TMP_ADDR=$(mktemp)
TMP_DS=$(mktemp)

mkdir -p /tmp

#################################
# Verifica tabela address
#################################

/usr/bin/mysql -N -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e \
"SELECT CONCAT(ip, '|', mask, '|', port, '|', proto, '|', context_info) FROM address ORDER BY ip;" > "$TMP_ADDR"

if [ ! -f "$SNAP_ADDR" ]; then
    echo "[address] Snapshot inicial criado e address_reload executado"
    cp "$TMP_ADDR" "$SNAP_ADDR"
    /usr/bin/opensips-cli -x mi address_reload
elif ! cmp -s "$SNAP_ADDR" "$TMP_ADDR"; then
    echo "[address] Alterações detectadas, executando address_reload..."
    cp "$TMP_ADDR" "$SNAP_ADDR"
    /usr/bin/opensips-cli -x mi address_reload
else
    echo "[address] Nenhuma alteração detectada."
fi

#################################
# Verifica tabela dispatcher
#################################

/usr/bin/mysql -N -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e \
"SELECT CONCAT(setid, '|', destination, '|', weight, '|', priority, '|', attrs, '|', description) FROM dispatcher ORDER BY setid, destination;" > "$TMP_DS"

if [ ! -f "$SNAP_DS" ]; then
    echo "[dispatcher] Snapshot inicial criado e ds_reload executado"
    cp "$TMP_DS" "$SNAP_DS"
    /usr/bin/opensips-cli -x mi ds_reload
elif ! cmp -s "$SNAP_DS" "$TMP_DS"; then
    echo "[dispatcher] Alterações detectadas, executando ds_reload..."
    cp "$TMP_DS" "$SNAP_DS"
    /usr/bin/opensips-cli -x mi ds_reload
else
    echo "[dispatcher] Nenhuma alteração detectada."
fi

#################################
# Limpeza
#################################

rm -f "$TMP_ADDR" "$TMP_DS"
