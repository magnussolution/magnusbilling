<?php

return [
    "URL" => [
        "production" => "https://cobrancas.api.efipay.com.br",
        "sandbox" => "https://cobrancas-h.api.efipay.com.br"
    ],
    "ENDPOINTS" => [
        "authorize" => [
            "route" => "/v1/authorize",
            "method" => "post"
        ],
        "createCharge" => [
            "route" => "/v1/charge",
            "method" => "post",
            "scope" => "charge"
        ],
        "createOneStepCharge" => [
            "route" => "/v1/charge/one-step",
            "method" => "post",
            "scope" => "charge"
        ],
        "createOneStepChargePartner" => [
            "route" => "/v1/partner/charge/one-step",
            "method" => "post",
            "scope" => "charge"
        ],
        "detailCharge" => [
            "route" => "/v1/charge/:id",
            "method" => "get",
            "scope" => "charge"
        ],
        "listCharges" => [
            "route" => "/v1/charges",
            "method" => "get",
            "scope" => "charge"
        ],
        "updateChargeMetadata" => [
            "route" => "/v1/charge/:id/metadata",
            "method" => "put",
            "scope" => "charge"
        ],
        "updateBillet" => [
            "route" => "/v1/charge/:id/billet",
            "method" => "put",
            "scope" => "charge"
        ],
        "definePayMethod" => [
            "route" => "/v1/charge/:id/pay",
            "method" => "post",
            "scope" => "charge"
        ],
        "definePayMethodPartner" => [
            "route" => "/v1/partner/charge/:id/pay",
            "method" => "post",
            "scope" => "charge"
        ],
        "cancelCharge" => [
            "route" => "/v1/charge/:id/cancel",
            "method" => "put",
            "scope" => "charge"
        ],
        "cardPaymentRetry" => [
            "route" => "/v1/charge/:id/retry",
            "method" => "post",
            "scope" => "charge"
        ],
        "refundCard" => [
            "route" => "/v1/charge/card/:id/refund",
            "method" => "post",
            "scope" => "charge"
        ],
        "createCarnet" => [
            "route" => "/v1/carnet",
            "method" => "post",
            "scope" => "charge"
        ],
        "detailCarnet" => [
            "route" => "/v1/carnet/:id",
            "method" => "get",
            "scope" => "charge"
        ],
        "updateCarnetParcel" => [
            "route" => "/v1/carnet/:id/parcel/:parcel",
            "method" => "put",
            "scope" => "charge"
        ],
        "updateCarnetParcels" => [
            "route" => "/v1/carnet/:id/parcels",
            "method" => "put",
            "scope" => "charge"
        ],
        "updateCarnetMetadata" => [
            "route" => "/v1/carnet/:id/metadata",
            "method" => "put",
            "scope" => "charge"
        ],
        "getNotification" => [
            "route" => "/v1/notification/:token",
            "method" => "get",
            "scope" => "charge"
        ],
        "listPlans" => [
            "route" => "/v1/plans",
            "method" => "get",
            "scope" => "charge"
        ],
        "createPlan" => [
            "route" => "/v1/plan",
            "method" => "post",
            "scope" => "charge"
        ],
        "deletePlan" => [
            "route" => "/v1/plan/:id",
            "method" => "delete",
            "scope" => "charge"
        ],
        "createSubscription" => [
            "route" => "/v1/plan/:id/subscription",
            "method" => "post",
            "scope" => "charge"
        ],
        "createOneStepSubscription" => [
            "route" => "/v1/plan/:id/subscription/one-step",
            "method" => "post",
            "scope" => "charge"
        ],
        "createOneStepSubscriptionLink" => [
            "route" => "/v1/plan/:id/subscription/one-step/link",
            "method" => "post",
            "scope" => "charge"
        ],
        "detailSubscription" => [
            "route" => "/v1/subscription/:id",
            "method" => "get",
            "scope" => "charge"
        ],
        "defineSubscriptionPayMethod" => [
            "route" => "/v1/subscription/:id/pay",
            "method" => "post",
            "scope" => "charge"
        ],
        "cancelSubscription" => [
            "route" => "/v1/subscription/:id/cancel",
            "method" => "put",
            "scope" => "charge"
        ],
        "updateSubscription" => [
            "route" => "/v1/subscription/:id",
            "method" => "put",
            "scope" => "charge"
        ],
        "updateSubscriptionMetadata" => [
            "route" => "/v1/subscription/:id/metadata",
            "method" => "put",
            "scope" => "charge"
        ],
        "createSubscriptionHistory" => [
            "route" => "/v1/subscription/:id/history",
            "method" => "post",
            "scope" => "charge"
        ],
        "sendSubscriptionLinkEmail" => [
            "route" => "/v1/charge/:id/subscription/resend",
            "method" => "post",
            "scope" => "charge"
        ],
        "getInstallments" => [
            "route" => "/v1/installments",
            "method" => "get",
            "scope" => "charge"
        ],
        "sendBilletEmail" => [
            "route" => "/v1/charge/:id/billet/resend",
            "method" => "post",
            "scope" => "charge"
        ],
        "createChargeHistory" => [
            "route" => "/v1/charge/:id/history",
            "method" => "post",
            "scope" => "charge"
        ],
        "sendCarnetEmail" => [
            "route" => "/v1/carnet/:id/resend",
            "method" => "post",
            "scope" => "charge"
        ],
        "sendCarnetParcelEmail" => [
            "route" => "/v1/carnet/:id/parcel/:parcel/resend",
            "method" => "post",
            "scope" => "charge"
        ],
        "createCarnetHistory" => [
            "route" => "/v1/carnet/:id/history",
            "method" => "post",
            "scope" => "charge"
        ],
        "cancelCarnet" => [
            "route" => "/v1/carnet/:id/cancel",
            "method" => "put",
            "scope" => "charge"
        ],
        "cancelCarnetParcel" => [
            "route" => "/v1/carnet/:id/parcel/:parcel/cancel",
            "method" => "put",
            "scope" => "charge"
        ],
        "createOneStepLink" => [
            "route" => "/v1/charge/one-step/link",
            "method" => "post",
            "scope" => "charge"
        ],
        "defineLinkPayMethod" => [
            "route" => "/v1/charge/:id/link",
            "method" => "post",
            "scope" => "charge"
        ],
        "updateChargeLink" => [
            "route" => "/v1/charge/:id/link",
            "method" => "put",
            "scope" => "charge"
        ],
        "sendLinkEmail" => [
            "route" => "/v1/charge/:id/link/resend",
            "method" => "post",
            "scope" => "charge"
        ],
        "updatePlan" => [
            "route" => "/v1/plan/:id",
            "method" => "put",
            "scope" => "charge"
        ],
        "defineBalanceSheetBillet" => [
            "route" => "/v1/charge/:id/balance-sheet",
            "method" => "post",
            "scope" => "charge"
        ],
        "settleCharge" => [
            "route" => "/v1/charge/:id/settle",
            "method" => "put",
            "scope" => "charge"
        ],
        "settleCarnet" => [
            "route" => "/v1/carnet/:id/settle",
            "method" => "put",
            "scope" => "charge"
        ],
        "settleCarnetParcel" => [
            "route" => "/v1/carnet/:id/parcel/:parcel/settle",
            "method" => "put",
            "scope" => "charge"
        ]
    ]
];
