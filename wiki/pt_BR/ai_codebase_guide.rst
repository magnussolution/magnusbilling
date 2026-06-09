Guia de Entendimento do Codigo para IA
======================================

Este guia foi escrito para ajudar assistentes de IA e novos mantenedores a
navegar rapidamente no codigo do MagnusBilling 7 e responder perguntas tecnicas
com rastreabilidade.

Objetivo
========

Responder com precisao perguntas como:

- Onde uma funcionalidade esta implementada.
- Qual fluxo executa em cada tipo de chamada.
- Quais tabelas/modelos/controladores participam de cada operacao.
- Quais arquivos devem ser alterados para implementar uma mudanca.

Visao de Alto Nivel
===================

O MagnusBilling combina tres blocos principais:

1. Backend web em Yii 1.1 (PHP)
2. Frontend administrativo em ExtJS 6.2
3. Motor de chamadas AGI (Asterisk)

Fluxo simplificado:

::

    Navegador (ExtJS)
      -> index.php/<controller>/<action>
      -> Yii Controller
      -> Model (ActiveRecord)
      -> MySQL/MariaDB

    Asterisk Dialplan
      -> resources/asterisk/mbilling.php
      -> classes *Agi.php
      -> tabelas de usuarios/tarifas/troncos/CDR

Pontos de Entrada Reais
=======================

Backend web
-----------

- index.php: bootstrap do Yii e execucao da aplicacao.
- protected/config/main.php: import de models/componentes e conexao com banco.

Frontend
--------

- app.js: cria a aplicacao ExtJS (Ext.application).
- classic/src/Application.js: classe MBilling.Application, login/check de sessao,
  carga inicial de views/stores e regras globais de CSRF.

AGI
---

- resources/asterisk/mbilling.php: entrypoint do AGI, roteia comandos especiais,
  detecta DID, chamadas SIP, queue, callback e fluxo padrao.

Mapa de Diretorios Criticos
===========================

::

    protected/
      controllers/   # Endpoints HTTP (actionList/actionCreate/actionUpdate...)
      models/        # ActiveRecord para tabelas pkg_*
      components/    # BaseController, autenticacao, utilitarios, integracoes
      config/        # main.php, permissao, cron

    app/
      store/         # Camada de dados ExtJS (proxy ajax)
      model/         # Estrutura de dados da UI
      helper/        # Funcoes de apoio

    classic/src/
      Application.js # Bootstrap da UI e montagem da sessao/menu

    resources/asterisk/
      mbilling.php
      Magnus.php
      AuthenticateAgi.php
      CalcAgi.php
      DidAgi.php
      QueueAgi.php
      IvrAgi.php
      SipCallAgi.php
      StandardCallAgi.php
      SearchTariff.php

Roteador de Perguntas (Playbook para IA)
========================================

Use esta tabela para encontrar o ponto de investigacao inicial.

* Login, sessao, permissao, menu:
  comece em ``protected/controllers/AuthenticationController.php``.
  Arquivos de apoio: ``protected/components/BaseController.php`` e
  ``protected/components/Controller.php``.

* CRUD de entidades do painel (user, sip, trunk, rate, did, queue):
  comece em ``protected/controllers/<Entidade>Controller.php``.
  Arquivos de apoio: ``protected/models/<Entidade>.php`` e
  ``app/store/<Entidade>.js``.

* Chamada de saida (outbound), cobranca, timeout, tronco:
  comece em ``resources/asterisk/StandardCallAgi.php``.
  Arquivos de apoio: ``resources/asterisk/CalcAgi.php``,
  ``resources/asterisk/SearchTariff.php`` e
  ``resources/asterisk/AuthenticateAgi.php``.

* DID/entrada, fila, IVR, destino de chamada:
  comece em ``resources/asterisk/DidAgi.php``.
  Arquivos de apoio: ``resources/asterisk/IvrAgi.php``,
  ``resources/asterisk/QueueAgi.php``, models Did/Diddestination e tabelas
  ``pkg_did`` / ``pkg_did_destination``.

* Comandos especiais (``*120`` voucher, ``*7`` pickup, pausa de fila):
  comece em ``resources/asterisk/mbilling.php``.

* Configuracoes globais (idioma, versao, timeout, moeda):
  comece em ``pkg_configuration`` via model Configuration.
  Arquivo de apoio: ``protected/components/LoadConfig.php``.

* Problema de UI apos login/check de sessao:
  comece em ``classic/src/Application.js``.
  Endpoint de apoio: ``index.php/authentication/check``.

Modelo Mental de Relacao Frontend x Backend
===========================================

Padrao recorrente:

1. Store ExtJS faz request em endpoint ``index.php/<controller>/<action>``
2. Controller Yii processa filtros/permissoes
3. Model ActiveRecord executa persistencia
4. Controller devolve JSON para grid/form

Exemplo de rastreio:

- Ver endpoint chamado no frontend (store ou Ext.Ajax.request)
- Abrir controller correspondente em protected/controllers/
- Identificar o model utilizado
- Confirmar campos e regras no model
- Validar tabela envolvida (prefixo ``pkg_``)

Fluxo de Chamada (Resumo Operacional)
=====================================

Saida (outbound)
----------------

1. Dialplan chama AGI em resources/asterisk/mbilling.php
2. Autenticacao do usuario (AuthenticateAgi)
3. Validacao de numero/restricoes
4. Busca de tarifa (SearchTariff)
5. Calculo de timeout/custo (CalcAgi)
6. Selecao de tronco e dial
7. Persistencia de CDR e debito de credito

Entrada (DID)
-------------

1. mbilling.php detecta chamada DID
2. DidAgi localiza DID e destinos
3. Encaminha para SIP/Queue/IVR/numero externo
4. Atualiza CDR e custos da chamada de entrada

Checklist para Responder Perguntas com Confianca
=================================================

Antes de responder uma pergunta tecnica, a IA deve validar:

1. Arquivo de entrada correto da funcionalidade.
2. Controller/model/tabela corretos (quando for fluxo web).
3. Classe AGI correta (quando for telefonia).
4. Se ha comportamento por perfil (admin/agent/client).
5. Se a configuracao global pode alterar o resultado.

Se faltar evidencia no arquivo principal, seguir as chamadas de funcao ate
um destes pontos:

- consulta SQL/tabela
- chamada de metodo em model/controller
- execucao AGI/DIAL

Riscos de Interpretacao (Armadilhas Comuns)
===========================================

- Existem modulos com nomes muito parecidos (CallOnline vs CallOnLine,
  campaign* e callSummary*). Validar sempre o arquivo exato.
- Parte do frontend carrega centenas de views em Application.js; nao assumir
  que um modulo esta ativo sem verificar menu/permissoes.
- Regras de seguranca e sessao podem bloquear actions silenciosamente,
  especialmente via BaseController::init().
- Fluxos AGI possuem condicionais por variaveis do canal (Asterisk) que mudam
  o caminho de execucao.

Arquivos de Referencia Recomendados
===================================

- resources/asterisk/AGI_RAG.md
- resources/asterisk/FLUXOS_DE_CHAMADAS.md
- wiki/pt_BR/yii_backend.rst
- wiki/pt_BR/extjs_frontend.rst
- wiki/pt_BR/database_schema.rst

Manutencao Deste Guia
=====================

Atualize este documento quando houver:

- novo ponto de entrada (web ou AGI)
- mudanca de fluxo de autenticacao
- novo modulo central (controller/model/classe AGI)
- alteracao estrutural nas tabelas principais
