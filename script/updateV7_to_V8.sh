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
  --allow-existing       Kept for compatibility; existing files are archived automatically
  -h, --help              Show this help

This script supports Debian only. It installs Asterisk 20 with PJSIP and
creates a clean MagnusBilling-compatible configuration. It never imports a
MagnusBilling 7 /etc/asterisk directory.

IMPORTANT - MIGRATION RESPONSIBILITY
This script is provided as-is, without warranty. You are solely responsible
for creating and verifying backups, validating compatibility, and reviewing
the result of the migration. MagnusSolution and the MagnusBilling team are not
responsible for data loss, service interruption, configuration problems, or
any other damage resulting from an update performed with this script.

If you prefer the migration to be planned and performed by the MagnusBilling
team, contact MagnusSolution to purchase professional migration support:
https://magnussolution.com | info@magnussolution.com
EOF
}

die() { echo "ERROR: $*" >&2; exit 1; }
log() { echo "[install_asterisk20] $*"; }

show_migration_notice() {
    cat >&2 <<'EOF'

===============================================================================
 IMPORTANT - READ BEFORE MIGRATING MAGNUSBILLING 7 TO MAGNUSBILLING 8
===============================================================================
 This script is provided as-is, without warranty. You are solely responsible
 for creating and verifying backups, validating compatibility, and reviewing
 the migration result.

 MagnusSolution and the MagnusBilling team are not responsible for data loss,
 service interruption, configuration problems, or any other damage resulting
 from an update performed with this script.

 If you want the MagnusBilling team to plan and perform the migration, paid
 professional support is available:
 https://magnussolution.com | info@magnussolution.com
===============================================================================

EOF
}

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
        unixodbc-dev odbcinst patchelf
}

prepare_user_and_directories() {
    if ! getent passwd "${ASTERISK_USER}" >/dev/null 2>&1; then
        useradd --system --home-dir /var/lib/asterisk --shell /usr/sbin/nologin \
            --comment "Asterisk PBX" "${ASTERISK_USER}"
    else
        log "Using existing ${ASTERISK_USER} system user."
    fi
    usermod --home /var/lib/asterisk --shell /usr/sbin/nologin "${ASTERISK_USER}"
    install -d -o "${ASTERISK_USER}" -g "${ASTERISK_USER}" \
        /var/lib/asterisk /var/log/asterisk /var/spool/asterisk /var/run/asterisk
    install -d -o root -g "${ASTERISK_USER}" -m 0750 "${ASTERISK_ETC}"
}

