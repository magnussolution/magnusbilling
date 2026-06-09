.. _admin-guide:

Guia de Administração - MagnusBilling
======================================

Este guia descreve como administrar o MagnusBilling para gerenciadores e revendedores.

Acesso Administrativo
=====================

Fazer Login
-----------

1. Abra o navegador e acesse: `http://seu_servidor/`
2. Digite seu **username** e **password**
3. Selecione o **company** (empresa) se revendedor
4. Clique em **Login**

::

    URL: http://seu_servidor/
    Username: root (padrão)
    Password: magnus (padrão) - MUDAR NA PRODUÇÃO
    
    ⚠️  IMPORTANTE: Mudar senha padrão imediatamente após instalação


Reset de Senha de Root
----------------------

Se esqueceu a senha de root, acesse o servidor via SSH e execute:

::

    # 1. Conectar ao MySQL
    mysql -u root -p magnusbilling
    
    # Se não souber a senha do MySQL, está em:
    cat /root/passwordMysql.log
    
    # 2. Executar comando para resetar senha de root do MagnusBilling
    UPDATE pkg_user SET password = SHA1("magnus") WHERE username = "root";
    
    # 3. Saio do mysql
    exit
    
    # Agora você pode fazer login com:
    # Username: root
    # Password: magnus


Gerenciamento de Usuários
==========================

Criar Novo Usuário
-------------------

1. Menu: **Admin** → **Clientes** (ou Users)
2. Clique em **Novo Usuário**
3. Preencha os campos:

+-----------------------+-------------------------------------------------------+
| Campo                 | Descrição                                             |
+=======================+=======================================================+
| Username              | Login de acesso (ex: joao_silva)                      |
+-----------------------+-------------------------------------------------------+
| Password              | Senha de acesso (mínimo 6 caracteres)                 |
+-----------------------+-------------------------------------------------------+
| Email                 | Email para notificações                               |
+-----------------------+-------------------------------------------------------+
| Firstname             | Primeiro nome                                         |
+-----------------------+-------------------------------------------------------+
| Lastname              | Sobrenome                                             |
+-----------------------+-------------------------------------------------------+
| Phone                 | Telefone de contato                                   |
+-----------------------+-------------------------------------------------------+
| Address               | Endereço completo                                     |
+-----------------------+-------------------------------------------------------+
| User Type             | admin, reseller, client (padrão: client)              |
+-----------------------+-------------------------------------------------------+
| Status                | active, inactive, blocked                             |
+-----------------------+-------------------------------------------------------+
| Credit                | Saldo inicial (ex: 100.00)                            |
+-----------------------+-------------------------------------------------------+
| Credit Limit          | Limite de saque (ex: 50.00)                           |
+-----------------------+-------------------------------------------------------+
| Expiration Date       | Data em que a conta expira                            |
+-----------------------+-------------------------------------------------------+
| Company               | Empresa vinculada (para revendedor)                   |
+-----------------------+-------------------------------------------------------+

4. Clique em **Salvar**


Exemplo de Criação::

    Nome: João Silva
    Username: joao_silva
    Password: senha123
    Email: joao@example.com
    User Type: client
    Status: active
    Credit: 100.00
    Company: MagnusSolutions (se revendedor)
    Expiration Date: 2026-12-31


Editar Usuário
---------------

1. Menu: **Admin** → **Clientes**
2. Procure o usuário na lista
3. Clique no ícone **Editar** (lápis)
4. Modifique os dados
5. Clique em **Salvar**

Ações comuns de edição::

    - Aumentar/diminuir crédito
    - Desativar conta (Status: inactive)
    - Bloquear abuso (Status: blocked)
    - Estender expiração
    - Alterar company (para revendedor)


Deletar Usuário
----------------

1. Menu: **Admin** → **Clientes**
2. Selecione o usuário
3. Clique em **Deletar**
4. Confirme a ação

⚠️ **CUIDADO**: Deletar usuário remove também:
   - Todas as extensões SIP/IAX
   - Todos os DIDs
   - Todas as chamadas (CDR)


