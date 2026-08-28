#!/bin/bash

set -euo pipefail

readonly COMMAND_NAME="$(basename -- "$0")"
readonly ACCESS_DIRECTORY="${MAGNUSBILLING_PANEL_IP_DIR:-/etc/magnusbilling/panel-ip-access}"
readonly WEB_GROUP="${MAGNUSBILLING_WEB_GROUP:-www-data}"

fail()
{
    echo "ERROR: $*" >&2
    exit 1
}

require_root()
{
    if [[ ${EUID} -ne 0 ]]; then
        fail "execute ${COMMAND_NAME} as root (or with sudo)."
    fi
}

validate_username()
{
    local username="$1"

    if [[ -z "${username}" ]]; then
        fail "panel username cannot be empty."
    fi
}

allowlist_key()
{
    local username="$1"

    PANEL_USERNAME="${username}" php -r '
        $username = getenv("PANEL_USERNAME");
        if ($username === false || $username === "") {
            exit(1);
        }
        echo hash("sha256", $username);
    ' || fail "could not create the panel username identifier."
}

ssh_client_ip()
{
    local client_ip=""

    if [[ -n "${SSH_CONNECTION:-}" ]]; then
        read -r client_ip _ <<< "${SSH_CONNECTION}"
    elif [[ -n "${SSH_CLIENT:-}" ]]; then
        read -r client_ip _ <<< "${SSH_CLIENT}"
    fi

    if [[ -z "${client_ip}" ]]; then
        fail "no SSH client IP found; run this command inside the SSH session to authorize."
    fi

    if ! CLIENT_IP="${client_ip}" php -r '
        $ip = getenv("CLIENT_IP");
        exit(filter_var($ip, FILTER_VALIDATE_IP) === false ? 1 : 0);
    '; then
        fail "SSH supplied an invalid client IP."
    fi

    printf '%s\n' "${client_ip}"
}

authorize_ip_in_database()
{
    local username="$1"
    local client_ip="$2"

    PANEL_USERNAME="${username}" PANEL_CLIENT_IP="${client_ip}" php -r '
        $configFile = "/etc/asterisk/res_config_mysql.conf";
        $config = parse_ini_file($configFile);
        foreach (["dbhost", "dbname", "dbuser", "dbpass"] as $requiredKey) {
            if (! is_array($config) || ! array_key_exists($requiredKey, $config)) {
                fwrite(STDERR, "ERROR: invalid MariaDB configuration in {$configFile}.\n");
                exit(1);
            }
        }

        $ip = getenv("PANEL_CLIENT_IP");
        $username = getenv("PANEL_USERNAME");
        if (filter_var($ip, FILTER_VALIDATE_IP) === false || $username === false || $username === "") {
            fwrite(STDERR, "ERROR: invalid IP or panel username.\n");
            exit(1);
        }

        try {
            $pdo = new PDO(
                "mysql:host={$config["dbhost"]};dbname={$config["dbname"]};charset=utf8mb4",
                $config["dbuser"],
                $config["dbpass"],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            $pdo->beginTransaction();

            $deleteFirewall = $pdo->prepare("DELETE FROM pkg_firewall WHERE ip = :ip");
            $deleteFirewall->execute([":ip" => $ip]);

            $deleteLog = $pdo->prepare("DELETE FROM pkg_log WHERE ip = :ip");
            $deleteLog->execute([":ip" => $ip]);

            $insertFirewall = $pdo->prepare(
                "INSERT INTO pkg_firewall (ip, action, description, jail, id_server)
                 VALUES (:ip, 5, :description, :jail, 1)"
            );
            $insertFirewall->execute([
                ":ip" => $ip,
                ":description" => "Authorized by addmyip for panel user " . $username,
                ":jail" => "IgnoreIP",
            ]);

            $pdo->commit();
        } catch (Throwable $error) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            fwrite(STDERR, "ERROR: unable to authorize IP in MariaDB: " . $error->getMessage() . "\n");
            exit(1);
        }
    ' || fail "database authorization failed; the panel allowlist was not changed."
}

prepare_directory()
{
    install -d -o root -g "${WEB_GROUP}" -m 0750 -- "${ACCESS_DIRECTORY}"
    touch -- "${ACCESS_DIRECTORY}/.lock"
    chown root:"${WEB_GROUP}" -- "${ACCESS_DIRECTORY}/.lock"
    chmod 0640 -- "${ACCESS_DIRECTORY}/.lock"
}

