#!/usr/bin/env bash
set -Eeuo pipefail

readonly SENTINEL_MODULE=/usr/lib/asterisk/modules/app_mbilling.so
readonly SENTINEL_CONFIG=/etc/magnus-sentinel/ingest.ini
readonly SENTINEL_INSTALLER_URL=https://magnusbilling.org/download/MagnusSentinel-current.sh
readonly SENTINEL_CHECKSUM_URL=${SENTINEL_INSTALLER_URL}.sha256

log() {
    printf '[Magnus Sentinel] %s\n' "$*"
}

fail() {
    printf '[Magnus Sentinel] ERRO: %s\n' "$*" >&2
    exit 1
}

ini_value() {
    local section="$1"
    local key="$2"
    awk -F= -v wanted_section="$section" -v wanted_key="$key" '
        /^[[:space:]]*\[/ {
            current=$0
            gsub(/^[[:space:]]*\[|\][[:space:]]*$/, "", current)
            next
        }
        current == wanted_section {
            candidate=$1
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", candidate)
            if (candidate == wanted_key) {
                value=substr($0, index($0, "=") + 1)
                gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
                print value
                exit
            }
        }
    ' "$SENTINEL_CONFIG"
}

local_odbc_database() {
    awk -F= '
        BEGIN { section="" }
        /^[[:space:]]*\[/ {
            section=tolower($0)
            gsub(/^[[:space:]]*\[|\][[:space:]]*$/, "", section)
            next
        }
        section == "mbilling-connector" {
            key=tolower($1)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
            if (key == "server") {
                value=tolower(substr($0, index($0, "=") + 1))
                gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
                if (value == "localhost" || value == "127.0.0.1" || value == "::1")
                    found=1
            }
        }
        END { exit(found ? 0 : 1) }
    ' /etc/odbc.ini
}

[[ "${EUID}" -eq 0 ]] || fail "execute como root"
[[ -f "$SENTINEL_MODULE" && ! -L "$SENTINEL_MODULE" ]] || {
    log "app_mbilling.so não encontrada; Sentinel não é aplicável"
    exit 0
}

role=master
database_host=localhost
server_public_ip=""
if [[ -x /opt/magnus-sentinel/sentinel_ingest.py ]]; then
    [[ -r "$SENTINEL_CONFIG" ]] || fail "ingest.ini da instalação existente não pode ser lido"
    role="$(ini_value source server_role)"
    database_host="$(ini_value odbc database_host)"
    server_public_ip="$(ini_value source server_public_ip)"
    [[ "$role" == "master" || "$role" == "slave" ]] || fail "server_role existente é inválido"
    [[ -n "$database_host" ]] || fail "database_host existente está vazio"
    if [[ "$role" == "slave" && -z "$server_public_ip" ]]; then
        fail "server_public_ip existente está vazio para o slave"
    fi
    log "atualizando instalação existente ($role)"
else
    [[ -r /etc/odbc.ini ]] || fail "/etc/odbc.ini não pode ser lido"
    local_odbc_database || fail \
        "instalação automática nova exige MASTER com banco local; instale slaves manualmente"
    log "instalando no MASTER com banco local"
fi

temporary_dir="$(mktemp -d /tmp/magnus-sentinel-update.XXXXXX)"
cleanup() {
    rm -rf -- "$temporary_dir"
}
trap cleanup EXIT
installer="$temporary_dir/MagnusSentinel-current.sh"

wget --https-only -q -O "$installer" "$SENTINEL_INSTALLER_URL" || fail "falha ao baixar o instalador"
wget --https-only -q -O "$installer.sha256" "$SENTINEL_CHECKSUM_URL" || fail "falha ao baixar o SHA-256"
grep -Eq '^[0-9a-fA-F]{64}  MagnusSentinel-current\.sh$' "$installer.sha256" || fail "arquivo SHA-256 é inválido"
(cd "$temporary_dir" && sha256sum -c MagnusSentinel-current.sh.sha256) || fail "SHA-256 do instalador é inválido"
chmod 700 "$installer"

if [[ "$role" == "master" ]]; then
    installer_args=(master "$database_host")
    if [[ -n "$server_public_ip" ]]; then
        installer_args+=("$server_public_ip")
    fi
    "$installer" "${installer_args[@]}"
else
    "$installer" slave "$server_public_ip" "$database_host"
fi
log "instalação/atualização concluída"
