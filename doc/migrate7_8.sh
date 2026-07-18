#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

readonly SCRIPT_NAME="$(basename "$0")"
readonly DB_CONFIG="/etc/asterisk/res_config_mysql.conf"
readonly MBILLING_ROOT="/var/www/html/mbilling"

usage()
{
    cat <<EOF
MagnusBilling 7 to 8 migration assistant

This script never installs MagnusBilling 8 over MagnusBilling 7.

Usage:
  ${SCRIPT_NAME} backup [--final] [--output DIRECTORY]
  ${SCRIPT_NAME} restore DUMP.sql.gz [--yes]
  ${SCRIPT_NAME} help

Commands:
  backup     Run on the MagnusBilling 7 server. Creates a full database dump,
             checksum, version manifest, and an Asterisk reference archive.
  restore    Run only on a clean MagnusBilling 8 Debian server. Preserves the
             clean version 8 database, imports the version 7 dump, and runs
             UpdateMysql.

Options:
  --final    Stop Asterisk, the web server, and cron before the final dump.
             The old server remains stopped for cutover or rollback.
  --output   Backup output directory. Default: /root
  --yes      Confirm a restore non-interactively.

Read the complete guide before using this script:
  https://github.com/magnussolution/magnusbilling8/blob/source/wiki/en/get_started/migrate_from_mb7.rst
EOF
}

die()
{
    echo "ERROR: $*" >&2
    exit 1
}

log()
{
    echo "[migrate7_8] $*"
}

require_root()
{
    if [[ ${EUID} -ne 0 ]]; then
        die "Run this command as root."
    fi
}

