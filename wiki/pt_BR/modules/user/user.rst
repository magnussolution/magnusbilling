
.. _user-username:

Usuário
--------

| Usuário para logar no painel de cliente.




.. _user-password:

Senha
-----

| Senha para logar no painel de cliente.




.. _user-id-group:

Grupo
-----

| Existe 3 tipos de grupos: Administrador, Revendedor e Cliente. Você pode criar ou editar qualquer destes grupos. Cada grupo tem suas permissōes específicas. Veja o menu Configurações, Grupo para Clientes.




.. _user-id-group-agent:

Grupo para os usuários do agente
---------------------------------

| Selecione o grupo que os clientes deste revendedor usaram.




.. _user-id-plan:

Plano
-----

| Plano usado para tarifar este cliente.




.. _user-language:

Idioma
------

| Idioma. Esta idioma é usado para algumas funçōes do sistema, mas não para o idioma do painel.




.. _user-prefix-local:

Regra prefixo
-------------

| Esta regra permite o cliente discar no formato local. 
| EX 0 DDD ou somente o número dentro de seu DDD. As regras são separadas por vírgula e composta por 2 ou 3 parâmetros separados por /.
| 1º é o número que será substituído. Pode ser * para pegar qualquer dígito.
| 2º é o número que vai substituir o 1º.
| 3º é a quantidade de dígitos do número. Se nao colocar o 3º parâmetro, não será verificado a quantidade de dígitos.
| 
| Alguns exemplos.
| 
| Permite ligar 55DDDnº, 0DDDnº ou somente o número
| 
| 0/55,*/5511/8,*/5511/9
| Regra 1 -> números que iniciam com 0, o zero será substituído por 55, independente de quantos dígitos tiver o número. 
| Regra 2 -> números que iniciam com qualquer valor e tem 8 dígitos, será adicionado 5511 na frente. 
| Regra 3 -> números que iniciam com qualquer valor e tem 9 dígitos, será adicionado 5511 na frente
| 
| 
| Permite ligar 55DDDnº, 0DDDnº, DDDnº ou somente o número
| 
| 0/55,*/5511/8,*/5511/9,*/55/10,*/55/11
| Regra 1 -> números que iniciam com 0, o zero será substituído por 55, independente de quantos dígitos tiver o número. 
| Regra 2 -> números que iniciam com qualquer valor e tem 8 dígitos, será adicionado 55 na frente. 
| Regra 3 -> números que iniciam com qualquer valor e tem 9 dígitos, será adicionado 55 na frente
| Regra 4 -> números que iniciam com qualquer valor e tem 10 dígitos, será adicionado 5511 na frente. 
| Regra 5 -> números que iniciam com qualquer valor e tem 11 dígitos, será adicionado 5511 na frente
| .




.. _user-active:

Ativo
-----

| Somente usuários ativos podem fazer chamadas.




.. _user-country:

País
-----

| Usado para CID Callback. O DDI do país será adicionado antes do CallerID to converter o CallerID para o formato DDI DDD nº.




.. _user-id-offer:

Ativar pacote grátis
---------------------

| Usado para ativar um pacote grátis. É necessário informar as tarifas que vão pertencer aos pacotes gratís.




.. _user-cpslimit:

Limite de CPS
-------------

| Limite de CPS(chamadas por segundo) para este cliente. As chamadas que superar este limite será enviado CONGESTION.




.. _user-description:

Descrição
-----------

| Nós ainda não escrevemos a descrição deste campo.




.. _user-company-website:

Site da empresa
---------------

| Site da empresa|Tambem usado para customizar o painel de login para um revendedor. Neste caso, o dominio ou subdominio deve ser colocado sem http ou www




.. _user-company-name:

Nome da empresa
---------------

| Nome da empresa.|Tambem usado para customizar o painel de login para um revendedor




.. _user-commercial-name:

Nome fantasia
-------------

| Nome fantasia.




.. _user-state-number:

Inscrição estadual
--------------------

| Inscrição estadual.




.. _user-lastname:

Sobrenome
---------

| Sobrenome.




.. _user-firstname:

Nome
----

| Nome.




.. _user-city:

Cidade
------

| Cidade.




.. _user-state:

Estado
------

| Estado.




