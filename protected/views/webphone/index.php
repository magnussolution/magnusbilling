<!doctype html>
<html lang="<?php echo CHtml::encode(str_replace('_', '-', Yii::app()->language)); ?>" data-language="<?php echo CHtml::encode(Yii::app()->language); ?>">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title><?php echo CHtml::encode(Yii::t('zii', 'WEBPHONE')); ?></title>
<link rel="stylesheet" href="<?php echo CHtml::encode($assetBase . 'phone.css'); ?>">
<script defer src="<?php echo CHtml::encode($assetBase . 'i18n.js?v=20260909-8'); ?>"></script><script defer src="<?php echo CHtml::encode($assetBase . 'vendor.js'); ?>"></script><script defer src="<?php echo CHtml::encode($assetBase . 'phone.js?v=20260909-6'); ?>"></script>
</head>
<body>
<main>
<section id="dialer" class="dialer" aria-label="<?php echo CHtml::encode(Yii::t('zii', 'Phone')); ?>" data-i18n-aria="Phone" hidden>
<label><span data-i18n="Number or SIP address"><?php echo CHtml::encode(Yii::t('zii', 'Number or SIP address')); ?></span><input id="destination" type="text" inputmode="tel" autocomplete="off" placeholder="<?php echo CHtml::encode(Yii::t('zii', 'Enter destination')); ?>" data-i18n-placeholder="Enter destination"></label>
<p id="callStatus" role="status" aria-live="polite"><span data-i18n="No call"><?php echo CHtml::encode(Yii::t('zii', 'No call')); ?></span></p>
<div id="keypad" class="keypad" aria-label="<?php echo CHtml::encode(Yii::t('zii', 'Keypad')); ?>" data-i18n-aria="Keypad"></div>
<div class="actions"><button id="call" disabled><span data-i18n="Call"><?php echo CHtml::encode(Yii::t('zii', 'Call')); ?></span></button><button id="answer" hidden><span data-i18n="Answer"><?php echo CHtml::encode(Yii::t('zii', 'Answer')); ?></span></button><button id="hangup" class="danger" disabled><span data-i18n="Hang up"><?php echo CHtml::encode(Yii::t('zii', 'Hang up')); ?></span></button></div>
<div class="actions"><button id="mute" disabled aria-pressed="false"><span data-i18n="Mute"><?php echo CHtml::encode(Yii::t('zii', 'Mute')); ?></span></button><button id="hold" disabled aria-pressed="false"><span data-i18n="Hold"><?php echo CHtml::encode(Yii::t('zii', 'Hold')); ?></span></button></div>
<button id="play" hidden><span data-i18n="Enable call audio"><?php echo CHtml::encode(Yii::t('zii', 'Enable call audio')); ?></span></button>
<audio id="remoteAudio" autoplay playsinline></audio>
</section>
<form id="connectForm">
<fieldset id="settings"><legend><span data-i18n="SIP account"><?php echo CHtml::encode(Yii::t('zii', 'SIP account')); ?></span></legend>
<input id="server" type="hidden">
<input id="uri" type="hidden">
<label><span data-i18n="SIP username"><?php echo CHtml::encode(Yii::t('zii', 'SIP username')); ?></span><input id="authUser" autocomplete="username" spellcheck="false" required></label>
<label><span data-i18n="SIP password"><?php echo CHtml::encode(Yii::t('zii', 'SIP password')); ?></span><input id="password" type="password" autocomplete="off" required></label>
<details><summary><span data-i18n="Network and NAT"><?php echo CHtml::encode(Yii::t('zii', 'Network and NAT')); ?></span></summary>
<label><span data-i18n="STUN server (optional)"><?php echo CHtml::encode(Yii::t('zii', 'STUN server (optional)')); ?></span><input id="stun" placeholder="stun:stun.example.com:3478"></label>
<label><span data-i18n="TURN server (optional)"><?php echo CHtml::encode(Yii::t('zii', 'TURN server (optional)')); ?></span><input id="turn" placeholder="turn:turn.example.com:3478"></label>
<label><span data-i18n="TURN username"><?php echo CHtml::encode(Yii::t('zii', 'TURN username')); ?></span><input id="turnUser" autocomplete="off"></label>
<label><span data-i18n="TURN password"><?php echo CHtml::encode(Yii::t('zii', 'TURN password')); ?></span><input id="turnPassword" type="password" autocomplete="off"></label>
<label class="check"><input id="relay" type="checkbox"><span data-i18n="Use TURN only"><?php echo CHtml::encode(Yii::t('zii', 'Use TURN only')); ?></span></label>
</details>
</fieldset>
<div class="actions"><button id="connect" type="submit"><span data-i18n="Connect"><?php echo CHtml::encode(Yii::t('zii', 'Connect')); ?></span></button><button id="disconnect" type="button" disabled><span data-i18n="Disconnect"><?php echo CHtml::encode(Yii::t('zii', 'Disconnect')); ?></span></button></div>
<p id="status" role="status" aria-live="polite"><span data-i18n="Disconnected"><?php echo CHtml::encode(Yii::t('zii', 'Disconnected')); ?></span></p>
</form>
<footer><?php echo CHtml::encode(Yii::t('zii', 'Firefox · Safari · Chrome')); ?><br><span data-i18n="Use HTTPS and enable WebRTC on the SIP account. Keep this page open to receive calls."><?php echo CHtml::encode(Yii::t('zii', 'Use HTTPS and enable WebRTC on the SIP account. Keep this page open to receive calls.')); ?></span></footer>
</main>
</body></html>
