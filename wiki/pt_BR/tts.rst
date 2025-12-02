.. _tts:

Configurar TTS
==============

O MagnusBilling suporte TTS via URL, segue alguns provedores testados com suas respectivas configurações.



Lembrando que as variáveis da URL, independente do provedor, deve ser editada conforme sua necessidade e de acordo com a API do provedor, a única parte que é referente ao MagnusBilling é a variável $name, que é onde o MagnusBilling vai substituir o nome cadastrado no menu Números.


Vocalware
+++++++++

Para configurar o primeiro passo é criar sua conta no site https://www.vocalware.com/ 
Agora temos que configurar a URL da API no menu Configurações sub menu Ajustes. Localize a opção TTS URL e altere a URL para:

https://www.vocalware.com/tts/gen.php?EID=3&LID=6&VID=1&TXT=$name&EXT=mp3&FX_TYPE=&FX_LEVEL=&ACC=YOUR_ACC&API=YPUR_API&SESSION=&HTTP_ERR=&CS=&SECRET=YOUR_SECRET


Neste exemplo acima, já deixamos configurado o idioma Português do Brasil.

EID=3 é Engine ID = 3
LID=6 é Portuguese
VID=1 é a voz de Helena


Voicerss
++++++++

Para configurar o primeiro passo é criar sua conta no site http://www.voicerss.org
Agora temos que configurar a URL da API no menu Configurações sub menu Ajustes. Localize a opção TTS URL e altere a URL para:

http://api.voicerss.org/?key=YOUR_API&hl=pt-br&src=$name&f=8khz_16bit_mono

Nesta empresa você somente precisa colocar sua API. Neste exemplo já deixamos o idioma em Português do Brasil.


Google
++++++

Você pode ver mais informações sobre o Google TTS no link: https://cloud.google.com/text-to-speech?hl=pt_br

A URL do Google é:

https://translate.google.com/translate_tts?ie=UTF-8&q=$name&tl=pt-BR&total=1&idx=0&textlen=5&client=tw-ob&tk=$token




O magnusBilling funcionará com qualquer provedor TTS que aceite a integração via URL.

Este serviço poderá ser cobrado pelo provedor.


