<?php
/**
 * View to modulo "PlacetoPay Check transaction".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 * 2016-03-31
 */

class PlaceToPayCommand extends CConsoleCommand
{

    public function run($args)
    {
        // incluye las librerias de PlacetoPay
        try {
            include Yii::app()->baseUrl . '/lib/PlacetoPay/classes/EGM/PlacetoPay.php';
        } catch (Exception $e) {
            echo 'error';
            exit;
        }

        $modelMethodPay = Methodpay::model()->find('payment_method LIKE :key', array(':key' => 'PlacetoPay'));

        if (!count($modelMethodPay)) {
            exit;
        }

        // define los datos propios del comercio
        define('P2P_CustomerSiteID', $modelMethodPay->P2P_CustomerSiteID);

        // A continuacion se describen la serie de pasos a realizar para resolver
        // el estado de las transaaciones pendientes
        try {
            // 1. Inicializa el objeto de PlacetoPay
            $p2p         = new PlacetoPay();
            $modelRefill = Refill::model()->findAll('description LIKE "%pendiente%" AND payment = 0');

            // 3. Realiza la consulta a la base de datos, por aquellas transacciones que estan pendientes
            // y cuya antiguedad es superior a 5 minutos
            foreach ($modelRefill as $refill) {
                // 4. Consulta la respuesta de la operacion
                $rc = $p2p->queryPayment(P2P_CustomerSiteID, $refill->id, 'COP', $refill->credit);
                if ((($rc == PlacetoPay::P2P_ERROR) && ($p2p->getErrorCode() != 'HTTP')) || ($rc == PlacetoPay::P2P_DECLINED)) {
                    echo 'actualice la BD, no se hizo el pago';

                    $id                  = $refill->id;
                    $id_user             = $refill->id_user;
                    $description         = "Recarga PlaceToPay <font color=red>rechazada</font>. Referencia: $id, Autorizacion/CUS: " . $p2p->getAuthorization();
                    $refill->description = $description;
                    $refill->save();
                } else if (($rc == PlacetoPay::P2P_APPROVED) || ($rc == PlacetoPay::P2P_DUPLICATE)) {
                    echo 'actualice la BD, asiente el pago';

                    $id          = $refill->id;
                    $id_user     = $refill->id_user;
                    $description = "Recarga PlaceToPay <font color=green>Aprobada</font>. Referencia: $id, Autorizacion/CUS: " . $p2p->getAuthorization() . ', ' . $p2p->getFranchiseName();

                    $refill->description = $description;
                    $refill->payment     = 1;
                    $refill->save();

                    $modelUser = User::model()->findByPk((int) $id_user);
                    $modelUser->credit += $refill->credit;
                    $modelUser->save();

                    if ($modelUser->country == 57 && $refill->credit > 0) {
                        $sql = "INSERT INTO pkg_invoice (id_user) VALUES ($id_user)";
                        Yii::app()->db->createCommand($sql)->execute();

                        $invoice_number         = Yii::app()->db->lastInsertID;
                        $refill->invoice_number = $invoice_number;
                        $refill->save();
                    }

                    $mail = new Mail(Mail::$TYPE_REFILL, $id_user);
                    $mail->replaceInEmail(Mail::$ITEM_ID_KEY, $id);
                    $mail->replaceInEmail(Mail::$ITEM_AMOUNT_KEY, $refill->credit);
                    $mail->replaceInEmail(Mail::$DESCRIPTION, $description);
                    $mail->send();

                } else if ($rc == PlacetoPay::P2P_PENDING) {
                    echo 'no haga nada';
                } else {
                    echo 'genere un log, pudo ser un problema de telecomunicaciones';
                }
            }
            unset($dbConn);
        } catch (Exception $e) {
            echo $e->getMessage();
        }
    }
}