Gerenciamento de Extensões
===========================

SIP (Softphone/Telefone IP)
---------------------------

Criar Extensão SIP
~~~~~~~~~~~~~~~~~~~

1. Menu: **Admin** → **Clientes** → [Selecione usuário] → **SIP**
2. Clique em **Nova SIP**
3. Configure:

   **SIP Name** (obrigatório)
       Nome da extensão (ex: 200, joao_sip, office_phone)
   
   **Password** (obrigatório)
       Senha para registrar no asterisk (ex: sip200pass)
   
   **Host** (opcional)
       IP fixo do telefone (deixar vazio se IP dinâmico)
   
   **Port**
       5060 (padrão) ou outra porta
   
   **Extension** (obrigatório)
       Número da ramal interno (ex: 200, 201)
   
   **Context**
       from-internal (padrão) ou customizado
   
   **Allow Transfer**
       Permitir transferência de chamadas (sim/não)
   
   **Record Calls**
       Gravar chamadas desta extensão (sim/não)
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo::

    SIP Name: joao_silva_200
    Password: abc123def456
    Extension: 200
    Context: from-internal
    Status: active


Registrar Telefone SIP
~~~~~~~~~~~~~~~~~~~~~~~

Em um telefone IP ou softphone (Grandstream, Yealink, X-Lite, etc):

::

    Server Address: IP_DO_MAGNUSBILLING ou DNS
    SIP Port: 5060
    
    User/Username: joao_silva_200 (SIP Name)
    Password: abc123def456
    Extension: 200
    Domain/Realm: IP_DO_MAGNUSBILLING


IAX (Inter-Asterisk eXchange)
-----------------------------

Criar Extensão IAX
~~~~~~~~~~~~~~~~~~~

1. Menu: **Admin** → **Clientes** → [Selecione usuário] → **IAX**
2. Clique em **Nova IAX**
3. Configure:

   **Name**
       Nome da extensão (ex: iacx2001)
   
   **Username**
       Nome para autenticação
   
   **Password**
       Senha para registrar
   
   **Host**
       IP do cliente (opcional)
   
   **Port**
       4569 (padrão)
   
   **Extension**
       Número do ramal (ex: 201)
   
   **Context**
       from-internal (padrão)

4. Clique em **Salvar**


Gerenciamento de DIDs
=====================

Criar DID (Número de Entrada)
------------------------------

1. Menu: **Admin** → **Clientes** → [Selecione usuário] → **DID**
2. Clique em **Novo DID**
3. Configure:

   **DID Number**
       Número de telefone completo (ex: 1155551234)
   
   **Description**
       Descrição (ex: "Linha principal São Paulo")
   
   **Country**
       País (ex: Brasil)
   
   **City**
       Cidade (ex: São Paulo)
   
   **Price Purchase**
       Custo mensal de compra do DID
   
   **Price Sale**
       Preço mensal de venda ao cliente
   
   **Destination Type**
       Aonde encaminhar chamadas recebidas:
       - SIP: para extensão
       - Queue: para fila de espera
       - IVR: para menu automático
       - Callback: para callback

   **Destination ID**
       ID do destino (SIP extension, queue ID, etc)

   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo::

    DID Number: 1155551234
    Description: Suporte Técnico
    Country: Brasil
    City: São Paulo
    Price Purchase: 50.00
    Price Sale: 99.90
    Destination Type: Queue
    Destination ID: 1 (Queue "Suporte")
    Status: active


Múltiplos Destinos (Fallback)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Adicionar prioridade/fallback de destinos:

1. No DID, clique em **Destinos**
2. Adicione destinos em ordem de prioridade:

   ::

       Prioridade 1: Queue "Suporte" (timeout 30s)
           → Se falhar (ninguém atende)
       
       Prioridade 2: SIP 300 (timeout 20s)
           → Se falhar
       
       Prioridade 3: Voicemail


