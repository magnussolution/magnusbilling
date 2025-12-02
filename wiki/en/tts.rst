.. _tts:

TTS Configuration
==============

MagnusBilling supports TTS via URL, next some tested providersand their respective configurations.



Reminding that the URL variables, independently of the provider, must be edited conform your necessities and with the right API according to the provider, the only part relating MagnusBilling is the variable $name, which is where MagnusBilling will replace the registered names in the Numbers menu.


Vocalware
+++++++++

The first step to set up is to create your account in this site https://www.vocalware.com/ 
Now we need to configure the API URL in the Settings menu -> Adjustments sub menu. Locate the option TTS URL and change the URL to:

https://www.vocalware.com/tts/gen.php?EID=3&LID=6&VID=1&TXT=$name&EXT=mp3&FX_TYPE=&FX_LEVEL=&ACC=YOUR_ACC&API=YPUR_API&SESSION=&HTTP_ERR=&CS=&SECRET=YOUR_SECRET


In the example above, is already configurated in Brazilian Portuguese.

EID=3 is Engine ID = 3
LID=6 is Portuguese
VID=1 is Helena's voice


Voicerss
++++++++

The first step to set up is to create your account in this site: http://www.voicerss.org
Now we need to configure the API URL in the Settings menu -> Adjustments sub menu. Locate the option TTS URL and change the URL to:

http://api.voicerss.org/?key=YOUR_API&hl=pt-br&src=$name&f=8khz_16bit_mono

In this company you only need to put your API. In this example is already configurated in Brazilian Portuguese.

Google
++++++

You can look for more information about Google TTS in this link: https://cloud.google.com/text-to-speech?hl=pt_br

The Google URL is:

https://translate.google.com/translate_tts?ie=UTF-8&q=$name&tl=pt-BR&total=1&idx=0&textlen=5&client=tw-ob&tk=$token




MagnusBilling will work like any other TTS provider that accepts the integration via URL.

This service can be charged by the provider.