add_current_ip()
{
    local username="$1"
    local client_ip="$2"
    local key
    local allowlist
    local legacy_allowlist=""
    local temporary_file

    key="$(allowlist_key "${username}")"
    allowlist="${ACCESS_DIRECTORY}/user-${key}.allow"
    if [[ "${username}" =~ ^[A-Za-z0-9_.@-]{1,100}$ ]] &&
       [[ "${username}" != "." && "${username}" != ".." ]]; then
        legacy_allowlist="${ACCESS_DIRECTORY}/${username}.allow"
    fi

    temporary_file="$(mktemp "${ACCESS_DIRECTORY}/.user-${key}.allow.XXXXXX")"
    trap 'rm -f -- "${temporary_file:-}"' EXIT

    if [[ -f "${allowlist}" ]]; then
        awk 'NF { print }' "${allowlist}" > "${temporary_file}"
    fi
    if [[ -n "${legacy_allowlist}" && -f "${legacy_allowlist}" ]]; then
        awk 'NF { print }' "${legacy_allowlist}" >> "${temporary_file}"
    fi
    if ! grep -Fqx -- "${client_ip}" "${temporary_file}"; then
        printf '%s\n' "${client_ip}" >> "${temporary_file}"
    fi

    sort -u -o "${temporary_file}" -- "${temporary_file}"
    chown root:"${WEB_GROUP}" -- "${temporary_file}"
    chmod 0640 -- "${temporary_file}"
    mv -f -- "${temporary_file}" "${allowlist}"
    if [[ -n "${legacy_allowlist}" ]]; then
        rm -f -- "${legacy_allowlist}"
    fi
    trap - EXIT

    echo "Authorized ${client_ip} for panel user ${username}."
}

delete_current_ip()
{
    local username="$1"
    local client_ip="$2"
    local key
    local allowlist
    local target_allowlist
    local legacy_allowlist=""
    local temporary_file

    key="$(allowlist_key "${username}")"
    target_allowlist="${ACCESS_DIRECTORY}/user-${key}.allow"
    allowlist="${target_allowlist}"
    if [[ "${username}" =~ ^[A-Za-z0-9_.@-]{1,100}$ ]] &&
       [[ "${username}" != "." && "${username}" != ".." ]]; then
        legacy_allowlist="${ACCESS_DIRECTORY}/${username}.allow"
    fi
    if [[ ! -f "${allowlist}" && -n "${legacy_allowlist}" && -f "${legacy_allowlist}" ]]; then
        allowlist="${legacy_allowlist}"
    fi

    if [[ ! -f "${allowlist}" ]]; then
        echo "Panel user ${username} is already unrestricted; no IP allowlist exists."
        return
    fi

    temporary_file="$(mktemp "${ACCESS_DIRECTORY}/.user-${key}.allow.XXXXXX")"
    trap 'rm -f -- "${temporary_file:-}"' EXIT
    awk -v client_ip="${client_ip}" 'NF && $0 != client_ip { print }' \
        "${allowlist}" > "${temporary_file}"
    sort -u -o "${temporary_file}" -- "${temporary_file}"
    chown root:"${WEB_GROUP}" -- "${temporary_file}"
    chmod 0640 -- "${temporary_file}"
    mv -f -- "${temporary_file}" "${target_allowlist}"
    if [[ -n "${legacy_allowlist}" ]]; then
        rm -f -- "${legacy_allowlist}"
    fi
    allowlist="${target_allowlist}"
    trap - EXIT

    echo "Removed ${client_ip} for panel user ${username}."
    if [[ ! -s "${allowlist}" ]]; then
        echo "WARNING: ${username} now has no authorized panel IPs. Use addmyip from SSH or releaseAll."
    fi
}

release_all()
{
    local allowlist
    local released=0

    while IFS= read -r -d '' allowlist; do
        rm -f -- "${allowlist}"
        released=$((released + 1))
    done < <(find "${ACCESS_DIRECTORY}" -maxdepth 1 -type f -name '*.allow' -print0)

    echo "Released all panel IP restrictions (${released} allowlist(s) removed)."
}

main()
{
    local username
    local client_ip

    require_root
    prepare_directory

    exec 9> "${ACCESS_DIRECTORY}/.lock"
    flock -x 9

    case "${COMMAND_NAME}" in
        addmyip)
            [[ $# -eq 1 ]] || fail "usage: addmyip USERNAME"
            username="$1"
            validate_username "${username}"
            client_ip="$(ssh_client_ip)"
            authorize_ip_in_database "${username}" "${client_ip}"
            add_current_ip "${username}" "${client_ip}"
            ;;
        delmyip)
            [[ $# -eq 1 ]] || fail "usage: delmyip USERNAME"
            username="$1"
            validate_username "${username}"
            client_ip="$(ssh_client_ip)"
            delete_current_ip "${username}" "${client_ip}"
            ;;
        releaseAll)
            [[ $# -eq 0 ]] || fail "usage: releaseAll"
            release_all
            ;;
        *)
            fail "invoke this program as addmyip, delmyip, or releaseAll."
            ;;
    esac
}

main "$@"
