.. _database-schema:

Banco de Dados - Schema MySQL
==============================

O MagnusBilling utiliza **MySQL/MariaDB** para armazenar toda configuração, usuários, tarifas, chamadas (CDR) e dados operacionais.

Diagrama Entidade-Relacionamento (ER)
--------------------------------------

Estrutura simplificada::

    ┌─────────────────────────────────────────────────────────────────────┐
    │                      TABELAS PRINCIPAIS                             │
    └─────────────────────────────────────────────────────────────────────┘
    
    
    ┌──────────────────────┐         ┌──────────────────────┐
    │     pkg_user         │         │     pkg_company      │
    ├──────────────────────┤         ├──────────────────────┤
    │ id (PK)              │         │ id (PK)              │
    │ username (UNIQUE)    │         │ name                 │
    │ password             │         │ cnpj                 │
    │ email                │         │ address              │
    │ credit               │         │ phone                │
    │ credit_limit         │    1:N  │ limit_credit         │
    │ company_id (FK)      │◄────────│ status               │
    │ status               │         └──────────────────────┘
    │ expirationdate       │
    │ creationdate         │
    └──────────────────────┘
           │         │
           │         └──────────┐
          1:N                   1:N
           │                     │
           │                     ▼
           │              ┌──────────────────────┐
           │              │   pkg_queue          │
           │              ├──────────────────────┤
           │              │ id (PK)              │
           │              │ name                 │
           │              │ user_id (FK)         │
           │              │ extension            │
           │              │ max_agents           │
           │              │ strategy             │
           │              │ timeout              │
           │              └──────────────────────┘
           │
           ├──1:N──┐
           │       ▼
           │  ┌──────────────────────┐
           │  │   pkg_sip            │
           │  ├──────────────────────┤
           │  │ id (PK)              │
           │  │ user_id (FK)         │
           │  │ name (SIP username)  │
           │  │ host                 │
           │  │ port                 │
           │  │ password             │
           │  │ extension            │
           │  │ context              │
           │  │ status               │
           │  │ creationdate         │
           │  └──────────────────────┘
           │
           ├──1:N──┐
           │       ▼
           │  ┌──────────────────────┐
           │  │   pkg_iax            │
           │  ├──────────────────────┤
           │  │ id (PK)              │
           │  │ user_id (FK)         │
           │  │ name                 │
           │  │ host                 │
           │  │ port                 │
           │  │ username             │
           │  │ password             │
           │  │ extension            │
           │  │ context              │
           │  │ status               │
           │  └──────────────────────┘
           │
           └──1:N──┐
                   ▼
              ┌──────────────────────┐
              │   pkg_cdr            │
              ├──────────────────────┤
              │ id (PK)              │
              │ user_id (FK)         │
              │ trunk_id (FK)        │
              │ extension            │
              │ destination          │
              │ duration             │
              │ talk_duration        │
              │ price                │
              │ cost                 │
              │ profit               │
              │ uniqueid             │
              │ calldate             │
              │ disposition          │
              └──────────────────────┘


    ┌──────────────────────────────────────────────────────────────────────┐
    │                    TARIFAS E PREÇOS                                  │
    └──────────────────────────────────────────────────────────────────────┘
    
    
    ┌──────────────────────┐         ┌──────────────────────┐
    │    pkg_rate          │         │   pkg_prefix         │
    ├──────────────────────┤         ├──────────────────────┤
    │ id (PK)              │    1:N  │ id (PK)              │
    │ name                 │────────►│ rate_id (FK)         │
    │ initblock            │         │ prefix               │
    │ billingblock         │         │ destination          │
    │ rateinitial          │         │ country              │
    │ language             │         │ status               │
    │ status               │         └──────────────────────┘
    │ creationdate         │
    └──────────────────────┘
           │
           │ M:N (pkg_user_rate)
           ▼
    ┌──────────────────────┐
    │   pkg_user_rate      │
    ├──────────────────────┤
    │ user_id (FK)         │
    │ rate_id (FK)         │
    │ override_price       │
    │ status               │
    └──────────────────────┘


    ┌──────────────────────────────────────────────────────────────────────┐
    │                  DID (ENTRADA)                                       │
    └──────────────────────────────────────────────────────────────────────┘
    
    
    ┌──────────────────────┐         ┌──────────────────────┐
    │     pkg_did          │         │ pkg_did_destination  │
    ├──────────────────────┤    1:N  ├──────────────────────┤
    │ id (PK)              │────────►│ id (PK)              │
    │ did (telefone)       │         │ did_id (FK)          │
    │ user_id (FK)         │         │ destination_type     │
    │ destination_id       │         │ (sip/queue/ivr)      │
    │ description          │         │ destination_id       │
    │ status               │         │ priority             │
    │ creationdate         │         │ status               │
    └──────────────────────┘         └──────────────────────┘


    ┌──────────────────────────────────────────────────────────────────────┐
    │                    IVR (MENU AUTOMÁTICO)                             │
    └──────────────────────────────────────────────────────────────────────┘
    
    
    ┌──────────────────────┐         ┌──────────────────────┐
    │      pkg_ivr         │         │  pkg_ivr_option      │
    ├──────────────────────┤    1:N  ├──────────────────────┤
    │ id (PK)              │────────►│ id (PK)              │
    │ name                 │         │ ivr_id (FK)          │
    │ description          │         │ option_key           │
    │ recorded_message     │         │ (0-9, #, *)          │
    │ user_id (FK)         │         │ destination_type     │
    │ status               │         │ destination_id       │
    │ creationdate         │         │ timeout              │
    └──────────────────────┘         │ invalid_attempts     │
                                     └──────────────────────┘


    ┌──────────────────────────────────────────────────────────────────────┐
    │             TRONCOS E CONECTIVIDADE                                  │
    └──────────────────────────────────────────────────────────────────────┘
    
    
    ┌──────────────────────┐         ┌──────────────────────┐
    │   pkg_trunk          │         │  pkg_trunk_group     │
    ├──────────────────────┤    1:N  ├──────────────────────┤
    │ id (PK)              │────────►│ id (PK)              │
    │ name                 │         │ user_id (FK)         │
    │ user_id (FK)         │         │ trunk_id (FK)        │
    │ context              │         │ priority             │
    │ host                 │         │ status               │
    │ port                 │         └──────────────────────┘
    │ type (sip/iax)       │
    │ protocol             │
    │ username             │
    │ password             │
    │ status               │
    │ creationdate         │
    └──────────────────────┘


Descrição Detalhada das Tabelas Principais
------------------------------------------

pkg_user - Usuários do Sistema
------------------------------

Tabela principal que armazena todos os usuários (administradores, revendedores, clientes)::

    - id: Identificador único
    - username: Login único (ex: root, joao_silva)
    - password: Hash SHA1 da senha
    - credit: Crédito disponível (saldo)
    - credit_limit: Limite de crédito
    - company_id: Empresa vinculada
    - user_type: admin, reseller, ou client
    - status: active, inactive, ou blocked
    - expirationdate: Data de expiração


pkg_sip - Extensões SIP
-----------------------

Extensões SIP registradas para chamadas::

    - user_id: Usuário proprietário
    - name: Username SIP (deve ser único)
    - password: Senha de registro SIP
    - host: IP do cliente
    - port: Porta SIP (padrão 5060)
    - extension: Número do ramal (ex: 200, 201)
    - context: Contexto do dialplan (ex: from-internal)
    - status: active ou inactive


pkg_cdr - Call Detail Records
-----------------------------

Histórico de todas as chamadas realizadas::

    - user_id: Usuário que fez a chamada
    - trunk_id: Tronco usado na chamada
    - source: Quem ligou (CLI)
    - destination: Número para quem ligou
    - duration: Duração total em segundos
    - talk_duration: Duração efetiva de conversa
    - price: Valor cobrado do cliente
    - cost: Valor pago ao carrier
    - profit: Lucro (price - cost)
    - calldate: Data/hora da chamada
    - disposition: ANSWERED, NO ANSWER, FAILED


pkg_rate - Tarifas/Planos
-------------------------

Define preços para diferentes destinos::

    - name: Nome da tarifa (ex: "Brasil Nacional")
    - initblock: Bloco mínimo em segundos
    - billingblock: Incremento em segundos
    - rateinitial: Preço por minuto


pkg_prefix - Prefixos de Destino
--------------------------------

Mapeia prefixos de telefone para tarifas::

    - prefix: Primeiros dígitos (ex: 5511 = São Paulo)
    - destination: Descrição (ex: "São Paulo, Brasil")
    - rate_id: Qual tarifa usar


pkg_did - Números de Entrada
----------------------------

DIDs (números inbound) configurados no sistema::

    - did: Número telefônico completo
    - user_id: Usuário proprietário
    - destination_type: sip, queue, ivr, callback
    - destination_id: ID do destino


pkg_queue - Filas de Espera
---------------------------

Filas para atendimento de clientes::

    - name: Nome da fila
    - extension: Ramal para acessar fila
    - strategy: leastrecent, rrmemory, round_robin
    - max_agents: Número de agentes


pkg_trunk - Troncos/Carriers
----------------------------

Provedores VoIP por onde passam as chamadas::

    - name: Nome do tronco (ex: "Vivo SIP")
    - type: sip ou iax
    - host: Servidor SIP/IAX
    - username: Autenticação no carrier


Queries Úteis
-------------

Consultar Saldo de Usuário
~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    SELECT username, credit, credit_limit 
    FROM pkg_user 
    WHERE id = 1;


Total de Chamadas por Usuário (últimos 30 dias)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    SELECT 
        user_id,
        COUNT(*) as quantidade,
        SUM(duration) as tempo_total,
        SUM(price) as total_gasto
    FROM pkg_cdr
    WHERE calldate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY user_id
    ORDER BY total_gasto DESC;


Lucro por Tronco
~~~~~~~~~~~~~~~~

::

    SELECT 
        trunk_id,
        SUM(price) as receita,
        SUM(cost) as despesa,
        SUM(price) - SUM(cost) as lucro,
        COUNT(*) as chamadas
    FROM pkg_cdr
    WHERE calldate >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    GROUP BY trunk_id
    ORDER BY lucro DESC;


Chamadas Falhadas
~~~~~~~~~~~~~~~~~

::

    SELECT 
        id, source, destination, duration, disposition
    FROM pkg_cdr
    WHERE disposition IN ('NO ANSWER', 'FAILED')
    AND calldate >= NOW() - INTERVAL 7 DAY
    ORDER BY calldate DESC;


Índices para Performance
------------------------

Índices críticos recomendados::

    pkg_cdr:
    - INDEX (user_id, calldate)
    - INDEX (destination, calldate)
    - INDEX (trunk_id, calldate)
    
    pkg_user:
    - INDEX (username)
    - INDEX (email)
    
    pkg_sip:
    - INDEX (user_id, extension)
    
    pkg_did:
    - INDEX (did)
    - INDEX (user_id)


Backup
------

Backup manual::

    mysqldump -u root -p magnusbilling > backup.sql
    
    # Ou comprimido
    mysqldump -u root -p magnusbilling | gzip > backup_$(date +%Y%m%d).sql.gz


Restaurar de Backup
~~~~~~~~~~~~~~~~~~~

::

    # Restaurar banco inteiro
    mysql -u root -p magnusbilling < backup.sql
    
    # Ou de arquivo comprimido
    gunzip -c backup_20260226.sql.gz | mysql -u root -p magnusbilling


Manutenção
----------

Otimizar Tabelas
~~~~~~~~~~~~~~~~

::

    mysql -u root -p magnusbilling
    OPTIMIZE TABLE pkg_cdr;
    OPTIMIZE TABLE pkg_user;
    
    # Ou todas as tabelas
    OPTIMIZE TABLE event_db;


Limpar CDRs Antigos
~~~~~~~~~~~~~~~~~~~

::

    # Deletar CDRs com mais de 2 anos
    DELETE FROM pkg_cdr 
    WHERE calldate < DATE_SUB(NOW(), INTERVAL 2 YEAR);
    
    # Depois otimizar
    OPTIMIZE TABLE pkg_cdr;


Verificar Tamanho das Tabelas
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    SELECT 
        table_name,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS SIZE_MB
    FROM information_schema.tables
    WHERE table_schema = 'magnusbilling'
    ORDER BY (data_length + index_length) DESC;
