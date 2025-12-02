<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */
class CryptocurrencyCommand extends CConsoleCommand
{
    public function run($args)
    {

        $modelMethodPay = Methodpay::model()->find('payment_method = :key', [':key' => 'cryptocurrency']);
        if ( ! isset($modelMethodPay->id)) {
            echo 'No method found';
            exit;
        }

        $last_30_minutes     = time() - 1800;
        $modelCryptocurrency = Cryptocurrency::model()->findAll('date > :key1 AND status = 1',
            [':key1' => date('Y-m-d')]);

        foreach ($modelCryptocurrency as $key => $payment) {
            $result = '';
            Yii::log(print_r($payment->getAttributes(), true), 'error');

            echo "try get payments\n";
            $command = 'python3.9 /var/www/html/mbilling/protected/commands/crypto.py ' . $modelMethodPay->client_id . ' ' . $modelMethodPay->client_secret . ' ' . $payment->currency . ' ' . $last_30_minutes;
            //Yii::log($command, 'error');
            exec($command, $result);
            if ( ! isset($result[0])) {
                $command = 'python3 /var/www/html/mbilling/protected/commands/crypto.py ' . $modelMethodPay->client_id . ' ' . $modelMethodPay->client_secret . ' ' . $payment->currency . ' ' . $last_30_minutes;
                exec($command, $result);
            }
            Yii::log(print_r($result, true), 'error');
            $result = implode("\n", $result);
            $result = json_decode($result);

            foreach ($result as $key => $value) {

                if ($value->amount == $payment->amountCrypto) {

                    if (isset($payment->id_user)) {

                        if (Refill::model()->countRefill($value->txId, $payment->id_user) == 0) {

                            Yii::log('encontrou liberar credit', 'error');

                            Cryptocurrency::model()->updateByPk($payment->id, ['status' => 0]);
                            $description = 'CriptoCurrency ' . $value->coin . ', txid: ' . $value->txId;
                            Yii::log($description, 'error');
                            echo ($payment->id_user . ' ' . $payment->amount . ' ' . $description . ' ' . $value->txId);
                            Yii::log($payment->id_user . ' ' . $payment->amount . ' ' . $description . ' ' . $value->txId, 'error');
                            Yii::log($description, 'error');
                            UserCreditManager::releaseUserCredit($payment->id_user, $payment->amount, $description, 1, $value->txId);
                        } else {
                            echo "Paymente already released\n";
                        }
                    } else {
                        echo "Receive new deposit in your wallet but not found any refill in your MagnusBilling\n";
                    }

                }
            }

        }
    }
}