.. _user-address:

Endereço
---------

| Endereço.




.. _user-neighborhood:

Bairro
------

| Bairro.




.. _user-zipcode:

CEP
---

| CEP.




.. _user-phone:

Fone
----

| Telefone fixo.




.. _user-mobile:

Celular
-------

| Telefone celular.




.. _user-email:

Email
-----

| Email, é necessário para o envio de notificaçōes do sistema.




.. _user-doc:

CPF/CNPJ
--------

| Documento do cliente.




.. _user-vat:

Imposto
-------

| Usado em alguns métodos de pagamento.




.. _user-contract-value:

Valor contrato
--------------

| Valor do contrato




.. _user-dist:

DIST
----

| Nós ainda não escrevemos a descrição deste campo.




.. _user-typepaid:

Tipo pago
---------

| Cliente pós-pago poderá ficar com saldo negativo até o limite de crédito informado no campo abaixo.




.. _user-credit-notification-daily:

Notificação de crédito diário
---------------------------------

| Se ativar esta opção o MagnusBilling vai enviar um email diariamente com o saldo do cliente. Você pode editar o email que será enviado no menu Configurações submenu Modelo de Emails.




.. _user-creditlimit:

Limite de crédito
------------------

| Somente usado para Pos-Pago. O cliente poderá ligar até chegar a este limite negativo.




.. _user-credit-notification:

Notificação de crédito
-------------------------

| Se o crédito do cliente ficar menor que está campo, MagnusBilling vai enviar um email para o cliente informando que está com pouco crédito. NECESSÁRIO TER CADASTRADO UM SERVIDOR SMTP NO MENU CONFIGURAÇŌES.




.. _user-enableexpire:

Habilitar vencimento
--------------------

| Ativar expiração. Necessário informar a data da expiração no campo Data de expiração.




.. _user-expirationdate:

Data de expiração
-------------------

| Data que este cliente não poderá mais efetuar chamadas.




.. _user-calllimit:

Limite de chamada
-----------------

| Chamadas simultâneas permitidas para este usuário.




.. _user-calllimit-error:

Erro ao superar limite
----------------------

| Sinalização a ser enviada caso o limite de chamadas for superador.




.. _user-mix-monitor-format:

Formato das gravaçōes
-----------------------

| Formato que será usado para gravar as chamadas.




.. _user-callshop:

CallShop
--------

| Ativa o módulo CallShop. Somente ative se realmente for usar. É necessário dar permissōes ao grupo selecionado.




.. _user-disk-space:

Espaço em disco
----------------

| Espaço em GB que o usuário poderá usar com as gravaçōes. Coloque -1 para deixar sem limite.É necessário adicionar no cron o seguinte comando php /var/www/html/mbilling/cron.php UserDiskSpace .




.. _user-sipaccountlimit:

Limite de contas SIP
--------------------

| Quantas Contas VoIP este usuário poderá ter. Será necessário dar permissōes no grupo para criar Contas VoIP.




.. _user-callingcard-pin:

CallingCard PIN
---------------

| Usado para autenticação do calling card.




.. _user-restriction:

Restrição
-----------

| Esta opção permite restringir o usuário para somente discar para alguns números, ou proibir discar para alguns números, conforme for selecionado. Os números deverão ser adicionado no menu Números Bloqueados.




.. _user-restriction-use:

Usar
----

| Qual número será usado para verificar a Restrição. Esta opção é somente válida para chamas de saida.




.. _user-transfer-international-profit:

Lucro
-----

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-transfer-flexiload-profit:

Lucro
-----

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-transfer-bkash-profit:

Lucro
-----

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-transfer-dbbl-rocket:

Enable DBBL/Rocket
------------------

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-transfer-dbbl-rocket-profit:

Lucro
-----

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-transfer-show-selling-price:

Mostrar preço de venda
-----------------------

| Esta função não está disponível no Brasil. Somente usado para recarga de celulares em alguns países.




.. _user-email2:

Email
-----

| Email 2




.. _user-email-services:

Enviar email de Serviços
-------------------------

| Ativa ou não as notificaçōes por email dos serviços




.. _user-email-did:

Enviar email de DID
-------------------

| Ativa ou não as notificaçōes por email dos DIDs