Gerenciamento de Tarifas
=========================

Criar Plano de Preços (Rate)
-----------------------------

1. Menu: **Admin** → **Tarifas** → **Preços/Rates**
2. Clique em **Nova Tarifa**
3. Configure:

   **Name**
       Nome da tarifa (ex: "Tarifa Brasil", "Tarifa Internacional")
   
   **Description**
       Descrição detalhada (ex: "Chamadas nacionais com preço reduzido")
   
   **Initblock**
       Bloco inicial em segundos (padrão: 60)
       - Quanto antes cobrar
       - Exemplo: initblock=30 → mínimo 30 segundos
   
   **Billingblock**
       Incremento em segundos (padrão: 6)
       - Arredondar cobranças em múltiplos
       - Exemplo: billingblock=6 → cobra 6, 12, 18, 24s
   
   **Rate Initial**
       Preço em R$ por minuto (ex: 0.05)
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo - Tarifa Brasil::

    Name: Brasil Nacional
    Initblock: 30 segundos
    Billingblock: 6 segundos
    Rate Initial: 0.05 R$/minuto
    Status: active


Adicionar Prefixos à Tarifa
~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Clique na tarifa criada
2. Menu: **Prefixos** (ou **Rates Details**)
3. Clique em **Novo Prefixo**

   **Prefix**
       Primeiros dígitos a combinar (ex: 5511 = São Paulo)
   
   **Destination**
       Descrição (ex: "São Paulo, Brasil")
   
   **Country**
       País (ex: Brasil)
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo de Prefixos para "Brasil Nacional"::

    5511 -> São Paulo, Brasil
    5521 -> Rio de Janeiro, Brasil
    5531 -> Minas Gerais, Brasil
    5541 -> Paraná, Brasil
    5548 -> Santa Catarina, Brasil
    55 -> Outras cidades  (fallback)


Atribuir Tarifa a Usuário
-------------------------

1. Menu: **Admin** → **Clientes** → [Selecione usuário]
2. Aba: **Tarifas**
3. Clique em **Adicionar Tarifa**
4. Selecione a tarifa (ex: "Brasil Nacional")
5. Opcionalmente, sobrescreva o preço:

   **Override Price** (opcional)
       Preço customizado (ex: 0.03 ao invés de 0.05)
       Deixar vazio = usar preço da tarifa

6. Clique em **Salvar**


Atribuir Tarifa de Agente
~~~~~~~~~~~~~~~~~~~~~~~~~

Se o usuário é um agente, pode ter tarifa especial:

1. Menu: **Admin** → **Clientes** → [Selecione usuário]
2. Aba: **Agent**
3. Configure:

   **Agent Group**
       Grupo do agente (ex: "Sales", "Support")
   
   **Agent Rate**
       Tarifa especial para este agente
   
   **Percentage**
       Porcentagem de comissão (ex: 20%)

4. Clique em **Salvar**


Gerenciamento de Troncos
========================

Tronco é um carrier/provedor de VoIP por onde saem chamadas.

Criar Novo Tronco
-----------------

1. Menu: **Admin** → **Troncos**
2. Clique em **Novo Tronco**
3. Configure:

   **Name**
       Nome do tronco (ex: "Vivo SIP", "Oi SIP", "Skype")
   
   **Type**
       sip ou iax (geralmente SIP)
   
   **SIP Server**
       Endereço do servidor (ex: sip.vivo.com.br)
   
   **SIP Port**
       5060 (padrão) ou outra porta
   
   **SIP Username**
       Usuário de autenticação (ex: account123)
   
   **SIP Password**
       Senha de autenticação
   
   **SIP Auth User**
       Usuário de autenticação (pode ser diferente de Username)
   
   **Dial Prefix**
       Prefixo a adicionar antes do número (ex: 55)
   
   **Lead Zero**
       Remover ou adicionar 0 anterior (true/false)
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo - Tronco Vivo::

    Name: Vivo SIP
    Type: sip
    SIP Server: sip.vivo.com.br
    SIP Port: 5060
    SIP Username: 0xx_xxxx_xxxx
    SIP Password: senha_vivo
    Dial Prefix: 55
    Lead Zero: true
    Status: active


