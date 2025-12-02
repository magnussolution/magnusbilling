.. _how-to-use-voucher:

Como usar VOUCHER
=================

Para usar um Voucher, a primeira coisa a fazer é criar os Vouchers no menu financeiro, submenu Voucher.

Veja a lista das descrições de cada campo:

* :ref:`voucher-credit` 
* :ref:`voucher-id-plan` 
* :ref:`voucher-language` 
* :ref:`voucher-prefix-local` 
* :ref:`voucher-quantity` 
* :ref:`voucher-tag` 
* :ref:`voucher-voucher`  


Após gerar os novos Vouchers, será necessário adicionar permissões no grupo dos cliente para que possam ver e criar Voucher, conforme a imagem abaixo.

.. image:: img/voucher_permission.png
        :scale: 85%	   


Existem três maneiras de usar um voucher.

1 - Através do painel de um cliente existente.

Agora os clientes em posse de algum Voucher que não tiver sido usado, e que pertencem a algum grupo de clientes que tenha permissão para ver e criar Voucher, poderá fazer o login no seu painel de cliente ir ao menu Voucher, clicar em novo, e colocar o Voucher. Estando tudo correto com o voucher, o sistema vai liberar o credito para o usuário.



2 - Através de um DID.

Crie um DID e o deixe sem destino, ou com destino Calling Card. Ao ligar para o DID, será solicitado número PIN, então digite o número do voucher. Será criado um usuário novo, com as configurações do Voucher, e adicionado o crédito para a conta.


3 - Ligar de uma conta SIP para o código *120

Ao ligar para o código *120 e ingresar o número do Voucher ao ser solicitado o PIN, o valor do Voucher será adicionado ao usuário.




Será criado uma recarga para o cliente com o valor do crédito do Voucher nas 3 opções anteriores.

No menu Voucher do administrador, vai aparecer o usuário que usou o voucher, e a data de uso.


