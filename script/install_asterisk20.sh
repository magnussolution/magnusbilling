#!/usr/bin/env bash

set -Eeuo pipefail
umask 022

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly DEFAULT_VERSION="20.9.2"
readonly ASTERISK_USER="asterisk"
readonly ASTERISK_ETC="/etc/asterisk"

VERSION="${ASTERISK_VERSION:-${DEFAULT_VERSION}}"
SOURCE_ARCHIVE="${SCRIPT_DIR}/asterisk-${VERSION}.tar.gz"
CONFIGURE_FIREWALL=0
ALLOW_EXISTING=0

usage() {
    cat <<EOF
Install Asterisk ${DEFAULT_VERSION} for a MagnusBilling 7 to 8 migration.

Usage:
  $(basename "$0") [options]

Options:
  --version VERSION       Asterisk version (default: ${DEFAULT_VERSION})
  --source FILE           Local Asterisk tarball (default: script tarball)
  --configure-firewall   Open SIP 5060/udp and RTP 10000-20000/udp when firewalld is active
  --allow-existing       Preserve an existing /etc/asterisk and continue
  -h, --help              Show this help

This script supports Debian only. It installs Asterisk 20 with PJSIP and
creates a clean MagnusBilling-compatible configuration. It never imports a
MagnusBilling 7 /etc/asterisk directory.
EOF
}

die() { echo "ERROR: $*" >&2; exit 1; }
log() { echo "[install_asterisk20] $*"; }

require_root() {
    [[ ${EUID} -eq 0 ]] || die "Run this installer as root."
    [[ -f /etc/debian_version ]] || die "Only Debian is supported by this installer."
    [[ "${VERSION}" =~ ^20\. ]] || die "This installer only supports Asterisk 20.x."
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --version)
                [[ $# -ge 2 ]] || die "--version requires a value."
                VERSION="$2"
                SOURCE_ARCHIVE="${SCRIPT_DIR}/asterisk-${VERSION}.tar.gz"
                shift 2
                ;;
            --source)
                [[ $# -ge 2 ]] || die "--source requires a file."
                SOURCE_ARCHIVE="$2"
                shift 2
                ;;
            --configure-firewall)
                CONFIGURE_FIREWALL=1
                shift
                ;;
            --allow-existing)
                ALLOW_EXISTING=1
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                die "Unknown option: $1"
                ;;
        esac
    done
}

install_dependencies() {
    log "Installing Debian build dependencies."
    apt-get update --allow-releaseinfo-change
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        autoconf automake bison build-essential ca-certificates curl flex \
        git libasound2-dev libcap-dev libcurl4-openssl-dev libedit-dev \
        libjansson-dev libncurses-dev libnewt-dev libogg-dev libpopt-dev \
        libpq-dev libspeexdsp-dev libsqlite3-dev \
        libssl-dev libtool libtool-bin libvorbis-dev libxml2-dev \
        libxslt1-dev pkg-config subversion uuid-dev wget \
        unixodbc-dev odbcinst odbcinst1debian2
}

prepare_user_and_directories() {
    if ! id -u "${ASTERISK_USER}" >/dev/null 2>&1; then
        useradd --system --home-dir /var/lib/asterisk --shell /usr/sbin/nologin \
            --comment "Asterisk PBX" "${ASTERISK_USER}"
    fi
    install -d -o "${ASTERISK_USER}" -g "${ASTERISK_USER}" \
        /var/lib/asterisk /var/log/asterisk /var/spool/asterisk /var/run/asterisk
    install -d -o root -g "${ASTERISK_USER}" -m 0750 "${ASTERISK_ETC}"
}

