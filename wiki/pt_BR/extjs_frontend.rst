.. _extjs-frontend:

Frontend - ExtJS 6.2
====================

O MagnusBilling utiliza **ExtJS 6.2** para a interface web de administração.

Estrutura de Arquivos
======================

::

    /
    ├── index.html               # Página principal
    ├── app.js                   # Inicialização
    ├── app.json                 # Configuração
    └── app/
        ├── store/               # Stores (sources de dados)
        ├── model/               # Models (estrutura de dados)
        ├── view/                # Views (componentes UI)
        ├── controller/          # Controllers (lógica)
        └── helper/              # Utilitários


Padrão MVC
==========

::

    View (UI) ← → Controller (lógica) ← → Store/Model (dados) ← → Servidor


Models
======

Define estrutura e validações::

    Ext.define('Bruno.model.User', {
        extend: 'Ext.data.Model',
        
        fields: [
            { name: 'id', type: 'int' },
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'credit', type: 'float' },
        ],
        
        validations: [
            { type: 'presence', field: 'username' },
            { type: 'email', field: 'email' },
        ],
        
        proxy: {
            type: 'ajax',
            url: '/magnus/user/list',
            reader: { type: 'json', rootProperty: 'data' },
        }
    });


Stores
======

Gerenciam dados (carregamento, filtros, paginação)::

    var store = Ext.create('Bruno.store.Users');
    
    // Carregar
    store.load({ params: { page: 1, limit: 50 } });
    
    // Filtrar
    store.addFilter({ property: 'email', value: '%@gmail.com' });
    
    // Recarregar
    store.reload();


Views - Componentes UI
======================

Panel - Container genérico
~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    Ext.create('Ext.panel.Panel', {
        title: 'Meu Painel',
        width: 500,
        items: [ /* componentes filhos */ ]
    });


GridPanel - Tabela de Dados
~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    Ext.create('Ext.grid.Panel', {
        store: store,
        columns: [
            { text: 'ID', dataIndex: 'id', width: 50 },
            { text: 'Usuário', dataIndex: 'username', width: 150 },
            { text: 'Email', dataIndex: 'email', width: 200 },
        ]
    });


FormPanel - Formulário
~~~~~~~~~~~~~~~~~~~~~~

::

    Ext.create('Ext.form.Panel', {
        items: [
            { xtype: 'textfield', name: 'username', fieldLabel: 'Usuário' },
            { xtype: 'emailfield', name: 'email', fieldLabel: 'Email' },
            { xtype: 'numberfield', name: 'credit', fieldLabel: 'Crédito' },
        ],
        buttons: [
            { text: 'Salvar', handler: function() { /* ... */ } }
        ]
    });


Window - Janela Modal
~~~~~~~~~~~~~~~~~~~~~

::

    var window = Ext.create('Ext.window.Window', {
        title: 'Novo Usuário',
        width: 400,
        modal: true,
        items: [ /* formulário */ ],
        buttons: [
            { text: 'Salvar' },
            { text: 'Cancelar', handler: function() { window.close(); } }
        ]
    });
    window.show();


TreePanel - Estructura Hierárquica
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    Ext.create('Ext.tree.Panel', {
        root: {
            text: 'Sistema',
            expanded: true,
            children: [
                { text: 'Usuários' },
                { text: 'Tarifas' }
            ]
        }
    });


TabPanel - Abas
~~~~~~~~~~~~~~~

::

    Ext.create('Ext.tab.Panel', {
        activeTab: 0,
        items: [
            { title: 'Info', items: [ /* ... */ ] },
            { title: 'Config', items: [ /* ... */ ] }
        ]
    });


Controllers
===========

Gerenciam eventos e lógica::

    Ext.define('Bruno.controller.Users', {
        extend: 'Ext.app.Controller',
        
        stores: ['Users'],
        models: ['User'],
        
        init: function() {
            this.control({
                'users-grid button[action=create]': {
                    click: this.createUser
                },
                'user-form button[action=save]': {
                    click: this.saveUser
                }
            });
        },
        
        createUser: function() { /* ... */ },
        saveUser: function() { /* ... */ }
    });