Atribuir Tronco a Usuário
-------------------------

1. Menu: **Admin** → **Clientes** → [Selecione usuário]
2. Aba: **Troncos**
3. Clique em **Adicionar Tronco**
4. Selecione o tronco (ex: "Vivo SIP")
5. Configure:

   **Priority**
       1, 2, 3... (ordem de tentativa)
   
   **Status**
       active ou inactive

6. Clique em **Salvar**


Gerenciamento de Filas
======================

Criar Fila de Espera
--------------------

1. Menu: **Admin** → **Filas**
2. Clique em **Nova Fila**
3. Configure:

   **Name**
       Nome da fila (ex: "Suporte Técnico", "Vendas")
   
   **Extension**
       Ramal para alcançar a fila (ex: 100)
   
   **Description**
       Descrição (ex: "Fila de suporte 24h")
   
   **Owner**
       Usuário dono da fila
   
   **Max Agents**
       Número máximo de agentes (ex: 10)
   
   **Strategy**
       Algoritmo de distribuição:
       - **leastrecent**: Quem não atendeu há mais tempo
       - **rrmemory**: Round-robin com memória
       - **round_robin**: Alternando
   
   **Timeout**
       Segundos antes de ir para fallback (ex: 30)
   
   **Retry**
       Tentativas antes de desistir (ex: 5)
   
   **Record Calls**
       Gravar chamadas (sim/não)
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo - Fila Suporte::

    Name: Suporte Técnico
    Extension: 100
    Description: Fila unificada de suporte 24h
    Max Agents: 5
    Strategy: leastrecent
    Timeout: 30 segundos
    Retry: 5
    Record Calls: true
    Status: active


Adicionar Agentes à Fila
------------------------

1. Clique na fila criada
2. Aba: **Membros** ou **Agentes**
3. Clique em **Adicionar Agente**
4. Configure:

   **Extension/SIP**
       Qual extensão do agente (ex: 201, 202, 203)
   
   **Penalty**
       Penalidade para priorizar filas (0 = sem penalidade)
   
   **Status**
       active ou inactive

5. Clique em **Salvar**

Exemplo::

    Agentes para "Suporte Técnico":
      ├─ SIP 201 (João) - penalty 0
      ├─ SIP 202 (Maria) - penalty 0
      ├─ SIP 203 (Pedro) - penalty 0
      ├─ SIP 204 (Ana) - penalty 5 (backup)
      └─ SIP 205 (Carlos) - penalty 10 (supervisão)


Gerenciamento de IVR
====================

Criar Menu IVR (Mensagem Automática)
------------------------------------

1. Menu: **Admin** → **IVR**
2. Clique em **Novo IVR**
3. Configure:

   **Name**
       Nome do menu (ex: "IVR Principal", "Menu Suporte")
   
   **Description**
       Descrição (ex: "Menu de boas-vindas")
   
   **Owner**
       Usuário dono do IVR
   
   **Greeting Message**
       Arquivo de áudio (WAV) para reproduzir
       Exemplo: "Bem-vindo a São Paulo Turismo. Pressione 1 para..."
   
   **Timeout**
       Segundos antes de desistir se sem resposta (ex: 3)
   
   **Invalid Attempts**
       Quantas tentativas antes de encaminhar (ex: 3)
   
   **Retry Message**
       Mensagem se opção inválida (ex: "Opção inválida, tente novamente")
   
   **Status**
       active ou inactive

4. Clique em **Salvar**

Exemplo::

    Name: IVR Suporte
    Description: Menu de categorias de suporte
    Timeout: 3 segundos
    Invalid Attempts: 3
    Status: active


Adicionar Opções do IVR
-----------------------

