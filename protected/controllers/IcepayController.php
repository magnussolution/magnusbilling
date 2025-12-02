<?php

/**
 * Url for moip ruturn http://ip/billing/index.php/icepay .
 */
class IcepayController extends Controller
{

    public function actionIndex()
    {
        if (isset($_POST)) {
            $modelMethodpay = Methodpay::model()->find("payment_method = 'IcePay'");

            if (preg_match("/ /", $modelMethodpay->show_name)) {
                $type        = explode(" ", $modelMethodpay->show_name);
                $typePayment = 'ICEPAY_' . $type[0];
            } else {
                $typePayment = 'ICEPAY_' . $modelMethodpay->show_name;
            }

            require_once "lib/icepay/icepay.php";
            $method = new $typePayment($modelMethodpay->username, $modelMethodpay->pagseguro_TOKEN);

            if (!$method->OnSuccess()) {
                $data = $method->GetData();

                RefillIcepay::model()->deleteByPk((int) (int) $data->orderID);

                echo '<h1>Oops, some error occured</h1>
                    <p>Error description : OnSuccess FALSE ' . $data->statusCode . ' </p>';
                exit();
            }

            $data = $method->GetData();

            /*
            stdClass Object ( [status] => OK
            [statusCode] => Payment Completed simulation via Test Mode
            [merchant] => 24984
            [orderID] => @101278590
            [paymentID] => 12437189
            [reference] =>
            [transactionID] => 12437189
            [checksum] => 6f941ba70719e4a1f19d6086247b222b954393a9 )

            http://www.thantel.com/mbilling/index.php/icepay?Status=OPEN&StatusCode=Merchant+server+returned+error+or+not+reachable.&Merchant=24984&OrderID=5&PaymentID=12437479&Reference=&TransactionID=0050001667513203&Checksum=caab79e08074dd380e551ed14b3244f8eaf7a28d&PaymentMethod=IDEAL
             */

            if ($data->status == "OK" || $data->status == "OPEN") {
                echo '<h1>Thank You! You have successfully completed the payment!</h1>';

                $modelRefillIcepay = RefillIcepay::model()->findByPk((int) (int) $data->orderID);

                RefillIcepay::model()->deleteByPk((int) (int) $data->orderID);

                if (isset($modelRefillIcepay->credit) && Refill::model()->countRefill($data->paymentID, $modelRefillIcepay->id_user) == 0) {

                    $description = 'Ycepay No.' . $data->paymentID;
                    UserCreditManager::releaseUserCredit($modelRefillIcepay->id_user, $modelRefillIcepay->credit, $description, 1, $data->paymentID);

                } else {
                    echo "paymente id= $data->orderID not found";
                }

            } else {
                echo '<h1>Oops, some error occured</h1>';
                echo '<p>Error description: ' . $data->statusCode . '</p>';
            }

        } else {
            echo 'not allow';
        }
    }
}
