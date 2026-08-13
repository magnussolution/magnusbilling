# =====================================================================
# MagnusBilling 8 — imagem única (Apache + PHP + Asterisk 20 + cron)
# Derivada fielmente do script/install.sh do próprio fork.
# Compila Asterisk 20.9.2 com res_config_mysql (realtime) a partir do
# tarball que já vem no repo (script/asterisk-20.9.2.tar.gz).
#
# NOTA DE CONFIANÇA: a compilação do Asterisk pode exigir 1–2 iterações de
# ajuste de módulos (menuselect) no primeiro build. Valide no nó MB.
# =====================================================================
FROM debian:12-slim

ENV DEBIAN_FRONTEND=noninteractive

# ---- Pacotes de runtime + build (espelha install.sh) ----
RUN apt-get update && apt-get install -y --no-install-recommends \
      apache2 libapache2-mod-php \
      php php-cli php-dev php-common php-gd php-pear php-sqlite3 php-curl \
      php-mbstring php-xml php-mysql \
      mariadb-client \
      autoconf automake build-essential gawk g++ curl wget ca-certificates \
      git unzip uuid-dev libxml2-dev libncurses-dev libjansson-dev \
      libsqlite3-dev sqlite3 libssl-dev libcurl4-openssl-dev \
      subversion mpg123 xmlstarlet patchelf gettext-base \
      unixodbc unixodbc-dev odbcinst \
      supervisor cron procps net-tools sngrep \
    && rm -rf /var/lib/apt/lists/*

# ---- Usuário asterisk + diretórios ----
RUN useradd -r -d /var/lib/asterisk -s /usr/sbin/nologin -c 'Asterisk PBX' asterisk \
    && mkdir -p /var/run/asterisk /var/log/asterisk /var/spool/asterisk/monitor \
    && mkdir -p /var/lib/asterisk/agi-bin

# ---- Compila Asterisk 20 a partir do tarball do repo ----
COPY script/asterisk-20.9.2.tar.gz /usr/src/asterisk.tar.gz
RUN cd /usr/src && tar xzf asterisk.tar.gz && rm asterisk.tar.gz \
    && cd asterisk-20.9.2 \
    && contrib/scripts/install_prereq install \
    && ./configure --with-jansson-bundled --with-pjproject-bundled \
    && make menuselect.makeopts \
    && menuselect/menuselect \
         --enable res_config_mysql \
         --enable res_odbc \
         --enable cdr_adaptive_odbc \
         --enable format_mp3 \
         --enable app_macro \
         menuselect.makeopts \
    && make -j"$(nproc)" \
    && make install \
    && make samples \
    && ldconfig \
    && cd /usr/src && rm -rf asterisk-20.9.2

# ---- Código do MagnusBilling (o SEU fork) ----
COPY . /var/www/html/mbilling
RUN rm -f /var/www/html/index.html \
    && printf "<?php header('Location: ./mbilling'); ?>\n" > /var/www/html/index.php \
    && mkdir -p /var/www/html/mbilling/tmp /var/www/html/mbilling/assets \
    && chown -R www-data:www-data /var/www/html \
    && chmod +x /var/www/html/mbilling/resources/asterisk/mbilling.php

# ---- Apache (docroot + módulos) ----
RUN a2enmod php* rewrite 2>/dev/null; a2enmod rewrite \
    && sed -ri 's/^Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
    && sed -ri 's/:80>/:8080>/' /etc/apache2/sites-available/000-default.conf \
    && sed -ri 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html#' /etc/apache2/sites-available/000-default.conf

# ---- Sons (br/en/es) ----
RUN cp -rf /var/www/html/mbilling/resources/sounds/br /var/lib/asterisk/sounds 2>/dev/null || true \
    && cp -rf /var/www/html/mbilling/resources/sounds/en/* /var/lib/asterisk/sounds 2>/dev/null || true \
    && chown -R asterisk:asterisk /var/lib/asterisk /var/log/asterisk /var/run/asterisk /var/spool/asterisk

# ---- Configs base do Asterisk + supervisor + entrypoint ----
COPY docker/asterisk/ /opt/asterisk-base/
COPY docker/supervisord.conf /etc/supervisor/conf.d/mbilling.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Portas expostas (informativo; em rede host valem as do nó)
EXPOSE 8080/tcp 5060/udp 5060/tcp 10000-20000/udp

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