1. Clique no IVR criado
2. Aba: **Opções**
3. Clique em **Nova Opção**
4. Configure:

   **Option Key**
      Número que usuário pressiona (0-9, #, ``*``)
   
   **Destination Type**
       Aonde encaminhar:
       - sip (extensão)
       - queue (fila)
       - ivr (outro menu)
       - callback (callback automático)
   
   **Destination ID**
       ID do destino
   
   **Timeout**
       Segundos para esta opção (ex: 10)

5. Clique em **Salvar**

Exemplo - Menu Suporte::

    IVR: "Bem-vindo. Escolha seu problema"
    
    Opção 1: Problemas técnicos        → Queue 1 (Suporte Técnico)
    Opção 2: Faturamento              → Queue 2 (Faturamento)
    Opção 3: Reclamações              → Queue 3 (Ombudsman)
    Opção 4: Solicitar callback        → Callback automático
    Opção 0: Atendente humano         → SIP 100 (Recepção)


Gravação de Mensagens IVR
~~~~~~~~~~~~~~~~~~~~~~~~~

Para gravar mensagens de áudio::

    1. Gravar em WAV 8kHz mono (arquivo pequeno)
    2. Salvar em: /var/asterisk/sounds/custom/
    3. Referenciar no IVR: custom/hello
    
    Exemplo com asterisk:
    asterisk -rx "audio record custom/my_message"


Relatórios
==========

Ver Histórico de Chamadas (CDR)
-------------------------------

1. Menu: **Admin** → **CDR** ou **Relatórios** → **Chamadas**
2. Filtros disponíveis:

   **Período**
       Data inicial e final
   
   **Usuário**
       Selecionar usuário específico
   
   **Destino**
       Filtrar por prefixo ou número
   
   **Duração**
       Chamadas com mínimo X segundos
   
   **Status**
       ANSWERED, NO ANSWER, FAILED, etc

3. Clique em **Pesquisar**
4. Resultados mostram:

   - **Caller**: quem ligou
   - **Destination**: para quem ligou
   - **Duration**: tempo total
   - **Talk Duration**: tempo de conversa
   - **Price**: quanto foi cobrado
   - **Cost**: quanto foi pago ao carrier

Exportar CDR
~~~~~~~~~~~~

1. Na tela de CDR, clique em **Exportar**
2. Selecione formato:

   - CSV (Excel/LibreOffice)
   - PDF
   - XLS

3. Clique em **Exportar**


Relatório de Faturamento
------------------------

1. Menu: **Admin** → **Relatórios** → **Faturamento**
2. Selecione período
3. Visualizar:

   - Total de chamadas por usuário
   - Receita total
   - Despesa com carriers
   - Lucro
   - Chamadas por dia/hora/prefixo


Relatório de SLA (Qualidade)
----------------------------

1. Menu: **Admin** → **Relatórios** → **SLA**
2. Métricas:

   - Taxa de sucesso (ANSWERED / total)
   - Tempo médio de resposta
   - Chamadas não respondidas
   - Falhas de conexão


Manutenção do Sistema
=====================

Backup
------

Fazer backup regular::

    # Backup automático diário
    # Agendado em cron job
    
    0 2 * * * mysqldump -u root -p magnusbilling | gzip > /backup/magnusbilling_$(date +\%Y\%m\%d).sql.gz
    
    # Manter últimos 30 dias
    find /backup -name "magnusbilling_*.sql.gz" -mtime +30 -delete


Logs do Sistema
---------------

1. Acessar via terminal::

    # Logs do Asterisk
    tail -f /var/log/asterisk/full
    
    # Logs do MagnusBilling (Yii)
    tail -f /var/www/magnusbilling/protected/runtime/application.log
    
    # Logs nginx
    tail -f /var/log/nginx/error.log


Monitoramento de Disco
----------------------

Verificar espaço::

    df -h
    
    # Se espaço baixo, limpar CDRs antigos:
    # Menu: Admin → Maintenance → Clean Old CDRs


Resetar Senha de Usuário (como admin)
-------------------------------------

Se você é admin e quer resetar a senha de outro usuário:

1. Menu: **Admin** → **Clientes** → [Selecione usuário]
2. Clique em **Resetar Senha**
3. Sistema gera password temporária
4. Enviar para usuário fazer login e mudar

Ou via MySQL direto::

    # Conectar ao MySQL
    mysql -u root -p magnusbilling
    
    # Resetar senha de qualquer usuário
    UPDATE pkg_user SET password = SHA1('nova_senha') WHERE username = 'joao_silva';
    
    # Confirmar
    exit


Limpeza de Cache
----------------

Se sistema lento ou dados desatualizados::

    # Via aplicação
    Menu: Admin → Maintenance → Clear Cache
    
    # Via terminal (Linux)
    rm -rf /var/www/magnusbilling/protected/runtime/cache/*


Sincronizacao com Asterisk
---------------------------

Se extensões SIP/IAX não estão acessíveis::

    # Recarregar configurações do Asterisk
    asterisk -rx "sip reload"
    asterisk -rx "iax2 reload"
    asterisk -rx "queue reload"


Troubleshooting
===============

Problema: Extensão SIP não registra
-----------------------------------

Solução::

    # 1. Verificar se SIP está ativo
    asterisk -rx "sip show peer nomedaextensao"
    
    # 2. Verificar status na web (Admin → Clientes → SIP → Status)
    
    # 3. Verificar firewall
    - Porta 5060/UDP aberta?
    - Porta 5060-5099/UDP aberta? (RTP)
    
    # 4. Verificar senha
    - Username e password correspondem?
    
    # 5. Recarregar SIP
    asterisk -rx "sip reload"


Problema: DIDs não recebem chamadas
-----------------------------------

Solução::

    # 1. Verificar se DID está ativo
    Menu: Admin → Clientes → DID → Status = active?
    
    # 2. Verificar destino
    DID aponta para SIP/Queue/IVR correto?
    
    # 3. Verificar tronco de entrada
    Qual tronco recebe chamadas? Está ativo?
    
    # 4. Teste prático
    Ligar para o DID e ver logs:
    tail -f /var/log/asterisk/full


Problema: Chamadas muito caras
------------------------------

Solução::

    # 1. Verificar tarifa do usuário
    Menu: Admin → Clientes → Tarifas
    qual tarifa está ativa?
    
    # 2. Verificar configuração de bloco
    initblock muito baixo?
    billingblock de 1 segundo?
    
    # 3. Verificar sobrescrita de preços
    Tem override_price customizado?
    
    # 4. Verificar tronco caro
    Qual tronco está sendo usado?
    Menu: Admin → Troncos → verificar configuração


Problema: Relatório lento
-------------------------

Solução::

    # 1. Filtrar período menor
    
    # 2. Adicionar índices ao banco
    # Ver seção "Database Schema"
    
    # 3. Arquivar CDRs antigos
    Menu: Admin → Maintenance → Archive Old CDRs
    
    # 4. Reiniciar bases dados
    mysql> OPTIMIZE TABLE pkg_cdr;


Boas Práticas
=============

1. **Segurança**
   - Mudar senha de root imediatamente (padrão: root/magnus)
   - Usar firewall restritivo
   - HTTPS ao invés de HTTP
   - Regular backups off-site

2. **Performance**
   - Arquivar CDRs > 1 ano
   - Limpar logs regularmente
   - Monitorar uso de disco
   - Usar paginação em relatórios

3. **Organização**
   - Nomear extensões com padrão consistente
   - Documentar estrutura de DIDs
   - Manter lista de agentes atualizada
   - Revisar tarifas periodicamente

4. **Monitoramento**
   - Verificar logs diariamente
   - Monitorar TPS (chamadas/segundo)
   - Alertas para falhas críticas
   - Manter estatísticas de uptime

5. **Backup**
   - Backup completo semanal
   - Backup incremental diário
   - Testar restore regularmente
   - Guardar backups fora do servidor