Comunicação com Backend
=======================

Requisição GET::

    Ext.Ajax.request({
        url: '/magnus/user/list',
        params: { page: 1, limit: 50 },
        success: function(response) {
            var data = Ext.decode(response.responseText);
        }
    });


Requisição POST::

    Ext.Ajax.request({
        url: '/magnus/user/create',
        method: 'POST',
        params: {
            username: 'joao',
            email: 'joao@example.com'
        },
        success: function(response) {
            var result = Ext.decode(response.responseText);
            if (result.success) {
                Ext.Msg.alert('Sucesso', 'Usuário criado!');
            }
        }
    });


Temas Inclusos
==============

O MagnusBilling inclui temas com cores variadas::

    classic.json / modern.json (temas base)
    
    crisp, neptune, triton (estilos)
    
    black, blue, gray, green, orange, purple, red, yellow (cores)
    
    Exemplo: blue-crisp.json, blue-neptune.json, blue-triton.json


Validação de Formulários
=========================

Validadores disponíveis::

    presence    # Campo obrigatório
    length      # Tamanho mínimo/máximo
    format      # Regex pattern
    email       # Email válido
    numberrange # Número em intervalo


Exemplo::

    Ext.define('Bruno.model.User', {
        validations: [
            { type: 'presence', field: 'username' },
            { type: 'length', field: 'username', min: 3, max: 20 },
            { type: 'email', field: 'email' },
        ]
    });


Renderizadores (Formatação)
============================

Formatam dados na exibição::

    { 
        text: 'Crédito', 
        dataIndex: 'credit',
        renderer: 'currency("R$", 2)'
    },
    
    {
        text: 'Status',
        dataIndex: 'status',
        renderer: function(value) {
            if (value === 'active') {
                return '<span style="color:green">Ativo</span>';
            } else {
                return '<span style="color:red">Inativo</span>';
            }
        }
    }


Armazenamento de Dados do Cliente
==================================

Persistir dados no navegador::

    // Local Storage (permanente)
    localStorage.setItem('user_id', 123);
    var user_id = localStorage.getItem('user_id');
    
    // Session Storage (até fechar navegador)
    sessionStorage.setItem('token', 'xyz123');
    
    // Cookies
    Ext.util.Cookies.set('theme', 'blue-neptune', new Date(Date.now() + 31536000000));


Toolbar
=======

Barra de ferramentas::

    {
        xtype: 'toolbar',
        items: [
            { text: 'Novo', icon: 'resources/icons/add.png', handler: function() { } },
            '-',
            { text: 'Deletar', icon: 'resources/icons/delete.png' },
            '->',
            { xtype: 'textfield', emptyText: 'Pesquisar...' }
        ]
    }


Notificações
============

Feedback ao usuário::

    // Alerta
    Ext.Msg.alert('Aviso', 'Operação concluída!');
    
    // Confirmação
    Ext.Msg.confirm('Confirmar', 'Deletar?', function(btn) {
        if (btn === 'yes') { /* deletar */ }
    });
    
    // Toast (notificação flutuante)
    Ext.toast({
        title: 'Sucesso',
        message: 'Usuário criado!',
        align: 't'
    });


Boas Práticas
=============

1. **Lazy Loading** - Carregar componentes quando necessário
2. **Paginação** - Em grids grandes
3. **Validação Frontend** - Antes de enviar ao servidor
4. **Error Handling** - Tratar erros AJAX
5. **Memory Leaks** - Destruir listeners quando não mais necessários

Exemplo - Debounce em Search::

    {
        xtype: 'textfield',
        listeners: {
            change: Ext.Function.createDelayed(function(field) {
                store.filter('username', field.getValue());
            }, 500)  // Esperar 500ms após última mudança
        }
    }