require_command()
{
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

first_available_command()
{
    local candidate
    for candidate in "$@"; do
        if command -v "${candidate}" >/dev/null 2>&1; then
            command -v "${candidate}"
            return 0
        fi
    done
    return 1
}

config_value()
{
    local key="$1"
    awk -F= -v wanted="${key}" '
        function trim(value) {
            sub(/^[[:space:]]+/, "", value)
            sub(/[[:space:]]+$/, "", value)
            return value
        }
        /^[[:space:]]*[#;]/ { next }
        {
            name = trim($1)
            if (name == wanted) {
                value = substr($0, index($0, "=") + 1)
                print trim(value)
                exit
            }
        }
    ' "${DB_CONFIG}"
}

stop_writers()
{
    local unit
    for unit in asterisk apache2 httpd cron crond; do
        systemctl stop "${unit}" >/dev/null 2>&1 || true
    done
}

start_mb8_services()
{
    local unit
    for unit in mariadb apache2 cron asterisk; do
        systemctl start "${unit}" >/dev/null
    done
}

read_application_database()
{
    [[ -r "${DB_CONFIG}" ]] || die "Database configuration is not readable: ${DB_CONFIG}"

    DB_HOST="$(config_value dbhost)"
    DB_NAME="$(config_value dbname)"
    DB_USER="$(config_value dbuser)"
    DB_PASS="$(config_value dbpass)"

    [[ -n "${DB_HOST}" ]] || die "dbhost is missing from ${DB_CONFIG}."
    [[ -n "${DB_NAME}" ]] || die "dbname is missing from ${DB_CONFIG}."
    [[ -n "${DB_USER}" ]] || die "dbuser is missing from ${DB_CONFIG}."
    [[ -n "${DB_PASS}" ]] || die "dbpass is missing from ${DB_CONFIG}."
}

application_query()
{
    local sql="$1"
    MYSQL_PWD="${DB_PASS}" "${DB_CLIENT}" \
        --host="${DB_HOST}" \
        --user="${DB_USER}" \
        --batch \
        --skip-column-names \
        --database="${DB_NAME}" \
        --execute="${sql}"
}

root_query()
{
    local sql="$1"
    "${DB_CLIENT}" --protocol=socket --batch --skip-column-names --execute="${sql}"
}

backup_mb7()
{
    local final_backup=0
    local output_directory="/root"
    local timestamp
    local prefix
    local dump_file
    local temporary_dump
    local version
    local asterisk_archive

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --final)
                final_backup=1
                shift
                ;;
            --output)
                [[ $# -ge 2 ]] || die "--output requires a directory."
                output_directory="$2"
                shift 2
                ;;
            *)
                die "Unknown backup option: $1"
                ;;
        esac
    done

    require_root
    require_command awk
    require_command gzip
    require_command sha256sum
    require_command tar

    DB_CLIENT="$(first_available_command mariadb mysql)" \
        || die "MariaDB/MySQL client not found."
    DB_DUMP="$(first_available_command mariadb-dump mysqldump)" \
        || die "MariaDB/MySQL dump client not found."

    read_application_database
    version="$(application_query \
        "SELECT config_value FROM pkg_configuration WHERE config_key = 'version' LIMIT 1;")"
    [[ "${version}" =~ ^7(\.|$) ]] \
        || die "The source database must be MagnusBilling 7. Detected: ${version:-unknown}"

    install -d -m 0700 "${output_directory}"

    if [[ "${final_backup}" -eq 1 ]]; then
        log "Stopping Asterisk, web, and cron writers for the final backup."
        stop_writers
    else
        log "Creating an online rehearsal backup. Use --final during cutover."
    fi

    timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
    prefix="${output_directory%/}/magnusbilling7-migration-${timestamp}"
    dump_file="${prefix}.sql.gz"
    temporary_dump="${dump_file}.partial"
    asterisk_archive="${prefix}-asterisk-reference.tar.gz"

    trap 'rm -f "${temporary_dump:-}"' EXIT

    log "Dumping the complete ${DB_NAME} database, including triggers."
    MYSQL_PWD="${DB_PASS}" "${DB_DUMP}" \
        --host="${DB_HOST}" \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --triggers \
        --hex-blob \
        --default-character-set=utf8 \
        "${DB_NAME}" | gzip -1 > "${temporary_dump}"

    gzip -t "${temporary_dump}"
    mv "${temporary_dump}" "${dump_file}"
    (
        cd "${output_directory}"
        sha256sum "$(basename "${dump_file}")" > "$(basename "${dump_file}").sha256"
    )

    if [[ -d /etc/asterisk ]]; then
        log "Archiving /etc/asterisk for reference. This archive contains secrets."
        tar -C / -czf "${asterisk_archive}" etc/asterisk
    fi

    {
        echo "created_utc=${timestamp}"
        echo "source_version=${version}"
        echo "source_database=${DB_NAME}"
        echo "final_backup=${final_backup}"
        echo "dump=$(basename "${dump_file}")"
        if [[ -f "${asterisk_archive}" ]]; then
            echo "asterisk_reference=$(basename "${asterisk_archive}")"
        fi
    } > "${prefix}.manifest"

    trap - EXIT
    log "Backup completed: ${dump_file}"
    log "Checksum: ${dump_file}.sha256"
    log "Copy recordings, prompts, certificates, and customer files separately."
    if [[ "${final_backup}" -eq 1 ]]; then
        log "The old call, web, and cron services remain stopped."
    fi
}

restore_mb8()
{
    local dump_file=""
    local assume_yes=0
    local clean_version
    local migrated_version
    local timestamp
    local clean_backup
    local answer

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --yes)
                assume_yes=1
                shift
                ;;
            -*)
                die "Unknown restore option: $1"
                ;;
            *)
                [[ -z "${dump_file}" ]] || die "Only one dump file may be restored."
                dump_file="$1"
                shift
                ;;
        esac
    done

    require_root
    require_command gzip
    require_command php
    require_command systemctl
    [[ -n "${dump_file}" ]] || die "Specify the MagnusBilling 7 .sql.gz dump."
    [[ -r "${dump_file}" ]] || die "Dump file is not readable: ${dump_file}"
    [[ -f "${MBILLING_ROOT}/index.php" ]] \
        || die "MagnusBilling 8 is not installed at ${MBILLING_ROOT}."
    [[ -f "${MBILLING_ROOT}/protected/commands/UpdateMysqlCommand.php" ]] \
        || die "UpdateMysqlCommand.php is missing from the MagnusBilling 8 installation."

    DB_CLIENT="$(first_available_command mariadb mysql)" \
        || die "MariaDB/MySQL client not found."
    DB_DUMP="$(first_available_command mariadb-dump mysqldump)" \
        || die "MariaDB/MySQL dump client not found."

    clean_version="$(root_query \
        "SELECT config_value FROM mbilling.pkg_configuration WHERE config_key = 'version' LIMIT 1;" \
        2>/dev/null || true)"
    [[ "${clean_version}" =~ ^8(\.|$) ]] \
        || die "Restore requires a clean MagnusBilling 8 database. Detected: ${clean_version:-unknown}"

    gzip -t "${dump_file}"
    if [[ -r "${dump_file}.sha256" ]]; then
        log "Verifying the database dump checksum."
        (
            cd "$(dirname "${dump_file}")"
            sha256sum -c "$(basename "${dump_file}").sha256"
        )
    else
        log "No checksum sidecar found. The gzip stream is valid, but origin was not verified."
    fi

    if [[ "${assume_yes}" -ne 1 ]]; then
        echo
        echo "This will replace the clean MagnusBilling 8 database on this server."
        echo "It must never be run on the MagnusBilling 7 production server."
        read -r -p "Type MIGRATE TO MB8 to continue: " answer
        [[ "${answer}" == "MIGRATE TO MB8" ]] || die "Restore cancelled."
    fi

    timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
    clean_backup="/root/magnusbilling8-clean-before-migration-${timestamp}.sql.gz"

    log "Stopping MagnusBilling 8 writers."
    stop_writers

    log "Preserving the clean MagnusBilling 8 database at ${clean_backup}."
    "${DB_DUMP}" --protocol=socket --single-transaction --quick --triggers mbilling \
        | gzip -1 > "${clean_backup}"
    gzip -t "${clean_backup}"

    log "Replacing the clean database with the MagnusBilling 7 dump."
    root_query \
        "DROP DATABASE IF EXISTS mbilling;
         CREATE DATABASE mbilling CHARACTER SET utf8 COLLATE utf8_general_ci;"
    gunzip -c "${dump_file}" | "${DB_CLIENT}" --protocol=socket mbilling

    log "Running the fail-fast MagnusBilling database migrator."
    php "${MBILLING_ROOT}/cron.php" UpdateMysql

    migrated_version="$(root_query \
        "SELECT config_value FROM mbilling.pkg_configuration WHERE config_key = 'version' LIMIT 1;")"
    [[ "${migrated_version}" =~ ^8(\.|$) ]] \
        || die "Database migration did not produce a MagnusBilling 8 version."

    log "Starting MagnusBilling 8 services."
    start_mb8_services

    log "Database migration completed at version ${migrated_version}."
    log "Do not move production traffic until the PJSIP and billing acceptance tests pass."
}

main()
{
    local command="${1:-help}"
    if [[ $# -gt 0 ]]; then
        shift
    fi

    case "${command}" in
        backup)
            backup_mb7 "$@"
            ;;
        restore)
            restore_mb8 "$@"
            ;;
        help|-h|--help)
            usage
            ;;
        *)
            usage >&2
            die "Unknown command: ${command}"
            ;;
    esac
}

main "$@"
