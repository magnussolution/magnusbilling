Solução de Problemas ao Salvar
==============================

Em algumas situações, ao criar ou editar registros no MagnusBilling,
o botão **Salvar** pode não concluir a operação corretamente.

Isso pode ocorrer em qualquer módulo, como Usuários, Tarifas, Troncos,
DIDs, Alarmes, Provedores, Campanhas e outros.

Antes de iniciar qualquer investigação, certifique-se de que o
MagnusBilling está atualizado para a versão mais recente disponível.

Atualize o MagnusBilling Primeiro
---------------------------------

Muitos problemas são corrigidos em novas versões.

Antes de abrir um chamado de suporte, atualize o MagnusBilling para a
última versão disponível e teste novamente.

Caso o problema persista, siga os passos abaixo.

Abrindo as Ferramentas de Desenvolvedor
---------------------------------------

A forma mais eficiente de identificar problemas ao salvar registros é
utilizando as Ferramentas de Desenvolvedor do navegador.

Google Chrome
~~~~~~~~~~~~~

Pressione:

.. code-block:: text

   F12

ou

.. code-block:: text

   Ctrl+Shift+I

Microsoft Edge
~~~~~~~~~~~~~~

Pressione:

.. code-block:: text

   F12

ou

.. code-block:: text

   Ctrl+Shift+I

Mozilla Firefox
~~~~~~~~~~~~~~~

Pressione:

.. code-block:: text

   F12

ou

.. code-block:: text

   Ctrl+Shift+I

Safari
~~~~~~

Ative o menu Desenvolvedor e pressione:

.. code-block:: text

   Option+Command+I

Analisando a Aba Network
------------------------

1. Abra a aba **Network**.
2. Mantenha as Ferramentas de Desenvolvedor abertas.
3. Clique em **Salvar** no MagnusBilling.
4. Localize a requisição enviada ao servidor.

Verifique:

* Código HTTP retornado
* URL da requisição
* Parâmetros enviados
* Resposta retornada pelo servidor

Códigos HTTP Mais Comuns
------------------------

+------+--------------------------------------+
| Code | Descrição                            |
+======+======================================+
| 200  | Requisição processada com sucesso    |
+------+--------------------------------------+
| 400  | Dados inválidos ou ausentes          |
+------+--------------------------------------+
| 401  | Problema de autenticação             |
+------+--------------------------------------+
| 403  | Permissão negada                     |
+------+--------------------------------------+
| 404  | Recurso não encontrado               |
+------+--------------------------------------+
| 500  | Erro interno do servidor             |
+------+--------------------------------------+

Analisando a Aba Console
------------------------

Abra a aba **Console** e verifique se algum erro JavaScript é exibido
ao clicar em Salvar.

Exemplos:

* Uncaught TypeError
* SyntaxError
* Falha em requisição AJAX
* Erros de componentes ExtJS

Verificando os Logs do Servidor
-------------------------------

Se a requisição retornar HTTP 500, verifique os logs do servidor web.

Debian/Ubuntu:

.. code-block:: bash

   tail -f /var/log/apache2/error.log

CentOS/RHEL:

.. code-block:: bash

   tail -f /var/log/httpd/error_log

Informações Necessárias para o Suporte
--------------------------------------

Ao abrir um chamado de suporte, envie:

* Captura da aba Network
* Captura da aba Console
* Código HTTP retornado
* Resposta completa do servidor
* Versão do MagnusBilling
* Nome e versão do navegador

Essas informações ajudam a identificar rapidamente se o problema está
relacionado à validação da interface, permissões, erros do servidor,
restrições do banco de dados ou customizações realizadas no sistema.

Veja Também
-----------

* Como Atualizar o MagnusBilling
* Entendendo Erros HTTP 500
* Coletando Logs para Suporte