preserve_existing_config() {
    if [[ ! -d "${ASTERISK_ETC}" ]] || [[ -z "$(find "${ASTERISK_ETC}" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
        return
    fi

    systemctl stop asterisk >/dev/null 2>&1 || true
    cp -rf /etc/asterisk /etc/asterisk_1.3
}


build_asterisk() {

    rm -rf /usr/lib/asterisk/modules/
    cd /usr/src
    rm -rf asterisk*
    clear
    wget https://raw.githubusercontent.com/magnussolution/magnusbilling/source/script/asterisk-20.9.2.tar.gz
    tar xzvf asterisk-20.9.2.tar.gz
    rm -rf asterisk-20.9.2.tar.gz
    cd asterisk-*
    install -d /var/run/asterisk /var/log/asterisk
    chown -R asterisk:asterisk /var/run/asterisk
    chown -R asterisk:asterisk /var/log/asterisk
    make clean
    contrib/scripts/install_prereq install
    ./configure --with-jansson-bundled --with-pjproject-bundled
    make menuselect.makeopts
    menuselect/menuselect --enable res_config_mysql  menuselect.makeopts
    make
    make install
    make samples
    make config
    ldconfig
    cp -rf /etc/asterisk_1.3/res_config_mysql.conf /etc/asterisk/
}



write_configuration() {


mkdir -p /usr/local/src/magnus
touch /etc/asterisk/extensions_magnus.conf
touch /etc/asterisk/extensions_magnus_did.conf
touch /etc/asterisk/pjsip_magnus.conf
touch /etc/asterisk/pjsip_magnus_user.conf
touch /etc/asterisk/musiconhold_magnus.conf
touch /etc/asterisk/queues_magnus.conf
touch /etc/asterisk/voicemail_magnus.conf
touch /etc/asterisk/mbilling.conf


cp -rf /etc/asterisk_1.3/res_config_mysql.conf /etc/asterisk/
cp -rf /etc/asterisk_1.3/extensions.ael /etc/asterisk/
cp -rf /etc/asterisk_1.3/res_odbc.conf /etc/asterisk
cp -rf /etc/asterisk_1.3/func_odbc.conf /etc/asterisk
cp -rf /etc/asterisk_1.3/logger.conf /etc/asterisk/logger.conf
cp -rf /etc/asterisk_1.3/manager.conf /etc/asterisk/manager.conf
cp -rf /etc/asterisk_1.3/extensions_magnus.conf /etc/asterisk/extensions_magnus.conf





echo "#include extensions_magnus.conf" >> /etc/asterisk/extensions.conf
echo '#include extensions_magnus_did.conf' >> /etc/asterisk/extensions.conf
echo "#include musiconhold_magnus.conf" >> /etc/asterisk/musiconhold.conf
echo "#include voicemail_magnus.conf" >> /etc/asterisk/voicemail.conf


echo "
noload => res_config_sqlite3.so
noload => res_config_sqlite.so
noload => chan_skinny.so
noload => cdr_custom.so
noload => cdr_odbc.so
noload => cdr_sqlite3_custom.so
noload => cdr_csv.so
noload => cdr_manager.so
noload => chan_iax2.so
noload => cdr_mysql.so
noload => app_celgenuserevent.so
noload => cel_custom.so
noload => cel_manager.so
noload => cel_odbc.so
noload => cel_sqlite3_custom.so
noload => res_format_attr_celt.so
noload => chan_sip.so
noload => res_pjsip_endpoint_identifier_anonymous.so
" >> /etc/asterisk/modules.conf

echo '[directories](!)
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
' > /etc/asterisk/asterisk.conf


echo "
[options]
documentation_language = en_US 
verbose = 5
debug = 0
maxfiles = 500000
hideconnect = 1

[compat]
pbx_realtime=1.6
res_agi=1.6
app_set=1.6" >> /etc/asterisk/asterisk.conf



echo "
[general]
bindaddr = 0.0.0.0

[transport-udp]
type = transport
protocol = udp
bind = 0.0.0.0:5060

#include pjsip_magnus.conf
#include pjsip_magnus_user.conf
" > /etc/asterisk/pjsip.conf


echo "
#include queues_magnus.conf
" >> /etc/asterisk/queues.conf

    chown -R "${ASTERISK_USER}:${ASTERISK_USER}" /var/lib/asterisk /var/log/asterisk /var/spool/asterisk /var/run/asterisk
    chown root:"${ASTERISK_USER}" "${ASTERISK_ETC}"/*
    chmod 0640 "${ASTERISK_ETC}"/*.conf
}

migrate_legacy_network_settings() {
    local legacy_sip="/etc/asterisk_1.3/sip.conf"
    local pjsip_config="${ASTERISK_ETC}/pjsip.conf"
    local setting value
    local externip=""
    local externaddr=""
    local media_address=""
    local migrated_settings
    local updated_pjsip
    local -a localnets=()

    if [[ ! -f "${legacy_sip}" ]]; then
        log "Legacy ${legacy_sip} not found; skipping SIP network migration."
        return
    fi

    while IFS='=' read -r setting value; do
        setting="${setting//[[:space:]]/}"
        value="${value%%;*}"
        value="${value%%#*}"
        value="${value#"${value%%[![:space:]]*}"}"
        value="${value%"${value##*[![:space:]]}"}"
        [[ -n "${value}" ]] || continue

        case "${setting,,}" in
            localnet)
                localnets+=("${value}")
                ;;
            externip)
                externip="${value}"
                ;;
            externaddr)
                externaddr="${value}"
                ;;
            media_address)
                media_address="${value}"
                ;;
        esac
    done < <(sed -nE '/^[[:space:]]*[;#]/d; /^[[:space:]]*(localnet|externip|externaddr|media_address)[[:space:]]*=/Ip' "${legacy_sip}")

    if [[ ${#localnets[@]} -eq 0 && -z "${externip}" && -z "${externaddr}" && -z "${media_address}" ]]; then
        log "No legacy localnet or external IP settings found in ${legacy_sip}."
        return
    fi

    migrated_settings="$(mktemp)"
    updated_pjsip="$(mktemp)"
    {
        for value in "${localnets[@]}"; do
            printf 'local_net = %s\n' "${value}"
        done

        value="${externaddr:-${externip:-${media_address}}}"
        [[ -z "${value}" ]] || printf 'external_signaling_address = %s\n' "${value}"

        value="${media_address:-${externaddr:-${externip}}}"
        [[ -z "${value}" ]] || printf 'external_media_address = %s\n' "${value}"
    } > "${migrated_settings}"

    awk -v settings_file="${migrated_settings}" '
        !inserted && /^#include[[:space:]]/ {
            while ((getline line < settings_file) > 0) print line
            print ""
            close(settings_file)
            inserted = 1
        }
        { print }
        END {
            if (!inserted) {
                while ((getline line < settings_file) > 0) print line
                close(settings_file)
            }
        }
    ' "${pjsip_config}" > "${updated_pjsip}"
    install -o root -g "${ASTERISK_USER}" -m 0640 "${updated_pjsip}" "${pjsip_config}"
    rm -f "${migrated_settings}" "${updated_pjsip}"

    log "Migrated legacy SIP network settings to ${pjsip_config}."
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

replateM7ToM8() {
    cd /var/www/html/mbilling
    rm -rf MagnusBilling8-current.tar.gz
    wget --no-check-certificate https://magnusbilling.org/download/MagnusBilling8-current.tar.gz
    tar xzf MagnusBilling8-current.tar.gz
    /var/www/html/mbilling/protected/commands/update.sh
}


p4_proc()
{
    set $(grep "model name" /proc/cpuinfo);

    if [ "$4" == "Celeron" ]; then

        wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-pentium.so
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium.so
        cp /usr/src/codec_g723-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g723.so
        cp /usr/src/codec_g729-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so

        return 0;
    fi

    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-pentium4.so
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium4.so
    mv /usr/src/codec_g723-ast200-gcc4-glibc-pentium4.so  /usr/lib/asterisk/modules/codec_g723.so
    mv codec_g729-ast200-gcc4-glibc-pentium4.so /usr/lib/asterisk/modules/codec_g729.so

}
p4_x64_proc()
{
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-x86_64-pentium4.so
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-x86_64-pentium4.so
    mv /usr/src/codec_g723-ast200-gcc4-glibc-x86_64-pentium4.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-x86_64-pentium4.so /usr/lib/asterisk/modules/codec_g729.so

}
p3_proc()
{
    set $(grep "model name" /proc/cpuinfo);
    if [ "$4" == "Intel(R)" &&  "$5" == "Pentium(R)" && "$6"== "III" ];then
        wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-pentium.so
        wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium.so
        mv /usr/src/codec_g723-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g723.so
        mv /usr/src/codec_g729-ast200-gcc4-glibc-pentium.so /usr/lib/asterisk/modules/codec_g729.so
        return 0;
    fi
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-pentium3.so
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-pentium3.so
    mv /usr/src/codec_g723-ast200-gcc4-glibc-pentium3.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-pentium3.so /usr/lib/asterisk/modules/codec_g729.so

}
AMD_proc()
{
    wget https://www.magnusbilling.org/download/codecs/codec_g729-ast200-gcc4-glibc-athlon-sse.so
    wget https://www.magnusbilling.org/download/codecs/codec_g723-ast200-gcc4-glibc-athlon-sse.so
    mv /usr/src/codec_g723-ast200-gcc4-glibc-athlon-sse.so /usr/lib/asterisk/modules/codec_g723.so
    mv /usr/src/codec_g729-ast200-gcc4-glibc-athlon-sse.so /usr/lib/asterisk/modules/codec_g729.so

}

processor_type()
{
    _UNAME=`uname -a`;
    _IS_64_BIT=`echo "$_UNAME"  | grep x86_64`
    if [ -n "$_IS_64_BIT" ];
        then _64BIT=1;
        else _64BIT=0;
    fi;
}


installCodec(){
    echo "INSTALLING G723 and G729 CODECS......... FROM http://asterisk.hosting.lv";
    cd /usr/src
    rm -rf codec_*
    processor_type;
    _IS_AMD=`cat /proc/cpuinfo | grep AMD`;
    _P3=`cat /proc/cpuinfo | grep "Pentium III"`;
    _P3_R=`cat /proc/cpuinfo | grep "Pentium(R) III"`;
    _INTEL=`cat /proc/cpuinfo | grep Intel`;
    if [ -n "$_IS_AMD" ];
      then
          echo "Processor type detected: AMD";
          if  [ "$_64BIT" == 1 ]; then
            echo "It is a x64 proc";
               p4_x64_proc;
          else
            echo "AMD processor detected";
            AMD_proc;
          fi

    elif [ -n "$_P3_R" ]; then echo "Pentium(R) III processor detected"; p3_proc;
    elif [ "$_64BIT" == 1 ]; then echo "Processor type detected: INTEL x64"; p4_x64_proc;
    elif [ -n "$_INTEL" ]; then echo "Pentium IV processor detected"; p4_proc;
    elif [ -n "$_P3" ]; then echo "Pentium III processor detected"; p3_proc;
    else
        echo -e "Automatic detection of required codec installation script failed\nYou must manually select and install the required codec according to this output:";
        cat /proc/cpuinfo
        uname -a
        echo "you can find codecs installation scripts in http://asterisk.hosting.lv";
    fi;
}

fix_codec_execstack()
{
    local codec
    for codec in /usr/lib/asterisk/modules/codec_g729.so /usr/lib/asterisk/modules/codec_g723.so; do
        if [ -f "${codec}" ]; then
            log "Clearing executable-stack flag from ${codec}."
            patchelf --clear-execstack "${codec}"
        fi
    done
}




main() {
    parse_args "$@"
    show_migration_notice
    require_root
    install_dependencies
    prepare_user_and_directories
    preserve_existing_config
    build_asterisk
    installCodec
    fix_codec_execstack
    write_configuration
    migrate_legacy_network_settings
    write_systemd_unit
    replateM7ToM8
    systemctl restart asterisk
    asterisk -rx 'core show version'
    asterisk -rx 'pjsip show transports'
    install -d -m 0755 /etc/magnusbilling
    printf 'asterisk_version=%s\ninstalled_utc=%s\n' "${VERSION}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        > /etc/magnusbilling/asterisk20-install.manifest
    log "Asterisk ${VERSION} is ready for MagnusBilling 8 migration."
}

main "$@"
