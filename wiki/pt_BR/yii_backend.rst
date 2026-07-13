.. _yii-backend:

Backend - Yii Framework
========================

O MagnusBilling utiliza **Yii 1.1**, um framework PHP robusto, rápido e seguro para a camada backend.

Estrutura de Diretórios
========================

::

    protected/
    ├── components/      # Componentes reutilizáveis
    ├── controllers/     # Controladores (ações)
    ├── models/          # Modelos de dados (ORM)
    ├── config/          # Configurações
    ├── runtime/         # Arquivos temporários
    └── extensions/      # Extensões customizadas


Fluxo de Requisição HTTP
=========================

::

    1. Cliente ExtJS envia requisição HTTP (JSON)
    2. Rota no Yii mapeia para Controller
    3. Controller valida permissões
    4. Controller chama Model (ActiveRecord)
    5. Model interage com banco de dados MySQL
    6. Response JSON retorna ao cliente


Modelos (Models)
================

Os modelos implementam padrão **ActiveRecord**, mapeando tabelas MySQL:

Tabelas principais::

    User        → pkg_user
    Sip         → pkg_sip
    Iax         → pkg_iax
    Rate        → pkg_rate
    Trunk       → pkg_trunk
    Did         → pkg_did
    Queue       → pkg_queue
    Ivr         → pkg_ivr
    Cdr         → pkg_cdr


Exemplo de Modelo - User::

    class User extends CActiveRecord {
        
        public function tableName() {
            return 'pkg_user';
        }
        
        // Validações
        public function rules() {
            return array(
                array('username, password', 'required'),
                array('username', 'unique'),
                array('credit', 'numerical', 'integerOnly' => false),
            );
        }
        
        // Relações com outras tabelas
        public function relations() {
            return array(
                'sips' => array(self::HAS_MANY, 'Sip', 'user_id'),
                'company' => array(self::BELONGS_TO, 'Company', 'company_id'),
                'cdrs' => array(self::HAS_MANY, 'Cdr', 'user_id'),
            );
        }
    }


Controladores (Controllers)
===========================

Controllers respondem a requisições HTTP e retornam JSON (RESTful).

Padrão de Actions::

    class UserController extends CController {
        
        // Listar usuários
        public function actionList()
        public function actionRead($id)      // Buscar um
        public function actionCreate()       // Criar novo
        public function actionUpdate($id)    // Atualizar
        public function actionDelete($id)    // Deletar
    }


Exemplo de Action::

    public function actionCreate() {
        $model = new User();
        $model->attributes = $_POST;
        
        if ($model->save()) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array(
                'success' => false, 
                'errors' => $model->errors
            ));
        }
    }


Componentes Reutilizáveis
==========================

Componentes implementam funcionalidades compartilhadas::

    AuthComponent       # Autenticação, autorizações
    AmiComponent        # Asterisk Manager Interface (AMI)
    LogComponent        # Logging de ações
    TimeZoneComponent   # Conversão de fusos horários


Autenticação e Permissões
==========================

Baseado em papéis (RBAC)::

    admin     → Acesso total
    reseller  → Gerenciador seu próprios clientes
    client    → Acesso apenas à sua conta


Verificar Permissão::

    if (!Yii::app()->user->checkAccess('manageUsers')) {
        throw new CHttpException(403, 'Sem permissão');
    }


Integração com Asterisk Manager Interface (AMI)
=================================================

O componente AMI conecta ao Asterisk para controlar chamadas em tempo real::

    // Verificar se canal está ativo
    $this->amiComponent->channelExists($channel);
    
    // Contar chamadas ativas de um usuário
    $this->amiComponent->getChannelCount($user_id);
    
    // Fazer pickup de chamada
    $this->amiComponent->pickupCall($channel, $exten);
    
    // Transferir chamada
    $this->amiComponent->blindTransfer($channel1, $channel2);


Inicialização AGI
==================

Os scripts AGI do Asterisk usam classes do Yii::

    // Inicializar Yii
    require_once('/var/www/magnusbilling/protected/config/init.php');
    
    // Usar modelos
    $user = User::model()->findByPk($user_id);
    $rates = $user->rates;


Cache de Dados
==============

Sistema de cache para melhorar performance::

    // Guardar no cache por 1 hora
    Yii::app()->cache->set('key', $value, 3600);
    
    // Recuperar do cache
    $value = Yii::app()->cache->get('key');
    
    // Deletar
    Yii::app()->cache->delete('key');


Debugging
=========

Logs armazenados em `/protected/runtime/`::

    application.log     # Eventos gerais
    sql.log             # Consultas SQL
    error.log           # Erros


Ativar debug mode::

    // Em protected/config/main.php
    defined('YII_DEBUG') or define('YII_DEBUG', true);


Boas Práticas
=============

1. **Validação** → Sempre usar Model::rules()
2. **SQL** → Usar placeholders: `:name` (evitar SQL injection)
3. **Transações** → Para operações críticas (multiple INSERTs)
4. **Autorização** → Verificar permissões em todo controller
5. **Performance** → Eager loading de relações com `with()`

Exemplo - Eager Loading::

    // ❌ Ruim: N+1 queries
    $users = User::model()->findAll();
    foreach ($users as $user) {
        echo $user->company->name;  // Query por iteração
    }
    
    // ✅ Bom: 2 queries
    $users = User::model()->with('company')->findAll();


Exemplo - Transação::

    $transaction = Yii::app()->db->beginTransaction();
    try {
        $user = new User();
        $user->save();
        
        $sip = new Sip();
        $sip->save();
        
        $transaction->commit();
    } catch (Exception $e) {
        $transaction->rollback();
    }
