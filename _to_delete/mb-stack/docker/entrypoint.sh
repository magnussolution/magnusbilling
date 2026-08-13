#!/usr/bin/env bash
# =====================================================================
# Entrypoint MagnusBilling (container único)
# - renderiza configs base do Asterisk a partir das envs
# - escreve res_config_mysql.conf (DB do Asterisk realtime E do painel Yii)
# - espera o banco, importa o schema na primeira vez
# - instala o crontab do MagnusBilling
# =====================================================================
set -euo pipefail

: "${DB_HOST:=127.0.0.1}"
: "${DB_PORT:=3306}"
: "${DB_NAME:=mbilling}"
: "${DB_USER:=mbillingUser}"
: "${DB_PASS:?DB_PASS não definido}"
: "${PUBLIC_IP:?PUBLIC_IP não definido}"
: "${RTP_START:=10000}"
: "${RTP_END:=20000}"
: "${AMI_SECRET:=magnussolution}"

ETC=/etc/asterisk
export PUBLIC_IP RTP_START RTP_END AMI_SECRET

echo "[entrypoint] renderizando configs base do Asterisk..."
mkdir -p "$ETC"
for t in asterisk manager pjsip rtp; do
  envsubst < "/opt/asterisk-base/${t}.conf.template" > "${ETC}/${t}.conf"
done

# Arquivos gerados pelo painel — garante que existam p/ o Asterisk subir limpo
for f in extensions_magnus.conf extensions_magnus_did.conf pjsip_magnus.conf \
         pjsip_magnus_user.conf musiconhold_magnus.conf queues_magnus.conf \
         voicemail_magnus.conf mbilling.conf; do
  [ -f "${ETC}/${f}" ] || touch "${ETC}/${f}"
done

# Includes idempotentes nos arquivos principais
ensure_include() { grep -qF "$2" "$1" 2>/dev/null || echo "$2" >> "$1"; }
: > "${ETC}/extensions.conf.d_marker" 2>/dev/null || true
[ -f "${ETC}/extensions.conf" ] || echo "[general]" > "${ETC}/extensions.conf"
ensure_include "${ETC}/extensions.conf"  "#include extensions_magnus.conf"
ensure_include "${ETC}/extensions.conf"  "#include extensions_magnus_did.conf"
[ -f "${ETC}/musiconhold.conf" ] || echo "[default]" > "${ETC}/musiconhold.conf"
ensure_include "${ETC}/musiconhold.conf" "#include musiconhold_magnus.conf"
[ -f "${ETC}/voicemail.conf" ] || echo "[general]" > "${ETC}/voicemail.conf"
ensure_include "${ETC}/voicemail.conf"   "#include voicemail_magnus.conf"
[ -f "${ETC}/queues.conf" ] || echo "[general]" > "${ETC}/queues.conf"
ensure_include "${ETC}/queues.conf"      "#include queues_magnus.conf"

# chan_sip fora (MB8 é PJSIP)
echo -e "[modules]\nnoload => chan_sip.so\nnoload => cdr_manager.so\nnoload => cel_manager.so" \
  > "${ETC}/modules.d_magnus.conf" 2>/dev/null || true

echo "[entrypoint] escrevendo res_config_mysql.conf..."
cat > "${ETC}/res_config_mysql.conf" <<EOF
[general]
dbhost = ${DB_HOST}
dbport = ${DB_PORT}
dbname = ${DB_NAME}
dbuser = ${DB_USER}
dbpass = ${DB_PASS}
EOF
chown root:asterisk "${ETC}/res_config_mysql.conf"
chmod 0640 "${ETC}/res_config_mysql.conf"
chown -R asterisk:asterisk "${ETC}" /var/lib/asterisk /var/log/asterisk /var/run/asterisk /var/spool/asterisk

echo "[entrypoint] aguardando banco ${DB_HOST}:${DB_PORT}..."
for i in $(seq 1 60); do
  if mariadb -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASS}" -e "SELECT 1" "${DB_NAME}" >/dev/null 2>&1; then
    echo "[entrypoint] banco pronto."
    break
  fi
  sleep 3
  [ "$i" = "60" ] && echo "[entrypoint] AVISO: banco não respondeu a tempo; seguindo mesmo assim."
done

# Importa schema apenas se ainda não existir a tabela pkg_user
if ! mariadb -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASS}" \
      -e "SELECT 1 FROM pkg_user LIMIT 1" "${DB_NAME}" >/dev/null 2>&1; then
  echo "[entrypoint] importando schema inicial (script/database.sql)..."
  mariadb -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" \
      < /var/www/html/mbilling/script/database.sql \
    && echo "[entrypoint] schema importado. Login inicial: root / magnus (TROQUE já)." \
    || echo "[entrypoint] ERRO ao importar schema — verifique manualmente."
else
  echo "[entrypoint] schema já presente; pulando import."
fi

# Permissões do painel
chown -R www-data:www-data /var/www/html/mbilling/tmp /var/www/html/mbilling/assets 2>/dev/null || true

# Crontab do MagnusBilling
echo "[entrypoint] instalando crontab..."
cat > /etc/cron.d/mbilling <<'CRON'
* * * * * root php /var/www/html/mbilling/cron.php massivecall
* * * * * root php /var/www/html/mbilling/cron.php callchart
* * * * * root php /var/www/html/mbilling/cron.php statussystem
* * * * * root php /var/www/html/mbilling/cron.php didwww
* * * * * root php /var/www/html/mbilling/cron.php TrunkSIPCodes
*/2 * * * * root php /var/www/html/mbilling/cron.php SummaryTablesCdr
*/3 * * * * root php /var/www/html/mbilling/cron.php PhoneBooksReprocess
*/5 * * * * root php /var/www/html/mbilling/cron.php alarm
1 * * * * root php /var/www/html/mbilling/cron.php NotifyClient
0 2 * * * root php /var/www/html/mbilling/cron.php Backup
1 22 * * * root php /var/www/html/mbilling/cron.php DidCheck
1 23 * * * root php /var/www/html/mbilling/cron.php PlanCheck
8 8 * * * root php /var/www/html/mbilling/cron.php servicescheck
59 23 * * * root php /var/www/html/mbilling/cron.php NotifyClientDaily
CRON
chmod 0644 /etc/cron.d/mbilling

echo "[entrypoint] pronto. Iniciando supervisor..."
exec "$@"
