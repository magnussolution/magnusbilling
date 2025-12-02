<?php

return [
    "URL" => [
        "production" => "https://abrircontas.api.efipay.com.br",
        "sandbox" => "https://abrircontas-h.api.efipay.com.br"
    ],
    "ENDPOINTS" => [
        "authorize" => [
            "route" => "/v1/oauth/token",
            "method" => "post"
        ],
        "createAccount" => [
            "route" => "/v1/conta-simplificada",
            "method" => "post",
            "scope" => "gn.registration.write"
        ],
        "getAccountCredentials" => [
            "route" => "/v1/conta-simplificada/:idContaSimplificada/credenciais",
            "method" => "get",
            "scope" => "gn.registration.read"
        ],
        "createAccountCertificate" => [
            "route" => "/v1/conta-simplificada/:idContaSimplificada/certificado",
            "method" => "post",
            "scope" => "gn.registration.read"
        ],
        "accountConfigWebhook" => [
            "route" => "/v1/webhook",
            "method" => "post",
            "scope" => "gn.registration.webhook.write"
        ],
        "accountListWebhook" => [
            "route" => "/v1/webhooks",
            "method" => "get",
            "scope" => "gn.registration.webhook.read"
        ],
        "accountDetailWebhook" => [
            "route" => "/v1/webhook/:identificadorWebhook",
            "method" => "get",
            "scope" => "gn.registration.webhook.read"
        ],
        "accountDeleteWebhook" => [
            "route" => "/v1/webhook/:identificadorWebhook",
            "method" => "delete",
            "scope" => "gn.registration.webhook.write"
        ]
    ]
];
