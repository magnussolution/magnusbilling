<?php

namespace Efi;

/**
 * Class EfiPay
 * @package EfiPay
 * 
 * API COBRANÇAS
 * @method object createCharge(array $params = [], array $body)
 * @method object createOneStepCharge(array $params = [], array $body)
 * @method object oneStepPartner(array $params = [], array $body)
 * @method object detailCharge(array $params)
 * @method object listCharges(array $params)
 * @method object updateChargeMetadata(array $params, array $body)
 * @method object updateBillet(array $params, array $body)
 * @method object definePayMethod(array $params, array $body)
 * @method object definePayMethodPartner(array $params, array $body)
 * @method object cancelCharge(array $params)
 * @method object cardPaymentRetry(array $params, array $body)
 * @method object refundCard(array $params, array $body)
 * @method object createCarnet(array $params = [], array $body)
 * @method object detailCarnet(array $params)
 * @method object updateCarnetParcel(array $params, array $body)
 * @method object updateCarnetParcels(array $params, array $body)
 * @method object updateCarnetMetadata(array $params, array $body)
 * @method object getNotification(array $params)
 * @method object listPlans(array $params)
 * @method object createPlan(array $params = [], array $body)
 * @method object deletePlan(array $params)
 * @method object createSubscription(array $params, array $body)
 * @method object createOneStepSubscription(array $params, array $body)
 * @method object createOneStepSubscriptionLink(array $params, array $body)
 * @method object detailSubscription(array $params)
 * @method object defineSubscriptionPayMethod(array $params, array $body)
 * @method object cancelSubscription(array $params)
 * @method object updateSubscriptionMetadata(array $params, array $body)
 * @method object createSubscriptionHistory(array $params, array $body)
 * @method object sendSubscriptionLinkEmail(array $params, array $body)
 * @method object getInstallments(array $params)
 * @method object sendBilletEmail(array $params, array $body)
 * @method object createChargeHistory(array $params, array $body)
 * @method object sendCarnetEmail(array $params, array $body)
 * @method object sendCarnetParcelEmail(array $params, array $body)
 * @method object createCarnetHistory(array $params, array $body)
 * @method object cancelCarnet(array $params)
 * @method object cancelCarnetParcel(array $params)
 * @method object createOneStepLink(array $params = [], array $body)
 * @method object defineLinkPayMethod(array $params, array $body)
 * @method object updateChargeLink(array $params, array $body)
 * @method object sendLinkEmail(array $params, array $body)
 * @method object updatePlan(array $params, array $body)
 * @method object defineBalanceSheetBillet(array $params, array $body)
 * @method object settleCharge(array $params)
 * @method object settleCarnetParcel(array $params)
 * 
 * API PIX
 * @method object pixConfigWebhook(array $params, array $body)
 * @method object pixDetailWebhook(array $params)
 * @method object pixListWebhook(array $params)
 * @method object pixDeleteWebhook(array $params)
 * @method object pixCreateCharge(array $params, array $body)
 * @method object pixCreateImmediateCharge(array $params = [], array $body)
 * @method object pixDetailCharge(array $params)
 * @method object pixUpdateCharge(array $params, array $body)
 * @method object pixListCharges(array $params)
 * @method object pixGenerateQRCode(array $params)
 * @method object pixDevolution(array $params, array $body)
 * @method object pixDetailDevolution(array $params)
 * @method object pixSend(array $params, array $body)
 * @method object pixSendDetail(array $params)
 * @method object pixSendDetailId(array $params)
 * @method object pixSendList(array $params)
 * @method object pixDetail(array $params)
 * @method object pixReceivedList(array $params)
 * @method object pixDetailReceived(array $params)
 * @method object pixCreateLocation(array $params = [], array $body)
 * @method object pixLocationList(array $params)
 * @method object pixDetailLocation(array $params)
 * @method object pixUnlinkTxidLocation(array $params)
 * @method object pixCreateEvp()
 * @method object pixListEvp()
 * @method object pixDeleteEvp(array $params)
 * @method object getAccountBalance(array $params)
 * @method object updateAccountConfig(array $params = [], array $body)
 * @method object listAccountConfig()
 * @method object medList(array $params)
 * @method object medDefense(array $params, array $body)
 * @method object pixCreateDueCharge(array $params, array $body)
 * @method object pixUpdateDueCharge(array $params, array $body)
 * @method object pixDetailDueCharge(array $params)
 * @method object pixListDueCharges(array $params)
 * @method object createReport(array $params = [], array $body)
 * @method object detailReport(array $params)
 * @method object pixSplitDetailCharge(array $params)
 * @method object pixSplitLinkCharge(array $params)
 * @method object pixSplitUnlinkCharge(array $params)
 * @method object pixSplitDetailDueCharge(array $params)
 * @method object pixSplitLinkDueCharge(array $params)
 * @method object pixSplitUnlinkDueCharge(array $params)
 * @method object pixSplitConfig(array $params = [], array $body)
 * @method object pixSplitConfigId(array $params, array $body)
 * @method object pixSplitDetailConfig(array $params)
 * @method object pixCreateDueChargeBatch(array $params, array $body)
 * @method object pixUpdateDueChargeBatch(array $params, array $body)
 * @method object pixDetailDueChargeBatch(array $params)
 * @method object pixListDueChargeBatch(array $params)
 * @method object pixQrCodeDetail(array $params = [], array $body)
 * @method object pixQrCodePay(array $params, array $body)
 * 
 * API OPEN FINANCE
 * @method object ofConfigUpdate(array $params = [], array $body)
 * @method object ofConfigDetail()
 * @method object ofListParticipants(array $params)
 * @method object ofStartPixPayment(array $params = [], array $body)
 * @method object ofDevolutionPix(array $params, array $body)
 * @method object ofListPixPayment(array $params)
 * @method object ofCancelSchedulePix(array $params)
 * @method object ofListSchedulePixPayment(array $params)
 * @method object ofStartSchedulePixPayment(array $params = [], array $body)
 * @method object ofDevolutionSchedulePix(array $params, array $body)
 * @method object ofStartRecurrencyPixPayment(array $params = [], array $body)
 * @method object ofListRecurrencyPixPayment(array $params)
 * @method object ofCancelRecurrencyPix(array $params, array $body)
 * @method object ofDevolutionRecurrencyPix(array $params, array $body)
 * 
 * API PAYMENTS
 * @method object payDetailBarCode(array $params)
 * @method object payRequestBarCode(array $params, array $body)
 * @method object payDetailPayment(array $params)
 * @method object payListPayments(array $params)
 * @method object payConfigWebhook(array $params = [], array $body)
 * @method object payDeleteWebhook(array $params = [], array $body)
 * @method object payListWebhook(array $params)
 * 
 * API ABERTURA DE CONTAS
 * @method object createAccount(array $params = [], array $body)
 * @method object createAccountCertificate(array $params)
 * @method object getAccountCredentials(array $params)
 * @method object accountConfigWebhook(array $params = [], array $body)
 * @method object accountDeleteWebhook(array $params)
 * @method object accountDetailWebhook(array $params)
 * @method object accountListWebhook(array $params)
 */

class EfiPay extends Endpoints
{
    /**
     * Constructor of the EfiPay.
     *
     * @param array $options               Array with configuration options and credentials.
     * @param object|null $requester       Object with request settings.
     * @param string|null $endpointsConfigFile   Endpoint list file name.
     */
    public function __construct(array $options, ?object $requester = null, ?string $endpointsConfigFile = null)
    {
        if ($endpointsConfigFile) {
            Config::setEndpointsConfigFile($endpointsConfigFile);
        }

        // If $options is an instance of Endpoints, use it directly.
        if ($options instanceof Endpoints) {
            parent::__construct([], $requester);
            $this->setEndpoints($options->getEndpoints());
        } else {
            parent::__construct($options, $requester);
        }
    }
}