preserve_existing_config() {
    if [[ ! -d "${ASTERISK_ETC}" ]] || [[ -z "$(find "${ASTERISK_ETC}" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
        return
    fi
    [[ "${ALLOW_EXISTING}" -eq 1 ]] || die "${ASTERISK_ETC} is not empty. Re-run with --allow-existing; the old configuration will be archived, not imported."
    local archive="/root/asterisk-config-before-mb8-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
    systemctl stop asterisk >/dev/null 2>&1 || true
    tar -C / -czf "${archive}" etc/asterisk
    log "Existing Asterisk configuration archived at ${archive}."
    find "${ASTERISK_ETC}" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
}

obtain_source() {
    if [[ ! -r "${SOURCE_ARCHIVE}" ]]; then
        SOURCE_ARCHIVE="/usr/src/asterisk-${VERSION}.tar.gz"
    fi
    if [[ ! -r "${SOURCE_ARCHIVE}" ]]; then
        SOURCE_ARCHIVE="/tmp/asterisk-${VERSION}.tar.gz"
    fi
    if [[ ! -r "${SOURCE_ARCHIVE}" ]]; then
        SOURCE_ARCHIVE="/usr/src/asterisk-${VERSION}.tar.gz"
        log "Downloading Asterisk ${VERSION} from downloads.asterisk.org."
        curl -fL --retry 3 \
            "https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-${VERSION}.tar.gz" \
            -o "${SOURCE_ARCHIVE}"
    fi
    [[ -s "${SOURCE_ARCHIVE}" ]] || die "Asterisk source archive is empty: ${SOURCE_ARCHIVE}"
}

build_asterisk() {
    local build_root="/usr/src/asterisk-${VERSION}"
    rm -rf "${build_root}"
    tar -xzf "${SOURCE_ARCHIVE}" -C /usr/src
    [[ -d "${build_root}" ]] || die "Unexpected archive layout; expected ${build_root}."
    cd "${build_root}"

    log "Installing Asterisk prerequisite libraries."
    contrib/scripts/install_prereq install
    ./configure --with-jansson-bundled --with-pjproject-bundled
    make menuselect.makeopts
    menuselect/menuselect \
        --enable res_config_mysql \
        --enable res_pjsip \
        --enable res_pjsip_transport_websocket \
        menuselect.makeopts
    make -j"$(nproc)"
    make install
    make samples
    make config
    ldconfig
}

write_configuration() {
    install -d -o "${ASTERISK_USER}" -g "${ASTERISK_USER}" \
        /var/lib/asterisk/agi-bin /var/lib/asterisk/sounds /var/lib/asterisk/moh

    cat > "${ASTERISK_ETC}/asterisk.conf" <<'EOF'
[directories](!)
astetcdir => /etc/asterisk
astmoddir => /usr/lib/asterisk/modules
astvarlibdir => /var/lib/asterisk
astdbdir => /var/lib/asterisk
astkeydir => /var/lib/asterisk
astdatadir => /var/lib/asterisk
astagidir => /var/lib/asterisk/agi-bin
astspooldir => /var/spool/asterisk
astrundir => /var/run/asterisk
astlogdir => /var/log/asterisk
runuser = asterisk
rungroup = asterisk

[options]
documentation_language = en_US
verbose = 5
maxfiles = 500000
hideconnect = yes
EOF

    cat > "${ASTERISK_ETC}/pjsip.conf" <<'EOF'
[global]
type=global

[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060

#include pjsip_magnus.conf
#include pjsip_magnus_user.conf
EOF
    : > "${ASTERISK_ETC}/pjsip_magnus.conf"
    : > "${ASTERISK_ETC}/pjsip_magnus_user.conf"
    : > "${ASTERISK_ETC}/extensions_magnus.conf"
    : > "${ASTERISK_ETC}/extensions_magnus_did.conf"
    : > "${ASTERISK_ETC}/musiconhold_magnus.conf"
    : > "${ASTERISK_ETC}/queues_magnus.conf"
    : > "${ASTERISK_ETC}/voicemail_magnus.conf"

    cat > "${ASTERISK_ETC}/extensions.conf" <<'EOF'
[general]
static=yes
writeprotect=no

#include extensions_magnus.conf
#include extensions_magnus_did.conf
EOF
    cat > "${ASTERISK_ETC}/manager.conf" <<'EOF'
[general]
enabled = yes
port = 5038
bindaddr = 127.0.0.1
displayconnects = no
EOF
    cat > "${ASTERISK_ETC}/modules.conf" <<'EOF'
[modules]
autoload=yes
noload => chan_sip.so
noload => res_config_sqlite3.so
noload => res_config_sqlite.so
noload => cdr_sqlite3_custom.so
noload => cdr_sqlite3.so
EOF
    chown -R "${ASTERISK_USER}:${ASTERISK_USER}" /var/lib/asterisk /var/log/asterisk /var/spool/asterisk /var/run/asterisk
    chown root:"${ASTERISK_USER}" "${ASTERISK_ETC}"/*
    chmod 0640 "${ASTERISK_ETC}"/*.conf
}

write_systemd_unit() {
    cat > /etc/systemd/system/asterisk.service <<'EOF'
[Unit]
Description=Asterisk PBX (MagnusBilling)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=asterisk
Group=asterisk
Environment=HOME=/var/lib/asterisk
WorkingDirectory=/var/lib/asterisk
ExecStart=/usr/sbin/asterisk -f -U asterisk -G asterisk -C /etc/asterisk/asterisk.conf
ExecStop=/usr/sbin/asterisk -rx "core stop now"
ExecReload=/usr/sbin/asterisk -rx "core reload"
Restart=on-failure
RestartSec=4
LimitNOFILE=500000
LimitCORE=infinity
RuntimeDirectory=asterisk
RuntimeDirectoryMode=0750
ReadWritePaths=/var/lib/asterisk /var/spool/asterisk /var/log/asterisk

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable asterisk
}

configure_firewall() {
    [[ "${CONFIGURE_FIREWALL}" -eq 1 ]] || return
    command -v firewall-cmd >/dev/null 2>&1 || die "--configure-firewall requires firewalld."
    firewall-cmd --state >/dev/null 2>&1 || die "firewalld is not active."
    firewall-cmd --permanent --add-port=5060/udp
    firewall-cmd --permanent --add-port=10000-20000/udp
    firewall-cmd --reload
}

main() {
    parse_args "$@"
    require_root
    install_dependencies
    prepare_user_and_directories
    preserve_existing_config
    obtain_source
    build_asterisk
    write_configuration
    write_systemd_unit
    configure_firewall
    systemctl restart asterisk
    asterisk -rx 'core show version'
    asterisk -rx 'pjsip show transports'
    install -d -m 0755 /etc/magnusbilling
    printf 'asterisk_version=%s\ninstalled_utc=%s\n' "${VERSION}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        > /etc/magnusbilling/asterisk20-install.manifest
    log "Asterisk ${VERSION} is ready for MagnusBilling 8 migration."
    log "Install MagnusBilling 8 separately, then restore the MB7 dump and run UpdateMysql."
}

main "$@"
