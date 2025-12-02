.. _find-rate:

Busca de tarifa
===============

Como o MagnusBilling seleciona a tarifa a ser usada?
----------------------------------------------------

Quando um cliente faz uma chamada externa, para um fixo ou celular, é disparado uma rotina de verificações que consiste em :

1. Verifica o usuário e senha.
2. Verifica se o cliente está ativo.
3. Verifica se o número discado é um DID. 
4. Verifica se o número discado é uma Conta SIP.
5. Verifica o plano do cliente.
6. Buscar dentro das tarifas do plano qual a tarifa que mais se encaixa com o número discado.
7. Busca os troncos que pertencem ao grupo de troncos da tarifa encontrada.
8. Envia a chamada para o primeiro tronco, e se falhar envia para o próximo.
9. No momento que a chamada é finalizada, é calculado o preço de compra e venda
10. Adicionado a chamada no relatório CDR
11. Descontado o valor da chamada no crédito do cliente.
  

Mais bem, como funciona o passo 6?

É realizado da seguinte forma. Digamos que o cliente XXXXX ligou para o número 551140045678

No passo 5, o sistema pega o plano do cliente, e então no passo 6 é feito um "SELECT" na tabela das tarifas assim.


::

 $sql = "SELECT  * FROM pkg_plan LEFT JOIN pkg_rate ON pkg_plan.id = pkg_rate.id_plan  
 LEFT JOIN pkg_prefix ON pkg_rate.id_prefix = pkg_prefix.id 
 LEFT JOIN pkg_trunk_group ON pkg_trunk_group.id = pkg_rate.id_trunk_group  
 WHERE pkg_plan.id=$MAGNUS->id_plan AND pkg_rate.status = 1 
 AND $MAGNUS->prefixclause ORDER BY LENGTH( prefix ) DESC LIMIT 1";


A variável $MAGNUS->id_plan é o id do plano do cliente, e a variável $MAGNUS->prefixclause é o filtro realizado para encontrar a tarifa. 

Para facilitar o entendimento vamos explicar de outra forma.

Como o cliente ligou para 551140045678, o sistema vai buscar da seguinte forma.

Existe uma tarifa para o prefixo 551140045678?

* Se sim, usamos esta tarifa

* Se não, procuramos novamente retirando o último número, neste caso 55114004567 e assim até chegar somente no número 5. Se não encontrar nenhuma tarifa, o sistema vai retornar erro e não vai continuar a chamada.
  


Voltando ao "SELECT" ficaria assim.

::

 $sql = "SELECT  * FROM pkg_plan LEFT JOIN pkg_rate ON pkg_plan.id = pkg_rate.id_plan  
 LEFT JOIN pkg_prefix ON pkg_rate.id_prefix = pkg_prefix.id 
 LEFT JOIN pkg_trunk_group ON pkg_trunk_group.id = pkg_rate.id_trunk_group  
 WHERE pkg_plan.id=1 AND pkg_rate.status = 1 AND 
 (prefix = '551140045678' OR 
 prefix = '55114004567' OR 
 prefix = '5511400456' OR 
 prefix = '551140045' OR 
 prefix = '55114004' OR 
 prefix = '5511400' OR 
 prefix = '551140' OR 
 prefix = '55114' OR 
 prefix = '5511' OR 
 prefix = '551' OR 
 prefix = '55' OR 
 prefix = '5' ) 
 ORDER BY LENGTH( prefix ) DESC LIMIT 1";


Digamos que você tem no plano do cliente, as seguintes 3 tarifas

55,Brasil Fixo Geral
55119,Brasil SP Celular
5511,Brasil SP Fixo


Neste exemplo, o "SELECT" retornaria a tarifa 5511,Brasil SP Fixo. 



Mas você pode estar se perguntando se o cliente ligar para 5511988551234, o "SELECT" encontraria o prefixo 55119 e o 5511 e aí qual dos dois usaria? Usaria o 55119, pois no "SELECT" tem o parâmetro ORDER BY LENGTH( prefix ) DESC e também o parâmetro LIMIT 1. Ou seja, ele ordenará  os resultados colocando em primeiro o prefixo que tiver a maior quantidade de dígitos.



